import { useState, useRef, useCallback } from "react";
import {
  ImageIcon,
  MousePointerClick,
  LayoutGrid,
  Upload,
  Layers,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../../api/client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/* ─── Block definitions per sidebar tab ─── */

const IMAGEN_BLOCKS = [
  { id: "imagen-full", emoji: "\u{1F5BC}\uFE0F", label: "Imagen", desc: "Foto full width" },
  { id: "imagen-boton", emoji: "\u{1F4F8}", label: "Imagen + Boton", desc: "Foto con CTA abajo" },
  { id: "separador-color", emoji: "\u{1F3A8}", label: "Franja Color", desc: "Texto sobre color" },
];

const BOTON_BLOCKS = [
  { id: "boton-compra", emoji: "\u{1F6D2}", label: "Boton Compra", desc: "Pago al recibir" },
  { id: "boton-whatsapp", emoji: "\u{1F4AC}", label: "WhatsApp", desc: "Boton de WhatsApp" },
  { id: "boton-simple", emoji: "\u{1F517}", label: "Boton Simple", desc: "Enlace con estilo" },
  { id: "floating-cta", emoji: "\u{1F6D2}", label: "CTA Flotante", desc: "Boton fijo al pie" },
];

const SECCION_BLOCKS = [
  { id: "hero-principal", emoji: "\u{1F680}", label: "Hero Principal", desc: "Titulo, precio y boton" },
  { id: "trust-badges", emoji: "\u2705", label: "Confianza", desc: "Badges envio/pago/garantia" },
  { id: "testimonials", emoji: "\u2B50", label: "Testimonios", desc: "Opiniones de clientes" },
  { id: "before-after", emoji: "\u{1F504}", label: "Antes y Despues", desc: "Resultados reales" },
  { id: "faq-section", emoji: "\u2753", label: "Preguntas Frecuentes", desc: "Dudas comunes" },
  { id: "video-section", emoji: "\u{1F3AC}", label: "Video", desc: "YouTube embebido" },
  { id: "product-gallery", emoji: "\u{1F4F8}", label: "Galeria", desc: "Fotos del producto" },
  { id: "banner-cta", emoji: "\u{1F3AF}", label: "Banner Oferta", desc: "Oferta con boton CTA" },
  { id: "features-bullets", emoji: "\u{1F4CB}", label: "Bullets de Venta", desc: "Lista de beneficios" },
  { id: "text-section", emoji: "\u{1F4DD}", label: "Texto Libre", desc: "Bloque de texto editable" },
  { id: "spacer", emoji: "\u2796", label: "Separador", desc: "Linea entre secciones" },
];

const ESTRUCTURA_BLOCKS = [
  {
    id: "struct-1col",
    emoji: "\u25AC",
    label: "1 Columna",
    desc: "Seccion de ancho completo",
    content:
      '<section style="padding:40px 20px;font-family:Inter,sans-serif;"><div style="max-width:1100px;margin:0 auto;"><p>Contenido aqui...</p></div></section>',
  },
  {
    id: "struct-2col",
    emoji: "\u25AC\u25AC",
    label: "2 Columnas",
    desc: "Dos columnas lado a lado",
    content:
      '<section style="padding:40px 20px;font-family:Inter,sans-serif;"><div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;"><div style="flex:1;min-width:260px;"><p>Columna 1</p></div><div style="flex:1;min-width:260px;"><p>Columna 2</p></div></div></section>',
  },
  {
    id: "struct-3col",
    emoji: "\u25AC\u25AC\u25AC",
    label: "3 Columnas",
    desc: "Tres columnas iguales",
    content:
      '<section style="padding:40px 20px;font-family:Inter,sans-serif;"><div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;"><div style="flex:1;min-width:200px;"><p>Columna 1</p></div><div style="flex:1;min-width:200px;"><p>Columna 2</p></div><div style="flex:1;min-width:200px;"><p>Columna 3</p></div></div></section>',
  },
];

/* ─── Sidebar icon tabs ─── */

const SIDEBAR_TABS = [
  { key: "imagenes", Icon: ImageIcon, label: "Fotos" },
  { key: "botones", Icon: MousePointerClick, label: "Botones" },
  { key: "secciones", Icon: LayoutGrid, label: "Secciones" },
  { key: "subidos", Icon: Upload, label: "Subidos" },
  { key: "estructura", Icon: Layers, label: "Capas" },
];

/* ─── Upload sub-panel ─── */

function UploadPanel({ editor }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragover, setDragover] = useState(false);
  const fileRef = useRef(null);

  const uploadFiles = useCallback(
    async (files) => {
      const validFiles = Array.from(files).filter(
        (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
      );
      if (validFiles.length === 0) {
        toast.error("Solo imagenes de hasta 10MB");
        return;
      }
      setUploading(true);
      try {
        for (const file of validFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await client.post("/admin/media/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const imageUrl = res.data.url;
          const fullUrl = imageUrl.startsWith("/")
            ? `${API_BASE_URL}${imageUrl}`
            : imageUrl;
          setImages((prev) => [fullUrl, ...prev]);
        }
        toast.success(
          validFiles.length > 1
            ? `${validFiles.length} imagenes subidas`
            : "Imagen subida"
        );
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Error al subir imagen");
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragover(false);
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const handleInsertImage = (url) => {
    if (!editor) return;
    editor.addComponents({
      type: "image",
      tagName: "img",
      attributes: { src: url, alt: "Imagen subida" },
      style: { width: "100%", "max-width": "100%", display: "block", margin: "0 auto" },
    });
    toast.success("Imagen insertada");
  };

  return (
    <>
      <div
        className={`upload-dropzone ${dragover ? "dragover" : ""}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragover(true);
        }}
        onDragLeave={() => setDragover(false)}
        onDrop={handleDrop}
      >
        <div className="upload-dropzone-icon">
          {uploading ? (
            <Loader2 size={28} className="animate-spin" />
          ) : (
            <Upload size={28} />
          )}
        </div>
        <div className="upload-dropzone-text">
          {uploading ? "Subiendo..." : "Arrastra imagenes aqui"}
        </div>
        <div className="upload-dropzone-hint">o haz clic para buscar</div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <>
          <div className="upload-gallery-title">
            Tus imagenes ({images.length})
          </div>
          <div className="upload-gallery-grid">
            {images.map((url, i) => (
              <div
                key={i}
                className="upload-gallery-thumb"
                onClick={() => handleInsertImage(url)}
                title="Clic para insertar"
              >
                <img src={url} alt={`Subida ${i + 1}`} />
                <button
                  className="thumb-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImages((prev) => prev.filter((_, idx) => idx !== i));
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ─── Main Sidebar Component ─── */

export default function BlocksPanel({ editor }) {
  const [activeTab, setActiveTab] = useState(null);

  const handleInsertBlock = (blockId, customContent) => {
    if (!editor) return;
    if (customContent) {
      editor.addComponents(customContent);
    } else {
      const block = editor.BlockManager.get(blockId);
      if (block) {
        const content = block.get("content");
        editor.addComponents(content);
      }
    }
  };

  const handleTabClick = (key) => {
    setActiveTab((prev) => (prev === key ? null : key));
  };

  const getBlocks = () => {
    switch (activeTab) {
      case "imagenes":
        return IMAGEN_BLOCKS;
      case "botones":
        return BOTON_BLOCKS;
      case "secciones":
        return SECCION_BLOCKS;
      case "estructura":
        return ESTRUCTURA_BLOCKS;
      default:
        return [];
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case "imagenes":
        return "Imagenes";
      case "botones":
        return "Botones";
      case "secciones":
        return "Secciones HTML";
      case "subidos":
        return "Subir Imagenes";
      case "estructura":
        return "Estructura";
      default:
        return "";
    }
  };

  const blocks = getBlocks();

  return (
    <div className="blocks-sidebar-layout">
      {/* Icon rail */}
      <div className="sidebar-icons">
        {SIDEBAR_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`sidebar-icon-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => handleTabClick(tab.key)}
            title={tab.label}
          >
            <tab.Icon size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-panel (opens when a tab is active) */}
      {activeTab && (
        <div className="sidebar-subpanel">
          <div className="subpanel-header">{getTitle()}</div>
          <div className="subpanel-scroll">
            {activeTab === "subidos" ? (
              <UploadPanel editor={editor} />
            ) : (
              <div className="blocks-grid" style={{ padding: 12 }}>
                {blocks.map((block) => (
                  <button
                    key={block.id}
                    className="block-card"
                    onClick={() => handleInsertBlock(block.id, block.content)}
                    title={block.desc}
                  >
                    <span className="block-emoji">{block.emoji}</span>
                    <span className="block-label">{block.label}</span>
                    <span className="block-desc">{block.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
