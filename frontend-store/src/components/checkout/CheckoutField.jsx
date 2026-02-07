const ICONS = {
  user: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  phone: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  ),
  'map-pin': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  mail: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  note: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
};

export default function CheckoutField({ block, form, formErrors, onChange, onBlur, formStyle }) {
  const { field_key, label, placeholder, required, icon, input_type } = block;
  const iconEl = ICONS[icon] || ICONS.note;
  const hasError = formErrors[field_key];

  if (input_type === 'textarea') {
    return (
      <div>
        <label htmlFor={field_key} className="mb-1.5 block text-sm font-bold text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        <div className="relative flex">
          <span className="pointer-events-none absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-tl-lg bg-gray-100">
            {iconEl}
          </span>
          <textarea
            id={field_key}
            name={field_key}
            rows={3}
            value={form[field_key] || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={field_key} className="mb-1.5 block text-sm font-bold text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-0 flex h-10 w-10 items-center justify-center rounded-l-lg bg-gray-100">
          {iconEl}
        </span>
        <input
          id={field_key}
          name={field_key}
          type={input_type || 'text'}
          value={form[field_key] || ''}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-lg border py-3 pl-12 pr-4 text-sm outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${
            hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        />
      </div>
      {hasError && <p className="mt-1 text-xs text-red-500">{hasError}</p>}
    </div>
  );
}
