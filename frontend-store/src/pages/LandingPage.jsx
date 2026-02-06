import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSlug } from '../hooks/useStore';
import { usePixel } from '../components/PixelProvider';

const LANDING_BASE_CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; }
  img { max-width: 100% !important; height: auto !important; }

  /* Animaciones de botones CTA */
  @keyframes cta-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-6px)}30%{transform:translateX(6px)}45%{transform:translateX(-4px)}60%{transform:translateX(3px)}}
  @keyframes cta-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
  @keyframes cta-shine{0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes cta-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .anim-shake{animation:cta-shake 2.5s ease-in-out infinite}
  .anim-pulse{animation:cta-pulse 2s ease-in-out infinite}
  .anim-shine{background-size:200% auto;animation:cta-shine 3s linear infinite}
  .anim-bounce{animation:cta-bounce 2s ease-in-out infinite}
`;

export default function LandingPage() {
  const { pageSlug } = useParams();
  const navigate = useNavigate();
  const { trackEvent } = usePixel();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    trackEvent('PageView');
  }, [trackEvent]);

  useEffect(() => {
    const slug = getSlug();
    const apiBase = import.meta.env.VITE_API_URL || '';
    fetch(`${apiBase}/api/store/${slug}/pages/by-slug/${pageSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.html_content) {
          setPage(data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [pageSlug]);

  // Intercept CTA clicks — redirect links with href="#checkout" or data-action="checkout"
  const handleContentClick = useCallback(
    (e) => {
      const link = e.target.closest('a[href], button[data-action]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const action = link.getAttribute('data-action') || '';

      if (href === '#checkout' || href.includes('/checkout') || action === 'checkout') {
        e.preventDefault();
        if (page?.product_slug) {
          navigate(`/checkout/${page.product_slug}`);
        }
      }
    },
    [page, navigate]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Pagina no encontrada</h1>
          <p className="text-gray-500">Esta pagina no existe o no esta publicada.</p>
        </div>
      </div>
    );
  }

  // SECURITY NOTE: Content is created by the authenticated store owner via the
  // GrapesJS visual editor, not from untrusted end-user input. This follows the
  // same pattern as CustomLanding in Home.jsx.
  return (
    <div onClick={handleContentClick}>
      <style dangerouslySetInnerHTML={{ __html: LANDING_BASE_CSS + '\n' + (page.css_content || '') }} />
      <div dangerouslySetInnerHTML={{ __html: page.html_content || '' }} />
    </div>
  );
}
