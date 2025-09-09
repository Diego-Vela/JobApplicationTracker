// components/applications-page/ApplicationCard.tsx
import { Link } from "react-router-dom";
import type { Application, UIStatus, APIStatus } from "../types";
import StatusMenu from "./StatusMenu";
import { API_TO_UI } from "../statusMaps";

type Props = {
  app: Application;
  displayedStatus?: UIStatus;
  onStatusChanged?: (nextStatus: UIStatus) => void;
  overflowClip?: boolean;

  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelected?: (id: string) => void;
};

export default function ApplicationCard({
  app,
  displayedStatus,
  onStatusChanged,
  overflowClip = false,
  selectionMode = false,
  selected = false,
  onToggleSelected,
}: Props) {
  const uiValue: UIStatus =
    displayedStatus ?? (app.status ? API_TO_UI[app.status as APIStatus] : "applied");

  const CardInner = (
    <div className="p-4 hover:bg-gray-100 hover:rounded-xl">
      <div className="mb-1 flex items-start justify-between">
        <div className="flex items-start gap-3">
          {selectionMode && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();              // ensure it toggles even with parent onClick
                onToggleSelected?.(app.application_id);
              }}
              onClick={(e) => e.stopPropagation()} // guard against parent click
              className="mt-1 size-4 accent-brand self-center"
              aria-label={`Select ${app.company}`}
            />
          )}
          <div>
            <h3 className="text-2xl font-semibold">{app.company}</h3>
            {app.job_title && <p className="text-lg text-gray-600">{app.job_title}</p>}
          </div>
        </div>
      </div>
      {app.applied_date && (
        <p className="mt-2 text-lg text-gray-500">Applied: {fmtDate(app.applied_date)}</p>
      )}
    </div>
  );

  return (
    <li
      className={[
        "relative rounded-xl border bg-white p-0 shadow-sm",
        overflowClip ? "overflow-hidden" : "",
        selectionMode && selected ? "ring-2 ring-brand" : "",
      ].join(" ")}
      onClick={selectionMode ? () => onToggleSelected?.(app.application_id) : undefined}
      role={selectionMode ? "button" : undefined}
      aria-pressed={selectionMode ? selected : undefined}
    >
      {!selectionMode ? (
        <Link to={`/applications/${app.application_id}`} className="block">
          {CardInner}
        </Link>
      ) : (
        CardInner
      )}

      {/* Lock status while editing; only bulk operation should change it */}
      <div className="absolute right-3 top-3">
        <StatusMenu
          appId={app.application_id}
          value={uiValue}
          onChangeSuccess={onStatusChanged}
          disabled={selectionMode}  // disable when editing
        />
      </div>
    </li>
  );
}

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  // Avoid JS Date to prevent timezone issues; format directly
  const [year, month, day] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (!year || !month || !day) return iso;
  return `${months[parseInt(month, 10) - 1]} ${day}, ${year}`;
}
