// src/features/applications/useApplications.ts
import { useCallback, useEffect, useMemo, useState } from "react"
import { apiGet, apiPost, apiPatch, apiDelete } from "../api"
import type { Application, APIStatus } from "../components/types"

type FetchParams = {
  status?: APIStatus | "all"
  q?: string
}

export function useApplications(initial: FetchParams = {}) {
  const [items, setItems] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState(initial.q ?? "")
  const [status, setStatus] = useState<APIStatus | "all">(initial.status ?? "all")

  // selection for bulk ops
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const listQuery = useMemo(() => {
    const s = new URLSearchParams()
    if (q) s.set("q", q)
    if (status && status !== "all") s.set("status", status)
    return s.toString()
  }, [q, status])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const path = listQuery ? `/applications?${listQuery}` : "/applications"
      const data = await apiGet<Application[]>(path)
      setItems(data)
      setSelected({}) // clear selection on refresh
    } catch (e: any) {
      setError(e?.message || "Failed to load applications")
    } finally {
      setLoading(false)
    }
  }, [listQuery])

  useEffect(() => {
    refresh()
  }, [refresh])

  // ---- CRUD ----
  const create = useCallback(
    async (payload: Partial<Application>) => {
      const created = await apiPost<Application>("/applications", payload)
      setItems((prev) => [created, ...prev])
      return created
    },
    []
  )

  const update = useCallback(
    async (id: string, patch: Partial<Application>) => {
      const updated = await apiPatch<Application>(`/applications/${id}`, patch)
      setItems((prev) => prev.map((a) => (a.application_id === id ? updated : a)))
      return updated
    },
    []
  )

  const remove = useCallback(
    async (id: string) => {
      await apiDelete(`/applications/${id}`)
      setItems((prev) => prev.filter((a) => a.application_id !== id))
      setSelected((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    },
    []
  )

  // ---- Status move (single) ----
  const moveStatus = useCallback(
    async (id: string, next: APIStatus) => {
      const qs = new URLSearchParams({ new_status: next }).toString()
      await apiPost(`/applications/${id}/move?${qs}`) 
      setItems((prev) =>
        prev.map((a) =>
          a.application_id === id ? { ...a, status: next } : a
        )
      )
    },
    []
  )

  // ---- Bulk operations ----
  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  )

  const bulkMove = useCallback(
    async (next: APIStatus) => {
      if (!selectedIds.length) return
      await apiPost("/applications/bulk-move", { ids: selectedIds, status: next })
      setItems((prev) =>
        prev.map((a) =>
          selected[a.application_id] ? { ...a, status: next } : a
        )
      )
      setSelected({})
    },
    [selected, selectedIds]
  )

  const bulkDelete = useCallback(async () => {
    if (!selectedIds.length) return
    await apiPost("/applications/bulk-delete", { ids: selectedIds })
    setItems((prev) => prev.filter((a) => !selected[a.application_id]))
    setSelected({})
  }, [selected, selectedIds])

  // ---- Selection helpers ----
  const toggle = useCallback((id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const selectAll = useCallback(() => {
    const next: Record<string, boolean> = {}
    for (const a of items) next[a.application_id] = true
    setSelected(next)
  }, [items])

  const clearSelection = useCallback(() => setSelected({}), [])

  return {
    items,
    loading,
    error,
    refresh,

    // search/filter
    q,
    setQ,
    status,
    setStatus,

    // selection
    selected,
    selectedIds,
    toggle,
    selectAll,
    clearSelection,

    // operations
    create,
    update,
    remove,
    moveStatus,
    bulkMove,
    bulkDelete,
  }
}
