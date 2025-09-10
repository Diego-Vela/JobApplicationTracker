// src/hooks/useCreateApplication.ts
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "../api";
import type { ResumeOut, CoverLetterOut, CreatePayload, UIStatus } from "../components/types";


export function useApplicationsNew() {
  // Form state
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<UIStatus>("applied");
  const [appliedDate, setAppliedDate] = useState<string>("");

  // Document lists + selected
  const [resumes, setResumes] = useState<ResumeOut[]>([]);
  const [cvs, setCvs] = useState<CoverLetterOut[]>([]);
  const [resumeOption, setResumeOption] = useState<string>(""); // "" = None
  const [coverLetterOption, setCoverLetterOption] = useState<string>("");

  // UI state
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsErr, setDocsErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load document lists on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setDocsErr(null);
        setDocsLoading(true);
        const [resumesData, cvsData] = await Promise.all([
          apiGet<ResumeOut[]>("/files/resumes"),
          apiGet<CoverLetterOut[]>("/files/cv"),
        ]);
        if (cancelled) return;
        setResumes(resumesData || []);
        setCvs(cvsData || []);
      } catch (e: any) {
        if (!cancelled) setDocsErr(e?.message || "Failed to load documents.");
      } finally {
        if (!cancelled) setDocsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildPayload = useCallback((): CreatePayload | null => {
    if (!company.trim()) {
      setErr("Company is required");
      return null;
    }
    const payload: CreatePayload = {
      company: company.trim(),
      status,
    };
    if (jobTitle.trim()) payload.job_title = jobTitle.trim();
    if (jobDescription.trim()) payload.job_description = jobDescription.trim();
    if (appliedDate) payload.applied_date = appliedDate;
    if (resumeOption) payload.resume_id = resumeOption;
    if (coverLetterOption) payload.cv_id = coverLetterOption;
    return payload;
  }, [company, status, jobTitle, jobDescription, appliedDate, resumeOption, coverLetterOption]);

  const submit = useCallback(async () => {
    setErr(null);
    const payload = buildPayload();
    if (!payload) return false;

    setSubmitting(true);
    try {
      await apiPost("/applications", payload);
      return true;
    } catch (e: any) {
      setErr(e?.message || "Failed to create application");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [buildPayload]);

  return {
    // values
    company, jobTitle, jobDescription, status, appliedDate,
    resumeOption, coverLetterOption,
    resumes, cvs,
    docsLoading, docsErr,
    submitting, err,

    // setters
    setCompany, setJobTitle, setJobDescription, setStatus, setAppliedDate,
    setResumeOption, setCoverLetterOption,

    // actions
    submit,
  };
}
