// hooks/useApplications.ts
import { useState, useCallback, useEffect } from "react";
import { apiGet, API_URL, getToken } from "../api";
import type {
  Application,
  TabKey,
  UIStatus,
  APIStatus,
} from "../components/types";
import { API_TO_UI } from "../components/statusMaps";

export function useApplications(active: TabKey) {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ---selection state ---
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, UIStatus>>({});

  // fetch
  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const path = active === "all" ? "/applications" : `/applications?status_eq=${encodeURIComponent(active)}`;
      const data = await apiGet<Application[]>(path);
      setApps(data);
      setOverrides({}); // reset on fresh data
    } catch (e: any) {
      setErr(e.message || "Failed to load applications");
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // --- selection helpers ---
  function toggleSelectionMode() {
    setSelectionMode((s) => {
      if (!s) setSelected(new Set());
      return !s;
    });
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function clearSelection() {
    setSelected(new Set());
    setSelectionMode(false);
  }
  function selectAllOnPage() {
    if (!apps) return;
    setSelected(new Set(apps.map((a) => a.application_id)));
  }

  // --- bulk actions ---
  async function bulkMoveStatus(next: UIStatus) {
    if (selected.size === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`${API_URL}/applications/${id}/move?new_status=${next}`, {
            method: "POST",
            headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
          }).then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data?.detail || `Move failed (${res.status})`);
            }
          })
        )
      );
      await reload();
      clearSelection();
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`${API_URL}/applications/${id}`, {
            method: "DELETE",
            headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
          }).then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data?.detail || `Delete failed (${res.status})`);
            }
          })
        )
      );
      await reload();
      clearSelection();
    } finally {
      setBulkBusy(false);
    }
  }

  // --- status display helper ---
  function getDisplayedStatus(a: Application): UIStatus {
    const o = overrides[a.application_id];
    if (o) return o;
    const api = (a.status ?? "applied") as APIStatus;
    return API_TO_UI[api];
  }

  function setOverride(appId: string, next: UIStatus) {
    setOverrides((prev) => ({ ...prev, [appId]: next }));
  }

  return {
    apps,
    loading,
    err,
    reload,

    // selection
    selectionMode,
    selected,
    bulkBusy,
    toggleSelectionMode,
    toggleOne,
    clearSelection,
    selectAllOnPage,

    // bulk
    bulkMoveStatus,
    bulkDelete,

    // display
    getDisplayedStatus,
    setOverride,
  };
}
