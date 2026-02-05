import { useParams, Link } from 'react-router-dom';
import useStore from '../hooks/useStore';
import { usePixel } from '../components/PixelProvider';
import { useEffect } from 'react';

export default function Confirm() {
  const { orderId } = useParams();
  const { config } = useStore();
  const { trackEvent } = usePixel();

  const storeName = config?.store_name || 'Tienda';
  const successMessage =
    config?.success_message ||
    'Tu pedido ha sido recibido exitosamente. Te contactaremos pronto para confirmar los detalles de envio.';

  useEffect(() => {
    trackEvent('PageView');
  }, [trackEvent]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-2xl font-extrabold text-gray-900">
            Pedido confirmado
          </h1>

          {/* Order number */}
          <div className="mb-4 inline-block rounded-full bg-gray-100 px-4 py-2">
            <span className="text-sm text-gray-500">Pedido #</span>{' '}
            <span className="font-bold text-gray-800">{orderId}</span>
          </div>

          {/* Message */}
          <p className="mb-8 leading-relaxed text-gray-600">{successMessage}</p>

          {/* Payment info */}
          <div className="mb-6 rounded-xl bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              <p className="text-left text-sm text-amber-700">
                Recuerda: el pago se realiza al momento de recibir tu pedido (contraentrega).
              </p>
            </div>
          </div>

          {/* Back button */}
          <Link
            to="/"
            className="inline-block w-full rounded-xl bg-[var(--color-primary)] py-3.5 text-center font-bold text-white transition-colors hover:brightness-90"
          >
            Volver a la tienda
          </Link>

          {/* WhatsApp */}
          {config?.whatsapp_number && (
            <a
              href={`https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=Hola,%20acabo%20de%20hacer%20el%20pedido%20%23${orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-green-500 py-3 font-semibold text-green-600 transition-colors hover:bg-green-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="h-5 w-5 fill-green-500"
              >
                <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.742 3.052 9.376L1.054 31.28l6.156-1.968C9.758 30.98 12.762 32 16.004 32 24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.35 22.606c-.392 1.106-1.94 2.024-3.186 2.292-.854.182-1.968.326-5.72-1.23-4.802-1.99-7.892-6.86-8.132-7.178-.23-.318-1.938-2.58-1.938-4.922 0-2.342 1.228-3.494 1.664-3.972.392-.43 1.034-.612 1.648-.612.198 0 .376.01.536.018.478.02.716.048 1.032.796.392.934 1.348 3.276 1.466 3.514.12.238.24.556.08.874-.148.326-.278.47-.516.742-.238.272-.464.48-.702.772-.216.256-.46.53-.196.99.264.452 1.174 1.934 2.52 3.134 1.734 1.544 3.194 2.024 3.648 2.248.354.178.776.138 1.052-.158.348-.376.778-.998 1.216-1.612.31-.438.702-.494 1.094-.334.398.152 2.526 1.19 2.958 1.408.432.218.72.326.826.508.104.182.104 1.062-.288 2.168z" />
              </svg>
              Contactar por WhatsApp
            </a>
          )}
        </div>

        <p className="mt-6 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} {storeName}
        </p>
      </div>
    </div>
  );
}
