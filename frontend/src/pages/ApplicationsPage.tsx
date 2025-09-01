// pages/ApplicationsPage.tsx
import { useState } from "react";
import {
  Tabs, HeaderActions, EmptyState, ApplicationList,
} from "../components/applications-page";
import type { TabKey, UIStatus, Application, APIStatus } from "../components/applications-page";
import { useApplications } from "../hooks/useApplications";
import { API_TO_UI } from "../components/statusMaps";

export default function ApplicationsPage() {
  const [active, setActive] = useState<TabKey>("all");
  const { apps, loading, err, reload } = useApplications(active);

  // local optimistic overrides: application_id -> UIStatus
  const [overrides, setOverrides] = useState<Record<string, UIStatus>>({});

  function getDisplayedStatus(a: Application): UIStatus {
    return overrides[a.application_id]
      ?? (a.status ? API_TO_UI[a.status as APIStatus] : "applied");
  }
  function setOverride(id: string, next: UIStatus) {
    setOverrides((prev) => ({ ...prev, [id]: next }));
  }

  return (
    <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Applications</h1>
        <HeaderActions onRefresh={() => { setOverrides({}); reload(); }} />
      </div>

      <Tabs value={active} onChange={(t) => { setOverrides({}); setActive(t); }} />

      {loading && (<div className="rounded-lg border bg-white p-6 text-center text-gray-600">
        Loading {active === "all" ? "all" : active} applications…
      </div>)}

      {err && !loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-red-600">{err}</div>
      )}

      {!loading && !err && apps && apps.length === 0 && (
        <EmptyState label={active === "all" ? "All" : active} showCta={active === "all"} />
      )}

      {!loading && !err && apps && apps.length > 0 && (
        <ApplicationList
          apps={apps}
          getDisplayedStatus={getDisplayedStatus}        
          onStatusChanged={(id, next) => setOverride(id, next)} 
        />
      )}
    </div>
  );
}
