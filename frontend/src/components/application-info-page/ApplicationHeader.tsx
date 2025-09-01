// src/components/ApplicationHeader.tsx
import type { Application } from "../types";
import { API_TO_UI, STATUS_LABELS } from "../statusMaps";

export function ApplicationHeader({ app }: { app: Application }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{app.company}</h1>
        {app.job_title && <p className="text-gray-600">{app.job_title}</p>}
      </div>
      {app.status && (
        <span className="shrink-0 rounded-full border px-3 py-1 text-xs capitalize text-gray-700">
          {STATUS_LABELS[API_TO_UI[app.status]]}
        </span>
      )}
    </div>
  );
}
