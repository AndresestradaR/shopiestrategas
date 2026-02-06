import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  Upload as UploadIcon,
} from "lucide-react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import toast from "react-hot-toast";
import client from "../api/client";
import "./PageDesigner.css";

function registerDropshippingBlocks(editor) {
  const bm = editor.BlockManager;

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

  // 12. Boton CTA Flotante
  bm.add("floating-cta", {
    label: "Boton CTA Flotante",
    category: "Basicos",
    content: `
      <div style="position:fixed;bottom:0;left:0;right:0;background:#fff;padding:12px 16px;box-shadow:0 -4px 20px rgba(0,0,0,0.1);z-index:999;font-family:Inter,sans-serif;">
        <a href="#" style="display:block;background:#4DBEA4;color:#fff;padding:14px;border-radius:10px;font-size:16px;font-weight:700;text-decoration:none;text-align:center;box-shadow:0 4px 15px rgba(77,190,164,0.4);">Comprar Ahora - Pago Contraentrega</a>
      </div>
    `,
  });
}

export default function PageDesigner() {
  const { id: designId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [device, setDevice] = useState("Desktop");

  const { data: design, isLoading } = useQuery({
    queryKey: ["pageDesign", designId],
    queryFn: async () => {
      const res = await client.get(`/admin/page-designs/${designId}`);
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => client.put(`/admin/page-designs/${designId}`, payload),
  });

  useEffect(() => {
    if (isLoading || !containerRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      fromElement: false,
      height: "100%",
      width: "auto",
      storageManager: false,
      panels: { defaults: [] },
      deviceManager: {
        devices: [
          { name: "Desktop", width: "" },
          { name: "Tablet", width: "768px", widthMedia: "992px" },
          { name: "Mobile", width: "375px", widthMedia: "480px" },
        ],
      },
      styleManager: {
        sectors: [
          {
            name: "General",
            properties: ["display", "float", "position", "top", "right", "left", "bottom"],
          },
          {
            name: "Dimensiones",
            properties: ["width", "height", "max-width", "min-height", "margin", "padding"],
          },
          {
            name: "Tipografia",
            properties: [
              "font-family", "font-size", "font-weight", "letter-spacing",
              "color", "line-height", "text-align", "text-decoration", "text-shadow",
            ],
          },
          {
            name: "Decoraciones",
            properties: [
              "background-color", "background", "border-radius", "border",
              "box-shadow", "opacity",
            ],
          },
        ],
      },
      canvas: {
        styles: [
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
        ],
      },
      blockManager: {
        appendTo: "#blocks-panel",
      },
      layerManager: {
        appendTo: "#layers-panel",
      },
      selectorManager: {
        appendTo: "#styles-panel",
      },
      styleManager: {
        appendTo: "#styles-panel",
        sectors: [
          {
            name: "General",
            properties: ["display", "float", "position", "top", "right", "left", "bottom"],
          },
          {
            name: "Dimensiones",
            properties: ["width", "height", "max-width", "min-height", "margin", "padding"],
          },
          {
            name: "Tipografia",
            properties: [
              "font-family", "font-size", "font-weight", "letter-spacing",
              "color", "line-height", "text-align", "text-decoration", "text-shadow",
            ],
          },
          {
            name: "Decoraciones",
            properties: [
              "background-color", "background", "border-radius", "border",
              "box-shadow", "opacity",
            ],
          },
        ],
      },
    });

    registerDropshippingBlocks(editor);

    if (design?.grapesjs_data) {
      editor.loadProjectData(design.grapesjs_data);
    }

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [isLoading, design]);

  const handleDeviceChange = (deviceName) => {
    setDevice(deviceName);
    editorRef.current?.setDevice(deviceName);
  };

  const handleSave = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    setSaving(true);
    try {
      const projectData = editor.getProjectData();
      const html = editor.getHtml();
      const css = editor.getCss();
      await saveMutation.mutateAsync({
        grapesjs_data: projectData,
        html_content: html,
        css_content: css,
      });
      toast.success("Diseno guardado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    setPublishing(true);
    try {
      const projectData = editor.getProjectData();
      const html = editor.getHtml();
      const css = editor.getCss();
      await saveMutation.mutateAsync({
        grapesjs_data: projectData,
        html_content: html,
        css_content: css,
        is_published: true,
      });
      toast.success("Landing publicada");
    } catch {
      toast.error("Error al publicar");
    } finally {
      setPublishing(false);
    }
  };

  const [activePanel, setActivePanel] = useState("blocks");

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e" }}>
        <Loader2 size={32} style={{ color: "#4DBEA4", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#1a1a2e", overflow: "hidden" }}>
      {/* Top Toolbar */}
      <div className="designer-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/designs")}
            style={{ background: "transparent", color: "#aaa", display: "flex", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <div style={{ width: 1, height: 24, background: "#333" }} />
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
            {design?.title || "Editor"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Device toggle */}
          <div style={{ display: "flex", gap: 2, background: "#252540", borderRadius: 6, padding: 2 }}>
            {[
              { name: "Desktop", icon: <Monitor size={14} /> },
              { name: "Tablet", icon: <Tablet size={14} /> },
              { name: "Mobile", icon: <Smartphone size={14} /> },
            ].map((d) => (
              <button
                key={d.name}
                onClick={() => handleDeviceChange(d.name)}
                style={{
                  background: device === d.name ? "#4DBEA4" : "transparent",
                  color: device === d.name ? "#fff" : "#888",
                  padding: "4px 8px",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {d.icon}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: "#333" }} />

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: "#252540", color: "#ddd", display: "flex", alignItems: "center", gap: 6 }}
          >
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
            Guardar
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{ background: "#4DBEA4", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}
          >
            {publishing ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <UploadIcon size={14} />}
            Publicar
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Side Panel - Blocks/Layers */}
        <div style={{ width: 260, background: "#1a1a2e", borderRight: "1px solid #2a2a3a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Panel tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #2a2a3a" }}>
            {[
              { key: "blocks", label: "Bloques" },
              { key: "layers", label: "Capas" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePanel(tab.key)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "transparent",
                  color: activePanel === tab.key ? "#4DBEA4" : "#888",
                  borderBottom: activePanel === tab.key ? "2px solid #4DBEA4" : "2px solid transparent",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  borderBottomWidth: 2,
                  borderBottomStyle: "solid",
                  borderBottomColor: activePanel === tab.key ? "#4DBEA4" : "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div id="blocks-panel" style={{ flex: 1, overflowY: "auto", display: activePanel === "blocks" ? "block" : "none" }} />
          <div id="layers-panel" style={{ flex: 1, overflowY: "auto", display: activePanel === "layers" ? "block" : "none" }} />
        </div>

        {/* Canvas */}
        <div ref={containerRef} style={{ flex: 1 }} />

        {/* Right Side Panel - Styles */}
        <div id="styles-panel" style={{ width: 260, background: "#1a1a2e", borderLeft: "1px solid #2a2a3a", overflowY: "auto" }} />
      </div>
    </div>
  );
}
