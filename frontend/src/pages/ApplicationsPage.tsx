import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../api";

type Status = "applied" | "interview" | "offer" | "rejected";
type TabKey = "all" | Status;

type Application = {
  application_id: string;
  company: string;
  job_title?: string | null;
  status?: Status;
  applied_date?: string | null; // ISO date
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

export default function ApplicationsPage() {
  const [active, setActive] = useState<TabKey>("all");
  const [apps, setApps] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

async function load(tab: TabKey) {
  setLoading(true);
  setErr(null);
  try {
    const path =
      tab === "all"
        ? "/applications"
        : `/applications?status_eq=${encodeURIComponent(tab)}`; // <-- use status_eq
    const data = await apiGet<Application[]>(path);
    setApps(data);
  } catch (e: any) {
    setErr(e.message || "Failed to load applications");
    if (String(e.message).includes("401")) navigate("/login");
    setApps([]);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    void load(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(active)}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
          >
            Refresh
          </button>
          <Link
            to="/applications/new"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:brightness-95"
          >
            + Add Application
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <nav className="mb-6 overflow-x-auto">
        <ul className="flex gap-2">
          {TABS.map((t) => {
            const isActive = active === t.key;
            return (
              <li key={t.key}>
                <button
                  onClick={() => setActive(t.key)}
                  className={[
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm",
                    isActive
                      ? "bg-brand text-white"
                      : "border text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status messages */}
      {loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-gray-600">
          Loading {labelFor(active).toLowerCase()} applications…
        </div>
      )}

      {err && !loading && (
        <div className="rounded-lg border bg-white p-6 text-center text-red-600">{err}</div>
      )}

      {!loading && !err && apps && apps.length === 0 && (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="mb-3 text-gray-700">No {labelFor(active).toLowerCase()} applications.</p>
          {active === "all" && (
            <Link
              to="/applications/new"
              className="inline-block rounded-lg bg-brand px-4 py-2 text-white hover:brightness-95"
            >
              Add your first application
            </Link>
          )}
        </div>
      )}

      {/* List */}
      {!loading && !err && apps && apps.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {apps.map((a) => (
            <li
              key={a.application_id}
              className="rounded-xl border bg-white p-0 shadow-sm overflow-hidden"
            >
              <Link to={`/applications/${a.application_id}`} className="block p-4 hover:bg-gray-50">
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{a.company}</h3>
                    {a.job_title && <p className="text-sm text-gray-600">{a.job_title}</p>}
                  </div>
                  {a.status && (
                    <span className="rounded-full border px-2 py-0.5 text-xs capitalize text-gray-700">
                      {a.status}
                    </span>
                  )}
                </div>
                {a.applied_date && (
                  <p className="mt-2 text-sm text-gray-500">
                    Applied: {formatDate(a.applied_date)}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function labelFor(tab: TabKey) {
  switch (tab) {
    case "applied": return "Applied";
    case "interview": return "Interview";
    case "offer": return "Offer";
    case "rejected": return "Rejected";
    default: return "All";
  }
}
