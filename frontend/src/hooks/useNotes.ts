// src/features/notes/useNotes.ts
import { useCallback, useEffect, useState } from "react"
import { apiGet, apiPost, apiPatch, apiDelete } from "../api"
import type { AppNote } from "../components/types"

export function useNotes(applicationId: string) {
  const [notes, setNotes] = useState<AppNote[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [notesErr, setNotesErr] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!applicationId) return
    setLoadingNotes(true)
    setNotesErr(null)
    try {
      const data = await apiGet<AppNote[]>(`/applications/${applicationId}/notes`)
      setNotes(data)
    } catch (e: any) {
      setNotesErr(e?.message || "Failed to load notes")
    } finally {
      setLoadingNotes(false)
    }
  }, [applicationId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createNote = useCallback(
    async (payload: string) => {
      // optimistic create
      const tempId = `tmp-${Math.random().toString(36).slice(2)}`
      const optimistic: AppNote = {
        note_id: tempId,
        application_id: applicationId,
        content: payload,
        created_at: new Date().toISOString(),
      }
      setNotes((prev) => [optimistic, ...prev])

      try {
        const created = await apiPost<AppNote>(`/applications/${applicationId}/notes`, { content: payload })
        setNotes((prev) => [created, ...prev.filter((n) => n.note_id !== tempId)])
        return created
      } catch (e) {
        // rollback
        setNotes((prev) => prev.filter((n) => n.note_id !== tempId))
        throw e
      }
    },
    [applicationId]
  )

  const updateNote = useCallback(
    async (noteId: string, content: string) => {
      // optimistic update
      const prev = notes
      setNotes((cur) =>
        cur.map((n) => (n.note_id === noteId ? { ...n, content } : n))
      )
      try {
        const updated = await apiPatch<AppNote>(
          `/applications/${applicationId}/notes/${noteId}`,
          { content }
        )
        setNotes((cur) =>
          cur.map((n) => (n.note_id === noteId ? updated : n))
        )
        return updated
      } catch (e) {
        // rollback
        setNotes(prev)
        throw e
      }
    },
    [applicationId, notes]
  )

  const deleteNote = useCallback(
    async (noteId: string) => {
      // optimistic delete
      const prev = notes
      setNotes((cur) => cur.filter((n) => n.note_id !== noteId))
      try {
        await apiDelete(`/applications/${applicationId}/notes/${noteId}`)
      } catch (e) {
        // rollback
        setNotes(prev)
        throw e
      }
    },
    [applicationId, notes]
  )

  return {
    notes,
    loadingNotes,
    notesErr,
    refresh,
    createNote,
    updateNote,
    deleteNote,
  }
}
