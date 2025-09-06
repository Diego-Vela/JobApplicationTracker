// components/applications-page/PageHeader.tsx
import HeaderActions from "./HeaderActions";
import BulkActions from "./BulkActions";
import type { UIStatus } from "../types";
import { Edit } from "lucide-react"; 

type Props = {
  selectionMode: boolean;
  selectedCount: number;
  bulkBusy?: boolean;
  count: number;
  maxCount: number;

  onToggleSelectionMode: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  onBulkMove: (status: UIStatus) => void;
  onRefresh: () => void;
  onCancel?: () => void;
  disableAdd?: boolean;
}
export default function PageHeader({
  selectionMode,
  selectedCount,
  bulkBusy,
  count,
  maxCount,
  onToggleSelectionMode,
  onClearSelection,
  onSelectAll,
  onBulkDelete,
  onBulkMove,
  onRefresh,
  onCancel,
  disableAdd,
}: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3 min-w-[600px]">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          Applications
          <span className="text-base font-normal text-gray-500">
            {count}/{maxCount}
          </span>
        </h1>
        {!selectionMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSelectionMode}
              className="rounded-lg border px-3 py-2 text-xl hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit className="h-5 w-5" aria-hidden /> {/* Edit icon */}
              Edit
            </button>
            <HeaderActions onRefresh={onRefresh} disableAdd={disableAdd} />
          </div>
        ) : (
          <BulkActions
            selectedCount={selectedCount}
            bulkBusy={bulkBusy}
            onClearSelection={onClearSelection}
            onSelectAll={onSelectAll}
            onBulkDelete={onBulkDelete}
            onBulkMove={onBulkMove}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
}
