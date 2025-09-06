// src/pages/ApplicationsPage.tsx
import { useMemo, useState, useCallback } from "react";
import {
  PageHeader,
  LoadingMessage,
  ErrorMessage,
  EmptyState,
  ApplicationList,
  Tabs,
  SearchBar,
} from "../components/applications-page";

import { useApplications } from "../hooks/useApplications";
import type { TabKey, UIStatus } from "../components/types";

export default function ApplicationsPage() {
  // tabs: "all" | "applied" | "interviewing" | "offer" | "rejected"
  const [active, setActive] = useState<TabKey>("all");

  // NEW: hook now accepts initial filters and returns renamed fields
  const {
    items,                
    loading,
    error,              
    refresh,            

    // search/filter
    q, setQ,             
    setStatus,   

    // selection (record<string, bool>)
    selected,
    toggle,              
    selectAll,
    clearSelection,

    // operations
    bulkMove,             
    bulkDelete,
    moveStatus,           
  } = useApplications({ status: active });

  // Keep your PageHeader “selectionMode” UX as-is with a local toggle
  const [selectionMode, setSelectionMode] = useState(false);
  const toggleSelectionMode = useCallback(() => setSelectionMode((v) => !v), []);

  // Convert record -> Set for your components that expect Set
  const selectedSet = useMemo(() => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    return new Set(ids);
  }, [selected]);

  const selectAllOnPage = useCallback(() => {
    // select all currently loaded items
    selectAll();
  }, [selectAll]);

  // When a single card's status changes, call API and let local state update
  const setOverride = useCallback(
    async (id: string, next: UIStatus) => {
      await moveStatus(id, next as any); // ApiStatus is same union as UIStatus in your app
    },
    [moveStatus]
  );

  // Keep SearchBar in sync with the hook’s q
  const search = q;
  const setSearch = setQ;

  return (
    <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-8">
      <PageHeader
        selectionMode={selectionMode}
        selectedCount={selectedSet.size}
        bulkBusy={false}                 // hook now performs ops inline; no separate busy flag
        onToggleSelectionMode={toggleSelectionMode}
        onClearSelection={clearSelection}
        onSelectAll={selectAllOnPage}
        onBulkDelete={bulkDelete}
        onBulkMove={(next: UIStatus) => bulkMove(next as any)}
        onRefresh={refresh}
      />

      {/* Search within current tab */}
      <SearchBar value={search} onChange={setSearch} />

      <Tabs
        value={active}
        onChange={(t) => {
          setActive(t);
          setStatus(t === "all" ? "all" : (t as any));
          // keep selectionMode state as-is
        }}
      />

      {loading && (
        <LoadingMessage text={`Loading ${active === "all" ? "all" : active} applications…`} />
      )}

      {error && !loading && <ErrorMessage text={error} />}

      {!loading && !error && items && items.length === 0 && (
        <EmptyState label={active === "all" ? "All" : active} showCta={active === "all"} />
      )}

      {!loading && !error && items && items.length > 0 && (
        <ApplicationList
          apps={items}
          getDisplayedStatus={(a) => ((a.status ?? "applied") as UIStatus)}
          // selection mode + bulk edit
          selectionMode={selectionMode}
          selected={selectedSet}
          onToggleSelected={(id: string) => toggle(id)}
          // per-card status change 
          onStatusChanged={(id, next) => {
            setOverride(id, next);
          }}
        />
      )}
    </div>
  );
}
