// components/applications-page/StatusMenu.tsx
import { useEffect, useState } from "react";
import { STATUS_LABELS, UI_TO_API } from "../statusMaps";
import type { UIStatus } from "../types";
import { API_URL, getToken } from "../../api";

type Props = {
  appId: string;
  value: UIStatus;                           // UI value
  onChangeSuccess?: (next: UIStatus) => void;
};

export default function StatusMenu({ appId, value, onChangeSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);   // ← add missing state

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const tgt = e.target as HTMLElement;
      if (!tgt.closest?.(`[data-menu-for="${appId}"]`)) setOpen(false);
    }
    if (open) document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open, appId]);

  async function move(next: UIStatus) {
    if (next === value) { setOpen(false); return; }
    setBusy(true);
    try {
      const qs = new URLSearchParams({ new_status: UI_TO_API[next] }).toString();
      const res = await fetch(`${API_URL}/applications/${appId}/move?${qs}`, {
        method: "POST",
        headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Move failed");
      }
      onChangeSuccess?.(next);               // optimistic update
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative" data-menu-for={appId}>
      <button
        onClick={() => !busy && setOpen((o) => !o)}
        className="rounded-full border px-2.5 py-1 text-xs capitalize text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={busy}
      >
        {STATUS_LABELS[value]}
      </button>

      {open && (
        <ul role="listbox" className="absolute right-0 z-20 mt-1 w-40 rounded-lg border bg-white p-1 shadow-lg">
          {(["applied", "interviewing", "offer", "rejected"] as UIStatus[]).map((opt: UIStatus) => (
            <li key={opt}>
              <button
                className={[
                  "w-full text-left rounded-md px-3 py-2 text-sm capitalize hover:bg-gray-100",
                  opt === value ? "font-semibold" : "",
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
