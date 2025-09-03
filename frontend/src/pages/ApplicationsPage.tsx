// src/pages/ApplicationsPage.tsx
import { useState } from "react";
import { PageHeader, LoadingMessage, ErrorMessage, EmptyState, ApplicationList, Tabs, SearchBar } from "../components/applications-page";

import { useApplications } from "../hooks/useApplications";
import type { TabKey, UIStatus } from "../components/types";

export default function ApplicationsPage() {
  const [active, setActive] = useState<TabKey>("all");

  const {
    // data
    apps, loading, err, reload,
    // selection
    selectionMode, selected, bulkBusy,
    toggleSelectionMode, toggleOne, clearSelection, selectAllOnPage,
    // bulk actions
    bulkMoveStatus, bulkDelete,
    // display helper
    getDisplayedStatus,
    setOverride,
    // search
    search,
    setSearch
  } = useApplications(active);

  return (
    <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-8">
      <PageHeader
        selectionMode={selectionMode}
        selectedCount={selected.size}
        bulkBusy={bulkBusy}
        onToggleSelectionMode={toggleSelectionMode}
        onClearSelection={clearSelection}
        onSelectAll={selectAllOnPage}
        onBulkDelete={bulkDelete}
        onBulkMove={(status: UIStatus) => bulkMoveStatus(status)}
        onRefresh={reload}
      />

      {/* Search within current tab */}
      <SearchBar value={search} onChange={setSearch} />

      <Tabs value={active} onChange={(t) => { setActive(t); /* selection stays as-is */ }} />

      {loading && (
        <LoadingMessage text={`Loading ${active === "all" ? "all" : active} applications…`} />
      )}

      {err && !loading && <ErrorMessage text={err} />}

      {!loading && !err && apps && apps.length === 0 && (
        <EmptyState label={active === "all" ? "All" : active} showCta={active === "all"} />
      )}

      {!loading && !err && apps && apps.length > 0 && (
        <ApplicationList
          apps={apps}
          // show current label (API → UI) without reshuffling
          getDisplayedStatus={getDisplayedStatus}
          // selection mode + bulk edit
          selectionMode={selectionMode}
          selected={selected}
          onToggleSelected={toggleOne}
          // per-card status change (optional optimistic single edit)
          onStatusChanged={(id, next) => {
            setOverride(id, next);
          }}
        />
      )}
    </div>
  );
}
