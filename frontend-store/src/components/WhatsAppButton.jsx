export default function WhatsAppButton({ whatsappNumber }) {
  if (!whatsappNumber) return null;

  const cleanNumber = whatsappNumber.replace(/\D/g, '');

  return (
    <a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg transition-transform hover:scale-110 hover:bg-green-600 md:h-16 md:w-16"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-7 w-7 fill-white md:h-8 md:w-8"
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.742 3.052 9.376L1.054 31.28l6.156-1.968C9.758 30.98 12.762 32 16.004 32 24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.35 22.606c-.392 1.106-1.94 2.024-3.186 2.292-.854.182-1.968.326-5.72-1.23-4.802-1.99-7.892-6.86-8.132-7.178-.23-.318-1.938-2.58-1.938-4.922 0-2.342 1.228-3.494 1.664-3.972.392-.43 1.034-.612 1.648-.612.198 0 .376.01.536.018.478.02.716.048 1.032.796.392.934 1.348 3.276 1.466 3.514.12.238.24.556.08.874-.148.326-.278.47-.516.742-.238.272-.464.48-.702.772-.216.256-.46.53-.196.99.264.452 1.174 1.934 2.52 3.134 1.734 1.544 3.194 2.024 3.648 2.248.354.178.776.138 1.052-.158.348-.376.778-.998 1.216-1.612.31-.438.702-.494 1.094-.334.398.152 2.526 1.19 2.958 1.408.432.218.72.326.826.508.104.182.104 1.062-.288 2.168z" />
      </svg>
    </a>
  );
}
