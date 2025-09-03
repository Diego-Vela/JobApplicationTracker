import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  UploadCloud,
  Trash2,
  Download,
  Loader2,
  AlertCircle
} from "lucide-react";

/**
 * Jobblet - Documents Page
 *
 * Goal
 *  - Let each user upload/manage up to 5 Resumes and up to 5 CVs.
 *  - Clean, accessible UI with TailwindCSS.
 *  - Uses token-based auth (Bearer) pulled from localStorage by default.
 *
 * Backend routes this page expects (aligns with /files router):
 *  - GET    /files/resumes                           -> ResumeOut[]
 *  - POST   /files/resumes                           -> { url, file_name, label } => ResumeOut
 *  - DELETE /files/resumes/:resume_id                -> 204
 *  - GET    /files/cv                                -> CVOut[]
 *  - POST   /files/cv                                -> { url, file_name, label } => CVOut
 *  - DELETE /files/cv/:cv_id                         -> 204
 *
 * NOTE: This page sends only metadata to the backend (url, file_name, label).
 *       You must plug in your S3 (or other) upload function to produce a public/signed URL first.
 */

// ========================= Small API helper =========================
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function getToken() {
  return localStorage.getItem("token") || "";
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (res.status === 401) throw new Error("Unauthorized. Please log in again.");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  try { return await res.json(); } catch { return undefined as unknown as T; }
}

// ========================= Types =========================
export type DocType = "resume" | "cv";

export type ResumeOut = {
  resume_id: string;
  file_name: string;
  label?: string | null;
  resume_url?: string | null;
  uploaded_at?: string;
};

export type CVOut = {
  cv_id: string;
  file_name: string;
  label?: string | null;
  cv_url?: string | null;
  uploaded_at?: string;
};

// Frontend normalized type for rendering both lists together
export type DocumentItem = {
  id: string;
  name: string;
  label?: string | null;
  url?: string | null;
  uploaded_at?: string;
  type: DocType;
};

// ========================= Constants =========================
const ACCEPTED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_PER_TYPE = 5;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ========================= Uploader hook =========================
function useDocs(kind: DocType) {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const listPath = kind === "resume" ? "/files/resumes" : "/files/cv";
  const deletePath = (id: string) => (kind === "resume" ? `/files/resumes/${id}` : `/files/cv/${id}`);

  const refresh = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api<ResumeOut[] | CVOut[]>(listPath);
      const mapped: DocumentItem[] = (data as any[]).map((r) => ({
        id: kind === "resume" ? (r as ResumeOut).resume_id : (r as CVOut).cv_id,
        name: r.file_name,
        label: (r as any).label ?? null,
        url: kind === "resume" ? (r as ResumeOut).resume_url : (r as CVOut).cv_url,
        uploaded_at: r.uploaded_at,
        type: kind,
      }));
      setItems(mapped);
    } catch (e: any) {
      setError(e.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [kind]);

  const remove = async (id: string) => {
    setError(null);
    try {
      await api<void>(deletePath(id), { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  };

  const canUpload = items.length < MAX_PER_TYPE;

  const uploadMeta = async (fileUrl: string, fileName: string, label?: string) => {
    const path = listPath;
    const body = JSON.stringify({ url: fileUrl, file_name: fileName, label });
    const created = await api<ResumeOut | CVOut>(path, { method: "POST", body });
    const mapped: DocumentItem = {
      id: kind === "resume" ? (created as ResumeOut).resume_id : (created as CVOut).cv_id,
      name: created.file_name,
      label: (created as any).label ?? null,
      url: kind === "resume" ? (created as ResumeOut).resume_url : (created as CVOut).cv_url,
      uploaded_at: created.uploaded_at,
      type: kind,
    };
    setItems((prev) => [mapped, ...prev]);
  };

  return { items, loading, error, uploading, setUploading, refresh, remove, canUpload, uploadMeta };
}

// ========================= Placeholder uploader =========================
/**
 * Replace this with your real S3 (or GCS, etc.) uploader.
 * Expected to return a URL (public or signed) for the uploaded file.
 */
async function uploadToStorage(file: File): Promise<{ url: string }> {
  // TODO: wire up: e.g., call your backend to get a presigned URL, PUT the file there, then return the URL
  // throw new Error("Plug in your S3 upload here and return { url }");
  // For now, we simulate failure so it reminds you to wire it up.
  throw new Error("Upload function not wired. Provide a storage uploader that returns { url }.");
}

// ========================= Main Page =========================
export default function DocumentsPage() {
  const [tab, setTab] = useState<DocType>("resume");
  const resumes = useDocs("resume");
  const cvs = useDocs("cv");

  const current = tab === "resume" ? resumes : cvs;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-sm text-muted-foreground">Upload and manage up to {MAX_PER_TYPE} Resumes and {MAX_PER_TYPE} CVs per profile.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 inline-flex overflow-hidden rounded-2xl border bg-background">
        <button
          onClick={() => setTab("resume")}
          className={`px-4 py-2 text-sm font-medium transition ${tab === "resume" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
          aria-pressed={tab === "resume"}
        >Resumes</button>
        <button
          onClick={() => setTab("cv")}
          className={`px-4 py-2 text-sm font-medium transition ${tab === "cv" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
          aria-pressed={tab === "cv"}
        >CVs</button>
      </div>

      {/* Uploader */}
      <Uploader
        key={tab}
        kind={tab}
        canUpload={current.canUpload}
        uploading={current.uploading}
        setUploading={current.setUploading}
        onUploaded={async (file, label) => {
          const tooMany = !current.canUpload;
          if (tooMany) throw new Error(`Limit reached (max ${MAX_PER_TYPE}). Delete one to upload more.`);

          if (!ACCEPTED_MIME.includes(file.type)) throw new Error("Unsupported file type. Use PDF, DOC, or DOCX.");
          if (file.size > MAX_SIZE_BYTES) throw new Error("Max file size is 10 MB.");

          const { url } = await uploadToStorage(file); // <- wire me up
          await current.uploadMeta(url, file.name, label);
        }}
      />

      {/* Error banner */}
      {current.error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-900/40 dark:bg-red-950/40">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{current.error}</span>
        </div>
      )}

      {/* List */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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

// ========================= Uploader component =========================
function Uploader({
  kind,
  canUpload,
  uploading,
  setUploading,
  onUploaded,
}: {
  kind: DocType;
  canUpload: boolean;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  onUploaded: (file: File, label?: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [localErr, setLocalErr] = useState<string | null>(null);

  const disabled = uploading || !canUpload;

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setLocalErr(null);
    setFileName(file.name);
    try {
      setUploading(true);
      await onUploaded(file, label.trim() || undefined);
      setLabel("");
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e: any) {
      setLocalErr(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5" />
          <h2 className="text-base font-medium">Upload {kind === "resume" ? "Resume" : "CV"}</h2>
        </div>
        <span className="text-xs text-muted-foreground">Max {MAX_PER_TYPE} {kind === "resume" ? "resumes" : "CVs"}</span>
      </div>

      {!canUpload && (
        <p className="mb-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Limit reached. Delete one to upload more.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME.join(",")}
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
          disabled={disabled}
          className="block w-full cursor-pointer rounded-xl border p-2 text-sm file:mr-3 file:rounded-lg file:border file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <input
          type="text"
          placeholder="Optional label (e.g., 'Software Engineer', 'Academic CV')"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={uploading}
          className="w-full rounded-xl border p-2 text-sm"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>Select file</>
          )}
        </button>
      </div>

      {fileName && (
        <p className="mt-2 text-xs text-muted-foreground">Selected: {fileName}</p>
      )}

      {localErr && (
        <p className="mt-2 flex items-center gap-1 text-xs text-red-700">
          <AlertCircle className="h-4 w-4" /> {localErr}
        </p>
      )}
    </div>
  );
}

// ========================= Card =========================
function DocCard({ doc, onDelete }: { doc: DocumentItem; onDelete: () => void }) {
  const [busy, setBusy] = useState(false);
  const ext = useMemo(() => doc.name.split(".").pop()?.toUpperCase(), [doc.name]);

  const handleDelete = async () => {
    setBusy(true);
    try { await onDelete(); } finally { setBusy(false); }
  };

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
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================= Empty State =========================
function EmptyState({ kind }: { kind: DocType }) {
  return (
    <div className="col-span-full rounded-2xl border p-8 text-center text-sm text-muted-foreground">
      No {kind === "resume" ? "resumes" : "CVs"} yet. Use the uploader above to add your first file.
    </div>
  );
}
