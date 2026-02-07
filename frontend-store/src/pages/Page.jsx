import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSlug } from '../hooks/useStore';
import useStore from '../hooks/useStore';
import SafeHtml from '../components/SafeHtml';

const getImageUrl = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http')) return imgUrl;
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase) return `${apiBase}${imgUrl}`;
  return imgUrl.replace(/^\/uploads/, '/api/uploads');
};

export default function Page() {
  const { pageSlug } = useParams();
  const slug = getSlug();
  const { config } = useStore();
  const storeName = config?.store_name || 'Tienda';

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['storePage', slug, pageSlug],
    queryFn: async () => {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/api/store/${slug}/pages/${pageSlug}`);
      if (!res.ok) throw new Error('Pagina no encontrada');
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
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
          <p className="mb-6 text-gray-500">La pagina que buscas no existe.</p>
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
          <Link
            to="/"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-[var(--color-primary)]"
          >
            &larr; Volver a la tienda
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-extrabold text-gray-900">
          {page.title}
        </h1>
        <SafeHtml html={page.content} className="prose prose-gray max-w-none leading-relaxed" />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
      </footer>
    </div>
  );
}
