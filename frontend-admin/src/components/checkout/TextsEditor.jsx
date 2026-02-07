export default function TextsEditor({ config, onChange }) {
  const update = (field, value) => onChange({ [field]: value });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">Textos</h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Titulo del formulario</label>
          <input
            type="text"
            value={config.form_title || ''}
            onChange={(e) => update('form_title', e.target.value)}
            placeholder="Datos de envio"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mensaje de confirmacion</label>
          <textarea
            value={config.success_message || ''}
            onChange={(e) => update('success_message', e.target.value)}
            rows={2}
            placeholder="Tu pedido ha sido recibido con exito."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          />
        </div>
      </div>
    </div>
  );
}
