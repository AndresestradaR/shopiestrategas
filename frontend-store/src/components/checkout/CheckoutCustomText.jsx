import SafeHtml from '../SafeHtml';

export default function CheckoutCustomText({ block }) {
  const { text, html, align, font_size, color, bold } = block;

  if (html) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <SafeHtml html={html} />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p
        style={{
          textAlign: align || 'left',
          fontSize: font_size ? `${font_size}px` : undefined,
          color: color || undefined,
          fontWeight: bold ? 'bold' : undefined,
        }}
      >
        {text}
      </p>
    </div>
  );
}
