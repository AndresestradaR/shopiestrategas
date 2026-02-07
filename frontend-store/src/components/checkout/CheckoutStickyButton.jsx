import CheckoutSubmitButton from './CheckoutSubmitButton';

const animationStyles = {
  shake: `
    @keyframes ck-shake { 0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-4px)} 20%,40%,60%,80%{transform:translateX(4px)} }
    .ck-anim-shake { animation: ck-shake 2s ease-in-out infinite; }
  `,
  pulse: `
    @keyframes ck-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
    .ck-anim-pulse { animation: ck-pulse 2s ease-in-out infinite; }
  `,
  shine: `
    @keyframes ck-shine { 0%{background-position:-200%} 100%{background-position:200%} }
    .ck-anim-shine { background-image:linear-gradient(90deg,transparent 40%,rgba(255,255,255,0.3) 50%,transparent 60%); background-size:200%; animation:ck-shine 3s linear infinite; }
  `,
  bounce: `
    @keyframes ck-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    .ck-anim-bounce { animation: ck-bounce 1.5s ease-in-out infinite; }
  `,
};

export default function CheckoutStickyButton({ cfg, totalPriceFormatted, submitting, onSubmit }) {
  const animation = cfg.cta_animation || 'none';
  const animClass = animation !== 'none' ? `ck-anim-${animation}` : '';
  const styleTag = animationStyles[animation] || '';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      {styleTag && <style>{styleTag}</style>}
      <div className={`mx-auto max-w-lg ${animClass}`}>
        <CheckoutSubmitButton
          cfg={cfg}
          totalPriceFormatted={totalPriceFormatted}
          submitting={submitting}
          onSubmit={onSubmit}
        />
        {cfg.cta_subtitle && (
          <p className="mt-1.5 text-center text-xs text-gray-500">{cfg.cta_subtitle}</p>
        )}
        {!cfg.cta_subtitle && (
          <p className="mt-1.5 text-center text-xs text-gray-500">
            {cfg.shipping_text || 'Envio gratis'} &middot; {cfg.payment_method_text || 'Pagas al recibir'}
          </p>
        )}
      </div>
    </div>
  );
}
