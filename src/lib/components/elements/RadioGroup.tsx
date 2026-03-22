interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  direction?: 'row' | 'col';
}

export const RadioGroup = ({
  options,
  value,
  onChange,
  direction = 'row',
}: Props) => {
  return (
    <div
      className={`flex ${direction === 'col' ? 'flex-col gap-2' : 'flex-row gap-6'}`}
    >
      {options.map((o) => (
        <label
          key={o.value}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div
            onClick={() => onChange(o.value)}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${value === o.value ? 'border-blue-500' : 'border-gray-300 group-hover:border-blue-300'}`}
          >
            {value === o.value && (
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </div>
          <span className="text-sm text-gray-700">{o.label}</span>
        </label>
      ))}
    </div>
  );
};
