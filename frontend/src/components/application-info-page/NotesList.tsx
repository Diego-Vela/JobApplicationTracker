// src/components/NotesList.tsx
import type { AppNote } from "../types";
import { Trash2, Edit } from "lucide-react";

type Props = {
  notes: AppNote[];
  loading: boolean;
  error: string | null;
  fmtDate: (iso?: string | null) => string;
  onDelete?: (noteId: string) => void;
  onEdit?: (note: AppNote) => void;
  confirmDelete?: boolean | string;
};

export function NotesList({
  notes,
  loading,
  error,
  fmtDate,
  onDelete,
  onEdit,
  confirmDelete = true,
}: Props) {
  if (error) return <p className="text-sm text-red-600 break-words">{error}</p>;
  if (loading) return <p className="text-sm text-gray-600">Loading notes…</p>;
  if (!notes.length) return <p className="text-sm text-gray-500 mb-3">No notes yet.</p>;

  function handleDeleteClick(noteId: string) {
    if (!onDelete) return;
    if (confirmDelete) {
      const message =
        typeof confirmDelete === "string"
          ? confirmDelete
          : "Delete this note? This action cannot be undone.";
      if (!window.confirm(message)) return;
    }
    onDelete(noteId);
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 mb-3">
      {notes.map((n) => (
        <div
          key={n.note_id}
          className="rounded-xl border bg-gray-50 p-3 text-sm shadow-sm"
        >
          {/* header row with wrapping text + fixed-size icons */}
          <div className="flex items-start gap-2">
            {/* text column: allow shrink + wrap */}
            <div className="flex-1 min-w-0">
              <p className="whitespace-pre-wrap break-words text-gray-800">
                {n.content}
              </p>
            </div>

            {/* icons: don't shrink */}
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(n)}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Edit note"
                  aria-label="Edit note"
                >
                  <Edit size={16} className="text-gray-600" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => handleDeleteClick(n.note_id)}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Delete note"
                  aria-label="Delete note"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 text-[11px] uppercase tracking-wide text-gray-500">
            {fmtDate(n.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
}
