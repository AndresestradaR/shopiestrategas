import CheckoutField from './CheckoutField';
import CheckoutCustomText from './CheckoutCustomText';
import CheckoutImage from './CheckoutImage';
import CheckoutPriceSummary from './CheckoutPriceSummary';
import CheckoutDivider from './CheckoutDivider';
import CheckoutSpacer from './CheckoutSpacer';
import CheckoutSubmitButton from './CheckoutSubmitButton';

export default function CheckoutBlockRenderer({
  block,
  cfg,
  form,
  formErrors,
  onChange,
  onBlur,
  product,
  productImage,
  selectedVariant,
  setSelectedVariant,
  selectedOffer,
  setSelectedOffer,
  offers,
  unitPrice,
  quantity,
  totalPrice,
  formatPriceFn,
  currency,
  country,
  submitting,
  onSubmit,
  totalPriceFormatted,
  QuantityOffers,
  getImageUrl,
}) {
  switch (block.type) {
    case 'product_card':
      if (!cfg.show_product_image && !product) return null;
      return (
        <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
          {cfg.show_product_image && (
            <img
              src={productImage}
              alt={product.name}
              className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</h2>
            {selectedVariant && (
              <p className="mt-0.5 text-xs text-gray-500">
                {selectedVariant.name || selectedVariant.title}
              </p>
            )}
            <p className="mt-1 text-base font-bold text-[var(--color-primary)]">
              {formatPriceFn(unitPrice, currency, country)}
            </p>
          </div>
        </div>
      );

    case 'offers':
      if (!offers || offers.length === 0) return null;
      return (
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
      );

    case 'variants':
      if (!product?.variants || product.variants.length === 0) return null;
      return (
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
                  selectedVariant?.id === variant.id || selectedVariant?.name === variant.name
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {variant.name || variant.title}
              </button>
            ))}
          </div>
        </div>
      );

    case 'price_summary':
      if (!cfg.show_price_summary) return null;
      return (
        <CheckoutPriceSummary
          quantity={quantity}
          totalPrice={totalPrice}
          shippingText={cfg.shipping_text}
          formatPrice={(val) => formatPriceFn(val, currency, country)}
        />
      );

    case 'field':
      return (
        <CheckoutField
          block={block}
          form={form}
          formErrors={formErrors}
          onChange={onChange}
          onBlur={onBlur}
          inputStyle={cfg.form_input_style}
        />
      );

    case 'custom_text':
      return <CheckoutCustomText block={block} />;

    case 'image':
      return <CheckoutImage block={block} />;

    case 'divider':
      return <CheckoutDivider block={block} />;

    case 'spacer':
      return <CheckoutSpacer block={block} />;

    case 'trust_badge':
      if (!cfg.show_trust_badges) return null;
      return (
        <div className="flex items-center justify-center gap-4 py-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span>Pago seguro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5 0h7.5m-7.5 0-1-3m8.5 3h2.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5m-16.5 0H1.5m16.5 0 1-3" />
            </svg>
            <span>Envio gratis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            <span>Contraentrega</span>
          </div>
        </div>
      );

    // Backward compat: don't render removed block types
    case 'shipping_info':
    case 'payment_method':
      return null;

    case 'submit_button':
      if (cfg.cta_sticky) return null;
      return (
        <CheckoutSubmitButton
          cfg={cfg}
          totalPriceFormatted={totalPriceFormatted}
          submitting={submitting}
          onSubmit={onSubmit}
        />
      );

    default:
      return null;
  }
}
