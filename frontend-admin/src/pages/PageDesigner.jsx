import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import toast from "react-hot-toast";
import client from "../api/client";
import TopBar from "./designer/TopBar";
import BlocksPanel from "./designer/BlocksPanel";
import PropertiesPanel from "./designer/PropertiesPanel";
import "./PageDesigner.css";

/* ─── Dropshipping Blocks ──────────────────────────────────── */

function registerDropshippingBlocks(editor) {
  const bm = editor.BlockManager;

  // ===== BLOQUES PARA FLUJO CON IMAGENES (dropshipping real) =====

  // A. Imagen Full Width
  bm.add("imagen-full", {
    label: "Imagen Full Width",
    category: "Imagenes",
    content: {
      type: "image",
      tagName: "img",
      attributes: {
        src: "https://placehold.co/1080x1350/f0f4f8/94a3b8?text=Haz+clic+y+sube+tu+imagen",
        alt: "Imagen de la landing",
      },
      style: {
        width: "100%",
        "max-width": "100%",
        display: "block",
        margin: "0 auto",
      },
      "custom-name": "Imagen",
    },
  });

  // B. Boton de Compra (suelto, para poner entre imagenes)
  bm.add("boton-compra", {
    label: "Boton de Compra",
    category: "Imagenes",
    content: `
      <div style="padding:16px 20px;text-align:center;font-family:Inter,sans-serif;background:#fff;">
        <a href="#checkout" style="display:inline-block;width:100%;max-width:500px;background:#4DBEA4;color:#fff;padding:18px 40px;border-radius:12px;font-size:20px;font-weight:700;text-decoration:none;text-align:center;box-shadow:0 4px 15px rgba(77,190,164,0.4);">
          Hacer pedido - Pago al recibir
        </a>
      </div>
    `,
  });

  // C. Imagen + Boton (combo mas usado)
  bm.add("imagen-boton", {
    label: "Imagen + Boton",
    category: "Imagenes",
    content: `
      <section style="font-family:Inter,sans-serif;margin:0;padding:0;">
        <img src="https://placehold.co/1080x1350/f0f4f8/94a3b8?text=Sube+tu+imagen+aqui" alt="Seccion" style="width:100%;display:block;"/>
        <div style="padding:16px 20px;text-align:center;background:#fff;">
          <a href="#checkout" style="display:inline-block;width:100%;max-width:500px;background:#4DBEA4;color:#fff;padding:18px 40px;border-radius:12px;font-size:20px;font-weight:700;text-decoration:none;text-align:center;box-shadow:0 4px 15px rgba(77,190,164,0.4);">
            Hacer pedido - Envio gratis
          </a>
        </div>
      </section>
    `,
  });

  // D. Separador con color de fondo
  bm.add("separador-color", {
    label: "Franja de Color",
    category: "Imagenes",
    content: `
      <div style="padding:20px;text-align:center;background:#4DBEA4;font-family:Inter,sans-serif;">
        <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">Envio GRATIS a todo el pais - Paga al recibir</p>
      </div>
    `,
  });

  // E. Boton de WhatsApp
  bm.add("boton-whatsapp", {
    label: "Boton WhatsApp",
    category: "Botones",
    content: `
      <div style="padding:16px 20px;text-align:center;font-family:Inter,sans-serif;background:#fff;">
        <a href="https://wa.me/573001234567?text=Hola%2C%20quiero%20info" target="_blank" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;width:100%;max-width:500px;background:#25D366;color:#fff;padding:18px 40px;border-radius:12px;font-size:20px;font-weight:700;text-decoration:none;text-align:center;box-shadow:0 4px 15px rgba(37,211,102,0.4);" class="anim-shake">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Pedir por WhatsApp
        </a>
      </div>
    `,
  });

  // F. Boton Simple (enlace con estilo)
  bm.add("boton-simple", {
    label: "Boton Simple",
    category: "Botones",
    content: `
      <div style="padding:16px 20px;text-align:center;font-family:Inter,sans-serif;background:#fff;">
        <a href="#" style="display:inline-block;width:100%;max-width:500px;background:#1a1a1a;color:#fff;padding:16px 40px;border-radius:10px;font-size:18px;font-weight:700;text-decoration:none;text-align:center;">
          Ver mas detalles
        </a>
      </div>
    `,
  });

  // ===== SECCIONES HTML =====

  // 1. Hero Principal
  bm.add("hero-principal", {
    label: "Hero Principal",
    category: "Secciones",
    content: `
      <section style="position:relative;overflow:hidden;background:linear-gradient(135deg,#0D1717 0%,#1a2f2f 100%);padding:60px 20px;font-family:Inter,sans-serif;">
        <div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:40px;">
          <div style="flex:1;min-width:280px;">
            <span style="display:inline-block;background:#4DBEA4;color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:16px;">OFERTA ESPECIAL</span>
            <h1 style="font-size:42px;font-weight:800;color:#fff;line-height:1.15;margin:0 0 16px 0;">Transforma tu vida con nuestro producto estrella</h1>
            <p style="font-size:18px;color:#ccc;line-height:1.6;margin:0 0 24px 0;">Resultados comprobados por miles de clientes satisfechos. Envio gratis a todo el pais.</p>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;">
              <span style="font-size:36px;font-weight:800;color:#4DBEA4;">$89.900</span>
              <span style="font-size:20px;color:#888;text-decoration:line-through;">$149.900</span>
              <span style="background:#ff4444;color:#fff;padding:4px 10px;border-radius:6px;font-size:13px;font-weight:700;">-40%</span>
            </div>
            <a href="#" style="display:inline-block;background:#4DBEA4;color:#fff;padding:16px 40px;border-radius:12px;font-size:18px;font-weight:700;text-decoration:none;text-align:center;transition:opacity 0.2s;box-shadow:0 4px 15px rgba(77,190,164,0.4);">Pedir Ahora - Pago al Recibir</a>
          </div>
          <div style="flex:1;min-width:280px;text-align:center;">
            <img src="https://placehold.co/500x500/1a2f2f/4DBEA4?text=Producto" alt="Producto" style="max-width:100%;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);"/>
          </div>
        </div>
      </section>
    `,
  });

  // 2. Beneficios / Trust Badges
  bm.add("trust-badges", {
    label: "Trust Badges",
    category: "Secciones",
    content: `
      <section style="background:#f8fafb;padding:50px 20px;font-family:Inter,sans-serif;">
        <div style="max-width:1000px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;justify-content:center;">
          <div style="flex:1;min-width:200px;max-width:280px;background:#fff;border-radius:12px;padding:28px 20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="width:50px;height:50px;background:#e6f9f4;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
              <svg width="24" height="24" fill="none" stroke="#4DBEA4" stroke-width="2" viewBox="0 0 24 24"><path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.9 17.9 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0V6.75A2.25 2.25 0 009.75 4.5H6.75A2.25 2.25 0 004.5 6.75v7.5"/></svg>
            </div>
            <h3 style="font-size:16px;font-weight:700;color:#1a1a1a;margin:0 0 6px;">Envio Seguro</h3>
            <p style="font-size:14px;color:#666;margin:0;">Tu pedido llega protegido a la puerta de tu casa</p>
          </div>
          <div style="flex:1;min-width:200px;max-width:280px;background:#fff;border-radius:12px;padding:28px 20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="width:50px;height:50px;background:#e6f9f4;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
              <svg width="24" height="24" fill="none" stroke="#4DBEA4" stroke-width="2" viewBox="0 0 24 24"><path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75"/></svg>
            </div>
            <h3 style="font-size:16px;font-weight:700;color:#1a1a1a;margin:0 0 6px;">Pago Contraentrega</h3>
            <p style="font-size:14px;color:#666;margin:0;">Pagas cuando recibes tu producto, sin riesgo</p>
          </div>
          <div style="flex:1;min-width:200px;max-width:280px;background:#fff;border-radius:12px;padding:28px 20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="width:50px;height:50px;background:#e6f9f4;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
              <svg width="24" height="24" fill="none" stroke="#4DBEA4" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 style="font-size:16px;font-weight:700;color:#1a1a1a;margin:0 0 6px;">Garantia Total</h3>
            <p style="font-size:14px;color:#666;margin:0;">Si no estas satisfecho, te devolvemos tu dinero</p>
          </div>
        </div>
      </section>
    `,
  });

  // 3. Testimonios
  bm.add("testimonials", {
    label: "Testimonios",
    category: "Secciones",
    content: `
      <section style="background:#fff;padding:60px 20px;font-family:Inter,sans-serif;">
        <h2 style="text-align:center;font-size:28px;font-weight:800;color:#1a1a1a;margin:0 0 10px;">Lo que dicen nuestros clientes</h2>
        <p style="text-align:center;font-size:16px;color:#666;margin:0 0 40px;">Miles de personas ya confian en nosotros</p>
        <div style="max-width:1000px;margin:0 auto;display:flex;flex-wrap:wrap;gap:20px;justify-content:center;">
          <div style="flex:1;min-width:260px;max-width:320px;background:#f8fafb;border-radius:12px;padding:24px;border:1px solid #eee;">
            <div style="display:flex;gap:2px;margin-bottom:12px;">
              <span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span>
            </div>
            <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">"Increible producto, llego en 3 dias y la calidad es excelente. Totalmente recomendado, volvere a comprar."</p>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;border-radius:50%;background:#4DBEA4;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;">M</div>
              <div><p style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0;">Maria Lopez</p><p style="font-size:12px;color:#888;margin:0;">Bogota, Colombia</p></div>
            </div>
          </div>
          <div style="flex:1;min-width:260px;max-width:320px;background:#f8fafb;border-radius:12px;padding:24px;border:1px solid #eee;">
            <div style="display:flex;gap:2px;margin-bottom:12px;">
              <span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span>
            </div>
            <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">"Lo compre para mi mama y quedo encantada. El envio fue rapido y el empaque muy bonito. 100% recomendado."</p>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;">C</div>
              <div><p style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0;">Carlos Ramirez</p><p style="font-size:12px;color:#888;margin:0;">Medellin, Colombia</p></div>
            </div>
          </div>
          <div style="flex:1;min-width:260px;max-width:320px;background:#f8fafb;border-radius:12px;padding:24px;border:1px solid #eee;">
            <div style="display:flex;gap:2px;margin-bottom:12px;">
              <span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span><span style="color:#f59e0b;font-size:18px;">&#9733;</span>
            </div>
            <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">"Excelente relacion calidad-precio. Ya es mi tercera compra y siempre cumplen. El mejor sitio para comprar."</p>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;border-radius:50%;background:#ec4899;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;">L</div>
              <div><p style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0;">Laura Gutierrez</p><p style="font-size:12px;color:#888;margin:0;">Cali, Colombia</p></div>
            </div>
          </div>
        </div>
      </section>
    `,
  });

  // 4. Antes y Despues
  bm.add("before-after", {
    label: "Antes y Despues",
    category: "Secciones",
    content: `
      <section style="background:#f8fafb;padding:60px 20px;font-family:Inter,sans-serif;">
        <h2 style="text-align:center;font-size:28px;font-weight:800;color:#1a1a1a;margin:0 0 10px;">Resultados Reales</h2>
        <p style="text-align:center;font-size:16px;color:#666;margin:0 0 40px;">Mira la transformacion de nuestros clientes</p>
        <div style="max-width:800px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;justify-content:center;">
          <div style="flex:1;min-width:260px;text-align:center;">
            <div style="background:#ffebee;border-radius:12px;overflow:hidden;margin-bottom:12px;">
              <img src="https://placehold.co/400x400/ffebee/c62828?text=ANTES" alt="Antes" style="width:100%;display:block;"/>
            </div>
            <span style="display:inline-block;background:#ef5350;color:#fff;padding:6px 20px;border-radius:20px;font-size:14px;font-weight:700;">ANTES</span>
          </div>
          <div style="flex:1;min-width:260px;text-align:center;">
            <div style="background:#e8f5e9;border-radius:12px;overflow:hidden;margin-bottom:12px;">
              <img src="https://placehold.co/400x400/e8f5e9/2e7d32?text=DESPUES" alt="Despues" style="width:100%;display:block;"/>
            </div>
            <span style="display:inline-block;background:#4DBEA4;color:#fff;padding:6px 20px;border-radius:20px;font-size:14px;font-weight:700;">DESPUES</span>
          </div>
        </div>
      </section>
    `,
  });

  // 5. FAQ
  bm.add("faq-section", {
    label: "Preguntas Frecuentes",
    category: "Secciones",
    content: `
      <section style="background:#fff;padding:60px 20px;font-family:Inter,sans-serif;">
        <h2 style="text-align:center;font-size:28px;font-weight:800;color:#1a1a1a;margin:0 0 10px;">Preguntas Frecuentes</h2>
        <p style="text-align:center;font-size:16px;color:#666;margin:0 0 40px;">Resolvemos tus dudas</p>
        <div style="max-width:700px;margin:0 auto;">
          <div style="border:1px solid #e5e7eb;border-radius:10px;margin-bottom:12px;overflow:hidden;">
            <div style="padding:16px 20px;background:#f9fafb;font-weight:600;color:#1a1a1a;font-size:15px;cursor:pointer;">Como realizo mi pedido?</div>
            <div style="padding:16px 20px;font-size:14px;color:#555;line-height:1.6;">Simplemente haz clic en "Pedir Ahora", completa tus datos de envio y listo. Tu pedido llegara a la puerta de tu casa y pagas al recibirlo.</div>
          </div>
          <div style="border:1px solid #e5e7eb;border-radius:10px;margin-bottom:12px;overflow:hidden;">
            <div style="padding:16px 20px;background:#f9fafb;font-weight:600;color:#1a1a1a;font-size:15px;cursor:pointer;">Cuanto tarda el envio?</div>
            <div style="padding:16px 20px;font-size:14px;color:#555;line-height:1.6;">El envio tarda entre 2 a 5 dias habiles dependiendo de tu ciudad. Hacemos envios a todo el pais.</div>
          </div>
          <div style="border:1px solid #e5e7eb;border-radius:10px;margin-bottom:12px;overflow:hidden;">
            <div style="padding:16px 20px;background:#f9fafb;font-weight:600;color:#1a1a1a;font-size:15px;cursor:pointer;">Puedo pagar contraentrega?</div>
            <div style="padding:16px 20px;font-size:14px;color:#555;line-height:1.6;">Si, pagas cuando recibes tu producto. No necesitas tarjeta de credito ni transferencia previa.</div>
          </div>
          <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <div style="padding:16px 20px;background:#f9fafb;font-weight:600;color:#1a1a1a;font-size:15px;cursor:pointer;">Tienen garantia?</div>
            <div style="padding:16px 20px;font-size:14px;color:#555;line-height:1.6;">Si, todos nuestros productos tienen garantia de satisfaccion. Si no estas contento, te devolvemos tu dinero.</div>
          </div>
        </div>
      </section>
    `,
  });

  // 6. Video
  bm.add("video-section", {
    label: "Video",
    category: "Secciones",
    content: `
      <section style="background:#0D1717;padding:60px 20px;font-family:Inter,sans-serif;">
        <div style="max-width:800px;margin:0 auto;text-align:center;">
          <h2 style="font-size:28px;font-weight:800;color:#fff;margin:0 0 10px;">Mira el producto en accion</h2>
          <p style="font-size:16px;color:#aaa;margin:0 0 30px;">Un video vale mas que mil palabras</p>
          <div style="position:relative;padding-bottom:56.25%;height:0;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.4);">
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
          </div>
        </div>
      </section>
    `,
  });

  // 7. Galeria de Producto
  bm.add("product-gallery", {
    label: "Galeria de Producto",
    category: "Secciones",
    content: `
      <section style="background:#fff;padding:60px 20px;font-family:Inter,sans-serif;">
        <h2 style="text-align:center;font-size:28px;font-weight:800;color:#1a1a1a;margin:0 0 10px;">Galeria del Producto</h2>
        <p style="text-align:center;font-size:16px;color:#666;margin:0 0 40px;">Conoce cada detalle</p>
        <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
          <div style="border-radius:12px;overflow:hidden;aspect-ratio:1;"><img src="https://placehold.co/400x400/f0f4f8/475569?text=Foto+1" alt="Producto 1" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="border-radius:12px;overflow:hidden;aspect-ratio:1;"><img src="https://placehold.co/400x400/f0f4f8/475569?text=Foto+2" alt="Producto 2" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="border-radius:12px;overflow:hidden;aspect-ratio:1;"><img src="https://placehold.co/400x400/f0f4f8/475569?text=Foto+3" alt="Producto 3" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="border-radius:12px;overflow:hidden;aspect-ratio:1;"><img src="https://placehold.co/400x400/f0f4f8/475569?text=Foto+4" alt="Producto 4" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </section>
    `,
  });

  // 8. Banner CTA / Oferta
  bm.add("banner-cta", {
    label: "Banner CTA / Oferta",
    category: "Secciones",
    content: `
      <section style="background:linear-gradient(135deg,#4DBEA4 0%,#2d8f7a 100%);padding:50px 20px;font-family:Inter,sans-serif;text-align:center;">
        <div style="max-width:700px;margin:0 auto;">
          <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:16px;">OFERTA POR TIEMPO LIMITADO</span>
          <h2 style="font-size:32px;font-weight:800;color:#fff;margin:0 0 12px;">Ultimas unidades disponibles!</h2>
          <p style="font-size:18px;color:rgba(255,255,255,0.9);margin:0 0 8px;">Aprovecha esta oferta antes de que se agote</p>
          <div style="display:flex;justify-content:center;align-items:center;gap:16px;margin:24px 0;">
            <span style="font-size:42px;font-weight:800;color:#fff;">$89.900</span>
            <span style="font-size:22px;color:rgba(255,255,255,0.6);text-decoration:line-through;">$149.900</span>
          </div>
          <a href="#" style="display:inline-block;background:#fff;color:#0D1717;padding:16px 48px;border-radius:12px;font-size:18px;font-weight:700;text-decoration:none;box-shadow:0 4px 15px rgba(0,0,0,0.15);transition:transform 0.2s;">Comprar Ahora - Pago al Recibir</a>
        </div>
      </section>
    `,
  });

  // 9. Caracteristicas / Bullets de Venta
  bm.add("features-bullets", {
    label: "Bullets de Venta",
    category: "Secciones",
    content: `
      <section style="background:#fff;padding:60px 20px;font-family:Inter,sans-serif;">
        <div style="max-width:800px;margin:0 auto;display:flex;flex-wrap:wrap;gap:40px;align-items:center;">
          <div style="flex:1;min-width:260px;">
            <h2 style="font-size:28px;font-weight:800;color:#1a1a1a;margin:0 0 24px;">Por que elegir nuestro producto?</h2>
            <div style="display:flex;flex-direction:column;gap:16px;">
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <div style="width:28px;height:28px;min-width:28px;background:#e6f9f4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:2px;">
                  <svg width="16" height="16" fill="none" stroke="#4DBEA4" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <div><p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 4px;">Ingredientes 100% naturales</p><p style="font-size:13px;color:#666;margin:0;">Sin quimicos ni efectos secundarios</p></div>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <div style="width:28px;height:28px;min-width:28px;background:#e6f9f4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:2px;">
                  <svg width="16" height="16" fill="none" stroke="#4DBEA4" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <div><p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 4px;">Resultados visibles en 7 dias</p><p style="font-size:13px;color:#666;margin:0;">Cambios reales desde la primera semana</p></div>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <div style="width:28px;height:28px;min-width:28px;background:#e6f9f4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:2px;">
                  <svg width="16" height="16" fill="none" stroke="#4DBEA4" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <div><p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 4px;">Envio gratis a todo el pais</p><p style="font-size:13px;color:#666;margin:0;">Llega directo a la puerta de tu casa</p></div>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <div style="width:28px;height:28px;min-width:28px;background:#e6f9f4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:2px;">
                  <svg width="16" height="16" fill="none" stroke="#4DBEA4" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <div><p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 4px;">Mas de 10.000 clientes satisfechos</p><p style="font-size:13px;color:#666;margin:0;">Calificacion promedio de 4.8 estrellas</p></div>
              </div>
            </div>
          </div>
          <div style="flex:1;min-width:260px;text-align:center;">
            <img src="https://placehold.co/450x450/f0f4f8/475569?text=Beneficios" alt="Beneficios" style="max-width:100%;border-radius:16px;"/>
          </div>
        </div>
      </section>
    `,
  });

  // 10. Texto Libre
  bm.add("text-section", {
    label: "Texto Libre",
    category: "Secciones",
    content: `
      <section style="background:#fff;padding:50px 20px;font-family:Inter,sans-serif;">
        <div style="max-width:750px;margin:0 auto;">
          <h2 style="font-size:26px;font-weight:800;color:#1a1a1a;margin:0 0 20px;">Descripcion del Producto</h2>
          <p style="font-size:16px;color:#444;line-height:1.8;margin:0 0 16px;">Escribe aqui la descripcion detallada de tu producto. Puedes hablar sobre los materiales, el proceso de fabricacion, los beneficios principales y cualquier otro detalle que ayude al cliente a tomar la decision de compra.</p>
          <p style="font-size:16px;color:#444;line-height:1.8;margin:0;">Recuerda que una buena descripcion genera confianza y aumenta las conversiones. Se especifico, usa datos reales y destaca lo que hace unico a tu producto frente a la competencia.</p>
        </div>
      </section>
    `,
  });

  // 11. Separador / Spacer
  bm.add("spacer", {
    label: "Separador",
    category: "Basicos",
    content: `
      <div style="padding:30px 20px;font-family:Inter,sans-serif;">
        <div style="max-width:1000px;margin:0 auto;">
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"/>
        </div>
      </div>
    `,
  });

  // 12. Boton CTA Flotante (sticky para funcionar en el iframe de GrapesJS)
  bm.add("floating-cta", {
    label: "Boton CTA Flotante",
    category: "Basicos",
    content: `
      <div style="position:sticky;bottom:0;left:0;right:0;background:#fff;padding:12px 16px;box-shadow:0 -4px 20px rgba(0,0,0,0.1);z-index:999;font-family:Inter,sans-serif;">
        <a href="#checkout" style="display:block;background:#4DBEA4;color:#fff;padding:16px;border-radius:10px;font-size:18px;font-weight:700;text-decoration:none;text-align:center;box-shadow:0 4px 15px rgba(77,190,164,0.4);">Comprar Ahora - Pago Contraentrega</a>
      </div>
    `,
  });
}

/* ─── Main Component ───────────────────────────────────────── */

export default function PageDesigner() {
  const { id: designId } = useParams();
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [device, setDevice] = useState("Escritorio");
  const [theme, setTheme] = useState("night");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState("");

  // Refs for auto-save closure
  const titleRef = useRef(title);
  titleRef.current = title;
  const saveStatusRef = useRef(saveStatus);
  saveStatusRef.current = saveStatus;
  const savingRef = useRef(saving);
  savingRef.current = saving;

  const { data: design, isLoading } = useQuery({
    queryKey: ["pageDesign", designId],
    queryFn: async () => {
      const res = await client.get(`/admin/page-designs/${designId}`);
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      client.put(`/admin/page-designs/${designId}`, payload),
  });

  // Set title once design loads
  useEffect(() => {
    if (design?.title) setTitle(design.title);
  }, [design]);

  // Init GrapesJS
  useEffect(() => {
    if (isLoading || editorRef.current) return;

    const editor = grapesjs.init({
      container: "#gjs-canvas",
      fromElement: false,
      height: "100%",
      width: "auto",
      storageManager: false,
      panels: { defaults: [] },
      styleManager: { sectors: [] },
      layerManager: { appendTo: "#void" },
      traitManager: { appendTo: "#void" },
      selectorManager: { appendTo: "#void", componentFirst: true },
      assetManager: { custom: true },
      showDevices: false,
      showToolbar: true,
      deviceManager: {
        devices: [
          { name: "Escritorio", width: "" },
          { name: "Tablet", width: "768px", widthMedia: "992px" },
          { name: "Celular", width: "375px", widthMedia: "480px" },
        ],
      },
      canvas: {
        styles: [
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
        ],
      },
    });

    registerDropshippingBlocks(editor);
    console.log("[PageDesigner] Blocks registered:", editor.BlockManager.getAll().length);

    // Inject custom CSS into GrapesJS iframe (animations + body max-width)
    const injectCanvasStyles = () => {
      const iframeDoc = editor.Canvas.getDocument();
      if (!iframeDoc) return;
      // Avoid duplicate injection
      if (iframeDoc.getElementById("shopie-custom-styles")) return;
      const style = iframeDoc.createElement("style");
      style.id = "shopie-custom-styles";
      style.textContent = `
        * { box-sizing: border-box; }
        body {
          max-width: 600px !important;
          margin: 0 auto !important;
          overflow-x: hidden !important;
        }
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        section, div {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        @keyframes cta-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-6px)}30%{transform:translateX(6px)}45%{transform:translateX(-4px)}60%{transform:translateX(3px)}}
        @keyframes cta-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes cta-shine{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes cta-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .anim-shake{animation:cta-shake 2.5s ease-in-out infinite}
        .anim-pulse{animation:cta-pulse 2s ease-in-out infinite}
        .anim-shine{background-size:200% auto;animation:cta-shine 3s linear infinite}
        .anim-bounce{animation:cta-bounce 2s ease-in-out infinite}
      `;
      iframeDoc.head.appendChild(style);
      console.log("[PageDesigner] Canvas styles injected");
    };

    editor.on("load", () => {
      injectCanvasStyles();
      setTimeout(() => {
        editor.refresh();
        console.log("[PageDesigner] Editor refreshed");
      }, 300);
    });
    editor.on("canvas:frame:load", injectCanvasStyles);

    // Override open-assets command to prevent native modal
    editor.Commands.add("open-assets", {
      run(ed, sender, opts) {
        const target = opts?.target;
        if (target) ed.select(target);
      },
    });

    if (design?.grapesjs_data) {
      try {
        editor.loadProjectData(design.grapesjs_data);
        console.log("[PageDesigner] Project data loaded, components:", editor.getComponents().length);
      } catch (e) {
        console.error("[PageDesigner] Error loading project data:", e);
      }
    } else {
      console.log("[PageDesigner] No project data to load");
    }

    // Track unsaved changes
    editor.on("component:add", () => setSaveStatus("unsaved"));
    editor.on("component:remove", () => setSaveStatus("unsaved"));
    editor.on("component:update", () => setSaveStatus("unsaved"));
    editor.on("component:styleUpdate", () => setSaveStatus("unsaved"));

    editorRef.current = editor;
    setEditorInstance(editor);

    return () => {
      editor.destroy();
      editorRef.current = null;
      setEditorInstance(null);
    };
  }, [isLoading, design]);

  // Save handler (uses refs to avoid stale closures)
  const handleSave = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed) return;
    setSaving(true);
    setSaveStatus("saving");
    try {
      const projectData = ed.getProjectData();
      const html = ed.getHtml();
      const css = ed.getCss();
      await saveMutation.mutateAsync({
        title: titleRef.current,
        grapesjs_data: projectData,
        html_content: html,
        css_content: css,
      });
      setSaveStatus("saved");
      toast.success("Guardado");
    } catch {
      setSaveStatus("unsaved");
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [saveMutation]);

  // Keep handleSave ref current for auto-save
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (saveStatusRef.current === "unsaved" && !savingRef.current) {
        handleSaveRef.current();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePublish = async () => {
    const ed = editorRef.current;
    if (!ed) return;
    setPublishing(true);
    try {
      const projectData = ed.getProjectData();
      const html = ed.getHtml();
      const css = ed.getCss();
      await saveMutation.mutateAsync({
        title: titleRef.current,
        grapesjs_data: projectData,
        html_content: html,
        css_content: css,
        is_published: true,
      });
      setSaveStatus("saved");
      toast.success("Landing publicada");
    } catch {
      toast.error("Error al publicar");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeviceChange = (deviceName) => {
    setDevice(deviceName);
    editorRef.current?.setDevice(deviceName);
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    setSaveStatus("unsaved");
  };

  if (isLoading) {
    return (
      <div className="designer-loading">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "#4DBEA4" }}
        />
      </div>
    );
  }

  return (
    <div className={`designer-root ${theme}`}>
      <TopBar
        title={title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        onSave={handleSave}
        onPublish={handlePublish}
        device={device}
        onDeviceChange={handleDeviceChange}
        theme={theme}
        onThemeToggle={() =>
          setTheme((t) => (t === "night" ? "day" : "night"))
        }
        saving={saving}
        publishing={publishing}
      />

      <div className="designer-body">
        <BlocksPanel editor={editorInstance} />

        <div className="designer-canvas-wrap">
          <div id="gjs-canvas" />
        </div>

        <PropertiesPanel editor={editorInstance} />
      </div>

      {/* Hidden container for native GrapesJS managers */}
      <div id="void" style={{ display: "none" }} />
    </div>
  );
}
