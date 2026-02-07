import { useQuery } from '@tanstack/react-query';
import { getSlug } from './useStore';

const API_URL = import.meta.env.VITE_API_URL || '';

async function fetchCheckoutConfig(slug) {
  const res = await fetch(`${API_URL}/api/store/${slug}/checkout-config`);
  if (!res.ok) return null;
  return res.json();
}

export default function useCheckoutConfig() {
  const slug = getSlug();

  const { data: checkoutConfig, isLoading } = useQuery({
    queryKey: ['checkoutConfig', slug],
    queryFn: () => fetchCheckoutConfig(slug),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { checkoutConfig: checkoutConfig || null, isLoading };
}
