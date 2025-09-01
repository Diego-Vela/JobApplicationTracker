// src/components/NoteForm.tsx
import { useState } from "react";

type Props = {
  onSubmit: (content: string) => Promise<void>;
};
export function NoteForm({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    try {
      setErr(null);
      setSaving(true);
      await onSubmit(value.trim());
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
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="Add a note about this application…"
      />
      {err && <p className="text-sm text-red-600 break-words">{err}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || !value.trim()}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 hover:brightness-95"
        >
          {saving ? "Saving…" : "Add note"}
        </button>
      </div>
    </form>
  );
}
