// src/components/DocumentSelect.tsx
type Option = { value: string; label: string };

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
  noneLabel?: string; // default: "None"
};

export function DocumentSelect({
  label,
  options,
  value,
  onChange,
  loading,
  error,
  disabled,
  noneLabel = "None",
}: Props) {
  return (
    <div>
      <label className="mb-1 block text-md font-medium text-gray-700">{label}</label>
      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : options.length ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
        >
          <option value="">{noneLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="text-gray-700">No options available.</div>
      )}
    </div>
  );
}
