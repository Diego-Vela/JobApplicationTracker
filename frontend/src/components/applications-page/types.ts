/* types.ts
  Defines the types used in the applications feature
*/ 
export type UIStatus = "applied" | "interviewing" | "offer" | "rejected";
export type APIStatus = "applied" | "interviewing" | "offer" | "rejected";

export type Application = {
  application_id: string;
  company: string;
  job_title?: string | null;
  status?: APIStatus | null;
  applied_date?: string | null; // ISO date
};

export type TabKey = "all" | UIStatus;