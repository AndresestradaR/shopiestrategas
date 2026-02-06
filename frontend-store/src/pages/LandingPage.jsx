import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSlug } from '../hooks/useStore';
import { usePixel } from '../components/PixelProvider';

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
      <style dangerouslySetInnerHTML={{ __html: page.css_content || '' }} />
      <div dangerouslySetInnerHTML={{ __html: page.html_content || '' }} />
    </div>
  );
}
