import { useMemo, useState } from "react";
import { FileText, Download, Loader2, Trash2 } from "lucide-react";
import type { DocumentItem } from "../types";
import { presignDownload } from "../../hooks/useDocs";

export function DocCard({ doc, onDelete }: { doc: DocumentItem; onDelete: () => void }) {
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDelete = async () => {
    const message =
      doc.type === "resume"
        ? "Are you sure you want to delete this resume?\n\nAll linked applications that use it will have their attached resume set to null."
        : "Are you sure you want to delete this CV?\n\nIt will be permanently removed.";
    if (!window.confirm(message)) return;

    setBusy(true);
    try { await onDelete(); } finally { setBusy(false); }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const url = await presignDownload(doc.type, doc.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
      alert("Could not generate a download link.");
    } finally {
      setDownloading(false);
    }
  };

  const ext = useMemo(() => doc.name.split(".").pop()?.toUpperCase(), [doc.name]);

  return (
    <div className="group flex items-start gap-3 rounded-2xl border p-4">
      <div className="mt-0.5 rounded-xl bg-muted p-2">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{doc.name}</p>
            {doc.label && <p className="truncate text-xs text-muted-foreground">{doc.label}</p>}
          </div>
          <div className="shrink-0 text-[10px] text-muted-foreground">{ext}</div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {doc.uploaded_at && <span>Uploaded {new Date(doc.uploaded_at).toLocaleString()}</span>}
        </div>
        <div className="mt-3 flex items-center gap-2">
          {doc.url && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-200 disabled:opacity-60"
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {downloading ? "Preparing…" : "Download"}
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
