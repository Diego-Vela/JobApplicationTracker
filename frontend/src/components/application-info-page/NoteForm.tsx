// src/components/NoteForm.tsx
import { useState } from "react";
import { MAX_NOTES_LENGTH } from "../types";

type Props = {
  onSubmit: (content: string) => Promise<void>;
};
export function NoteForm({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_NOTES_LENGTH) {
      setErr(`Note is too long (${trimmed.length}/${MAX_NOTES_LENGTH} characters).`);
      return;
    }
    try {
      setErr(null);
      setSaving(true);
      await onSubmit(trimmed);
      setValue("");
    } catch (e: any) {
      setErr(e.message || "Failed to add note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-lg"
        placeholder="Add a note about this application…"
        maxLength={MAX_NOTES_LENGTH} // Prevents excessive input
      />
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {value.trim().length}/{MAX_NOTES_LENGTH}
        </span>
        {err && <span className="text-red-600 break-words">{err}</span>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || !value.trim()}
          className="rounded-lg bg-brand px-3 py-1.5 text-lg font-medium text-white disabled:opacity-60 hover:brightness-95"
        >
          {saving ? "Saving…" : "Add note"}
        </button>
      </div>
    </form>
  );
}
