// src/pages/ApplicationInfoPage.tsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { UIStatus, Application } from "../components/types";
import { ApplicationHeader, ApplicationStatusSelect, ApplicationDetails, NotesList, NoteForm } from "../components/application-info-page";
import { useApplicationInfo } from "../hooks/useApplicationsInfo";
import { useNotes } from "../hooks/useNotes";
import { API_TO_UI } from "../components/statusMaps";


export default function ApplicationInfoPage() {
  const { id } = useParams<{ id: string }>();

  // app
  const { app, loading, err, save, moveStatus } = useApplicationInfo(id);

  // notes
  const { notes, loadingNotes, notesErr, setNotesErr, addNote, deleteNote, updateNote } = useNotes(id);

  // local edit UI state
  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [appliedDate, setAppliedDate] = useState<string>("");

  const currentUIStatus = useMemo<UIStatus | null>(() => {
    if (!app?.status) return null;
    return API_TO_UI[app.status as keyof typeof API_TO_UI];
  }, [app?.status]);

  function beginEdit() {
    if (!app) return;
    setCompany(app.company ?? "");
    setJobTitle(app.job_title ?? "");
    setJobDescription(app.job_description ?? "");
    const d = app.applied_date ? new Date(app.applied_date) : null;
    setAppliedDate(d && !Number.isNaN(d.getTime()) ? toInputDate(d) : (app.applied_date ?? ""));
    setEditing(true);
  }
  function cancelEdit() { setEditing(false); }

  async function saveEdit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!id || !app) return;

    const payload: Partial<Application> = {};
    if (company.trim() && company.trim() !== app.company) payload.company = company.trim();
    const jt = jobTitle.trim() || null;
    if ((jt || null) !== (app.job_title ?? null)) payload.job_title = jt;
    const jd = jobDescription.trim() || null;
    if ((jd || null) !== (app.job_description ?? null)) payload.job_description = jd;
    const ad = appliedDate || null;
    if ((ad || null) !== (app.applied_date ?? null)) payload.applied_date = ad;

    if (Object.keys(payload).length === 0) { setEditing(false); return; }

    await save(payload);
    setEditing(false);
  }

  async function onAddNote(content: string) {
    if (!id) return;
    // clear any prior fetch error when adding
    setNotesErr(null);
    await addNote(id, content);
  }

  return (
    <div className="mx-auto w-full max-w-screen-md min-w-[320px] px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/applications" className="text-brand hover:underline">← Back to Applications</Link>
        {app && (
          <ApplicationStatusSelect
            value={currentUIStatus}
            onChange={(next) => moveStatus(next)}
          />
        )}
      </div>

      {loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-gray-600">Loading…</div>
      )}

      {err && !loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-red-600">{err}</div>
      )}

      {!loading && !err && app && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
          <ApplicationHeader app={app} />

          {!editing ? (
            <>
              <ApplicationDetails app={app} fmtDate={fmtDate} />

              {app.job_description && (
                <div className="pt-2">
                  <h2 className="mb-1 text-sm font-semibold">Job Description</h2>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{app.job_description}</p>
                </div>
              )}

              {/* Notes */}
              <div className="pt-2">
                <h2 className="mb-2 text-sm font-semibold">Notes</h2>
                <NotesList
                  notes={notes}
                  loading={loadingNotes}
                  error={notesErr}
                  fmtDate={fmtDate}
                  onDelete={(noteId) => deleteNote(id!, noteId)}
                  onUpdate={(noteId, content) => updateNote(id!, noteId, content)}
                  confirmDelete="Are you sure you want to delete this note?"
                />
                <NoteForm onSubmit={onAddNote} />
              </div>

              <div className="pt-2">
                <button onClick={beginEdit} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">
                  Edit
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Company</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-md border px-3 py-2" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Job Title</label>
                  <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Applied Date</label>
                  <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} className="w-full rounded-md border px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Job Description</label>
                <textarea rows={5} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Update the job description or notes…" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:brightness-95">Save</button>
                <button type="button" onClick={cancelEdit} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */
function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
  });
}
function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
