import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../api";

type Application = {
  application_id: string;
  company: string;
  job_title?: string | null;
  job_description?: string | null;
  status?: "applied" | "interview" | "offer" | "rejected";
  applied_date?: string | null;   // ISO YYYY-MM-DD
  resume_id?: string | null;
  cv_id?: string | null;
};

export default function ApplicationInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  function fmtDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  }

  return (
    <div className="mx-auto w-full max-w-screen-md min-w-[320px] px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/applications" className="text-brand hover:underline">
          ← Back to Applications
        </Link>
        {/* Optional: Edit button route if you add one later */}
        {/* <Link to={`/applications/${id}/edit`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100">Edit</Link> */}
      </div>

      {loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-gray-600">Loading…</div>
      )}

      {err && !loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-red-600">{err}</div>
      )}

      {!loading && !err && app && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{app.company}</h1>
              {app.job_title && <p className="text-gray-600">{app.job_title}</p>}
            </div>
            {app.status && (
              <span className="shrink-0 rounded-full border px-3 py-1 text-xs capitalize text-gray-700">
                {app.status}
              </span>
            )}
          </div>

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
              <p className="whitespace-pre-wrap text-sm text-gray-700">{app.job_description}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => navigate("/applications")}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
            >
              Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
