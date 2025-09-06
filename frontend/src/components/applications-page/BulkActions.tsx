// components/applications-page/BulkActions.tsx
import { useState } from "react";
import type { UIStatus } from "../types";
import { UI_TO_COLOR2, STATUS_LABELS } from "../statusMaps";

type Props = {
  selectedCount: number;
  bulkBusy?: boolean;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  onBulkMove: (status: UIStatus) => void;
  onCancel?: () => void;
};

export default function BulkActions({
  selectedCount,
  bulkBusy,
  onSelectAll,
  onBulkDelete,
  onBulkMove,
  onCancel
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-lg text-gray-600">{selectedCount} selected</span>

      <button
        onClick={onSelectAll}
        className="rounded-lg border px-3 py-2 text-lg hover:bg-gray-100"
      >
        Select all
      </button>

      <div className="relative">
        <button
          disabled={selectedCount === 0 || bulkBusy}
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border px-3 py-2 text-lg hover:bg-gray-100 disabled:opacity-60"
        >
          Change status
        </button>
        {open && (
          <ul className="absolute z-20 mt-1 w-40 rounded-lg border bg-white p-1 shadow">
            {(["applied", "interviewing", "offer", "rejected"] as UIStatus[]).map(
              (opt) => (
                <li key={opt}>
                  <button
                    className={`w-full text-left rounded-md px-3 py-2 text-lg capitalize hover:bg-gray-100 ${UI_TO_COLOR2[opt]}`}
                    onClick={() => {
                      setOpen(false);
                      onBulkMove(opt);
                    }}
                  >
                    {STATUS_LABELS[opt]}
                  </button>
                </li>
              )
            )}
          </ul>
        )}
      </div>

      <button
        onClick={onBulkDelete}
        disabled={selectedCount === 0 || bulkBusy}
        className="rounded-lg border border-red-300 px-3 py-2 text-lg text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        Delete
      </button>

      <button
        onClick={onCancel}
        className="rounded-lg px-3 py-2 text-lg hover:bg-gray-100"
      >
        Cancel
      </button>
    </div>
  );
}
