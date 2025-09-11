import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { MAX_RESUMES, MAX_COVER_LETTERS, MAX_SIZE_BYTES, ACCEPTED_MIME } from "../components/types";
import type { DocType } from "../components/types";
import { useDocs, uploadToStorage } from "../hooks/useDocs";
import { Uploader } from "../components/documents-page/Uploader";
import { DocCard } from "../components/documents-page/DocCard";

export default function DocumentsPage() {
  const [tab, setTab] = useState<DocType>("resume");
  const resumes = useDocs("resume");
  const coverLetters = useDocs("cv");
  const current = tab === "resume" ? resumes : coverLetters;

  // Define tab keys and labels for documents
  const DOC_TABS: { key: DocType; label: string }[] = [
    { key: "resume", label: "Resumes" },
    { key: "cv", label: "Cover Letters" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Documents</h1>
          <p className="text-lg text-muted-foreground">
            Upload and manage up to {MAX_RESUMES} Resumes and {MAX_COVER_LETTERS} Cover Letters per profile.
          </p>
        </div>
      </div>

      {/* Use Tabs component for document tabs */}
      <nav className="mb-6 overflow-x-auto">
        <ul className="flex gap-2">
          {DOC_TABS.map((t) => {
            const active = tab === t.key;
            return (
              <li key={t.key}>
                <button
                  onClick={() => setTab(t.key)}
                  className={[
                    "whitespace-nowrap rounded-full px-4 py-2 text-xl hover:cursor-pointer",
                    active
                      ? "bg-brand text-white hover:bg-brand"
                      : "border text-gray-700 hover:bg-gray-100",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <Uploader
        key={tab}
        kind={tab}
        canUpload={current.canUpload}
        uploading={current.uploading}
        setUploading={current.setUploading}
        onUploaded={async (file, label) => {
          if (!current.canUpload) throw new Error(`Limit reached (max ${current.maximumUpload}). Delete one to upload more.`);
          if (!ACCEPTED_MIME.includes(file.type)) throw new Error("Unsupported file type. Use PDF, DOC, or DOCX.");
          if (file.size > MAX_SIZE_BYTES) throw new Error("Max file size is 10 MB.");

          const { url } = await uploadToStorage(file);
          await current.uploadMeta(url, file.name, label);
        }}
      />

      {current.error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-900/40 dark:bg-red-950/40">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{current.error}</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-1 lg:grid-cols-1">
        {current.loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 rounded-2xl border p-4">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-muted" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            </div>
          ))
        ) : current.items.length === 0 ? (
          <EmptyState kind={tab} />
        ) : (
          current.items.map((doc) => (
            <DocCard key={doc.id} doc={doc} onDelete={() => current.remove(doc.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({ kind }: { kind: DocType }) {
  return (
    <div className="col-span-full rounded-2xl border p-8 text-center text-md text-muted-foreground">
      No {kind === "resume" ? "resumes" : "cover letters"} yet. Use the uploader above to add your first file.
    </div>
  );
}
