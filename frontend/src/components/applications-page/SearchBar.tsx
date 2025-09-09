// components/applications-page/SearchBar.tsx
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;      // debounced (except clear/submit)
  onSubmit?: () => void;                  // optional "enter"/button submit
  placeholder?: string;
  debounceMs?: number;
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search by company, title, or date (e.g., Google, engineer, 2023-08-01)",
  debounceMs = 300,
}: Props) {
  const [local, setLocal] = useState(value);

  // keep prop value -> local in sync (without re-triggering onChange)
  useEffect(() => setLocal(value), [value]);

  // keep the latest onChange in a ref so the debounced callback never goes stale
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // one timer for the component lifetime
  const timerRef = useRef<number | null>(null);

  // clear any pending debounce timer
  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // schedule a debounced emit
  const schedule = (v: string) => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      onChangeRef.current(v);
      timerRef.current = null;
    }, debounceMs);
  };

  // flush immediately (used on Enter, blur, Clear)
  const flush = (v: string) => {
    clearTimer();
    onChangeRef.current(v);
  };

  useEffect(() => {
    return () => { clearTimer(); }; // cleanup on unmount
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setLocal(v);
    schedule(v);
  }

  return (
    <div className="mb-4 flex w-full items-center gap-2">
      <input
        value={local}
        onChange={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            flush(local);   // ensure latest keystroke is applied
            onSubmit?.();
          }
        }}
        onBlur={() => flush(local)} // keeps filter in sync if user tabs away
        className="w-full rounded-lg border px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30"
        placeholder={placeholder}
        aria-label="Search applications"
        type="search"
      />
      {local && (
        <button
          onClick={() => { setLocal(""); flush(""); }}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
        >
          Clear
        </button>
      )}
      {onSubmit && (
        <button
          onClick={() => { flush(local); onSubmit(); }}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
        >
          Search
        </button>
      )}
    </div>
  );
}
