// src/components/ApplicationStatusSelect.tsx
import type { UIStatus } from "../types";
import { STATUS_LABELS } from "../statusMaps";

type Props = {
  value: UIStatus | null;
  onChange: (next: UIStatus) => void;
};
export function ApplicationStatusSelect({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg text-gray-600">Status:</span>
      <select
        value={value ?? "applied"}
        onChange={(e) => onChange(e.target.value as UIStatus)}
        className="rounded-md border px-3 py-1.5 text-lg"
      >
        <option value="applied">{STATUS_LABELS.applied}</option>
        <option value="interviewing">{STATUS_LABELS.interviewing}</option>
        <option value="offer">{STATUS_LABELS.offer}</option>
        <option value="rejected">{STATUS_LABELS.rejected}</option>
      </select>
    </div>
  );
}
