// components/applications-page/ApplicationCard.tsx
import { Link } from "react-router-dom";
import type { Application, UIStatus, APIStatus } from "./types";
import StatusMenu from "./StatusMenu";
import { API_TO_UI } from "./statusMaps";

type Props = {
  app: Application;
  displayedStatus?: UIStatus;                       // NEW
  onStatusChanged?: (nextStatus: UIStatus) => void;
  overflowClip?: boolean;
};

export default function ApplicationCard({
  app,
  displayedStatus,
  onStatusChanged,
  overflowClip = false,
}: Props) {
  const uiValue: UIStatus =
    displayedStatus ?? (app.status ? API_TO_UI[app.status as APIStatus] : "applied");

  return (
    <li
      className={[
        "relative rounded-xl border bg-white p-0 shadow-sm",
        overflowClip ? "overflow-hidden" : "",
      ].join(" ")}
    >
      <Link
        to={`/applications/${app.application_id}`}
        className="block p-4 hover:bg-gray-100 hover:rounded-xl"
      >
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{app.company}</h3>
            {app.job_title && <p className="text-sm text-gray-600">{app.job_title}</p>}
          </div>
        </div>

        {app.applied_date && (
          <p className="mt-2 text-sm text-gray-500">
            Applied: {formatDate(app.applied_date)}
          </p>
        )}
      </Link>

      <div className="absolute right-3 top-3">
        <StatusMenu
          appId={app.application_id}
          value={uiValue}                       // ← now respects overrides
          onChangeSuccess={onStatusChanged}
        />
      </div>
    </li>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso!;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
