import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useStore from '../hooks/useStore';
import { formatPrice } from '../components/ProductCard';
import { usePixel } from '../components/PixelProvider';
import SafeHtml from '../components/SafeHtml';

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, '/api/uploads');
};

export default function Product() {
  const { slug: productSlug } = useParams();
  const { config, products, isLoading, error } = useStore();
  const { trackEvent } = usePixel();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const product = products?.find((p) => p.slug === productSlug);
  const currency = config?.currency || 'COP';
  const country = config?.country || 'CO';
  const storeName = config?.store_name || 'Tienda';

  useEffect(() => {
    if (product) {
      trackEvent('ViewContent', {
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
          <p className="mb-6 text-gray-500">El producto que buscas no existe o fue eliminado.</p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-colors hover:brightness-90"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => getImageUrl(typeof img === 'string' ? img : img.image_url || img.url || img.src))
      : ['https://placehold.co/600x600/e2e8f0/94a3b8?text=Sin+imagen'];

  const currentPrice = selectedVariant?.price || product.price;
  const comparePrice = selectedVariant?.compare_at_price || product.compare_at_price;
  const discount =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
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
          <Link to="/" className="text-sm font-medium text-gray-500 transition-colors hover:text-[var(--color-primary)]">
            &larr; Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-gray-50">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                  -{discount}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="mb-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mb-6 flex items-center gap-3">
              <span className="text-3xl font-bold text-[var(--color-primary)]">
                {formatPrice(currentPrice, currency, country)}
              </span>
              {comparePrice && comparePrice > currentPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(comparePrice, currency, country)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-bold text-red-600">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600">
                  {product.variant_label || 'Variante'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id || variant.name}
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

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-600">
                  Descripcion
                </h3>
                <SafeHtml html={product.description} className="prose prose-sm max-w-none text-gray-600" />
              </div>
            )}

            {/* CTA Button */}
            <Link
              to={`/checkout/${product.slug}`}
              className="mb-8 block w-full rounded-xl bg-[var(--color-primary)] py-4 text-center text-lg font-bold text-white shadow-lg transition-all hover:brightness-90 hover:shadow-xl"
            >
              Pedir Ahora
            </Link>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Envio seguro</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Pago contraentrega</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Stock disponible</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
