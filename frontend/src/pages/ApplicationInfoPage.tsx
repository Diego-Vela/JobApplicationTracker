import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet, API_URL, getToken } from "../api"; // apiGet provided earlier. We’ll use API_URL/getToken for PATCH & move calls.

type UIStatus = "applied" | "interview" | "offer" | "rejected";
type APIStatus = "applied" | "interviewing" | "offer" | "rejected";

type Application = {
  application_id: string;
  company: string;
  job_title?: string | null;
  job_description?: string | null;
  status?: APIStatus | null;
  applied_date?: string | null; // ISO YYYY-MM-DD
  resume_id?: string | null;
  cv_id?: string | null;
};

const STATUS_LABELS: Record<UIStatus, string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

// Map between UI values and backend values (if backend uses "interviewing")
const UI_TO_API: Record<UIStatus, APIStatus> = {
  applied: "applied",
  interview: "interviewing",
  offer: "offer",
  rejected: "rejected",
};
const API_TO_UI: Record<APIStatus, UIStatus> = {
  applied: "applied",
  interviewing: "interview",
  offer: "offer",
  rejected: "rejected",
};

export default function ApplicationInfoPage() {
  const { id } = useParams<{ id: string }>();
  //const navigate = useNavigate();

  // data
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // edit state
  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [appliedDate, setAppliedDate] = useState<string>("");

  // move status control (separate from edit)
  const currentUIStatus: UIStatus | null = useMemo(() => {
    if (!app?.status) return null;
    return API_TO_UI[app.status];
  }, [app?.status]);

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

  // Enter edit mode: seed form with current values
  function beginEdit() {
    if (!app) return;
    setCompany(app.company ?? "");
    setJobTitle(app.job_title ?? "");
    setJobDescription(app.job_description ?? "");
    // If applied_date is ISO with time, keep only YYYY-MM-DD
    const d = app.applied_date ? new Date(app.applied_date) : null;
    setAppliedDate(d && !Number.isNaN(d.getTime()) ? toInputDate(d) : (app.applied_date ?? ""));
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setErr(null);
  }

  async function saveEdit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!id || !app) return;

    // build minimal PATCH (only changed fields)
    const payload: Record<string, unknown> = {};
    if (company.trim() && company.trim() !== app.company) payload.company = company.trim();

    const jt = jobTitle.trim() || null;
    if ((jt || null) !== (app.job_title ?? null)) payload.job_title = jt;

    const jd = jobDescription.trim() || null;
    if ((jd || null) !== (app.job_description ?? null)) payload.job_description = jd;

    const ad = appliedDate || null;
    if ((ad || null) !== (app.applied_date ?? null)) payload.applied_date = ad;

    // If nothing changed, just exit edit mode.
    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }

    try {
      const updated = await apiPatch<Application>(`/applications/${id}`, payload);
      setApp(updated);
      setEditing(false);
    } catch (e: any) {
      setErr(e.message || "Failed to save changes");
    }
  }

  async function moveStatus(newUIStatus: UIStatus) {
    if (!id) return;
    const newStatus = UI_TO_API[newUIStatus];
    try {
      const moved = await apiPostRaw<Application>(`/applications/${id}/move?new_status=${encodeURIComponent(newStatus)}`);
      setApp(moved);
    } catch (e: any) {
      setErr(e.message || "Failed to update status");
    }
  }

  return (
    <div className="mx-auto w-full max-w-screen-md min-w-[320px] px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/applications" className="text-brand hover:underline">
          ← Back to Applications
        </Link>

        {/* Status mover */}
        {app && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={currentUIStatus ?? "applied"}
              onChange={(e) => moveStatus(e.target.value as UIStatus)}
              className="rounded-md border px-3 py-1.5 text-sm"
            >
              <option value="applied">{STATUS_LABELS.applied}</option>
              <option value="interview">{STATUS_LABELS.interview}</option>
              <option value="offer">{STATUS_LABELS.offer}</option>
              <option value="rejected">{STATUS_LABELS.rejected}</option>
            </select>
          </div>
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
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{app.company}</h1>
              {app.job_title && <p className="text-gray-600">{app.job_title}</p>}
            </div>
            {app.status && (
              <span className="shrink-0 rounded-full border px-3 py-1 text-xs capitalize text-gray-700">
                {STATUS_LABELS[API_TO_UI[app.status]]}
              </span>
            )}
          </div>

          {/* View vs Edit */}
          {!editing ? (
            <>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Applied Date</dt>
                  <dd className="text-sm">{fmtDate(app.applied_date)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Application ID</dt>
                  <dd className="text-sm break-all">{app.application_id}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Resume ID</dt>
                  <dd className="text-sm">{app.resume_id || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">CV ID</dt>
                  <dd className="text-sm">{app.cv_id || "—"}</dd>
                </div>
              </dl>

              {app.job_description && (
                <div className="pt-2">
                  <h2 className="mb-1 text-sm font-semibold">Job Description</h2>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {app.job_description}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={beginEdit}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Edit
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Company</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Job Title</label>
                  <input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Applied Date</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Job Description</label>
                <textarea
                  rows={5}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Update the job description or notes…"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:brightness-95"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
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
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// local PATCH helper using the same token as apiGet/apiPost
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

// local POST helper for the move endpoint (we keep it simple)
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
