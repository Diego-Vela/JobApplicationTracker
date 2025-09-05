import { useRef, useState } from "react";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { ACCEPTED_MIME, MAX_RESUMES, MAX_CVS, MAX_SIZE_BYTES } from "../types";
import type { DocType } from "../types";

export function Uploader({
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [localErr, setLocalErr] = useState<string | null>(null);

  const disabled = uploading || !canUpload;

  const handleChoose = (file?: File | null) => {
    setLocalErr(null);
    if (!file) { setSelectedFile(null); setFileName(null); return; }
    if (!ACCEPTED_MIME.includes(file.type)) { setLocalErr("Unsupported file type. Use PDF, DOC, or DOCX."); return; }
    if (file.size > MAX_SIZE_BYTES) { setLocalErr("Max file size is 10 MB."); return; }
    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleUpload = async () => {
    if (!selectedFile) return setLocalErr("Please choose a file first.");
    try {
      setLocalErr(null);
      setUploading(true);
      await onUploaded(selectedFile, label.trim() || undefined);
      // reset
      setSelectedFile(null); setFileName(null); setLabel("");
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
          <h2 className="text-xl font-medium">Upload {kind === "resume" ? "Resume" : "CV"}</h2>
        </div>
        <span className="text-lg text-gray-600 text-muted-foreground">
          Max {kind === "resume" ? MAX_RESUMES : MAX_CVS} {kind === "resume" ? "resumes" : "CVs"}
        </span>
      </div>

      {!canUpload && (
        <p className="mb-2 rounded-lg bg-amber-50 p-2 text-xl text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Limit reached. Delete one to upload more.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME.join(",")}
          onChange={(e) => handleChoose(e.target.files?.[0] || null)}
          disabled={disabled}
          className="block w-full cursor-pointer file:cursor-pointer rounded-xl border p-2 text-lg file:mr-3 file:rounded-lg file:border file:bg-muted file:px-3 file:py-1.5 file:text-lg file:font-medium"
        />
        <input
          type="text"
          placeholder="Optional label (e.g. 'Academic CV')"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={uploading}
          className="w-full rounded-xl border p-2 text-lg"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={disabled || !selectedFile}
          className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-lg font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>) : (<>Upload</>)}
        </button>
      </div>

      {fileName && <p className="mt-2 text-xs text-muted-foreground">Selected: {fileName}</p>}
      {localErr && (
        <p className="mt-2 flex items-center gap-1 text-xs text-red-700">
          <AlertCircle className="h-4 w-4" /> {localErr}
        </p>
      )}
    </div>
  );
}
