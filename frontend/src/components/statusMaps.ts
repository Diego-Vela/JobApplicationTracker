// components/applications/statusMaps.ts
import type { UIStatus, APIStatus } from "./types";

export const STATUS_LABELS: Record<UIStatus, string> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

export const UI_TO_API: Record<UIStatus, APIStatus> = {
  applied: "applied",
  interviewing: "interviewing",
  offer: "offer",
  rejected: "rejected",
};

export const API_TO_UI: Record<APIStatus, UIStatus> = {
  applied: "applied",
  interviewing: "interviewing",
  offer: "offer",
  rejected: "rejected",
};

export const TABS: { key: UIStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

export const UI_TO_COLOR: Record<UIStatus, string> = {
  applied: "bg-blue-100 text-blue-800",
  interviewing: "bg-yellow-100 text-yellow-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};