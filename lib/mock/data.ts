/**
 * Dummy data for the whole UI. Every page reads from here (through lib/mock/api.ts).
 * To plug in a real source, replace this file or swap `api()` in lib/hq.ts for real fetch calls.
 * Dates are generated relative to "now" so the UI always looks freshly used.
 */
import type { Commit, FileEntry, LinkState, LogEntry, Me, Repo } from "@/lib/hq";

const DAY = 864e5;
export const daysAgo = (d: number) => new Date(Date.now() - d * DAY).toISOString();
const unixAgo = (d: number) => Math.floor((Date.now() - d * DAY) / 1000);

export const me: Me = {
  identity: {
    name: "Alex Rivera",
    legal_name: "Alexandra Rivera",
    pronouns: "they/them",
    location: "Lisbon, Portugal",
    email: "alex.rivera@example.com",
    phone: "+351 900 000 000",
    headline: "Full-stack engineer building fast, friendly developer tools",
    summary:
      "Full-stack engineer with 4 years of experience shipping TypeScript and Rust products. I care about tight feedback loops, accessible interfaces and tools that get out of the way.",
    avatar: "avatar.svg",
  },
  target: "Senior frontend / full-stack roles at product-led developer-tool companies, remote-first.",
  links: [
    { id: "github", label: "GitHub", url: "https://github.com/example", resume: true },
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/example", resume: true },
    { id: "portfolio", label: "Portfolio", url: "https://example.com", resume: true },
    { id: "blog", label: "Blog", url: "https://example.org/blog", note: "Writing about DX and performance" },
    { id: "x", label: "X", url: "https://x.com/example" },
  ],
  education: [
    {
      level: "Degree", degree: "B.Sc.", field: "Computer Science", school: "University of Lisbon", start: "2017-09", end: "2021-06",
      grade: "17/20", status: "Completed", courses: ["Distributed Systems", "Compilers", "Human-Computer Interaction", "Databases"],
      activities: [{ role: "Lead organizer", org: "HackLisbon", note: "Grew the hackathon from 80 to 300 participants" }],
      highlights: ["Thesis on incremental computation for UI rendering"],
    },
    { level: "Certification", degree: "AWS Certified Developer – Associate", school: "Amazon Web Services", start: "2023-03", end: "2023-03", status: "Completed" },
  ],
  experience: [
    {
      role: "Senior Software Engineer", org: "Northwind Labs", type: "Full-time", mode: "Remote", location: "Berlin, Germany", start: "2024-02", end: "Present",
      highlights: [
        "Led the rebuild of the dashboard in Next.js, cutting time-to-interactive from 4.1s to 1.3s",
        "Designed a typed API layer used by 6 product teams",
        "Mentored 3 engineers through their first on-call rotations",
      ],
      stack: ["TypeScript", "Next.js", "React", "PostgreSQL", "tRPC"], learned: ["Incremental rollouts", "Design systems at scale"], visibility: "Public",
    },
    {
      role: "Software Engineer", org: "Brightpath", type: "Full-time", mode: "Hybrid", location: "Lisbon, Portugal", start: "2021-07", end: "2024-01",
      highlights: [
        "Shipped a realtime collaboration feature used by 40k monthly users",
        "Moved CI from 25 to 7 minutes with caching and test sharding",
      ],
      stack: ["React", "Node.js", "Redis", "Docker", "AWS"], visibility: "Public",
    },
    {
      role: "Frontend Intern", org: "Pixel & Co", type: "Internship", mode: "On-site", location: "Porto, Portugal", start: "2020-06", end: "2020-09",
      highlights: ["Built an accessible component library with 30+ components"], stack: ["Vue", "SCSS"], visibility: "Public",
    },
  ],
  skills: {
    strong: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
    working: ["Rust", "Docker", "AWS", "Python", "Tailwind CSS"],
    no_evidence: ["Kubernetes", "GraphQL"],
  },
  answers: {
    notice_period: "4 weeks",
    work_authorization: "EU citizen, no sponsorship needed",
    expected_salary: "Open to discuss, based on the role and location",
    remote_preference: "Remote-first, happy to travel quarterly",
    relocation: null,
    start_date: "",
    why_this_company: null,
  },
  achievements: [
    { title: "1st place, Web Summit Hackathon", kind: "Hackathon", date: "2023-11", note: "Built a live accessibility auditor in 36 hours", link: "https://example.com/hackathon" },
    { title: "Speaker, JSConf EU", kind: "Event", date: "2024-06", note: "Talk: Shipping less JavaScript" },
    { title: "Rust for JavaScript developers", kind: "Course", date: "2025-02" },
    { title: "Open source contributor of the month", kind: "Award", date: "2025-08" },
  ],
  stack: [
    { name: "TypeScript", category: "Language", tier: "Core", projects: 9, first_seen: "2019-03", last_used: daysAgo(1), recent: ["orbit-dashboard", "quill-notes"] },
    { name: "React", category: "Frontend", tier: "Core", projects: 8, first_seen: "2019-05", last_used: daysAgo(1) },
    { name: "Next.js", category: "Frontend", tier: "Core", projects: 6, first_seen: "2020-11", last_used: daysAgo(2) },
    { name: "Node.js", category: "Backend", tier: "Regular", projects: 5, first_seen: "2019-08", last_used: daysAgo(6) },
    { name: "PostgreSQL", category: "Database", tier: "Regular", projects: 4, first_seen: "2020-02", last_used: daysAgo(10) },
    { name: "Tailwind CSS", category: "Frontend", tier: "Regular", projects: 6, first_seen: "2021-01", last_used: daysAgo(2) },
    { name: "Rust", category: "Language", tier: "Working", projects: 2, first_seen: "2024-09", last_used: daysAgo(14) },
    { name: "Docker", category: "DevOps", tier: "Working", projects: 3, first_seen: "2021-04", last_used: daysAgo(30) },
    { name: "AWS", category: "Cloud", tier: "Working", projects: 2, first_seen: "2022-01", last_used: daysAgo(60) },
    { name: "Python", category: "Language", tier: "Tried", projects: 1, first_seen: "2018-10", last_used: daysAgo(200) },
    { name: "Vue", category: "Frontend", tier: "Past", projects: 1, first_seen: "2020-06", last_used: daysAgo(900) },
  ],
  claim_gaps: [
    { name: "Kubernetes", where: "skills", evidence: "No project or job uses it", action: "Remove it or add a project that deploys to k8s" },
    { name: "GraphQL", where: "skills", evidence: "Only mentioned in a draft resume", action: "Link a repo that uses it" },
  ],
  positioning: {
    direction: "Product-minded full-stack engineer who makes web apps feel instant.",
    headlines: [
      { label: "Default", text: "Full-stack engineer building fast, friendly developer tools" },
      { label: "Frontend", text: "Frontend engineer focused on performance and design systems" },
    ],
    summaries: [{ label: "Short", text: "4 years shipping TypeScript and Rust products for developer-tool startups." }],
    avoid: ["Blockchain", "Kubernetes", "PHP"],
    skill_order: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Rust"],
  },
};

type RepoSeed = Partial<Repo> & Pick<Repo, "name" | "primary" | "desc">;
const repo = (r: RepoSeed): Repo => ({
  pinned: false, private: false, fork: false, stars: 0, pushed: daysAgo(30), homepage: null, langs: { [r.primary ?? "Other"]: 1 }, ...r,
});

export const repos: Repo[] = [
  repo({
    name: "orbit-dashboard", pinned: true, stars: 342, pushed: daysAgo(1), primary: "TypeScript", desc: "Realtime analytics dashboard with a tiny footprint",
    tagline: "Analytics dashboard that loads in under a second", category: "Web app", status: "Active", when: "2025 – now",
    url: "https://github.com/example/orbit-dashboard", homepage: "https://orbit.example.com", live: "https://orbit.example.com",
    topics: ["nextjs", "analytics", "dashboard"], stack: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"], license: "MIT", branch: "main", forks: 21, size_kb: 4200,
    bullets: ["Streams 10k events/s to the browser over SSE", "Ships 38 KB of JS on first load"],
    impact: [{ label: "Stars", value: "342" }, { label: "First load", value: "38 KB" }, { label: "Users", value: "1.2k", note: "monthly active" }],
    langs: { TypeScript: 82000, CSS: 9000, JavaScript: 3000 }, created: daysAgo(400), cover: "shot-orbit.svg",
    detected: [{ name: "Next.js", category: "Frontend" }, { name: "PostgreSQL", category: "Database" }],
  }),
  repo({
    name: "quill-notes", pinned: true, stars: 128, pushed: daysAgo(3), primary: "TypeScript", desc: "Local-first markdown notes with sync",
    tagline: "Offline-first notes that sync without a server", category: "Desktop app", status: "Active",
    url: "https://github.com/example/quill-notes", homepage: "https://quill.example.com", live: "https://quill.example.com",
    stack: ["React", "TypeScript", "CRDT", "Tauri"], langs: { TypeScript: 54000, Rust: 12000, CSS: 4000 }, created: daysAgo(600), forks: 9, license: "MIT",
    bullets: ["Conflict-free sync with CRDTs", "Full-text search over 50k notes in under 20 ms"],
  }),
  repo({
    name: "ferris-cli", pinned: true, stars: 87, pushed: daysAgo(14), primary: "Rust", desc: "A fast project scaffolder written in Rust",
    tagline: "Scaffold any project in 200 ms", category: "CLI", status: "Maintained", url: "https://github.com/example/ferris-cli",
    stack: ["Rust", "Clap"], langs: { Rust: 31000 }, created: daysAgo(380), forks: 4, license: "Apache-2.0",
  }),
  repo({
    name: "a11y-lint", pinned: true, stars: 56, pushed: daysAgo(40), primary: "JavaScript", desc: "ESLint plugin that catches accessibility bugs early",
    tagline: "Accessibility checks in your editor", category: "Library", status: "Maintained", url: "https://github.com/example/a11y-lint",
    homepage: "https://a11y-lint.example.com", stack: ["JavaScript", "ESLint"], langs: { JavaScript: 22000, TypeScript: 4000 }, created: daysAgo(900),
  }),
  repo({
    name: "pixel-api", stars: 12, pushed: daysAgo(75), primary: "TypeScript", desc: "Image resizing API on the edge",
    category: "API", url: "https://github.com/example/pixel-api", stack: ["Node.js", "AWS"], langs: { TypeScript: 15000 }, created: daysAgo(700),
  }),
  repo({
    name: "dotfiles", stars: 4, pushed: daysAgo(9), primary: "Shell", desc: "My shell, editor and terminal setup",
    url: "https://github.com/example/dotfiles", langs: { Shell: 6000 }, created: daysAgo(1200),
  }),
  repo({
    name: "ml-playground", private: true, pushed: daysAgo(210), primary: "Python", desc: "Notebooks from a machine learning course",
    url: "https://github.com/example/ml-playground", langs: { Python: 18000 }, created: daysAgo(800),
  }),
  repo({
    name: "portfolio-v3", pushed: daysAgo(20), primary: "CSS", desc: "Personal site, third edition", homepage: "https://example.com",
    url: "https://github.com/example/portfolio-v3", langs: { CSS: 7000, HTML: 5000, TypeScript: 3000 }, created: daysAgo(300),
  }),
  // A local-only project: no `url`, so the UI treats it as "not on GitHub".
  repo({
    name: "freelance-booking", primary: "TypeScript", desc: "Booking system built for a local studio (private client work)",
    tagline: "Booking and payments for a yoga studio", status: "Shipped", category: "Client work", note: "Code is owned by the client",
    stack: ["Next.js", "Stripe", "PostgreSQL"], langs: { TypeScript: 1 }, pushed: daysAgo(120),
  }),
];

export const links: Record<string, LinkState> = {
  "https://github.com/example": { code: 200, status: "ok", ms: 180, checked: daysAgo(0.2) },
  "https://www.linkedin.com/in/example": { code: 999, status: "gated", ms: 420, checked: daysAgo(0.2) },
  "https://example.com": { code: 200, status: "ok", ms: 95, checked: daysAgo(0.2) },
  "https://example.org/blog": { code: 404, status: "dead", ms: 140, checked: daysAgo(0.2) },
  "https://x.com/example": { code: 200, status: "ok", ms: 310, checked: daysAgo(0.2) },
  "https://orbit.example.com": { code: 200, status: "ok", ms: 120, checked: daysAgo(0.2) },
  "https://quill.example.com": { code: 503, status: "down", ms: 2900, checked: daysAgo(0.2) },
  "https://a11y-lint.example.com": { code: 200, status: "ok", ms: 88, checked: daysAgo(0.2) },
};

export const log: LogEntry[] = [
  { ts: unixAgo(0.05), date: daysAgo(0.05), kind: "change", text: "set me/identity/headline", src: "app" },
  { ts: unixAgo(0.3), date: daysAgo(0.3), kind: "change", text: "check_links", src: "app" },
  { ts: unixAgo(0.8), date: daysAgo(0.8), kind: "change", text: "append projects/orbit-dashboard/bullets", src: "agent" },
  { ts: unixAgo(1.2), date: daysAgo(1.2), kind: "file", text: "Added resume-2026.pdf", src: "app" },
  { ts: unixAgo(1.5), date: daysAgo(1.5), kind: "change", text: "sync", src: "cli" },
  { ts: unixAgo(2.1), date: daysAgo(2.1), kind: "change", text: "pin quill-notes", src: "app" },
  { ts: unixAgo(3), date: daysAgo(3), kind: "change", text: "set me/answers/notice_period", src: "agent" },
  { ts: unixAgo(4), date: daysAgo(4), kind: "note", text: "Recruiter call with Northwind went well, follow up Friday", src: "app" },
  { ts: unixAgo(5), date: daysAgo(5), kind: "change", text: "append me/skills/working", src: "agent" },
  { ts: unixAgo(7), date: daysAgo(7), kind: "change", text: "del me/skills/working/3", src: "app" },
  { ts: unixAgo(9), date: daysAgo(9), kind: "change", text: "set projects/ferris-cli/tagline", src: "agent" },
  { ts: unixAgo(12), date: daysAgo(12), kind: "change", text: "undo", src: "app" },
];

const file = (f: Partial<FileEntry> & Pick<FileEntry, "id" | "name" | "kind">): FileEntry => {
  const ext = f.name.split(".").pop() ?? "";
  return { ext, mime: ext === "pdf" ? "application/pdf" : "image/svg+xml", size: 24000, added: unixAgo(10), links: [], ...f };
};

/** Files are served from public/files/<id>. */
export const files: FileEntry[] = [
  file({ id: "avatar.svg", name: "avatar.svg", kind: "avatar", size: 2100, added: unixAgo(30), links: [{ type: "me", ref: "avatar" }] }),
  file({ id: "resume-2026.pdf", name: "resume-2026.pdf", kind: "resume", label: "Resume – 2026", current: true, size: 3400, added: unixAgo(1.2) }),
  file({ id: "resume-2025.pdf", name: "resume-2025.pdf", kind: "resume", label: "Resume – 2025", size: 3300, added: unixAgo(200), note: "Older frontend-focused version" }),
  file({ id: "shot-orbit.svg", name: "shot-orbit.svg", kind: "screenshot", label: "Orbit dashboard", size: 3800, added: unixAgo(5), links: [{ type: "project", ref: "orbit-dashboard" }] }),
  file({ id: "shot-quill.svg", name: "shot-quill.svg", kind: "screenshot", label: "Quill editor", size: 3600, added: unixAgo(8), links: [{ type: "project", ref: "quill-notes" }] }),
  file({ id: "shot-ferris.svg", name: "shot-ferris.svg", kind: "screenshot", label: "Ferris CLI output", size: 3000, added: unixAgo(20), links: [{ type: "project", ref: "ferris-cli" }] }),
];

const MSGS = [
  "feat: add realtime event stream", "fix: handle empty state in charts", "refactor: split data layer", "chore: bump dependencies",
  "perf: memoize heavy selectors", "docs: update README", "feat: keyboard shortcuts", "fix: off-by-one in pagination",
  "test: cover sync conflicts", "style: tighten spacing on cards", "feat: dark mode polish", "fix: race in websocket reconnect",
  "ci: cache build output", "feat: export to CSV", "refactor: rename internal modules", "fix: timezone handling in dates",
];

/** Deterministic pseudo-random so commits look the same on every load. */
const rand = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/** Builds a believable history per repo: linear main line with an occasional merged branch. */
function history(repoName: string, count: number, spanDays: number, startAgo: number): Commit[] {
  const r = rand(repoName.length * 7919 + count);
  const out: Commit[] = [];
  for (let i = 0; i < count; i++) {
    const ago = startAgo + (spanDays * i) / count + r() * 2;
    const sha = Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(r() * 16)]).join("");
    out.push({
      sha, short: sha.slice(0, 7), msg: MSGS[Math.floor(r() * MSGS.length)], date: daysAgo(ago), author: "example", name: "Alex Rivera",
      add: Math.floor(r() * 300) + 1, del: Math.floor(r() * 120), files: Math.floor(r() * 9) + 1, parents: [], repo: repoName,
    });
  }
  // newest first; each commit's parent is the next (older) one, with a merge every ~9 commits
  out.forEach((c, i) => {
    if (out[i + 1]) c.parents.push(out[i + 1].sha);
    if (i % 9 === 4 && out[i + 3]) { c.parents.push(out[i + 3].sha); c.msg = `Merge branch 'feature/${MSGS[i % MSGS.length].split(": ")[1].split(" ")[0]}'`; }
  });
  return out;
}

export const commits: Record<string, Commit[]> = Object.fromEntries(
  repos.filter((r) => r.url).map((r, i) => [r.name, history(r.name, [80, 60, 40, 30, 20, 25, 15, 18][i] ?? 20, 300, Math.max(0, (Date.now() - Date.parse(r.pushed)) / DAY))]),
);

export const usage = [
  { key: "me/identity", label: "Identity", n: 42, last: unixAgo(0.1) },
  { key: "me/experience", label: "Experience", n: 31, last: unixAgo(0.4) },
  { key: "projects/orbit-dashboard", label: "orbit-dashboard", n: 18, last: unixAgo(1) },
  { key: "me/answers", label: "Application answers", n: 15, last: unixAgo(2) },
  { key: "me/skills", label: "Skills", n: 11, last: unixAgo(3) },
  { key: "me/links", label: "Links", n: 7, last: unixAgo(6) },
];

export const mcpTools = [
  { name: "brief", kind: "read", desc: "Short summary of the profile for a chat" },
  { name: "get", kind: "read", desc: "Read any part of the profile by path" },
  { name: "search", kind: "read", desc: "Find facts that match a query" },
  { name: "repo_context", kind: "read", desc: "Everything known about one project" },
  { name: "match_job", kind: "read", desc: "Check a job post against the profile" },
  { name: "set_identity", kind: "write", desc: "Update name, email, headline and more" },
  { name: "add_experience", kind: "write", desc: "Add a job" },
  { name: "add_skill", kind: "write", desc: "Add a skill with evidence" },
  { name: "set_answer", kind: "write", desc: "Save an application answer" },
  { name: "sync", kind: "network", desc: "Pull repos from GitHub" },
  { name: "check_links", kind: "network", desc: "Check every link for dead pages" },
] as const;
