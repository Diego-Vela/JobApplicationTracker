// components/applications-page/ApplicationList.tsx
import ApplicationCard from "./ApplicationCard";
import type { Application, UIStatus } from "../types";

export default function ApplicationList({
  apps,
  getDisplayedStatus,
  onStatusChanged,
  selectionMode,
  selected,
  onToggleSelected,
}: {
  apps: Application[];
  getDisplayedStatus?: (a: Application) => UIStatus;
  onStatusChanged?: (id: string, next: UIStatus) => void;

  selectionMode?: boolean;
  selected?: Set<string>;
  onToggleSelected?: (id: string) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
      {apps.map((a) => (
        <ApplicationCard
          key={a.application_id}
          app={a}
          displayedStatus={getDisplayedStatus ? getDisplayedStatus(a) : undefined}
          onStatusChanged={(next) => onStatusChanged?.(a.application_id, next)}
          selectionMode={selectionMode}
          selected={selected?.has(a.application_id)}
          onToggleSelected={onToggleSelected}
        />
      ))}
    </ul>
  );
}
