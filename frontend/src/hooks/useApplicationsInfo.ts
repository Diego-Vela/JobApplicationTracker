// src/hooks/useApplicationInfo.ts
import { useEffect, useState } from "react";
import { apiGet, API_URL, getToken } from "../api";
import type { Application, UIStatus } from "../components/types";
import { UI_TO_API } from "../components/statusMaps";

export function useApplicationInfo(id?: string) {
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await apiGet<Application>(`/applications/${id}`);
        setApp(data);
      } catch (e: any) {
        setErr(e.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.detail || `PATCH ${path} failed (${res.status})`);
    }
    return res.json();
  }

  async function apiPostRaw<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.detail || `POST ${path} failed (${res.status})`);
    }
    return res.json();
  }

  async function save(partial: Partial<Application>) {
    if (!id) return;
    const updated = await apiPatch<Application>(`/applications/${id}`, partial);
    setApp(updated);
  }

  async function moveStatus(newUIStatus: UIStatus) {
    if (!id) return;
    const newStatus = UI_TO_API[newUIStatus];
    const moved = await apiPostRaw<Application>(
      `/applications/${id}/move?new_status=${encodeURIComponent(newStatus)}`
    );
    setApp(moved);
  }

  return { app, setApp, loading, err, save, moveStatus };
}
