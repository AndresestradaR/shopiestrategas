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
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../../api/client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const ANIMATION_OPTIONS = [
  { value: "", label: "Ninguna" },
  { value: "anim-shake", label: "Shake" },
  { value: "anim-pulse", label: "Pulse" },
  { value: "anim-shine", label: "Shine" },
  { value: "anim-bounce", label: "Bounce" },
];

export default function PropertiesPanel({ editor }) {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("estilo");
  const [styles, setStyles] = useState({});
  const [content, setContent] = useState({ text: "", src: "", href: "", tag: "" });
  const [uploading, setUploading] = useState(false);
  const [animClass, setAnimClass] = useState("");
  const [animSpeed, setAnimSpeed] = useState(25);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imagenes");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagen muy grande (maximo 10MB)");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await client.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = res.data.url;
      const fullUrl = imageUrl.startsWith("/")
        ? (API_BASE_URL ? `${API_BASE_URL}${imageUrl}` : imageUrl.replace(/^\/uploads/, '/api/uploads'))
        : imageUrl;

      if (selected) {
        selected.setAttributes({ src: fullUrl });
        setContent((p) => ({ ...p, src: fullUrl }));
      }

      toast.success("Imagen subida");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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

  const readAnimClass = useCallback((component) => {
    if (!component) {
      setAnimClass("");
      setAnimSpeed(25);
      return;
    }
    const classes = component.getClasses();
    const found = ANIMATION_OPTIONS.find(
      (o) => o.value && classes.includes(o.value)
    );
    setAnimClass(found ? found.value : "");
    // Read current animation duration
    const s = component.getStyle();
    const dur = s["animation-duration"];
    if (dur) {
      setAnimSpeed(Math.round(parseFloat(dur) * 10));
    } else {
      setAnimSpeed(25);
    }
  }, []);

  useEffect(() => {
    if (!editor) return;

    const onSelect = (component) => {
      setSelected(component);
      readStyles(component);
      readContent(component);
      readAnimClass(component);
      // Auto-switch to contenido tab for images
      const tag = component.get("tagName")?.toLowerCase();
      if (tag === "img") {
        setTab("contenido");
      }
    };
    const onDeselect = () => {
      setSelected(null);
      setStyles({});
      setContent({ text: "", src: "", href: "", tag: "" });
      setAnimClass("");
      setAnimSpeed(25);
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
  }, [editor, readStyles, readContent, readAnimClass]);

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

  const handleAnimChange = (value) => {
    if (!selected) return;
    // Remove all animation classes first
    ANIMATION_OPTIONS.forEach((o) => {
      if (o.value) selected.removeClass(o.value);
    });
    if (value) {
      selected.addClass(value);
      const seconds = (animSpeed / 10).toFixed(1);
      selected.addStyle({ "animation-duration": `${seconds}s` });
    } else {
      selected.addStyle({ "animation-duration": "" });
    }
    setAnimClass(value);
  };

  const parseNum = (val, fallback = 0) => {
    const n = parseInt(val);
    return isNaN(n) ? fallback : n;
  };

  const isPlaceholder =
    content.src && content.src.includes("placehold.co");
  const hasRealImage =
    content.src && !content.src.includes("placehold.co");

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
                {/* State 1: Placeholder — large dropzone */}
                {(isPlaceholder || !content.src) && (
                  <div style={{ marginTop: 12 }}>
                    <label className="prop-label">Imagen</label>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "28px 16px",
                        border: "2px dashed var(--panel-border)",
                        borderRadius: 12,
                        cursor: uploading ? "wait" : "pointer",
                        transition: "all 0.2s",
                        textAlign: "center",
                        marginTop: 8,
                      }}
                    >
                      <Upload
                        size={28}
                        style={{ color: "var(--panel-text-muted)" }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--panel-text)",
                        }}
                      >
                        {uploading
                          ? "Subiendo..."
                          : "Sube la imagen de tu producto"}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--panel-text-muted)",
                        }}
                      >
                        JPG, PNG o WebP (max 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}

                {/* State 2: Real image — preview + change button */}
                {hasRealImage && (
                  <>
                    <div style={{ marginTop: 12, marginBottom: 8 }}>
                      <label className="prop-label">Vista previa</label>
                      <img
                        src={
                          content.src.startsWith("/")
                            ? `${API_BASE_URL}${content.src}`
                            : content.src
                        }
                        alt="Preview"
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          border: "1px solid var(--panel-border)",
                          marginTop: 6,
                        }}
                      />
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "10px 16px",
                        background: "var(--panel-bg-alt)",
                        border: "1px solid var(--panel-border)",
                        borderRadius: 8,
                        cursor: uploading ? "wait" : "pointer",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--panel-text)",
                        transition: "all 0.15s",
                        opacity: uploading ? 0.6 : 1,
                      }}
                    >
                      <Upload size={14} />
                      {uploading ? "Subiendo..." : "Cambiar imagen"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </>
                )}

                {/* Manual URL */}
                <label className="prop-label" style={{ marginTop: 12 }}>
                  O pegar URL
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

                {/* Animation selector for links/buttons */}
                <label className="prop-label" style={{ marginTop: 16 }}>
                  Animacion del boton
                </label>
                <div className="prop-toggle-group">
                  {ANIMATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`anim-badge ${animClass === opt.value ? "active" : ""}`}
                      onClick={() => handleAnimChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Speed slider — only when animation is selected */}
                {animClass && (
                  <>
                    <label className="prop-label" style={{ marginTop: 12 }}>
                      Velocidad de animacion
                    </label>
                    <div className="prop-slider-row">
                      <span style={{ fontSize: 11, color: "var(--panel-text-muted)" }}>Rapido</span>
                      <input
                        type="range"
                        min="3"
                        max="40"
                        value={animSpeed}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAnimSpeed(val);
                          const seconds = (val / 10).toFixed(1);
                          if (selected) {
                            selected.addStyle({ "animation-duration": `${seconds}s` });
                          }
                        }}
                        className="prop-slider"
                      />
                      <span style={{ fontSize: 11, color: "var(--panel-text-muted)" }}>Lento</span>
                    </div>
                    <span
                      className="prop-slider-value"
                      style={{ textAlign: "center", display: "block", marginTop: 4 }}
                    >
                      {(animSpeed / 10).toFixed(1)}s
                    </span>
                  </>
                )}
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
