// src/hooks/useNotes.ts
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api";
import type { AppNote } from "../components/types";

async function apiFetchNotes(appId: string) {
  return apiGet<AppNote[]>(`/applications/${appId}/notes`);
}

export function useNotes(id?: string) {
  const [notes, setNotes] = useState<AppNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesErr, setNotesErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoadingNotes(true);
    setNotesErr(null);
    try {
      const data = await apiFetchNotes(id);
      setNotes(data || []);
    } catch (e: unknown) {
      setNotesErr(e instanceof Error ? e.message : "Failed to load notes");
    } finally {
      setLoadingNotes(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addNote(appId: string, content: string) {
    setNotesErr(null);
    const temp: AppNote = {
      note_id: `temp-${Date.now()}`,
      application_id: appId,
      content,
      created_at: new Date().toISOString(),
    };
    setNotes(prev => [temp, ...prev]);
    try {
      const created = await apiPost<AppNote>(`/applications/${appId}/notes`, { content });
      setNotes(prev => [created, ...prev.filter(n => n.note_id !== temp.note_id)]);
    } catch (e) {
      setNotes(prev => prev.filter(n => n.note_id !== temp.note_id));
      throw e;
    } finally {
      refresh();
    }
  }

  async function deleteNote(appId: string, noteId: string) {
    setNotesErr(null);
    const prev = notes;
    setNotes(prev.filter(n => n.note_id !== noteId));
    try {
      await apiDelete(`/applications/${appId}/notes/${noteId}`);
    } catch (e) {
      setNotes(prev);
      throw e;
    } finally {
      refresh();
    }
  }

  async function updateNote(appId: string, noteId: string, content: string) {
    setNotesErr(null);
    const prev = notes;
    setNotes(prev.map(n => (n.note_id === noteId ? { ...n, content } : n)));
    try {
      const updated = await apiPatch<AppNote>(`/applications/${appId}/notes/${noteId}`, { content });
      setNotes(p => p.map(n => (n.note_id === noteId ? updated : n)));
    } catch (e) {
      setNotes(prev);
      throw e;
    } finally {
      refresh();
    }
  }

  async function onAddNote(content: string) {
    if (!id) return;
    setNotesErr(null);
    await addNote(id, content);
  }

  return {
    notes,
    loadingNotes,
    notesErr,
    setNotesErr,
    refresh,
    addNote,
    deleteNote,
    updateNote,
    onAddNote,
  };
}