// src/hooks/useNotes.ts
import { useEffect, useState, useCallback } from "react";
import { apiGet, API_URL, getToken } from "../api";
import type { AppNote } from "../components/types";

async function apiFetchNotes(appId: string) {
  return apiGet<AppNote[]>(`/applications/${appId}/notes`);
}

// tiny helper for JSON fetches with auth
async function apiJson(path: string, init: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(init.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || `${init.method} ${path} failed (${res.status})`);
  }
  return res.json();
}

export function useNotes(id?: string) {
  const [notes, setNotes] = useState<AppNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesErr, setNotesErr] = useState<string | null>(null);

  // ✅ Reuse your fetcher; memoize and expose as refresh
  const refresh = useCallback(async () => {
    if (!id) return;
    setLoadingNotes(true);
    setNotesErr(null);
    try {
      const data = await apiFetchNotes(id);
      setNotes(data || []);
    } catch (e: any) {
      setNotesErr(e.message || "Failed to load notes");
    } finally {
      setLoadingNotes(false);
    }
  }, [id]);

  // initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Mutations → either optimistic + background refresh, or just refresh.
  // Here’s optimistic + background refresh (snappy UI + consistency).
  async function addNote(appId: string, content: string) {
    // optimistic
    const temp: AppNote = {
      note_id: `temp-${Date.now()}`,
      application_id: appId,
      content,
      created_at: new Date().toISOString(),
    };
    setNotes(prev => [temp, ...prev]);

    try {
      const created = await apiJson(`/applications/${appId}/notes`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }) as AppNote;
      // reconcile temp -> real
      setNotes(prev =>
        [created, ...prev.filter(n => n.note_id !== temp.note_id)]
      );
    } catch (e) {
      // rollback temp on error
      setNotes(prev => prev.filter(n => n.note_id !== temp.note_id));
      throw e;
    } finally {
      // background refresh to guarantee server truth
      refresh();
    }
  }

  async function deleteNote(appId: string, noteId: string) {
    // optimistic
    const prev = notes;
    setNotes(prev.filter(n => n.note_id !== noteId));
    try {
      await apiJson(`/applications/${appId}/notes/${noteId}`, { method: "DELETE" });
    } catch (e) {
      // rollback on error
      setNotes(prev);
      throw e;
    } finally {
      refresh();
    }
  }

  async function updateNote(appId: string, noteId: string, content: string) {
    // optimistic
    const prev = notes;
    setNotes(prev.map(n => (n.note_id === noteId ? { ...n, content } : n)));
    try {
      const updated = await apiJson(`/applications/${appId}/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }) as AppNote;
      setNotes(p => p.map(n => (n.note_id === noteId ? updated : n)));
    } catch (e) {
      // rollback
      setNotes(prev);
      throw e;
    } finally {
      refresh();
    }
  }

  return { notes, loadingNotes, notesErr, setNotesErr, refresh, addNote, deleteNote, updateNote };
}