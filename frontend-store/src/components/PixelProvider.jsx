import { useEffect, createContext, useContext, useCallback, useRef } from 'react';

const PixelContext = createContext({ trackEvent: () => {} });

export function usePixel() {
  return useContext(PixelContext);
}

export default function PixelProvider({ config, children }) {
  const initialized = useRef(false);

  const metaPixelId = config?.meta_pixel_id;
  const tiktokPixelId = config?.tiktok_pixel_id;

  // Initialize Meta Pixel
  useEffect(() => {
    if (!metaPixelId || initialized.current) return;

    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
    n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', metaPixelId);
    window.fbq('track', 'PageView');
  }, [metaPixelId]);

  // Initialize TikTok Pixel
  useEffect(() => {
    if (!tiktokPixelId || initialized.current) return;

    /* eslint-disable */
    !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
    ttq.methods=["page","track","identify","instances","debug","on","off",
    "once","ready","alias","group","enableCookie","disableCookie"];
    ttq.setAndDefer=function(t,e){t[e]=function(){
    t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
    ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;
    n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
    ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;
    ttq._t=ttq._t||{};ttq._t[e]=+new Date;
    ttq._o=ttq._o||{};ttq._o[e]=n||{};
    var o=document.createElement("script");o.type="text/javascript";
    o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
    var a=document.getElementsByTagName("script")[0];
    a.parentNode.insertBefore(o,a)};
    ttq.load(tiktokPixelId);ttq.page()}(window,document,'ttq');
    /* eslint-enable */
  }, [tiktokPixelId]);

  useEffect(() => {
    initialized.current = true;
  }, []);

  const trackEvent = useCallback(
    (eventName, data = {}) => {
      // Meta Pixel events
      if (metaPixelId && window.fbq) {
        switch (eventName) {
          case 'PageView':
            window.fbq('track', 'PageView');
            break;
          case 'ViewContent':
            window.fbq('track', 'ViewContent', {
              content_name: data.name,
              content_ids: data.id ? [data.id] : [],
              content_type: 'product',
              value: data.price,
              currency: data.currency || 'COP',
            });
            break;
          case 'InitiateCheckout':
            window.fbq('track', 'InitiateCheckout', {
              content_ids: data.id ? [data.id] : [],
              value: data.price,
              currency: data.currency || 'COP',
            });
            break;
          case 'Purchase':
            window.fbq('track', 'Lead', {
              value: data.price,
              currency: data.currency || 'COP',
            });
            window.fbq('track', 'Purchase', {
              value: data.price,
              currency: data.currency || 'COP',
              content_ids: data.id ? [data.id] : [],
            });
            break;
          default:
            break;
        }
      }

      // TikTok Pixel events
      if (tiktokPixelId && window.ttq) {
        switch (eventName) {
          case 'PageView':
            window.ttq.page();
            break;
          case 'ViewContent':
            window.ttq.track('ViewContent', {
              content_id: data.id,
              content_name: data.name,
              value: data.price,
              currency: data.currency || 'COP',
            });
            break;
          case 'InitiateCheckout':
            window.ttq.track('InitiateCheckout', {
              content_id: data.id,
              value: data.price,
              currency: data.currency || 'COP',
            });
            break;
          case 'Purchase':
            window.ttq.track('SubmitForm', {
              value: data.price,
              currency: data.currency || 'COP',
            });
            window.ttq.track('CompletePayment', {
              value: data.price,
              currency: data.currency || 'COP',
              content_id: data.id,
            });
            break;
          default:
            break;
        }
      }
    },
    [metaPixelId, tiktokPixelId]
  );

  return (
    <PixelContext.Provider value={{ trackEvent }}>
      {children}
    </PixelContext.Provider>
  );
}
