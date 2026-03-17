import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X } from 'lucide-react';

interface FilterDropdownProps {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  label: string;
}

export const FilterDropdown = ({ options, selected, onChange, label }: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + 4,
        left: rect.left - 60,
      });
    }
  };

  useEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const selectAll = () => onChange([...options]);
  const clearAll = () => onChange([]);

  const isActive = selected.length > 0 && selected.length < options.length;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className={`ml-1 inline-flex items-center justify-center w-5 h-5 rounded text-xs transition-colors
          ${isActive
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
          }`}
        title={`Фильтр: ${label}`}
      >
        {isActive ? <Check size={10} strokeWidth={3} /> : <ChevronDown size={10} />}
      </button>

      {open && createPortal(
        <div
          ref={ref}
          className="fixed z-[9999] min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          style={{ top: position.top, left: position.left }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">{label}</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          </div>

          <div className="flex gap-1 px-2 py-1.5 border-b border-gray-100">
            <button
              onClick={selectAll}
              className="flex-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded px-1 py-0.5 transition-colors"
            >
              Все
            </button>
            <span className="text-gray-200">|</span>
            <button
              onClick={clearAll}
              className="flex-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded px-1 py-0.5 transition-colors"
            >
              Сбросить
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="accent-blue-500 w-3 h-3 cursor-pointer"
                />
                <span className="text-xs text-gray-700 truncate">{opt}</span>
              </label>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};