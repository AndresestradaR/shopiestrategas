import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useStore from '../hooks/useStore';
import { formatPrice } from '../components/ProductCard';
import QuantityOffers from '../components/QuantityOffers';
import { usePixel } from '../components/PixelProvider';

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  return `${apiBase}${imgUrl}`;
};

export default function Checkout() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { config, products, slug, isLoading, error } = useStore();
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
  const offers = config?.checkout_offers || product?.checkout_offers || [];

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

  useEffect(() => {
    if (offers.length > 0 && !selectedOffer) {
      const highlighted = offers.find((o) => o.is_highlighted);
      const initial = highlighted || offers[0];
      setSelectedOffer({
        quantity: initial.quantity,
        unitPrice: initial.price,
        totalPrice: initial.price * initial.quantity,
      });
    }
  }, [offers, selectedOffer]);

  const unitPrice = selectedVariant?.price || product?.price || 0;
  const quantity = selectedOffer?.quantity || 1;
  const totalPrice = selectedOffer?.totalPrice || unitPrice * quantity;

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
    if (!form.customer_first_name?.trim()) errors.customer_first_name = 'Este campo es obligatorio';
    if (!form.customer_last_name?.trim()) errors.customer_last_name = 'Este campo es obligatorio';
    if (!form.customer_phone?.trim()) errors.customer_phone = 'Este campo es obligatorio';
    if (!form.address?.trim()) errors.address = 'Este campo es obligatorio';
    if (!form.city?.trim()) errors.city = 'Este campo es obligatorio';
    if (!form.state?.trim()) errors.state = 'Este campo es obligatorio';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Correo electronico invalido';
    }
    if (form.customer_phone && !/^\+?[\d\s-]{7,15}$/.test(form.customer_phone.replace(/\s/g, ''))) {
      errors.customer_phone = 'Numero de telefono invalido';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  if (isLoading) {
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

  /* ---- Inline SVG icon components ---- */
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
  const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
  const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
  const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
  const NoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );

  /* Helper: render a form field row with icon */
  const renderField = ({ name, label, icon, required, type = 'text', placeholder = '' }) => (
    <div key={name}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-bold text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-0 flex h-10 w-10 items-center justify-center rounded-l-lg bg-gray-100">
          {icon}
        </span>
        <input
          id={name}
          name={name}
          type={type}
          value={form[name] || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-lg border py-3 pl-12 pr-4 text-sm outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${
            formErrors[name]
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-white'
          }`}
        />
      </div>
      {formErrors[name] && (
        <p className="mt-1 text-xs text-red-500">{formErrors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* ── Header ── */}
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

      {/* ── Main single-column content ── */}
      <main className="mx-auto max-w-lg px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Product card ── */}
          <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
            <img
              src={productImage}
              alt={product.name}
              className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-gray-800 line-clamp-2">
                {product.name}
              </h2>
              {selectedVariant && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {selectedVariant.name || selectedVariant.title}
                </p>
              )}
              <p className="mt-1 text-base font-bold text-[var(--color-primary)]">
                {formatPrice(unitPrice, currency, country)}
              </p>
            </div>
          </div>

          {/* ── Quantity offers ── */}
          {offers.length > 0 && (
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <QuantityOffers
                offers={offers}
                selectedQty={selectedOffer?.quantity || 1}
                onSelect={setSelectedOffer}
                currency={currency}
                country={country}
                basePrice={unitPrice}
              />
            </div>
          )}

          {/* ── Variant selector chips ── */}
          {product.variants && product.variants.length > 0 && (
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600">
                {product.variant_label || 'Selecciona tu variante'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id || variant.name}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                      selectedVariant?.id === variant.id ||
                      selectedVariant?.name === variant.name
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {variant.name || variant.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Price summary ── */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal {quantity > 1 && `(${quantity} uds)`}</span>
                <span>{formatPrice(totalPrice, currency, country)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envio</span>
                <span className="font-semibold text-green-600">Gratis</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-800">
                <span>Total</span>
                <span className="text-[var(--color-primary)]">
                  {formatPrice(totalPrice, currency, country)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Form: Datos de envio ── */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-800">Datos de envio</h2>

            {formErrors._general && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {formErrors._general}
              </div>
            )}

            <div className="space-y-4">
              {/* customer_first_name */}
              {renderField({
                name: 'customer_first_name',
                label: 'Nombre',
                icon: <UserIcon />,
                required: true,
                placeholder: 'Nombre',
              })}

              {/* customer_last_name */}
              {renderField({
                name: 'customer_last_name',
                label: 'Apellido',
                icon: <UserIcon />,
                required: true,
                placeholder: 'Apellido',
              })}

              {/* customer_phone */}
              {renderField({
                name: 'customer_phone',
                label: 'Telefono',
                icon: <PhoneIcon />,
                required: true,
                type: 'tel',
                placeholder: 'WhatsApp',
              })}

              {/* address */}
              {renderField({
                name: 'address',
                label: 'Direccion',
                icon: <MapPinIcon />,
                required: true,
                placeholder: 'Calle carrera #casa',
              })}

              {/* address_extra */}
              {renderField({
                name: 'address_extra',
                label: 'Complemento direccion',
                icon: <MapPinIcon />,
                required: false,
                placeholder: 'Barrio y punto de referencia',
              })}

              {/* state */}
              {renderField({
                name: 'state',
                label: 'Departamento',
                icon: <MapPinIcon />,
                required: true,
                placeholder: 'Departamento',
              })}

              {/* city */}
              {renderField({
                name: 'city',
                label: 'Ciudad',
                icon: <MapPinIcon />,
                required: true,
                placeholder: 'Ciudad',
              })}

              {/* email */}
              {renderField({
                name: 'email',
                label: 'Correo electronico',
                icon: <MailIcon />,
                required: false,
                type: 'email',
                placeholder: 'email@ejemplo.com',
              })}

              {/* notes */}
              <div>
                <label htmlFor="notes" className="mb-1.5 block text-sm font-bold text-gray-700">
                  Notas adicionales
                </label>
                <div className="relative flex">
                  <span className="pointer-events-none absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-tl-lg bg-gray-100">
                    <NoteIcon />
                  </span>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Indicaciones especiales para la entrega..."
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            Pago seguro contraentrega
          </div>
        </form>
      </main>

      {/* ── Sticky CTA button ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-lg">
          <button
            type="submit"
            form={undefined}
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-amber-500 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </span>
            ) : (
              `Completar pedido - ${formatPrice(totalPrice, currency, country)}`
            )}
          </button>
          <p className="mt-1.5 text-center text-xs text-gray-500">
            Envio gratis &middot; Pagas al recibir
          </p>
        </div>
      </div>
    </div>
  );
}
