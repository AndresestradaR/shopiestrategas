import { formatPrice } from './ProductCard';

export default function QuantityOffers({
  offers,
  selectedQty,
  onSelect,
  currency = 'COP',
  country = 'CO',
  basePrice,
}) {
  if (!offers || offers.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">
        Selecciona la cantidad
      </h3>

      <div className="space-y-2">
        {offers.map((offer) => {
          const isSelected = selectedQty === offer.quantity;
          const totalPrice = offer.price * offer.quantity;
          const savings = basePrice
            ? (basePrice - offer.price) * offer.quantity
            : 0;

          return (
            <button
              key={offer.quantity}
              type="button"
              onClick={() =>
                onSelect({
                  quantity: offer.quantity,
                  unitPrice: offer.price,
                  totalPrice,
                })
              }
              className={`relative flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Radio indicator */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    isSelected
                      ? 'border-[var(--color-primary)]'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      {offer.quantity} {offer.quantity === 1 ? 'unidad' : 'unidades'}
                    </span>
                    {offer.is_highlighted && (
                      <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-bold text-white">
                        {offer.label || 'Mas popular'}
                      </span>
                    )}
                    {!offer.is_highlighted && offer.label && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        {offer.label}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatPrice(offer.price, currency, country)} c/u
                  </span>
                </div>
              </div>

              {/* Price and savings */}
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--color-primary)]">
                  {formatPrice(totalPrice, currency, country)}
                </div>
                {savings > 0 && (
                  <div className="text-xs font-semibold text-green-600">
                    Ahorras {formatPrice(savings, currency, country)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
