import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../hooks/useStore';
import ProductCard from '../components/ProductCard';
import { usePixel } from '../components/PixelProvider';

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  return `${apiBase}${imgUrl}`;
};

function TrustBadges() {
  const badges = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      title: 'Envio seguro',
      desc: 'Tu pedido llega protegido',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
        </svg>
      ),
      title: 'Pago contraentrega',
      desc: 'Pagas al recibir tu pedido',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
      title: 'Soporte WhatsApp',
      desc: 'Te ayudamos al instante',
    },
  ];

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm"
            >
              <div className="mb-3 text-[var(--color-primary)]">{badge.icon}</div>
              <h3 className="mb-1 font-bold text-gray-800">{badge.title}</h3>
              <p className="text-sm text-gray-500">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { config, products, isLoading, error } = useStore();
  const { trackEvent } = usePixel();

  useEffect(() => {
    trackEvent('PageView');
  }, [trackEvent]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Tienda no disponible</h1>
          <p className="text-gray-500">No pudimos cargar esta tienda. Intenta de nuevo mas tarde.</p>
        </div>
      </div>
    );
  }

  const storeName = config?.store_name || 'Tienda';
  const logo = getImageUrl(config?.logo_url);
  const heroImage = getImageUrl(config?.hero_image_url || config?.banner_url);
  const heroTitle = config?.hero_title || config?.store_name || 'Bienvenido';
  const heroSubtitle = config?.hero_subtitle || 'Descubre nuestros productos exclusivos';
  const currency = config?.currency || 'COP';
  const country = config?.country || 'CO';
  const socialLinks = config?.social_links || {};
  const pages = config?.pages || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-lg font-bold text-white">
                {storeName.charAt(0)}
              </div>
            )}
            <span className="text-lg font-bold text-gray-800">{storeName}</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <Link to="/" className="transition-colors hover:text-[var(--color-primary)]">
              Inicio
            </Link>
            {config?.whatsapp_number && (
              <a
                href={`https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--color-primary)]"
              >
                Contacto
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      {heroImage && (
        <section className="relative overflow-hidden bg-gray-900">
          <img
            src={heroImage}
            alt={heroTitle}
            className="h-64 w-full object-cover opacity-80 sm:h-80 md:h-96"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="px-4 text-center">
              <h1 className="mb-3 text-3xl font-extrabold text-white drop-shadow-lg sm:text-4xl md:text-5xl">
                {heroTitle}
              </h1>
              <p className="mx-auto max-w-xl text-base text-white/90 drop-shadow sm:text-lg">
                {heroSubtitle}
              </p>
            </div>
          </div>
        </section>
      )}

      {!heroImage && (
        <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-16">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
              {heroTitle}
            </h1>
            <p className="mx-auto max-w-xl text-base text-white/90 sm:text-lg">
              {heroSubtitle}
            </p>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
            Nuestros Productos
          </h2>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id || product.slug}
                  product={product}
                  currency={currency}
                  country={country}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-gray-400">Proximamente nuevos productos</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-900 py-12 text-gray-300">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Brand */}
            <div>
              <h3 className="mb-3 text-lg font-bold text-white">{storeName}</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Tu tienda de confianza con envio seguro y pago contraentrega.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
                Informacion
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/p/politica-de-privacidad" className="transition-colors hover:text-white">
                    Politica de privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/p/terminos-y-condiciones" className="transition-colors hover:text-white">
                    Terminos y condiciones
                  </Link>
                </li>
                <li>
                  <Link to="/p/politica-de-envio" className="transition-colors hover:text-white">
                    Politica de envio
                  </Link>
                </li>
                <li>
                  <Link to="/p/politica-de-devolucion" className="transition-colors hover:text-white">
                    Politica de devolucion
                  </Link>
                </li>
                {pages.map((page) => (
                  <li key={page.slug}>
                    <Link to={`/p/${page.slug}`} className="transition-colors hover:text-white">
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
                Siguenos
              </h4>
              <div className="flex gap-3">
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-[var(--color-primary)]"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-[var(--color-primary)]"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-[var(--color-primary)]"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
