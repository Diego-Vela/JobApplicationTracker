// src/components/ApplicationHeader.tsx
import type { Application } from "../types";

export function ApplicationHeader({ app }: { app: Application }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{app.company}</h1>
        {app.job_title && <p className="text-gray-600 text-xl mt-2">{app.job_title}</p>}
      </div>
    </div>
  );
}
