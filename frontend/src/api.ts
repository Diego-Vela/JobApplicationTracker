export const API_URL = import.meta.env.VITE_API_URL as string;

/** Token helpers (already fine) */
export function getToken() {
  return localStorage.getItem("token");
}
export function setToken(newToken: string) {
  if (newToken) {
    localStorage.setItem("token", newToken);
  } else {
    localStorage.removeItem("token");
  }
  // 🔑 Tell listeners (Navbar) the auth state changed
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearToken() {
  localStorage.removeItem("token");
}

/** Build headers with Authorization when a token exists */
function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/** handle 401s in one place */
async function handleJsonOrThrow(res: Response, verb: string, path: string) {
  if (!res.ok) {
    if (res.status === 401) {
      // token is invalid/expired—log out globally
      clearToken();
      // Optionally redirect:
      // window.location.href = "/login";
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || `${verb} ${path} failed (${res.status})`);
  }
  return res.json();
}

/** GET with automatic Authorization */
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: authHeaders(init?.headers),
    ...init,
  });
  return handleJsonOrThrow(res, "GET", path);
}

/** POST with automatic Authorization (you had this already) */
export async function apiPost<T, B = unknown>(path: string, body?: B): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleJsonOrThrow(res, "POST", path);
}

/** (Nice to have) PUT/PATCH/DELETE with auth */
export async function apiPut<T, B = unknown>(path: string, body?: B): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleJsonOrThrow(res, "PUT", path);
}
export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    // Try to extract error text/json, but tolerate empties
    const ct = res.headers.get("content-type") || "";
    let message = `Request failed (${res.status})`;
    try {
      if (ct.includes("application/json")) {
        const data = await res.json();
        message = data?.detail || data?.message || message;
      } else {
        const txt = await res.text();
        if (txt) message = txt;
      }
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }

  // Success: do not parse json for DELETE
  return;
}

export async function apiSend<T>(path: string, method: string, body?: any): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** PATCH with automatic Authorization */
export async function apiPatch<T, B = unknown>(path: string, body?: B): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleJsonOrThrow(res, "PATCH", path);
}
