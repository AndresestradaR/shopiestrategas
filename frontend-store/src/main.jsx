import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Compute basename dynamically: /tienda/{slug}
// The URL pattern is /tienda/{slug}/... so basename includes the slug
function getBasename() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  // parts[0] = "tienda", parts[1] = slug
  if (parts.length >= 2 && parts[0] === 'tienda') {
    return `/tienda/${parts[1]}`;
  }
  return '/tienda';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={getBasename()}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
