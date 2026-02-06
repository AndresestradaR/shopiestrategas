import { useQuery } from '@tanstack/react-query';

function getSlug() {
  // 1. Check environment variable
  const envSlug = import.meta.env.VITE_STORE_SLUG;
  if (envSlug) return envSlug;

  // 2. Extract from subdomain (e.g. mi-tienda.minishop.co)
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length >= 3 && hostname.includes('minishop.co')) {
    return parts[0];
  }

  // 3. Extract from URL path (e.g. /tienda/mi-tienda/...)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2 && pathParts[0] === 'tienda') {
    return pathParts[1];
  }

  // 4. Fallback: first path segment
  if (pathParts.length > 0) {
    return pathParts[0];
  }

  return 'demo';
}

const API_URL = import.meta.env.VITE_API_URL || "";
const API_BASE = `${API_URL}/api/store`;

async function fetchConfig(slug) {
  const res = await fetch(`${API_BASE}/${slug}/config`);
  if (!res.ok) throw new Error('Error al cargar la configuración de la tienda');
  return res.json();
}

async function fetchProducts(slug) {
  const res = await fetch(`${API_BASE}/${slug}/products`);
  if (!res.ok) throw new Error('Error al cargar los productos');
  return res.json();
}

export function useStore() {
  const slug = getSlug();

  const {
    data: config,
    isLoading: configLoading,
    error: configError,
  } = useQuery({
    queryKey: ['storeConfig', slug],
    queryFn: () => fetchConfig(slug),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['storeProducts', slug],
    queryFn: () => fetchProducts(slug),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    config: config || null,
    products: products || [],
    slug,
    isLoading: configLoading || productsLoading,
    error: configError || productsError,
  };
}

export { getSlug };
export default useStore;
