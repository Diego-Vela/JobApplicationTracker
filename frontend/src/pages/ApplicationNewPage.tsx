// src/pages/ApplicationNewPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { DocumentSelect } from "../components/application-new-page/DocumentSelect";
import { useApplicationsNew } from "../hooks/useApplicationsNew";
import { MAX_LABEL_LENGTH, MAX_DESCRIPTION_LENGTH } from "../components/types";

export default function ApplicationNewPage() {
  const navigate = useNavigate();
  const f = useApplicationsNew();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await f.submit();
    if (ok) navigate("/applications");
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
        {/* Company (required, with max length) */}
        <div>
          <label htmlFor="company" className="mb-1 block text-lg font-medium text-gray-700">
            Company <span className="text-red-600 text-md">*</span>
          </label>
          <input
            id="company"
            value={f.company}
            onChange={(e) => f.setCompany(e.target.value)}
            required
            maxLength={MAX_LABEL_LENGTH}
            disabled={f.submitting}
            className="w-full rounded-lg border border-gray-300 px-3 text-lg py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
            placeholder="Acme Inc."
          />
          <p className="mt-1 text-sm text-gray-500">
            {f.company.length}/{MAX_LABEL_LENGTH} characters
          </p>
        </div>

        {/* Job Title (optional, with max length) */}
        <div>
          <label htmlFor="jobTitle" className="mb-1 block text-lg font-medium text-gray-700">
            Job Title
          </label>
          <input
            id="jobTitle"
            value={f.jobTitle}
            onChange={(e) => f.setJobTitle(e.target.value)}
            maxLength={MAX_LABEL_LENGTH}
            disabled={f.submitting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
            placeholder="Software Engineer"
          />
          <p className="mt-1 text-sm text-gray-500">
            {f.jobTitle.length}/{MAX_LABEL_LENGTH} characters
          </p>
        </div>

        {/* Job Description (optional, with max length) */}
        <div>
          <label htmlFor="jobDescription" className="mb-1 block text-lg font-medium text-gray-700">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            value={f.jobDescription}
            onChange={(e) => f.setJobDescription(e.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
            disabled={f.submitting}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-3 text-lg py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
            placeholder="Paste the job description or notes here…"
          />
          <p className="mt-1 text-sm text-gray-500">
            {f.jobDescription.length}/{MAX_DESCRIPTION_LENGTH} characters
          </p>
        </div>

        {/* Status (optional) */}
        <div>
          <label htmlFor="status" className="mb-1 block text-lg font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={f.status}
            onChange={(e) => f.setStatus(e.target.value as any)}
            disabled={f.submitting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
          >
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Applied Date (required) */}
        <div>
          <label htmlFor="appliedDate" className="mb-1 block text-lg font-medium text-gray-700">
            Applied Date <span className="text-red-600 text-md">*</span>
          </label>
          <input
            id="appliedDate"
            type="date"
            value={f.appliedDate}
            onChange={(e) => f.setAppliedDate(e.target.value)}
            required
            disabled={f.submitting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
          />
        </div>

        {/* Resume selector */}
        <DocumentSelect
          label="Resume"
          value={f.resumeOption}
          onChange={f.setResumeOption}
          loading={f.docsLoading}
          error={f.docsErr}
          disabled={f.submitting}
          options={f.resumes.map((r) => ({
            value: r.resume_id,
            label: r.label ?? r.file_name,
          }))}
          noneLabel="None"
        />

        {/* Cover Letter (CV) selector */}
        <DocumentSelect
          label="Cover Letter"
          value={f.coverLetterOption}
          onChange={f.setCoverLetterOption}
          loading={f.docsLoading}
          error={f.docsErr}
          disabled={f.submitting}
          options={f.cvs.map((c) => ({
            value: c.cv_id,
            label: c.label ?? c.file_name,
          }))}
          noneLabel="None"
        />

        <button
          type="submit"
          disabled={f.submitting}
          className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:brightness-95 disabled:opacity-60 text-lg"
        >
          {f.submitting ? "Saving…" : "Save Application"}
        </button>

        {f.err && <p className="text-lg text-red-600">{f.err}</p>}
      </form>
    </div>
  );
}
