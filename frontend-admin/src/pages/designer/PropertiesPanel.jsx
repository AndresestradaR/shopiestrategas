import { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  Type,
  Image,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
} from "lucide-react";

export default function PropertiesPanel({ editor }) {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("estilo");
  const [styles, setStyles] = useState({});
  const [content, setContent] = useState({ text: "", src: "", href: "", tag: "" });

  const readStyles = useCallback((component) => {
    if (!component) return;
    const s = component.getStyle();
    setStyles({
      "background-color": s["background-color"] || "",
      color: s["color"] || "",
      "font-size": s["font-size"] || "",
      "text-align": s["text-align"] || "",
      "font-weight": s["font-weight"] || "",
      padding: s["padding"] || "",
      "border-radius": s["border-radius"] || "",
      "box-shadow": s["box-shadow"] || "",
    });
  }, []);

  const readContent = useCallback((component) => {
    if (!component) return;
    const tag = component.get("tagName")?.toLowerCase();
    const attrs = component.getAttributes();
    const text =
      component.get("content") ||
      component.view?.el?.innerText?.slice(0, 200) ||
      "";
    setContent({
      text,
      src: tag === "img" ? attrs.src || "" : "",
      href: tag === "a" ? attrs.href || "" : "",
      tag,
    });
  }, []);

  useEffect(() => {
    if (!editor) return;

    const onSelect = (component) => {
      setSelected(component);
      readStyles(component);
      readContent(component);
    };
    const onDeselect = () => {
      setSelected(null);
      setStyles({});
      setContent({ text: "", src: "", href: "", tag: "" });
    };
    const onStyleUpdate = () => {
      const sel = editor.getSelected();
      if (sel) readStyles(sel);
    };

    editor.on("component:selected", onSelect);
    editor.on("component:deselected", onDeselect);
    editor.on("component:styleUpdate", onStyleUpdate);

    return () => {
      editor.off("component:selected", onSelect);
      editor.off("component:deselected", onDeselect);
      editor.off("component:styleUpdate", onStyleUpdate);
    };
  }, [editor, readStyles, readContent]);

  const updateStyle = (prop, value) => {
    if (!selected) return;
    selected.addStyle({ [prop]: value });
    setStyles((prev) => ({ ...prev, [prop]: value }));
  };

  const handleDelete = () => {
    if (!selected) return;
    selected.destroy();
    setSelected(null);
  };

  const parseNum = (val, fallback = 0) => {
    const n = parseInt(val);
    return isNaN(n) ? fallback : n;
  };

  if (!selected) {
    return (
      <div className="properties-panel">
        <div className="panel-empty">
          <Type size={32} style={{ opacity: 0.3 }} />
          <p>
            Selecciona un elemento
            <br />
            para editar sus propiedades
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <div className="panel-tabs">
        <button
          className={`panel-tab ${tab === "contenido" ? "active" : ""}`}
          onClick={() => setTab("contenido")}
        >
          Contenido
        </button>
        <button
          className={`panel-tab ${tab === "estilo" ? "active" : ""}`}
          onClick={() => setTab("estilo")}
        >
          Estilo
        </button>
      </div>

      <div className="panel-scroll">
        {tab === "contenido" ? (
          <div className="prop-section">
            <label className="prop-label">Texto</label>
            <textarea
              className="prop-textarea"
              value={content.text}
              onChange={(e) => {
                setContent((p) => ({ ...p, text: e.target.value }));
                if (selected) {
                  selected.set("content", e.target.value);
                }
              }}
              rows={3}
              placeholder="Escribe el texto..."
            />

            {content.tag === "img" && (
              <>
                <label className="prop-label" style={{ marginTop: 16 }}>
                  <Image size={14} /> URL de imagen
                </label>
                <input
                  className="prop-input"
                  value={content.src}
                  onChange={(e) => {
                    setContent((p) => ({ ...p, src: e.target.value }));
                    selected?.setAttributes({ src: e.target.value });
                  }}
                  placeholder="https://..."
                />
              </>
            )}

            {content.tag === "a" && (
              <>
                <label className="prop-label" style={{ marginTop: 16 }}>
                  <Link size={14} /> Enlace (URL)
                </label>
                <input
                  className="prop-input"
                  value={content.href}
                  onChange={(e) => {
                    setContent((p) => ({ ...p, href: e.target.value }));
                    selected?.setAttributes({ href: e.target.value });
                  }}
                  placeholder="https://..."
                />
              </>
            )}
          </div>
        ) : (
          <div className="prop-section">
            {/* Background Color */}
            <label className="prop-label">Color de fondo</label>
            <div className="prop-color-row">
              <input
                type="color"
                className="prop-color-picker"
                value={styles["background-color"] || "#ffffff"}
                onChange={(e) => updateStyle("background-color", e.target.value)}
              />
              <input
                className="prop-input-sm"
                value={styles["background-color"] || ""}
                onChange={(e) => updateStyle("background-color", e.target.value)}
                placeholder="transparent"
              />
            </div>

            {/* Text Color */}
            <label className="prop-label">Color de texto</label>
            <div className="prop-color-row">
              <input
                type="color"
                className="prop-color-picker"
                value={styles["color"] || "#000000"}
                onChange={(e) => updateStyle("color", e.target.value)}
              />
              <input
                className="prop-input-sm"
                value={styles["color"] || ""}
                onChange={(e) => updateStyle("color", e.target.value)}
                placeholder="#000000"
              />
            </div>

            {/* Font Size */}
            <label className="prop-label">Tamano de texto</label>
            <div className="prop-slider-row">
              <input
                type="range"
                min="10"
                max="72"
                value={parseNum(styles["font-size"], 16)}
                onChange={(e) => updateStyle("font-size", e.target.value + "px")}
                className="prop-slider"
              />
              <span className="prop-slider-value">
                {parseNum(styles["font-size"], 16)}px
              </span>
            </div>

            {/* Text Align */}
            <label className="prop-label">Alineacion</label>
            <div className="prop-toggle-group">
              {[
                { value: "left", Icon: AlignLeft },
                { value: "center", Icon: AlignCenter },
                { value: "right", Icon: AlignRight },
              ].map((a) => (
                <button
                  key={a.value}
                  className={`prop-toggle-btn ${styles["text-align"] === a.value ? "active" : ""}`}
                  onClick={() => updateStyle("text-align", a.value)}
                >
                  <a.Icon size={14} />
                </button>
              ))}
            </div>

            {/* Font Weight */}
            <label className="prop-label">Negrita</label>
            <div className="prop-toggle-group">
              <button
                className={`prop-toggle-btn ${
                  !styles["font-weight"] ||
                  styles["font-weight"] === "normal" ||
                  styles["font-weight"] === "400"
                    ? "active"
                    : ""
                }`}
                onClick={() => updateStyle("font-weight", "normal")}
              >
                Normal
              </button>
              <button
                className={`prop-toggle-btn ${
                  styles["font-weight"] === "bold" ||
                  styles["font-weight"] === "700"
                    ? "active"
                    : ""
                }`}
                onClick={() => updateStyle("font-weight", "bold")}
              >
                <Bold size={14} /> Bold
              </button>
            </div>

            {/* Padding */}
            <label className="prop-label">Espaciado interno</label>
            <div className="prop-slider-row">
              <input
                type="range"
                min="0"
                max="100"
                value={parseNum(styles["padding"], 0)}
                onChange={(e) => updateStyle("padding", e.target.value + "px")}
                className="prop-slider"
              />
              <span className="prop-slider-value">
                {parseNum(styles["padding"], 0)}px
              </span>
            </div>

            {/* Border Radius */}
            <label className="prop-label">Bordes redondeados</label>
            <div className="prop-slider-row">
              <input
                type="range"
                min="0"
                max="50"
                value={parseNum(styles["border-radius"], 0)}
                onChange={(e) =>
                  updateStyle("border-radius", e.target.value + "px")
                }
                className="prop-slider"
              />
              <span className="prop-slider-value">
                {parseNum(styles["border-radius"], 0)}px
              </span>
            </div>

            {/* Box Shadow */}
            <label className="prop-label">Sombra</label>
            <div className="prop-toggle-group">
              {[
                { label: "Ninguna", value: "none" },
                { label: "Suave", value: "0 2px 8px rgba(0,0,0,0.1)" },
                { label: "Media", value: "0 4px 16px rgba(0,0,0,0.15)" },
                { label: "Fuerte", value: "0 8px 30px rgba(0,0,0,0.2)" },
              ].map((s) => (
                <button
                  key={s.label}
                  className={`prop-toggle-btn ${styles["box-shadow"] === s.value ? "active" : ""}`}
                  onClick={() => updateStyle("box-shadow", s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel-footer">
        <button className="prop-delete-btn" onClick={handleDelete}>
          <Trash2 size={14} />
          Eliminar elemento
        </button>
      </div>
    </div>
  );
}
