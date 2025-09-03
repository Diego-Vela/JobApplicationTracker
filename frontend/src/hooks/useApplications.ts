// hooks/useApplications.ts
import { useState, useCallback, useEffect, useMemo } from "react";
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

  // ---search query from search bar---
  const [search, setSearch] = useState("");

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

  // --- search helpers ---
  // parse a date or range inside the search string; everything else is text
  function parseSearch(input: string) {
    const s = input.trim();
    if (!s) return { text: "", from: null as Date | null, to: null as Date | null };

    // range formats supported: "YYYY-MM-DD..YYYY-MM-DD", "MM/DD/YYYY to MM/DD/YYYY"
    const rangeMatch = s.match(/(.+)\s*(?:\.\.|to|-)\s*(.+)/i);
    if (rangeMatch) {
      const d1 = toDate(rangeMatch[1]);
      const d2 = toDate(rangeMatch[2]);
      if (d1 && d2) return { text: "", from: minDate(d1, d2), to: maxDate(d1, d2) };
    }

    // single date
    const single = toDate(s);
    if (single) return { text: "", from: single, to: single };

    // otherwise treat as text
    return { text: s, from: null, to: null };
  }

    function toDate(s: string): Date | null {
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return new Date(t);
    // try simple YYYY-MM-DD only digits/hyphens
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(s + "T00:00:00");
      return Number.isNaN(d.getTime()) ? null : d;
    }
    // try MM/DD/YYYY
    const mdY = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mdY) {
      const [_, m, d, y] = mdY;
      const dt = new Date(Number(y), Number(m) - 1, Number(d));
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  }

  function minDate(a: Date, b: Date) { return a < b ? a : b; }
  function maxDate(a: Date, b: Date) { return a > b ? a : b; }

  const { textQuery, dateFrom, dateTo } = useMemo(() => {
    const { text, from, to } = parseSearch(search);
    return { textQuery: text, dateFrom: from, dateTo: to };
  }, [search]);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // Build backend path using status tab and text search (if any)
      const base = active === "all" ? "/applications" : `/applications?status_eq=${encodeURIComponent(active)}`;
      const path = textQuery
        ? (base.includes("?") ? `${base}&q=${encodeURIComponent(textQuery)}` : `${base}?q=${encodeURIComponent(textQuery)}`)
        : base;

      const data = await apiGet<Application[]>(path);

      // Client-side date filtering if a date (or range) was detected
      const filtered = (dateFrom || dateTo)
        ? data.filter((a) => {
            if (!a.applied_date) return false;
            const d = new Date(a.applied_date);
            if (Number.isNaN(d.getTime())) return false;
            if (dateFrom && d < stripTime(dateFrom)) return false;
            if (dateTo && d > endOfDay(dateTo)) return false;
            return true;
          })
        : data;

      setApps(filtered);
      setOverrides({}); // reset optimistic labels on new queries
    } catch (e: any) {
      setErr(e.message || "Failed to load applications");
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [active, textQuery, dateFrom, dateTo]);

  useEffect(() => { void reload(); }, [reload]);

  function stripTime(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function endOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999); }

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

    // search
    search,
    setSearch
  };
}
