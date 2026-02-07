import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useStore from '../hooks/useStore';
import { useQuery } from '@tanstack/react-query';
import useCheckoutConfig from '../hooks/useCheckoutConfig';
import { formatPrice } from '../components/ProductCard';
import QuantityOfferSelector from '../components/checkout/QuantityOfferSelector';
import { usePixel } from '../components/PixelProvider';
import { mergeConfig } from '../components/checkout/defaults';
import CheckoutBlockRenderer from '../components/checkout/CheckoutBlockRenderer';
import CheckoutStickyButton from '../components/checkout/CheckoutStickyButton';

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, '/api/uploads');
};

export default function Checkout() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { config, products, slug, isLoading, error } = useStore();
  const { checkoutConfig, isLoading: configLoading } = useCheckoutConfig();
  const { trackEvent } = usePixel();

  const [form, setForm] = useState({
    customer_first_name: '',
    customer_last_name: '',
    customer_phone: '',
    address: '',
    address_extra: '',
    city: '',
    state: '',
    email: '',
    notes: '',
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const product = products?.find((p) => p.slug === productSlug);
  const currency = config?.currency || 'COP';
  const country = config?.country || 'CO';
  const storeName = config?.store_name || 'Tienda';

  // Merge fetched checkout config with defaults
  const cfg = mergeConfig(checkoutConfig);

  // Fetch quantity offer for this product
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const { data: quantityOffer } = useQuery({
    queryKey: ['quantity-offer', slug, product?.id],
    queryFn: async () => {
      if (!slug || !product?.id) return null;
      const res = await fetch(`${API_BASE}/api/store/${slug}/quantity-offers/${product.id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    },
    enabled: !!slug && !!product?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Load Google Font for form typography
  useEffect(() => {
    const GOOGLE_FONT_MAP = {
      'Inter, sans-serif': 'Inter',
      'Poppins, sans-serif': 'Poppins',
      'Montserrat, sans-serif': 'Montserrat',
      'Roboto, sans-serif': 'Roboto',
      'Open Sans, sans-serif': 'Open+Sans',
      'Lato, sans-serif': 'Lato',
    };
    const family = cfg.form_font_family || 'Inter, sans-serif';
    const googleName = GOOGLE_FONT_MAP[family];
    if (!googleName) return;
    const linkId = `gfont-${googleName}`;
    if (document.getElementById(linkId)) return;
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${googleName}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }, [cfg.form_font_family]);

  useEffect(() => {
    if (product) {
      trackEvent('InitiateCheckout', {
        id: product.id,
        name: product.name,
        price: product.price,
        currency,
      });
    }
  }, [product, currency, trackEvent]);

  useEffect(() => {
    if (product?.variants?.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

  // Register impression when quantity offer loads
  useEffect(() => {
    if (quantityOffer?.id && slug) {
      fetch(`${API_BASE}/api/store/${slug}/quantity-offers/${quantityOffer.id}/impression`, {
        method: 'POST',
      }).catch(() => {});
    }
  }, [quantityOffer?.id, slug]);

  const unitPrice = selectedVariant?.price || product?.price || 0;
  const quantity = selectedOffer?.quantity || 1;
  const totalPrice = selectedOffer?.totalPrice || unitPrice * quantity;
  const totalPriceFormatted = formatPrice(totalPrice, currency, country);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Progressive capture on blur
  const handleBlur = useCallback(
    async (e) => {
      const { name, value } = e.target;
      if (!value.trim() || !slug || !product) return;

      try {
        const API_URL = import.meta.env.VITE_API_URL || "";
        await fetch(`${API_URL}/api/store/${slug}/cart/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: product.id,
            product_slug: product.slug,
            customer_name: `${form.customer_first_name} ${form.customer_last_name}`.trim(),
            [name]: value.trim(),
            ...form,
          }),
        });
      } catch {
        // Silently fail on capture
      }
    },
    [slug, product, form]
  );

  const validate = () => {
    const errors = {};
    // Validate based on enabled required fields in config
    const fieldBlocks = (cfg.form_blocks || []).filter(
      (b) => b.type === 'field' && b.enabled && b.required
    );
    for (const fb of fieldBlocks) {
      if (!form[fb.field_key]?.trim()) {
        errors[fb.field_key] = 'Este campo es obligatorio';
      }
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Correo electronico invalido';
    }
    if (form.customer_phone && !/^\+?[\d\s-]{7,15}$/.test(form.customer_phone.replace(/\s/g, ''))) {
      errors.customer_phone = 'Numero de telefono invalido';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        ...form,
        customer_name: `${form.customer_first_name} ${form.customer_last_name}`.trim(),
        product_id: product.id,
        product_slug: product.slug,
        variant_id: selectedVariant?.id || null,
        variant_name: selectedVariant?.name || null,
        quantity,
        unit_price: selectedOffer?.unitPrice || unitPrice,
        total_price: totalPrice,
      };

      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/api/store/${slug}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || 'Error al crear el pedido');
      }

      const data = await res.json();

      trackEvent('Purchase', {
        id: product.id,
        name: product.name,
        price: totalPrice,
        currency,
      });

      navigate(`/confirmacion/${data.id || data.order_id}`);
    } catch (err) {
      setFormErrors({ _general: err.message || 'Error al procesar el pedido. Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || configLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Producto no encontrado</h1>
          <p className="mb-6 text-gray-500">No pudimos encontrar el producto solicitado.</p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const productImage =
    product.images && product.images.length > 0
      ? getImageUrl(typeof product.images[0] === 'string'
        ? product.images[0]
        : product.images[0].image_url || product.images[0].url || product.images[0].src)
      : 'https://placehold.co/200x200/e2e8f0/94a3b8?text=Sin+imagen';

  // Get sorted enabled blocks
  const blocks = [...(cfg.form_blocks || [])]
    .filter((b) => b.enabled)
    .sort((a, b) => a.position - b.position);

  // Separate field blocks to group them inside a card
  const fieldBlockTypes = new Set(['field']);
  let inFieldGroup = false;
  const renderGroups = [];
  let currentFieldGroup = [];

  for (const block of blocks) {
    if (fieldBlockTypes.has(block.type)) {
      if (!inFieldGroup) {
        inFieldGroup = true;
        currentFieldGroup = [];
      }
      currentFieldGroup.push(block);
    } else {
      if (inFieldGroup) {
        renderGroups.push({ type: 'field_group', fields: currentFieldGroup });
        inFieldGroup = false;
        currentFieldGroup = [];
      }
      renderGroups.push(block);
    }
  }
  if (inFieldGroup && currentFieldGroup.length > 0) {
    renderGroups.push({ type: 'field_group', fields: currentFieldGroup });
  }

  const sharedProps = {
    cfg,
    form,
    formErrors,
    onChange: handleChange,
    onBlur: handleBlur,
    product,
    productImage,
    selectedVariant,
    setSelectedVariant,
    selectedOffer,
    setSelectedOffer,
    quantityOffer,
    unitPrice,
    quantity,
    totalPrice,
    formatPriceFn: formatPrice,
    currency,
    country,
    submitting,
    onSubmit: handleSubmit,
    totalPriceFormatted,
    QuantityOfferSelector,
    getImageUrl,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            {config?.logo_url ? (
              <img src={getImageUrl(config.logo_url)} alt={storeName} className="h-8 w-auto" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">
                {storeName.charAt(0)}
              </div>
            )}
            <span className="font-bold text-gray-800">{storeName}</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Compra segura
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-lg px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-5" style={{ fontFamily: cfg.form_font_family || 'Inter, sans-serif' }}>
          {renderGroups.map((item, idx) => {
            // Field group: wrap consecutive fields in a card
            if (item.type === 'field_group') {
              return (
                <div
                  key={`field-group-${idx}`}
                  className="rounded-xl p-4 shadow-sm"
                  style={{
                    backgroundColor: cfg.form_bg_color,
                    borderRadius: `${cfg.form_border_radius}px`,
                    borderWidth: `${cfg.form_border_width}px`,
                    borderColor: cfg.form_border_color,
                    borderStyle: cfg.form_border_width > 0 ? 'solid' : 'none',
                    fontFamily: cfg.form_font_family || 'Inter, sans-serif',
                  }}
                >
                  <h2 className="mb-4 text-lg font-bold" style={{ color: cfg.form_text_color }}>
                    {cfg.form_title}
                  </h2>
                  {formErrors._general && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {formErrors._general}
                    </div>
                  )}
                  <div className="space-y-4">
                    {item.fields.map((field) => (
                      <CheckoutBlockRenderer
                        key={field.field_key || `field-${field.position}`}
                        block={field}
                        {...sharedProps}
                      />
                    ))}
                  </div>
                </div>
              );
            }
            // Non-field block
            return (
              <CheckoutBlockRenderer
                key={`${item.type}-${item.position || idx}`}
                block={item}
                {...sharedProps}
              />
            );
          })}
        </form>
      </main>

      {/* Sticky CTA button */}
      {cfg.cta_sticky && (
        <CheckoutStickyButton
          cfg={cfg}
          totalPriceFormatted={totalPriceFormatted}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
