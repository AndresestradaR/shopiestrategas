import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

export default function ColorPicker({ label, color, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="h-8 w-8 rounded-lg border border-gray-300 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <input
          type="text"
          value={color || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
          maxLength={9}
        />
      </div>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-xl bg-white p-3 shadow-xl border border-gray-200">
          <HexColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
