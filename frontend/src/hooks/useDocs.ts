// src/features/documents/useDocs.ts
import { useEffect, useState } from "react"
import type { DocumentItem, DocType, ResumeOut, CVOut } from "../components/types"
import { MAX_RESUMES, MAX_CVS } from "../components/types"
import { apiGet, apiPost, apiDelete } from "../api" // ⬅️ use new helpers

/** Upload a file to S3 using a presigned POST from backend */
export async function uploadToStorage(file: File): Promise<{ url: string }> {
  //console.log("Requesting presign");
  const q = new URLSearchParams({ filename: file.name, content_type: file.type })
  const { url, fields, file_url, max_size } = await apiPost<{
    url: string
    fields: Record<string, string>
    file_url: string
    max_size: number
  }>(`/files/presign?${q.toString()}`)
  //console.log("Got the presign");
  if (file.size > max_size) throw new Error("Max file size is 10 MB.")

  // Step 2: upload directly to S3
  const form = new FormData()
  Object.entries(fields).forEach(([k, v]) => form.append(k, v))
  form.append("file", file)

  const s3Res = await fetch(url, { method: "POST", body: form })
  //console.log("got the s3 response", s3Res);
  if (!s3Res.ok) throw new Error("Failed to upload to S3")

  return { url: file_url }
}

/** Get a presigned GET URL for downloading a private object */
export async function presignDownload(kind: DocType, itemId: string): Promise<string> {
  const q = new URLSearchParams({ kind, item_id: itemId })
  const { url } = await apiGet<{ url: string }>(`/files/presign-get?${q.toString()}`)
  return url
}

/** Hook to list/manage documents */
export function useDocs(kind: DocType) {
  const [items, setItems] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const listPath = kind === "resume" ? "/files/resumes" : "/files/cv"
  const deletePath = (id: string) => (kind === "resume" ? `/files/resumes/${id}` : `/files/cv/${id}`)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<ResumeOut[] | CVOut[]>(listPath)
      const mapped: DocumentItem[] = (data as any[]).map((r) => ({
        id: kind === "resume" ? (r as ResumeOut).resume_id : (r as CVOut).cv_id,
        name: (r as any).file_name,
        label: (r as any).label ?? null,
        url: kind === "resume" ? (r as ResumeOut).resume_url : (r as CVOut).cv_url,
        uploaded_at: (r as any).uploaded_at,
        type: kind,
      }))
      setItems(mapped)
    } catch (e: any) {
      setError(e.message || "Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind])

  const remove = async (id: string) => {
    try {
      await apiDelete(deletePath(id))
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch (e: any) {
      setError(e.message || "Failed to delete")
    }
  }

  const maximumUpload = kind === "resume" ? MAX_RESUMES : MAX_CVS
  const canUpload = items.length < maximumUpload

  const uploadMeta = async (fileUrl: string, fileName: string, label?: string) => {
    console.log("Uploading metadata", { fileUrl, fileName, label });
    const created = await apiPost<ResumeOut | CVOut>(listPath, {
      url: fileUrl,
      file_name: fileName,
      label,
    })
    console.log("Created metadata");
    const mapped: DocumentItem = {
      id: kind === "resume" ? (created as ResumeOut).resume_id : (created as CVOut).cv_id,
      name: created.file_name,
      label: (created as any).label ?? null,
      url: kind === "resume" ? (created as ResumeOut).resume_url : (created as CVOut).cv_url,
      uploaded_at: created.uploaded_at,
      type: kind,
    }
    setItems((prev) => [mapped, ...prev])
    console.log("Set items");
  }

  return { items, loading, error, uploading, setUploading, refresh, remove, canUpload, uploadMeta, maximumUpload }
}
