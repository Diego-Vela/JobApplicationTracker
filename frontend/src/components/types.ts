/* types.ts
  Defines the types used in the applications feature
*/ 
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