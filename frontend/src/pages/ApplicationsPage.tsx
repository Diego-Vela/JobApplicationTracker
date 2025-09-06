// src/pages/ApplicationsPage.tsx
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
import { MAX_TOTAL_APPLICATIONS } from "../components/types";

export default function ApplicationsPage() {
  const [active, setActive] = useState<TabKey>("all");

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

    loadMore,         // () => Promise<void>
    hasMore,          // boolean
    loadingMore,      // boolean
  } = useApplications({ status: active }) as any;

  const [selectionMode, setSelectionMode] = useState(false);
  const toggleSelectionMode = useCallback(() => setSelectionMode((v) => !v), []);

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
      await moveStatus(id, next as any);
    },
    [moveStatus]
  );

  // Keep SearchBar in sync with the hook’s q
  const search = q;
  const setSearch = setQ;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMore || !hasMore) return;

    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "600px",
        threshold: 0,
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, hasMore, loadingMore, active, q]);

  return (
    <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-8">
      <PageHeader
        selectionMode={selectionMode}
        selectedCount={selectedSet.size}
        bulkBusy={false}
        onToggleSelectionMode={toggleSelectionMode}
        onClearSelection={clearSelection}
        onSelectAll={selectAllOnPage}
        onBulkDelete={bulkDelete}
        onBulkMove={(next: UIStatus) => bulkMove(next as any)}
        onRefresh={refresh}
        onCancel={() => setSelectionMode(false)}
        count={items?.length ?? 0}
        maxCount={MAX_TOTAL_APPLICATIONS}
        disableAdd={items?.length >= MAX_TOTAL_APPLICATIONS} // <-- pass disableAdd
      />

      {/* Search within current tab */}
      <SearchBar value={search} onChange={setSearch} />

      <Tabs
        value={active}
        onChange={(t) => {
          setActive(t);
          setStatus(t === "all" ? "all" : (t as any));
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
        <>
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

          {/* Infinite scroll sentinel + footer indicators (non-invasive) */}
          <div ref={sentinelRef} aria-hidden className="h-1" />

          {loadingMore && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              Loading more…
            </div>
          )}

          {hasMore === false && (
            <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
              You’ve reached the end.
            </div>
          )}
        </>
      )}
    </div>
  );
}
