// src/api.ts
import { Amplify } from 'aws-amplify'
import {
  signUp, confirmSignUp, resendSignUpCode,
  signIn, signOut, fetchAuthSession, getCurrentUser as amplifyGetCurrentUser,
  resetPassword, confirmResetPassword, updatePassword
  
} from 'aws-amplify/auth'


const {
  VITE_API_URL,
  VITE_COGNITO_USER_POOL_ID,
  VITE_COGNITO_USER_POOL_CLIENT_ID,
} = import.meta.env

if (!VITE_API_URL) throw new Error('VITE_API_URL is not set')

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: VITE_COGNITO_USER_POOL_CLIENT_ID,
    },
  },
})

export class APIError extends Error {
  status: number
  data: any
  constructor(message: string, status: number, data: any) {
    super(message); this.status = status; this.data = data
  }
}

async function getIdToken(): Promise<string | null> {
  const session = await fetchAuthSession()
  const id = session.tokens?.idToken
  return id ? id.toString() : null
}

async function authHeaders(extra: HeadersInit = {}): Promise<HeadersInit> {
  const tok = await getIdToken()
  return tok ? { ...extra, Authorization: `Bearer ${tok}` } : extra
}

type Json = Record<string, any> | any[] | null
type FetchOpts = Omit<RequestInit, 'headers' | 'body'> & { headers?: HeadersInit }
type Expect = 'json' | 'none' | 'text'

async function request<T = any>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: Json,
  expect: Expect = 'json',
  opts: FetchOpts = {},
): Promise<T> {
  const url = `${VITE_API_URL}${path}` 
  const baseHeaders: HeadersInit = body == null
    ? { ...(opts.headers || {}) }
    : { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const headers = await authHeaders(baseHeaders)

  const res = await fetch(url, {
    ...opts,
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  })

  if (!res.ok) {
    let data: any = null
    try { data = await res.json() } catch {}
    const msg = (data && (data.detail || data.message)) || `HTTP ${res.status}`
    throw new APIError(msg, res.status, data)
  }

  if (expect === 'none' || res.status === 204) return null as T
  if (expect === 'text') return (await res.text()) as T
  return (await res.json()) as T
}

/* ====== Exported modular helpers ====== */
export const apiGet    = <T=any>(path: string, opts?: FetchOpts) => request<T>(path, 'GET', undefined, 'json', opts)
export const apiGetText= (path: string, opts?: FetchOpts)       => request<string>(path, 'GET', undefined, 'text', opts)
export const apiPost   = <T=any>(path: string, body?: Json, opts?: FetchOpts) => request<T>(path, 'POST', body, 'json', opts)
export const apiPatch  = <T=any>(path: string, body?: Json, opts?: FetchOpts) => request<T>(path, 'PATCH', body, 'json', opts)
export const apiDelete = (path: string, opts?: FetchOpts)       => request<null>(path, 'DELETE', undefined, 'none', opts)

/* ====== Auth (Cognito) ====== */
export const register            = (email: string, password: string) => signUp({ username: email, password, options: { userAttributes: { email } } })
export const confirmEmail        = (email: string, code: string)     => confirmSignUp({ username: email, confirmationCode: code })
export const resendVerification  = (email: string)                   => resendSignUpCode({ username: email })
export const login               = (email: string, password: string) => signIn({ username: email, password })
export const logout              = () => signOut()
export async function getCurrentUser() { try { return await amplifyGetCurrentUser() } catch { return null } }

/* ====== Example domain wrappers (optional) ======
   You can keep or remove these; they just call the generic helpers. */

export const ApplicationsAPI = {
  list: () => apiGet('/applications'),
  get: (id: string) => apiGet(`/applications/${id}`),
  create: (payload: any) => apiPost('/applications', payload),
  update: (id: string, patch: any) => apiPatch(`/applications/${id}`, patch),
  remove: (id: string) => apiDelete(`/applications/${id}`),
  bulkMove: (ids: string[], status: string) => apiPost('/applications/bulk-move', { ids, status }),
  bulkDelete: (ids: string[]) => apiPost('/applications/bulk-delete', { ids }),
  search: (q: string) => apiGet(`/applications/search?q=${encodeURIComponent(q)}`),
}

export const FilesAPI = {
  presignUpload: (filename: string, contentType?: string) =>
    apiPost('/files/presign', { filename, content_type: contentType }),
  createResume: (meta: { url: string; file_name: string; label?: string }) =>
    apiPost('/files/resumes', meta),
  listResumes: () => apiGet('/files/resumes'),
  deleteResume: (id: string) => apiDelete(`/files/resumes/${id}`),

  createCV: (meta: { url: string; file_name: string; label?: string }) =>
    apiPost('/files/cv', meta),
  listCVs: () => apiGet('/files/cv'),
  deleteCV: (id: string) => apiDelete(`/files/cv/${id}`),

  presignGet: (params: {
    kind?: 'resume' | 'cv'; item_id?: string; key?: string; url?: string; disposition?: 'inline' | 'attachment'
  }) => apiGet(`/files/presign-get${toQuery(params)}`),
}

function toQuery(obj: Record<string, any>) {
  const s = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return s ? `?${s}` : ''
}

// Forgot password flow
// --- Password reset (v6 names) ---
export async function requestPasswordReset(email: string) {
  // Triggers code delivery to email/SMS
  return resetPassword({ username: email });
}
export async function confirmPasswordReset(email: string, code: string, newPassword: string) {
  // Confirms with the verification code + sets new password
  return confirmResetPassword({ username: email, confirmationCode: code, newPassword });
}

// --- Change password when logged in ---
export async function changePassword(oldPassword: string, newPassword: string) {
  return updatePassword({ oldPassword, newPassword });
}