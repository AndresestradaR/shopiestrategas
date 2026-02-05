import { Link } from 'react-router-dom';

function formatPrice(price, currency = 'COP', country = 'CO') {
  if (price == null) return '';
  const localeMap = {
    CO: 'es-CO',
    MX: 'es-MX',
    GT: 'es-GT',
    PE: 'es-PE',
    EC: 'es-EC',
    CL: 'es-CL',
  };
  const locale = localeMap[country] || 'es-CO';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getDiscountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export default function ProductCard({ product, currency, country }) {
  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://placehold.co/400x400/e2e8f0/94a3b8?text=Sin+imagen';
  const imageUrl = typeof image === 'string' ? image : image.url || image.src;

  const discount = getDiscountPercent(product.price, product.compare_at_price);

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-[var(--color-primary)]">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--color-primary)]">
            {formatPrice(product.price, currency, country)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compare_at_price, currency, country)}
            </span>
          )}
        </div>

        <Link
          to={`/checkout/${product.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-3 block w-full rounded-lg bg-[var(--color-primary)] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:brightness-90"
        >
          Pedir Ahora
        </Link>
      </div>
    </Link>
  );
}

export { formatPrice, getDiscountPercent };
