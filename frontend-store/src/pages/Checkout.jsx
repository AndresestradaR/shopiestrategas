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

const DEFAULT_FIELDS = [
  { name: 'customer_name', label: 'Nombre completo', type: 'text', required: true },
  { name: 'customer_phone', label: 'Telefono / WhatsApp', type: 'tel', required: true },
  { name: 'address', label: 'Direccion de entrega', type: 'text', required: true },
  { name: 'city', label: 'Ciudad', type: 'text', required: true },
  { name: 'state', label: 'Departamento / Estado', type: 'text', required: false },
  { name: 'email', label: 'Correo electronico', type: 'email', required: false },
];

export default function Checkout() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { config, products, slug, isLoading, error } = useStore();
  const { trackEvent } = usePixel();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
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
  const checkoutFields = config?.checkout_fields || DEFAULT_FIELDS;
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
    const fields = checkoutFields.length > 0 ? checkoutFields : DEFAULT_FIELDS;
    fields.forEach((field) => {
      if (field.required && !form[field.name]?.trim()) {
        errors[field.name] = 'Este campo es obligatorio';
      }
    });
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

  const fields = checkoutFields.length > 0 ? checkoutFields : DEFAULT_FIELDS;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
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
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Compra segura
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Left: Form */}
            <div className="lg:col-span-3">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-800">
                  Datos de envio
                </h2>

                {formErrors._general && (
                  <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    {formErrors._general}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className={
                        field.name === 'address' || field.name === 'email'
                          ? 'sm:col-span-2'
                          : ''
                      }
                    >
                      <label
                        htmlFor={field.name}
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        {field.label}
                        {field.required && (
                          <span className="ml-1 text-red-400">*</span>
                        )}
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type || 'text'}
                        value={form[field.name] || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required={field.required}
                        placeholder={field.placeholder || ''}
                        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${
                          formErrors[field.name]
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      />
                      {formErrors[field.name] && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="notes"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Indicaciones especiales para la entrega..."
                      className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Variant selector in checkout */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
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
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-20 space-y-6">
                {/* Product Summary */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-gray-800">
                    Resumen del pedido
                  </h2>

                  <div className="mb-4 flex gap-4">
                    <img
                      src={productImage}
                      alt={product.name}
                      className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="mb-1 text-sm font-semibold text-gray-800 line-clamp-2">
                        {product.name}
                      </h3>
                      {selectedVariant && (
                        <p className="text-xs text-gray-500">
                          {selectedVariant.name || selectedVariant.title}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-bold text-[var(--color-primary)]">
                        {formatPrice(unitPrice, currency, country)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity offers */}
                  {offers.length > 0 && (
                    <QuantityOffers
                      offers={offers}
                      selectedQty={selectedOffer?.quantity || 1}
                      onSelect={setSelectedOffer}
                      currency={currency}
                      country={country}
                      basePrice={unitPrice}
                    />
                  )}

                  {/* Totals */}
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                    {quantity > 1 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Cantidad</span>
                        <span>{quantity} unidades</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Envio</span>
                      <span className="font-medium text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-[var(--color-primary)]">
                        {formatPrice(totalPrice, currency, country)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[var(--color-primary)] py-4 text-lg font-bold text-white shadow-lg transition-all hover:brightness-90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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
                    'Confirmar pedido'
                  )}
                </button>

                {/* Trust */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  Pago seguro contraentrega
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
