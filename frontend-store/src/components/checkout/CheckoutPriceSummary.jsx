export default function CheckoutPriceSummary({ quantity, totalPrice, shippingText, formatPrice }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal {quantity > 1 && `(${quantity} uds)`}</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Envio</span>
          <span className="font-semibold text-green-600">{shippingText || 'Gratis'}</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-800">
          <span>Total</span>
          <span className="text-[var(--color-primary)]">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
