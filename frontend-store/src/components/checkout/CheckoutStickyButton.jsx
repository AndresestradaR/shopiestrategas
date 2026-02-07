import CheckoutSubmitButton from './CheckoutSubmitButton';

export default function CheckoutStickyButton({ cfg, totalPriceFormatted, submitting, onSubmit }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-lg">
        <CheckoutSubmitButton
          cfg={cfg}
          totalPriceFormatted={totalPriceFormatted}
          submitting={submitting}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
