import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../api";

type Status = "applied" | "interviewing" | "offer" | "rejected";

export default function ApplicationNewPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<Status>("applied");
  const [appliedDate, setAppliedDate] = useState<string>(""); // YYYY-MM-DD

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!company.trim()) {
      setErr("Company is required");
      return;
    }

    setSubmitting(true);
    try {
      // Build payload per your Pydantic model (omit resume/cv for now)
      const payload: Record<string, unknown> = {
        company: company.trim(),
        status,
      };
      if (jobTitle.trim()) payload.job_title = jobTitle.trim();
      if (jobDescription.trim()) payload.job_description = jobDescription.trim();
      if (appliedDate) payload.applied_date = appliedDate; // ISO date

      // Single API call using helper (includes Authorization header if using token)
      await apiPost("/applications", payload);

      // On success, go back to list
      navigate("/applications");
    } catch (e: any) {
      setErr(e.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-screen-sm min-w-[320px] px-4 py-8">
      <div className="mb-6">
        <Link to="/applications" className="text-lg text-brand hover:underline">
          ← Back to Applications
        </Link>
      </div>

      <h1 className="mb-6 text-4xl font-bold">Add Application</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company (required) */}
        <div>
          <label htmlFor="company" className="mb-1 block text-lg font-medium text-gray-700">
            Company <span className="text-red-600 text-md">*</span>
          </label>
          <input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            disabled={submitting}
            className="w-full rounded-lg border border-gray-300 px-3 text-lg py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
            placeholder="Acme Inc."
          />
        </div>

        {/* Job Title (optional) */}
        <div>
          <label htmlFor="jobTitle" className="mb-1 block text-lg font-medium text-gray-700">
            Job Title
          </label>
          <input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={submitting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
            placeholder="Software Engineer"
          />
        </div>

        {/* Job Description (optional) */}
        <div>
          <label htmlFor="jobDescription" className="mb-1 block text-lg font-medium text-gray-700">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={submitting}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-3 text-lg py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
            placeholder="Paste the job description or notes here…"
          />
        </div>

        {/* Status (optional) */}
        <div>
          <label htmlFor="status" className="mb-1 block text-lg font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            disabled={submitting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:ring text-lg focus:ring-brand/30 disabled:bg-gray-100"
          >
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Applied Date (optional) */}
        <div>
          <label htmlFor="appliedDate" className="mb-1 block text-lg font-medium text-gray-700">
            Applied Date
          </label>
          <input
            id="appliedDate"
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
            disabled={submitting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:brightness-95 disabled:opacity-60 text-lg"
        >
          {submitting ? "Saving…" : "Save Application"}
        </button>

        {err && <p className="text-lg text-red-600">{err}</p>}
      </form>
    </div>
  );
}
