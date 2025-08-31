// components/applications/ApplicationList.tsx
import type { Application } from "./types";
import ApplicationCard from "./ApplicationCard";

export default function ApplicationList({ apps }: { apps: Application[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {apps.map((a) => (
        <ApplicationCard key={a.application_id} app={a} />
      ))}
    </ul>
  );
}
