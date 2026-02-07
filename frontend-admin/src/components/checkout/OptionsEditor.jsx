const COUNTRIES = [
  { code: 'CO', label: 'Colombia' },
  { code: 'MX', label: 'Mexico' },
  { code: 'GT', label: 'Guatemala' },
  { code: 'PE', label: 'Peru' },
  { code: 'EC', label: 'Ecuador' },
  { code: 'CL', label: 'Chile' },
];

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          checked ? 'bg-[#4DBEA4]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

export default function OptionsEditor({ config, onChange }) {
  const update = (field, value) => onChange({ [field]: value });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">Opciones</h3>
      <div className="space-y-3">
        <Toggle
          label="Mostrar imagen del producto"
          checked={config.show_product_image}
          onChange={(v) => update('show_product_image', v)}
        />
        <Toggle
          label="Mostrar resumen de precio"
          checked={config.show_price_summary}
          onChange={(v) => update('show_price_summary', v)}
        />
        <Toggle
          label="Mostrar sellos de confianza"
          checked={config.show_trust_badges}
          onChange={(v) => update('show_trust_badges', v)}
        />
        <Toggle
          label="Mostrar metodo de envio"
          checked={config.show_shipping_method}
          onChange={(v) => update('show_shipping_method', v)}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Pais</label>
          <select
            value={config.country || 'CO'}
            onChange={(e) => update('country', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
