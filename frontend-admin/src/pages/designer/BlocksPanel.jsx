import { useState } from "react";

const BLOCK_CATEGORIES = [
  {
    name: "Imagenes (Mas usado)",
    emoji: "\u{1F4F8}",
    blocks: [
      { id: "imagen-full", emoji: "\u{1F5BC}\uFE0F", label: "Imagen", desc: "Foto full width" },
      { id: "boton-compra", emoji: "\u{1F6D2}", label: "Boton Compra", desc: "Boton de pedir" },
      { id: "imagen-boton", emoji: "\u{1F4F8}", label: "Imagen + Boton", desc: "Foto con CTA abajo" },
      { id: "separador-color", emoji: "\u{1F3A8}", label: "Franja Color", desc: "Texto sobre color" },
    ],
  },
  {
    name: "Secciones HTML",
    emoji: "\u{1F9E9}",
    blocks: [
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
    ],
  },
  {
    name: "Basicos",
    emoji: "\u2796",
    blocks: [
      { id: "spacer", emoji: "\u2796", label: "Separador", desc: "Linea entre secciones" },
      { id: "floating-cta", emoji: "\u{1F6D2}", label: "CTA Flotante", desc: "Boton fijo al pie" },
    ],
  },
];

const STRUCTURE_BLOCKS = [
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

export default function BlocksPanel({ editor }) {
  const [tab, setTab] = useState("bloques");

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

  return (
    <div className="blocks-panel">
      <div className="panel-tabs">
        <button
          className={`panel-tab ${tab === "bloques" ? "active" : ""}`}
          onClick={() => setTab("bloques")}
        >
          Bloques
        </button>
        <button
          className={`panel-tab ${tab === "estructura" ? "active" : ""}`}
          onClick={() => setTab("estructura")}
        >
          Estructura
        </button>
      </div>

      <div className="blocks-scroll">
        {tab === "bloques"
          ? BLOCK_CATEGORIES.map((cat) => (
              <div key={cat.name} className="block-category">
                <div className="block-category-title">
                  {cat.emoji} {cat.name}
                </div>
                <div className="blocks-grid">
                  {cat.blocks.map((block) => (
                    <button
                      key={block.id}
                      className="block-card"
                      onClick={() => handleInsertBlock(block.id)}
                      title={block.desc}
                    >
                      <span className="block-emoji">{block.emoji}</span>
                      <span className="block-label">{block.label}</span>
                      <span className="block-desc">{block.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          : <div className="blocks-grid" style={{ padding: 12 }}>
              {STRUCTURE_BLOCKS.map((block) => (
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
        }
      </div>
    </div>
  );
}
