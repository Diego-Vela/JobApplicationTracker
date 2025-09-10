// src/hooks/useApplicationInfo.ts
import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPatch, apiDelete } from "../api";
import type { Application, UIStatus, ResumeOut, CoverLetterOut } from "../components/types";
import { UI_TO_API, API_TO_UI } from "../components/statusMaps";

export function useApplicationInfo(id?: string) {
  const navigate = useNavigate();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [resumes, setResumes] = useState<ResumeOut[]>([]);
  const [cvs, setCvs] = useState<CoverLetterOut[]>([]);
  const [resumeOption, setResumeOption] = useState<string>("");
  const [coverLetterOption, setCoverLetterOption] = useState<string>("");

  const [docsLoading, setDocsLoading] = useState(false);
  const [docsErr, setDocsErr] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [appliedDate, setAppliedDate] = useState<string>("");

  const currentUIStatus = useMemo<UIStatus | null>(() => {
    if (!app?.status) return null;
    return API_TO_UI[app.status as keyof typeof API_TO_UI];
  }, [app?.status]);

  // Load application
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    apiGet<Application>(`/applications/${id}`)
      .then((data) => {
        console.log("Fetched application from backend:", data); // Debug print
        setApp(data);
      })
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : "Failed to load application"))
      .finally(() => setLoading(false));
  }, [id]);

  // Load resumes and CVs when editing
  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    setDocsErr(null);
    setDocsLoading(true);

    Promise.all([
      apiGet<ResumeOut[]>("/files/resumes"),
      apiGet<CoverLetterOut[]>("/files/cv"),
    ])
      .then(([resumesData, cvsData]) => {
        if (cancelled) return;
        setResumes(resumesData || []);
        if (resumeOption && !resumesData.some(r => r.resume_id === resumeOption)) {
          setResumeOption("");
        }
        setCvs(cvsData || []);
        if (coverLetterOption && !cvsData.some(c => c.cv_id === coverLetterOption)) {
          setCoverLetterOption("");
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setDocsErr(e instanceof Error ? e.message : "Failed to load documents.");
      })
      .finally(() => {
        if (!cancelled) setDocsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editing, resumeOption, coverLetterOption]);

  // Save changes
  async function save(partial: Partial<Application>) {
    if (!id) return;
    try {
      const updated = await apiPatch<Application>(`/applications/${id}`, partial);
      setApp(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save changes");
    }
  }

  async function moveStatus(newUIStatus: UIStatus) {
    if (!id) return;
    try {
      const newStatus = UI_TO_API[newUIStatus];
      const moved = await apiPost<Application>(
        `/applications/${id}/move?new_status=${encodeURIComponent(newStatus)}`
      );
      setApp(moved);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to move status");
    }
  }

  function beginEdit() {
    if (!app) return;
    setCompany(app.company ?? "");
    setJobTitle(app.job_title ?? "");
    setJobDescription(app.job_description ?? "");
    setAppliedDate(app.applied_date ?? ""); // Use the string directly
    console.log("Setting appliedDate to:", app.applied_date ?? "");
    setResumeOption(app.resume_id ?? "");
    setCoverLetterOption(app.cv_id ?? "");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

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

    if (resumeOption !== app.resume_id) {
      payload.resume_id = resumeOption || null;
    }
    if (coverLetterOption !== app.cv_id) {
      payload.cv_id = coverLetterOption || null;
    }

    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }

    await save(payload);
    setEditing(false);
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await apiDelete(`/applications/${id}`);
      navigate("/applications");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete application");
    }
  }

  function fmtDate(iso?: string | null) {
    if (!iso) return "—";
    return iso.split("T")[0];
  }

  return {
    app, setApp, loading, err, save, moveStatus, handleDelete,
    resumes, cvs, resumeOption, setResumeOption, coverLetterOption, setCoverLetterOption,
    docsLoading, docsErr,
    editing, beginEdit, cancelEdit, saveEdit,
    company, setCompany, jobTitle, setJobTitle, jobDescription, setJobDescription,
    appliedDate, setAppliedDate,
    fmtDate, currentUIStatus,
  };
}
