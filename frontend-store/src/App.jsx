import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useStore from './hooks/useStore';
import PixelProvider from './components/PixelProvider';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Product from './pages/Product';
import Checkout from './pages/Checkout';
import Confirm from './pages/Confirm';
import Page from './pages/Page';
import LandingPage from './pages/LandingPage';

function AppShell() {
  const { config, isLoading } = useStore();

  // Apply dynamic CSS variables from store config
  useEffect(() => {
    if (!config) return;
    const root = document.documentElement;

    if (config.primary_color) {
      root.style.setProperty('--color-primary', config.primary_color);
    }
    if (config.secondary_color) {
      root.style.setProperty('--color-secondary', config.secondary_color);
    }
    if (config.accent_color) {
      root.style.setProperty('--color-accent', config.accent_color);
    }
    if (config.font_family) {
      root.style.setProperty('--font-family', config.font_family);
      document.body.style.fontFamily = config.font_family;
    }

    // Set page title
    if (config.store_name) {
      document.title = config.store_name;
    }

    // Set favicon if provided
    if (config.favicon_url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = config.favicon_url;
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <PixelProvider config={config}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:slug" element={<Product />} />
        <Route path="/checkout/:productSlug" element={<Checkout />} />
        <Route path="/confirmacion/:orderId" element={<Confirm />} />
        <Route path="/p/:pageSlug" element={<Page />} />
        <Route path="/landing/:pageSlug" element={<LandingPage />} />
      </Routes>
      <WhatsAppButton whatsappNumber={config?.whatsapp_number} />
    </PixelProvider>
  );
}

export default function App() {
  return <AppShell />;
}
