/* types.ts
  Defines the types used in the applications feature
*/ 
// ---------------------------------- Application-related types ---------------------------------- //
export type UIStatus = "applied" | "interviewing" | "offer" | "rejected";
export type APIStatus = "applied" | "interviewing" | "offer" | "rejected";

export type Application = {
  application_id: string;
  company: string;
  job_title?: string | null;
  job_description?: string | null;
  status?: APIStatus | null;
  applied_date?: string | null; // ISO date
  resume_id?: string | null;
  cv_id?: string | null;
};

export type TabKey = "all" | UIStatus;

export type AppNote = {
  note_id: string;
  application_id: string;
  content: string;
  created_at: string; // ISO
};

export type CreatePayload = {
  company: string;
  job_title?: string;
  job_description?: string;
  status: UIStatus;
  applied_date?: string; // YYYY-MM-DD
  resume_id?: string;
  cv_id?: string;
};

export const MAX_NUM_NOTES = 15;
export const MAX_NOTES_LENGTH = 500;
export const MAX_DESCRIPTION_LENGTH = 1500;

// ---------------------------------- Document-related types ---------------------------------- //
export type DocType = "resume" | "cv";

export type ResumeOut = {
  resume_id: string;
  file_name: string;
  label?: string | null;
  resume_url?: string | null;
  uploaded_at?: string;
};

export type CVOut = {
  cv_id: string;
  file_name: string;
  label?: string | null;
  cv_url?: string | null;
  uploaded_at?: string;
};

export type DocumentItem = {
  id: string;
  name: string;
  label?: string | null;
  url?: string | null;
  uploaded_at?: string;
  type: DocType;
};

export const ACCEPTED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_RESUMES = 5;
export const MAX_CVS = 50;
export const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
