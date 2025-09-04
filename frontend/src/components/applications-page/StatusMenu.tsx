// components/applications-page/StatusMenu.tsx
import { useEffect, useState } from "react";
import { STATUS_LABELS, UI_TO_API } from "../statusMaps";
import type { UIStatus } from "../types";
import { API_URL, getToken } from "../../api";

type Props = {
  appId: string;
  value: UIStatus;
  onChangeSuccess?: (next: UIStatus) => void;
  disabled?: boolean; // NEW
};

export default function StatusMenu({ appId, value, onChangeSuccess, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

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
    try {
      const qs = new URLSearchParams({ new_status: UI_TO_API[next] }).toString();
      const res = await fetch(`${API_URL}/applications/${appId}/move?${qs}`, {
        method: "POST",
        headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.detail || "Move failed");
      onChangeSuccess?.(next);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  // If disabled, show a passive pill
  if (disabled) {
    return (
      <span
        className="select-none rounded-full border px-3 py-1 text-md capitalize text-gray-600 bg-white"
        aria-disabled="true"
      >
        {STATUS_LABELS[value]}
      </span>
    );
  }

  return (
    <div className="relative" data-menu-for={appId}>
      <button
        onClick={() => !busy && setOpen((o) => !o)}
        className="rounded-full border px-3 py-1 text-md capitalize text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={busy}
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
