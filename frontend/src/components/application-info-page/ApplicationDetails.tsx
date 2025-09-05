// src/components/ApplicationDetails.tsx
import type { Application } from "../types";
import { ReadOnlyDocCard } from "./ReadOnlyDocCard";
import type { ResumeOut, CVOut } from "../types";
import { useEffect, useState } from "react";
import { apiGet } from "../../api";

export function ApplicationDetails({ app, fmtDate }: { app: Application; fmtDate: (iso?: string | null) => string; }) {
  
  const [resumeDoc, setResumeDoc] = useState<ResumeOut | null>(null);
  const [cvDoc, setCvDoc] = useState<CVOut | null>(null);

  useEffect(() => {
  let cancelled = false;
  (async () => {
    if (!app) return;

    try {
      // only fetch the lists we need
      const [resumes, cvs] = await Promise.all([
        app.resume_id ? apiGet<ResumeOut[]>("/files/resumes") : Promise.resolve(null),
        app.cv_id     ? apiGet<CVOut[]>("/files/cv")         : Promise.resolve(null),
      ]);

      if (cancelled) return;

      if (resumes && app.resume_id) {
        const r = resumes.find(x => x.resume_id === app.resume_id) || null;
        setResumeDoc(r);
      } else {
        setResumeDoc(null);
      }

      if (cvs && app.cv_id) {
        const c = cvs.find(x => x.cv_id === app.cv_id) || null;
        setCvDoc(c);
      } else {
        setCvDoc(null);
      }
    } catch (e) {
      // fall back to showing IDs if fetch fails
      setResumeDoc(null);
      setCvDoc(null);
    }
  })();
  return () => { cancelled = true; };
}, [app?.resume_id, app?.cv_id]);

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-1">
      <div>
        <dt className="text-md uppercase tracking-wide text-gray-500">Applied Date</dt>
        <dd className="text-lg">{fmtDate(app.applied_date)}</dd>
      </div>
      <div>
        <dt className="text-md uppercase tracking-wide text-gray-500">Resume</dt>
        <dd>
          {app.resume_id ? (
            <ReadOnlyDocCard
              doc={{
                id: app.resume_id,
                type: "resume",
                name: resumeDoc?.file_name ?? "Resume",
                label: resumeDoc?.label ?? undefined,
                url: resumeDoc?.resume_url,
              }}
            />
          ) : (
            <span>—</span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-md uppercase tracking-wide text-gray-500">Cover Letter</dt>
        <dd>
          {app.cv_id ? (
            <ReadOnlyDocCard
              doc={{
                id: app.cv_id,
                type: "cv",
                name: cvDoc?.file_name ?? "CV",
                label: cvDoc?.label ?? undefined,
                url: cvDoc?.cv_url,
              }}
            />
          ) : (
            <span>—</span>
          )}
        </dd>
      </div>
    </dl>
  );
}
