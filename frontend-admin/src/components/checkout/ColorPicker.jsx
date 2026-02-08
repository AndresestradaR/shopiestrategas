import { useState, useRef, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';

/**
 * Convert any color string (rgba, rgb, hex, named) to hex.
 */
function toHex(color) {
  if (!color) return '#000000';
  // Already hex
  if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
    // Normalize 3-char to 6-char
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    return color.slice(0, 7); // strip alpha if #RRGGBBAA
  }
  // rgba(r,g,b,a) or rgb(r,g,b)
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return color;
}

export default function ColorPicker({ label, value, color, onChange }) {
  const currentColor = value || color || '#000000';
  const hexColor = toHex(currentColor);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(hexColor);
  const ref = useRef(null);

  // Sync input when external value changes
  useEffect(() => {
    setInputValue(toHex(value || color || '#000000'));
  }, [value, color]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handlePickerChange = useCallback(
    (hex) => {
      setInputValue(hex);
      onChange(hex);
    },
    [onChange]
  );

  const handleInputChange = (e) => {
    let val = e.target.value;
    setInputValue(val);
    // Auto-add # if user types without it
    if (val && !val.startsWith('#')) val = '#' + val;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className="relative" ref={ref}>
      {label && <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="h-8 w-8 flex-shrink-0 rounded-lg border border-gray-300 shadow-sm transition-shadow hover:shadow-md"
          style={{ backgroundColor: hexColor }}
          title="Abrir selector de color"
        />
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
            HEX
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="#000000"
            className="w-full rounded-lg border border-gray-200 py-1.5 pl-10 pr-3 text-sm font-mono outline-none focus:border-[#4DBEA4] focus:ring-2 focus:ring-[#4DBEA4]/20"
            maxLength={7}
          />
        </div>
      </div>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-xl bg-white p-3 shadow-xl border border-gray-200">
          <HexColorPicker color={hexColor} onChange={handlePickerChange} />
        </div>
      )}
    </div>
  );
}
