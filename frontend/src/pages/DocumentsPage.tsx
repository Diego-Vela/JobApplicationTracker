import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { MAX_PER_TYPE, MAX_SIZE_BYTES, ACCEPTED_MIME } from "../components/types";
import type { DocType } from "../components/types";
import { useDocs, uploadToStorage } from "../hooks/useDocs";
import { Uploader } from "../components/documents-page/Uploader";
import { DocCard } from "../components/documents-page/DocCard";

export default function DocumentsPage() {
  const [tab, setTab] = useState<DocType>("resume");
  const resumes = useDocs("resume");
  const cvs = useDocs("cv");
  const current = tab === "resume" ? resumes : cvs;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Documents</h1>
          <p className="text-lg text-muted-foreground">
            Upload and manage up to {MAX_PER_TYPE} Resumes and {MAX_PER_TYPE} CVs per profile.
          </p>
        </div>
      </div>

      <div className="mb-6 inline-flex overflow-hidden rounded-2xl border bg-background">
        <button
          onClick={() => setTab("resume")}
          className={`px-4 py-2 text-xl font-medium transition ${tab === "resume" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
          aria-pressed={tab === "resume"}
        >Resumes</button>
        <button
          onClick={() => setTab("cv")}
          className={`px-4 py-2 text-xl font-medium transition ${tab === "cv" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
          aria-pressed={tab === "cv"}
        >CVs</button>
      </div>

      <Uploader
        key={tab}
        kind={tab}
        canUpload={current.canUpload}
        uploading={current.uploading}
        setUploading={current.setUploading}
        onUploaded={async (file, label) => {
          if (!current.canUpload) throw new Error(`Limit reached (max ${MAX_PER_TYPE}). Delete one to upload more.`);
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
    <div className="col-span-full rounded-2xl border p-8 text-center text-sm text-muted-foreground">
      No {kind === "resume" ? "resumes" : "CVs"} yet. Use the uploader above to add your first file.
    </div>
  );
}
