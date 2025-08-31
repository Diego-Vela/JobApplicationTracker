// pages/ApplicationsPage.tsx
import { useState } from "react";
import {
  Tabs, HeaderActions, EmptyState, ApplicationList,
} from "../components/applications-page";
import type { TabKey } from "../components/applications-page";
import { useApplications } from "../hooks/useApplications";

export default function ApplicationsPage() {
  const [active, setActive] = useState<TabKey>("all");
  const { apps, loading, err, reload } = useApplications(active);

  return (
    <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Applications</h1>
        <HeaderActions onRefresh={reload} />
      </div>

      <Tabs value={active} onChange={setActive} />

      {loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-gray-600">
          Loading {active === "all" ? "all" : active} applications…
        </div>
      )}

      {err && !loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-red-600">{err}</div>
      )}

      {!loading && !err && apps && apps.length === 0 && (
        <EmptyState label={active === "all" ? "All" : active} showCta={active === "all"} />
      )}

      {!loading && !err && apps && apps.length > 0 && <ApplicationList apps={apps} />}
    </div>
  );
}
