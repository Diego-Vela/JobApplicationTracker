// src/pages/ApplicationInfoPage.tsx
import { Link, useParams } from "react-router-dom";
import {
  ApplicationHeader,
  ApplicationStatusSelect,
  ApplicationDetails,
  NotesList,
  NoteForm,
} from "../components/application-info-page";
import { useApplicationInfo } from "../hooks/useApplicationInfo";
import { useNotes } from "../hooks/useNotes";
import { Edit, Trash2 } from "lucide-react";
import { MAX_NUM_NOTES } from "../components/types";

export default function ApplicationInfoPage() {
  const { id } = useParams<{ id: string }>();

  // useApplicationInfo
  const { app, loading, err, moveStatus, handleDelete,
           resumes, cvs, resumeOption, setResumeOption, coverLetterOption, setCoverLetterOption,
           docsLoading, docsErr,
           editing, beginEdit, cancelEdit, saveEdit,
           company, setCompany, jobTitle, setJobTitle, jobDescription, setJobDescription,
           appliedDate, setAppliedDate,
           fmtDate, currentUIStatus } = useApplicationInfo(id);

  // useNotes
  const { notes, loadingNotes, notesErr, deleteNote, updateNote, createNote } =
    useNotes(id as string);

  return (
    <div className="mx-auto w-full max-w-screen-md min-w-[320px] px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/applications" className="text-brand text-lg hover:underline">
          ← Back to Applications
        </Link>
        {app && (
          <ApplicationStatusSelect value={currentUIStatus} onChange={(next) => moveStatus(next)} />
        )}
      </div>

      {loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-gray-600 text-lg">
          Loading…
        </div>
      )}

      {err && !loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-red-600 text-lg">{err}</div>
      )}

      {!loading && !err && app && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
          <ApplicationHeader app={app} />

          {!editing ? (
            <>
              <ApplicationDetails app={app} fmtDate={fmtDate} />

              {app.job_description && (
                <div className="pt-2">
                  <h2 className="mb-1 text-lg font-semibold">Job Description</h2>
                  <p className="whitespace-pre-wrap text-lg text-gray-700">{app.job_description}</p>
                </div>
              )}

              {/* Notes */}
              <div className="pt-2">
                <h2 className="mb-2 text-lg font-semibold flex items-center gap-2">
                  Notes
                  <span className="text-sm font-normal text-gray-500">
                    {notes.length}/{MAX_NUM_NOTES}
                  </span>
                </h2>
                <NotesList
                  notes={notes}
                  loading={loadingNotes}
                  error={notesErr}
                  fmtDate={fmtDate}
                  onDelete={(noteId) => deleteNote(noteId)}
                  onUpdate={async (noteId, content) => { await updateNote(noteId, content); }}
                  confirmDelete="Are you sure you want to delete this note?"
                />
                {notes.length < MAX_NUM_NOTES && (
                  <NoteForm onSubmit={async (content) => { await createNote(content); }} />
                )}
                {notes.length >= MAX_NUM_NOTES && (
                  <div className="mt-2 text-sm">
                    You have reached the maximum number of notes ({MAX_NUM_NOTES}).
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={beginEdit}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-lg hover:bg-gray-100"
                >
                  <Edit size={18} />
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-lg border border-red-600 px-4 py-2 text-lg text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-lg font-medium text-gray-600">Company</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-md text-lg border px-3 py-2" required />
                </div>
                <div>
                  <label className="mb-1 block text-lg font-medium text-gray-600">Job Title</label>
                  <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full text-lg rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="mb-1 block text-lg font-medium text-gray-600">Applied Date</label>
                  <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} className="w-full text-lg rounded-md border px-3 py-2" />
                </div>
              </div>
              {/* Resume (from backend) */}
              <div>
                <label className="mb-1 block text-md font-medium text-gray-600">Resume</label>
                {docsLoading ? <div className="text-gray-600">Loading…</div>
                : docsErr ? <div className="text-red-600">{docsErr}</div>
                : resumes.length ? (
                    <select
                      value={resumeOption}
                      onChange={(e) => setResumeOption(e.target.value)}
                      className="w-full rounded-md border px-3 py-2"
                    >
                      {resumes.map((r) => (
                        <option key={r.resume_id} value={r.resume_id}>
                          {r.label || r.file_name}
                        </option>
                      ))}
                      <option value=""> None </option>   {/* None Option */}
                    </select>
                  ) : <div className="text-gray-700">No resumes uploaded yet.</div>}
              </div>
              {/* Cover Letter (from backend) */}
              <div>
                <label className="mb-1 block text-md font-medium text-gray-600">Cover Letter</label>
                {docsLoading ? <div className="text-gray-600">Loading…</div>
                : docsErr ? <div className="text-red-600">{docsErr}</div>
                : cvs.length ? (
                  <select
                    value={coverLetterOption}
                    onChange={(e) => setCoverLetterOption(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    
                    {cvs.map((c) => (
                      <option key={c.cv_id} value={c.cv_id}>
                        {c.label || c.file_name}
                      </option>
                    ))}
                    <option value=""> None </option>   {/* None Option */}
                  </select>
                  ) : <div className="text-gray-700">No cover letters uploaded yet.</div>}
              </div>

              <div>
                <label className="mb-1 block text-lg font-medium text-gray-600">Job Description</label>
                <textarea rows={5} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="w-full rounded-md text-lg border px-3 py-2" placeholder="Update the job description or notes…" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-lg font-medium text-white hover:brightness-95">Save</button>
                <button type="button" onClick={cancelEdit} className="rounded-lg border px-4 py-2 text-lg hover:bg-gray-100">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
