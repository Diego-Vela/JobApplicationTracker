// components/applications-page/ApplicationList.tsx
import { useEffect, useRef } from "react";
import ApplicationCard from "../components/applications-page/ApplicationCard";
import type { Application, UIStatus } from "../components/types";

export default function ApplicationList({
  apps,
  getDisplayedStatus,
  onStatusChanged,
  selectionMode,
  selected,
  onToggleSelected,

  //infinite scroll props
  onLoadMore,           
  hasMore = false,      
  loadingMore = false,  
  rootMargin = "600px", 
}: {
  apps: Application[];
  getDisplayedStatus?: (a: Application) => UIStatus;
  onStatusChanged?: (id: string, next: UIStatus) => void;

  selectionMode?: boolean;
  selected?: Set<string>;
  onToggleSelected?: (id: string) => void;

  // NEW
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  rootMargin?: string;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Observe the sentinel to trigger onLoadMore()
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingMore) {
          onLoadMore();
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [onLoadMore, hasMore, loadingMore, rootMargin]);

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
        {apps.map((a) => (
          <ApplicationCard
            key={a.application_id}
            app={a}
            displayedStatus={getDisplayedStatus ? getDisplayedStatus(a) : undefined}
            onStatusChanged={(next: UIStatus) => onStatusChanged?.(a.application_id, next)}
            selectionMode={selectionMode}
            selected={selected?.has(a.application_id)}
            onToggleSelected={onToggleSelected}
          />
        ))}
      </ul>

      {/* NEW: infinite scroll sentinel + footer UI */}
      <div ref={sentinelRef} aria-hidden className="h-1" />

      {loadingMore && (
        <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
          Loading more…
        </div>
      )}

      {!hasMore && apps.length > 0 && (
        <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
          You’ve reached the end.
        </div>
      )}
    </>
  );
}
