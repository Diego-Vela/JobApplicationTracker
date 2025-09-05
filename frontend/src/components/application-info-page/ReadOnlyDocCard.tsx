// src/components/documents-page/ReadOnlyDocCard.tsx
import { useMemo, useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import type { DocumentItem } from "../types";
import { presignDownload } from "../../hooks/useDocs";
import { apiGet } from "../../api";

export function ReadOnlyDocCard({ doc }: { doc: DocumentItem }) {
  const [downloading, setDownloading] = useState(false);

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

  const ext = useMemo(
    () => doc.name.split(".").pop()?.toUpperCase() || "",
    [doc.name]
  );

  return (
    <div className="rounded-2xl border p-4">
      {/* Long layout: left meta, right actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: icon + name/label + uploaded */}
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-muted p-2 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-xl font-medium">{doc.name}</p>
            </div>
            {doc.label && (
              <p className="truncate text-lg text-muted-foreground">{doc.label}</p>
            )}
            {doc.uploaded_at && (
              <p className="mt-1 text-lg text-muted-foreground">
                Uploaded {new Date(doc.uploaded_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Right: file type + download */}
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <span className={`rounded-md ${ ext === "PDF" ? "text-red-400" : "text-blue-400"} px-2 py-1 text-lg font-medium text-muted-foreground`}>
            {ext || (doc.type === "resume" ? "RESUME" : "CV")}
          </span>

          {/* Download button */}  
          {doc.url && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-lg font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {downloading ? "Preparing…" : "Download"}
            </button>
          )}

          {/* Preview button - only for PDF files */}
          {ext === "PDF" && (
            <button
              type="button"
              onClick={async () => {
                const { url } = await apiGet<{ url: string }>(
                  `/files/presign-get?kind=${doc.type}&item_id=${doc.id}&disposition=inline`
                );
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-lg font-medium hover:bg-gray-200"
            >
              Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
