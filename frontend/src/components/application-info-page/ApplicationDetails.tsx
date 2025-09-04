// src/components/ApplicationDetails.tsx
import type { Application } from "../types";

export function ApplicationDetails({ app, fmtDate }: { app: Application; fmtDate: (iso?: string | null) => string; }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      <div>
        <dt className="text-md uppercase tracking-wide text-gray-500">Applied Date</dt>
        <dd className="text-lg">{fmtDate(app.applied_date)}</dd>
      </div>
      <div>
        <dt className="text-md uppercase tracking-wide text-gray-500">Application ID</dt>
        <dd className="text-lg break-all">{app.application_id}</dd>
      </div>
      <div>
        <dt className="text-md uppercase tracking-wide text-gray-500">Resume ID</dt>
        <dd className="text-lg">{app.resume_id || "—"}</dd>
      </div>
      <div>
        <dt className="text-md uppercase tracking-wide text-gray-500">CV ID</dt>
        <dd className="text-lg">{app.cv_id || "—"}</dd>
      </div>
    </dl>
  );
}
