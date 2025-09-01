// src/components/NotesList.tsx
import { useState } from "react";
import type { AppNote } from "../types";
import { Trash2, Edit, X, Check } from "lucide-react";

type Props = {
  notes: AppNote[];
  loading: boolean;
  error: string | null;
  fmtDate: (iso?: string | null) => string;
  onDelete?: (noteId: string) => void;
  onUpdate?: (noteId: string, content: string) => Promise<void> | void;
  confirmDelete?: boolean | string;
};

export function NotesList({
  notes,
  loading,
  error,
  fmtDate,
  onDelete,
  onUpdate,
  confirmDelete = true,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  if (error) return <p className="text-sm text-red-600 break-words">{error}</p>;
  if (loading) return <p className="text-sm text-gray-600">Loading notes…</p>;
  if (!notes.length) return <p className="text-sm text-gray-500 mb-3">No notes yet.</p>;

  function askDelete(noteId: string) {
    if (!onDelete) return;
    if (confirmDelete) {
      const msg =
        typeof confirmDelete === "string"
          ? confirmDelete
          : "Delete this note? This action cannot be undone.";
      if (!window.confirm(msg)) return;
    }
    onDelete(noteId);
  }

  function beginEdit(n: AppNote) {
    setLocalErr(null);
    setEditingId(n.note_id);
    setDraft(n.content);
  }

  function cancelEdit() {
    setLocalErr(null);
    setEditingId(null);
    setDraft("");
    setSaving(false);
  }

  async function saveEdit(noteId: string) {
    if (!onUpdate) return;
    const next = draft.trim();
    if (!next) {
      setLocalErr("Content cannot be empty.");
      return;
    }
    try {
      setSaving(true);
      setLocalErr(null);
      await onUpdate(noteId, next);
      cancelEdit();
    } catch (e: any) {
      setLocalErr(e?.message || "Could not update note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 mb-3">
      {notes.map((n) => {
        const isEditing = editingId === n.note_id;
        return (
          <div key={n.note_id} className="rounded-xl border bg-gray-50 p-3 text-sm shadow-sm">
            {/* row with text + icons (wrap-friendly) */}
            <div className="flex items-start gap-2">
              {/* text column */}
              <div className="flex-1 min-w-0">
                {!isEditing ? (
                  <p className="whitespace-pre-wrap break-words text-gray-800">
                    {n.content}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="Update your note…"
                    />
                    {localErr && (
                      <p className="text-sm text-red-600 break-words">{localErr}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(n.note_id)}
                        disabled={saving || !draft.trim()}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 hover:brightness-95"
                        aria-label="Save"
                        title="Save"
                      >
                        <Check size={16} />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100"
                        aria-label="Cancel"
                        title="Cancel"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* icons */}
              {!isEditing && (
                <div className="flex items-center gap-1 shrink-0">
                  {onUpdate && (
                    <button
                      type="button"
                      onClick={() => beginEdit(n)}
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
                      onClick={() => askDelete(n.note_id)}
                      className="p-1 rounded hover:bg-gray-200"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-2 text-[11px] uppercase tracking-wide text-gray-500">
              {fmtDate(n.created_at)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
