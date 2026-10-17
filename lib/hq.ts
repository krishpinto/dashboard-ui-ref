import { mockApi, mockUpload } from "@/lib/mock/api";

export type Link = { id: string; label: string; url: string; resume?: boolean; note?: string };
/** Dates are YYYY-MM, YYYY or "Present". */
export type Experience = {
  role: string; org: string; type: "Full-time" | "Part-time" | "Internship" | "Freelance" | "Contract" | "Volunteer";
  mode?: "On-site" | "Remote" | "Hybrid"; location?: string; start: string; end: string;
  highlights?: string[]; stack?: string[]; learned?: string[]; public?: boolean; visibility?: "Public" | "Private"; note?: string;
};
export type Education = {
  level: "Degree" | "Diploma" | "Higher secondary" | "Secondary" | "Certification";
  degree: string; field?: string; school: string; start: string; end: string; grade?: string;
  courses?: string[]; activities?: { role: string; org?: string; note?: string }[]; highlights?: string[]; status?: "Ongoing" | "Completed"; semester?: string; note?: string;
};
export type Achievement = { title: string; kind: "Hackathon" | "Competition" | "Course" | "Certification" | "Award" | "Event"; date: string; note?: string; link?: string };
export type TechEntry = { name: string; category: string; tier: "Core" | "Regular" | "Working" | "Tried" | "Past"; projects?: number; first_seen?: string; last_used?: string; recent?: string[]; note?: string };
export type ClaimGap = { name: string; where: string; evidence: string; action?: string };
export type Positioning = { direction?: string; headlines?: { label: string; text: string }[]; summaries?: { label: string; text: string }[]; avoid?: string[]; skill_order?: string[] };
export type Me = {
  identity: Record<string, string>;
  target?: string;
  links: Link[];
  education: Education[];
  experience: Experience[];
  skills: { strong: string[]; working: string[]; no_evidence: string[] };
  answers: Record<string, unknown>;
  achievements?: (string | Achievement)[];
  stack?: TechEntry[];
  claim_gaps?: ClaimGap[];
  positioning?: Positioning;
};
export type Repo = {
  name: string; pinned: boolean; private: boolean; fork: boolean; stars: number; pushed: string;
  primary: string | null; desc: string | null; tagline?: string; summary?: string; category?: string; visibility?: string; status?: string; when?: string; local_path?: string; note?: string; stack?: string[]; bullets?: string[]; created?: string; url?: string; topics?: string[]; homepage: string | null; live?: string;
  impact?: { label: string; value: string; note?: string }[]; cover?: string; extras?: { fetched: number; issues: number; prs: number; release: { tag: string; date: string; url: string } | null; ci: { ok: boolean | null; at: string }[] } | null;
  detected?: { name: string; category: string }[] | null; license?: string | null; branch?: string | null; forks?: number; size_kb?: number;
  langs: Record<string, number>;
};
export type Commit = {
  sha: string; short: string; msg: string; date: string; author: string; name?: string;
  add: number; del: number; files: number | null; parents: string[]; repo?: string;
};
export type LinkState = { code: number; status: "ok" | "dead" | "down" | "gated"; ms: number; checked: string };
export type LogEntry = { ts: number; date: string; kind: string; text: string; src?: "app" | "agent" | "cli" };
export type Integration = { id: string; status: string; note: string };

/**
 * Every data read/write in the UI goes through here. It currently answers from dummy data (lib/mock).
 * To use a real backend, replace the body with your own fetch, e.g. POST `/api/${op}` with `args` as JSON.
 */
export async function api<T = unknown>(op: string, args: object = {}): Promise<T> {
  return (await mockApi(op, args as Record<string, unknown>)) as T;
}

export const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3b82f6", JavaScript: "#eab308", Rust: "#f97316", Python: "#22c55e", CSS: "#a855f7",
  HTML: "#ef4444", EJS: "#84cc16", Java: "#d97706", Shell: "#14b8a6", Other: "#52525b",
};

export const ago = (iso?: string | null) => {
  if (!iso) return "–";
  const d = (Date.now() - Date.parse(iso)) / 864e5;
  return d < 1 ? "today" : d < 60 ? `${Math.round(d)}d` : d < 700 ? `${Math.round(d / 30)}mo` : `${Math.round(d / 365)}y`;
};

export type FileLink = { type: "project" | "experience" | "education" | "achievement" | "me"; ref: string };
export type FileEntry = {
  id: string; name: string; ext: string; mime: string; size: number; kind: "avatar" | "resume" | "screenshot" | "other";
  added: number; note?: string; label?: string; current?: boolean; links: FileLink[];
};

/** Stored files are served from public/files/<id>. A value that already looks like a URL (incl. blob: uploads) is passed through. */
export const fileUrl = (id?: string | null) => (!id ? "" : /^(https?:|\/|data:|blob:)/.test(id) ? id : `/files/${id}`);

export const bytes = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n > 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);

/** Upload one file into the local store. */
export async function uploadFile(file: File, opts: { kind: FileEntry["kind"]; link?: FileLink; label?: string; note?: string }): Promise<FileEntry> {
  return mockUpload(file, opts);
}

/** A project that lives only on this computer (added by you or an agent), with no GitHub repo behind it. */
export const isLocal = (r: Repo) => !r.url;
