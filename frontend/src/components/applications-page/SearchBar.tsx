// components/applications-page/SearchBar.tsx
import { useEffect, useMemo, useState } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;      // called as user types (debounced)
  onSubmit?: () => void;                  // optional "enter" / button
  placeholder?: string;
  debounceMs?: number;
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search company, title, or date (e.g., 2025-09-02 or 08/31/2025…)",
  debounceMs = 300,
}: Props) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  // debounce the outbound onChange
  const debounced = useMemo(() => {
    let t: number | undefined;
    return (v: string) => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => onChange(v), debounceMs);
    };
  }, [onChange, debounceMs]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setLocal(v);
    debounced(v);
  }

  return (
    <div className="mb-4 flex w-full items-center gap-2">
      <input
        value={local}
        onChange={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.();
        }}
        className="w-full rounded-lg border px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30"
        placeholder={placeholder}
        aria-label="Search applications"
      />
      {local && (
        <button
          onClick={() => { setLocal(""); onChange(""); }}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
        >
          Clear
        </button>
      )}
      {onSubmit && (
        <button
          onClick={onSubmit}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
        >
          Search
        </button>
      )}
    </div>
  );
}
