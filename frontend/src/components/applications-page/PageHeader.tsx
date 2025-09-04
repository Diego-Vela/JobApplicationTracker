// components/applications-page/PageHeader.tsx
import HeaderActions from "./HeaderActions";
import BulkActions from "./BulkActions";
import type { UIStatus } from "../types";

type Props = {
  selectionMode: boolean;
  selectedCount: number;
  bulkBusy?: boolean;

  onToggleSelectionMode: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  onBulkMove: (status: UIStatus) => void;
  onRefresh: () => void;
};

export default function PageHeader({
  selectionMode,
  selectedCount,
  bulkBusy,
  onToggleSelectionMode,
  onClearSelection,
  onSelectAll,
  onBulkDelete,
  onBulkMove,
  onRefresh,
}: Props) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h1 className="text-4xl font-bold">Applications</h1>
      {!selectionMode ? (
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSelectionMode}
            className="rounded-lg border px-3 py-2 text-xl hover:bg-gray-100"
          >
            Edit
          </button>
          <HeaderActions onRefresh={onRefresh} />
        </div>
      ) : (
        <BulkActions
          selectedCount={selectedCount}
          bulkBusy={bulkBusy}
          onClearSelection={onClearSelection}
          onSelectAll={onSelectAll}
          onBulkDelete={onBulkDelete}
          onBulkMove={onBulkMove}
        />
      )}
    </div>
  );
}
