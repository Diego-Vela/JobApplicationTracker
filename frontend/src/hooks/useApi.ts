// src/hooks/useApi.ts
import { useCallback, useMemo, useRef } from 'react'
import {
  apiGet, apiPost, apiPatch, apiDelete,
  APIError, logout, resendVerification,
} from '../api' // adjust path if needed

type Handlers = {
  onUnauthorized?: () => void                   // 401 → force login route
  onUnverifiedEmail?: (email?: string) => void  // 403 → show “verify” UI
  onError?: (message: string, status?: number) => void // generic toast/log
  getEmail?: () => string | undefined           // optional current user email
}

export function useApi(handlers: Handlers = {}) {
  const {
    onUnauthorized,
    onUnverifiedEmail,
    onError,
    getEmail,
  } = handlers

  const busy = useRef(false)

  const handleError = useCallback(async (e: unknown) => {
    if (e instanceof APIError) {
      // 401: not signed in or token invalid/expired
      if (e.status === 401) {
        try { await logout() } catch {}
        onUnauthorized?.()
        return
      }
      // 403: common case is email not verified
      if (e.status === 403 && (e.data?.detail === 'Email not verified')) {
        onUnverifiedEmail?.(getEmail?.())
        return
      }
      onError?.(e.message, e.status)
      return
    }
    onError?.(e instanceof Error ? e.message : 'Unknown error')
  }, [onUnauthorized, onUnverifiedEmail, onError, getEmail])

  // Generic wrappers that apply the shared error handling
  const get = useCallback(async <T=any>(path: string) => {
    busy.current = true
    try { return await apiGet<T>(path) }
    catch (e) { await handleError(e); throw e }
    finally { busy.current = false }
  }, [handleError])

  const post = useCallback(async <T=any>(path: string, body?: any) => {
    busy.current = true
    try { return await apiPost<T>(path, body) }
    catch (e) { await handleError(e); throw e }
    finally { busy.current = false }
  }, [handleError])

  const patch = useCallback(async <T=any>(path: string, body?: any) => {
    busy.current = true
    try { return await apiPatch<T>(path, body) }
    catch (e) { await handleError(e); throw e }
    finally { busy.current = false }
  }, [handleError])

  const del = useCallback(async (path: string) => {
    busy.current = true
    try { return await apiDelete(path) }
    catch (e) { await handleError(e); throw e }
    finally { busy.current = false }
  }, [handleError])

  // Optional convenience: expose domain APIs pre-wired with error handling
  const apps = useMemo(() => ({
    list:   () => get('/applications'),
    get:    (id: string) => get(`/applications/${id}`),
    create: (payload: any) => post('/applications', payload),
    update: (id: string, patchBody: any) => patch(`/applications/${id}`, patchBody),
    remove: (id: string) => del(`/applications/${id}`),
    bulkMove: (ids: string[], status: string) => post('/applications/bulk-move', { ids, status }),
    bulkDelete: (ids: string[]) => post('/applications/bulk-delete', { ids }),
    search: (q: string) => get(`/applications/search?q=${encodeURIComponent(q)}`),
  }), [get, post, patch, del])

  const files = useMemo(() => ({
    presignUpload: (filename: string, contentType?: string) =>
      post('/files/presign', { filename, content_type: contentType }),
    createResume: (meta: { url: string; file_name: string; label?: string }) =>
      post('/files/resumes', meta),
    listResumes: () => get('/files/resumes'),
    deleteResume: (id: string) => del(`/files/resumes/${id}`),

    createCV: (meta: { url: string; file_name: string; label?: string }) =>
      post('/files/cv', meta),
    listCVs: () => get('/files/cv'),
    deleteCV: (id: string) => del(`/files/cv/${id}`),

    presignGet: (params: { kind?: 'resume'|'cv'; item_id?: string; key?: string; url?: string; disposition?: 'inline'|'attachment' }) =>
      get(`/files/presign-get${toQuery(params)}`),
  }), [get, post, del])

  // Optional helper to trigger a resend verification right from UI
  const resendVerificationEmail = useCallback(async () => {
    const email = getEmail?.()
    if (!email) { onError?.('No email available to resend verification'); return }
    try { await resendVerification(email) }
    catch (e) { await handleError(e) }
  }, [getEmail, handleError, onError])

  return {
    busy,
    get, post, patch, del,   // low-level helpers
    apps, files,             // domain helpers
    resendVerificationEmail, // convenience
  }
}

function toQuery(obj: Record<string, any>) {
  const s = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return s ? `?${s}` : ''
}
