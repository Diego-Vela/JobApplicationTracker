// src/hooks/useApplications.ts
import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../api";
import type { Application, TabKey, UIStatus, APIStatus } from "../components/types";
import { API_TO_UI } from "../components/statusMaps";

export function useApplications(active: TabKey) {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // local UI-only overrides (app_id -> UIStatus)
  const [overrides, setOverrides] = useState<Record<string, UIStatus>>({});

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const path = active === "all" ? "/applications" : `/applications?status_eq=${encodeURIComponent(active)}`;
      const data = await apiGet<Application[]>(path);
      setApps(data);
      setOverrides({}); // reset on fresh load/switch
    } catch (e: any) {
      setErr(e.message || "Failed to load applications");
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => { void reload(); }, [reload]);

  function displayStatus(app: Application): UIStatus {
    const o = overrides[app.application_id];
    if (o) return o;
    const api = (app.status ?? "applied") as APIStatus;
    return API_TO_UI[api];
  }

  function setOverride(appId: string, uiStatus: UIStatus) {
    setOverrides((prev) => ({ ...prev, [appId]: uiStatus }));
  }

  return { apps, loading, err, reload, displayStatus, setOverride, setApps };
}
