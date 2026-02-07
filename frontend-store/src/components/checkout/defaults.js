export const DEFAULT_BLOCKS = [
  { type: 'product_card', position: 0, enabled: true },
  { type: 'variants', position: 1, enabled: true },
  { type: 'price_summary', position: 2, enabled: true },
  { type: 'field', position: 3, enabled: true, field_key: 'customer_first_name', label: 'Nombre', placeholder: 'Nombre', required: true, icon: 'user' },
  { type: 'field', position: 4, enabled: true, field_key: 'customer_last_name', label: 'Apellido', placeholder: 'Apellido', required: true, icon: 'user' },
  { type: 'field', position: 5, enabled: true, field_key: 'customer_phone', label: 'Telefono', placeholder: 'WhatsApp', required: true, icon: 'phone', input_type: 'tel' },
  { type: 'field', position: 6, enabled: true, field_key: 'address', label: 'Direccion', placeholder: 'Calle carrera #casa', required: true, icon: 'map-pin' },
  { type: 'field', position: 7, enabled: true, field_key: 'address_extra', label: 'Complemento direccion', placeholder: 'Barrio y punto de referencia', required: false, icon: 'map-pin' },
  { type: 'field', position: 8, enabled: true, field_key: 'state', label: 'Departamento', placeholder: 'Departamento', required: true, icon: 'map-pin' },
  { type: 'field', position: 9, enabled: true, field_key: 'city', label: 'Ciudad', placeholder: 'Ciudad', required: true, icon: 'map-pin' },
  { type: 'field', position: 10, enabled: true, field_key: 'email', label: 'Correo electronico', placeholder: 'email@ejemplo.com', required: false, icon: 'mail', input_type: 'email' },
  { type: 'field', position: 11, enabled: true, field_key: 'notes', label: 'Notas adicionales', placeholder: 'Indicaciones especiales para la entrega...', required: false, icon: 'note', input_type: 'textarea' },
  { type: 'trust_badge', position: 12, enabled: true },
  { type: 'submit_button', position: 13, enabled: true },
];

export const DEFAULT_CONFIG = {
  cta_text: 'Completar pedido - {order_total}',
  cta_subtitle: null,
  cta_animation: 'none',
  cta_icon: null,
  cta_sticky: true,
  cta_sticky_position: 'bottom',
  cta_bg_color: '#F59E0B',
  cta_text_color: '#FFFFFF',
  cta_font_size: 18,
  cta_border_radius: 12,
  cta_border_width: 0,
  cta_border_color: '#000000',
  cta_shadow: 'lg',
  cta_sticky_mobile: true,
  cta_subtitle_font_size: 12,
  cta_font_family: 'Inter, sans-serif',
  form_bg_color: '#FFFFFF',
  form_text_color: '#1F2937',
  form_font_size: 14,
  form_border_radius: 12,
  form_border_width: 1,
  form_border_color: '#E5E7EB',
  form_shadow: 'sm',
  form_input_style: 'outline',
  form_font_family: 'Inter, sans-serif',
  form_blocks: DEFAULT_BLOCKS,
  custom_fields: null,
  form_title: 'Datos de envio',
  success_message: 'Tu pedido ha sido recibido con exito.',
  shipping_text: 'Envio gratis',
  payment_method_text: 'Pago contraentrega',
  trust_badge_text: 'Pago seguro contraentrega',
  show_product_image: true,
  show_price_summary: true,
  show_trust_badges: true,
  show_shipping_method: false,
  country: 'CO',
};

export function mergeConfig(fetched) {
  if (!fetched) return { ...DEFAULT_CONFIG };
  const merged = { ...DEFAULT_CONFIG };
  for (const key of Object.keys(merged)) {
    if (fetched[key] !== undefined && fetched[key] !== null) {
      merged[key] = fetched[key];
    }
  }
  if (!merged.form_blocks || merged.form_blocks.length === 0) {
    merged.form_blocks = DEFAULT_BLOCKS;
  }
  return merged;
}
