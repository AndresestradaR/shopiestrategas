const getImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, '/api/uploads');
};

export default function CheckoutImage({ block }) {
  const { image_url, alt, width, border_radius } = block;
  if (!image_url) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <img
        src={getImageUrl(image_url)}
        alt={alt || ''}
        style={{
          width: width || '100%',
          borderRadius: border_radius != null ? `${border_radius}px` : '8px',
        }}
        className="mx-auto block"
      />
    </div>
  );
}
