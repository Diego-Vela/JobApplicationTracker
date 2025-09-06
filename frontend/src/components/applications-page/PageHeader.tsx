// components/applications-page/PageHeader.tsx
import HeaderActions from "./HeaderActions";
import BulkActions from "./BulkActions";
import type { UIStatus } from "../types";
import { Edit } from "lucide-react"; 

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
  onCancel?: () => void;
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
  onCancel,
}: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3 min-w-[600px]">
        <h1 className="text-4xl font-bold">Applications</h1>
        {!selectionMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSelectionMode}
              className="rounded-lg border px-3 py-2 text-xl hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit className="h-5 w-5" aria-hidden /> {/* Edit icon */}
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
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
}
