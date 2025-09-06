// components/applications-page/StatusMenu.tsx
import { useEffect, useState } from "react";
import { STATUS_LABELS, UI_TO_API, UI_TO_COLOR } from "../statusMaps";
import type { UIStatus } from "../types";
import { apiPost, APIError } from "../../api"; // ⬅️ use new helpers

type Props = {
  appId: string;
  value: UIStatus;
  onChangeSuccess?: (next: UIStatus) => void;
  disabled?: boolean; // NEW
};

export default function StatusMenu({ appId, value, onChangeSuccess, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const tgt = e.target as HTMLElement;
      if (!tgt.closest?.(`[data-menu-for="${appId}"]`)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open, appId]);

  async function move(next: UIStatus) {
    if (next === value) { setOpen(false); return; }
    setBusy(true);
    setErr(null);
    try {
      const qs = new URLSearchParams({ new_status: UI_TO_API[next] }).toString();
      await apiPost(`/applications/${appId}/move?${qs}`);
      onChangeSuccess?.(next);
    } catch (e) {
      const msg = e instanceof APIError ? e.message : "Move failed";
      setErr(msg);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  // If disabled, show a passive pill
  if (disabled) {
    return (
      <span
        className={`select-none rounded-full border px-3 py-1 text-md capitalize ${UI_TO_COLOR[value]}`}
        aria-disabled="true"
        title={err ?? undefined}
      >
        {STATUS_LABELS[value]}
      </span>
    );
  }

  return (
    <div className="relative" data-menu-for={appId}>
      <button
        onClick={() => !busy && setOpen((o) => !o)}
        className={`rounded-full border px-3 py-1 text-md capitalize ${UI_TO_COLOR[value]} hover:bg-gray-100 disabled:opacity-60`}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={busy}
        title={err ?? undefined}
      >
        {STATUS_LABELS[value]}
      </button>

      {open && (
        <ul role="listbox" className="absolute right-0 z-20 mt-1 w-40 rounded-lg border bg-white p-1 shadow-lg">
          {(["applied", "interviewing", "offer", "rejected"] as UIStatus[]).map((opt) => (
            <li key={opt}>
              <button
                className={[
                  "w-full text-left rounded-md px-3 py-2 text-lg capitalize hover:bg-gray-100",
                  opt === value ? `font-semibold ${UI_TO_COLOR[opt]}` : "",
                ].join(" ")}
                onClick={() => move(opt)}
                role="option"
                aria-selected={opt === value}
                disabled={busy}
              >
                {STATUS_LABELS[opt]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
