interface Props {
  label?: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  options?: string[];
  value?: string[];
  onChangeMultiple?: (v: string[]) => void;
  direction?: 'row' | 'col';
}

export const Checkbox = ({
  label,
  checked,
  onChange,
  options,
  value = [],
  onChangeMultiple,
  direction = 'row',
}: Props) => {
  if (options && onChangeMultiple) {
    const toggle = (opt: string) => {
      if (value.includes(opt)) {
        onChangeMultiple(value.filter((v) => v !== opt));
      } else {
        onChangeMultiple([...value, opt]);
      }
    };

    return (
      <div
        className={`flex ${direction === 'col' ? 'flex-col gap-2' : 'flex-row gap-6'}`}
      >
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div
              onClick={() => toggle(opt)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                value.includes(opt)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 bg-white group-hover:border-blue-300'
              }`}
            >
              {value.includes(opt) && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        onClick={() => onChange?.(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          checked
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-300 bg-white group-hover:border-blue-300'
        }`}
      >
        {checked && (
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};
