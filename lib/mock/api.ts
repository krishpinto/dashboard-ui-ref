/**
 * In-memory stand-in for the original backend. `api(op, args)` in lib/hq.ts routes here.
 * Reads come from lib/mock/data.ts; writes change an in-memory copy, so edits work until the page reloads.
 * To use a real backend, make each case below call your API instead (or replace `api()` in lib/hq.ts).
 */
import type { FileEntry, LogEntry, Me, Repo } from "@/lib/hq";
import * as seed from "./data";

const clone = <T,>(v: T): T => structuredClone(v);
const db = {
  me: clone(seed.me),
  repos: clone(seed.repos),
  links: clone(seed.links),
  log: clone(seed.log),
  files: clone(seed.files),
  commits: clone(seed.commits),
  synced: Math.floor(Date.now() / 1000) - 5400,
};
const history: string[] = []; // JSON snapshots for undo

const now = () => Math.floor(Date.now() / 1000);
const record = (text: string, kind = "change") => db.log.unshift({ ts: now(), date: new Date().toISOString(), kind, text, src: "app" } satisfies LogEntry);
const snapshot = () => { history.push(JSON.stringify({ me: db.me, repos: db.repos })); if (history.length > 50) history.shift(); };
const repoBy = (name: string) => db.repos.find((r) => r.name === name);

/** The document the UI addresses with paths like "me/identity/name" or "projects/orbit-dashboard/tagline". */
const root = () => ({ me: db.me, projects: Object.fromEntries(db.repos.map((r) => [r.name, r])), state: { synced: db.synced } }) as Record<string, unknown>;

function walk(path: string, create = false): { parent: Record<string, unknown> | unknown[]; key: string } {
  const parts = path.split("/").filter(Boolean);
  let cur: unknown = root();
  for (const p of parts.slice(0, -1)) {
    const c = cur as Record<string, unknown>;
    if (c[p] === undefined && create) c[p] = {};
    cur = c[p];
    if (cur === undefined || cur === null) throw new Error(`No such path: ${path}`);
  }
  return { parent: cur as Record<string, unknown>, key: parts[parts.length - 1] };
}

const get = (path: string) => {
  if (!path) return root();
  const { parent, key } = walk(path);
  return (parent as Record<string, unknown>)[key];
};
const set = (path: string, value: unknown) => { const { parent, key } = walk(path, true); (parent as Record<string, unknown>)[key] = value; };
const append = (path: string, value: unknown) => {
  const { parent, key } = walk(path, true);
  const p = parent as Record<string, unknown[]>;
  p[key] = [...(p[key] ?? []), value];
};
const del = (path: string) => {
  const { parent, key } = walk(path);
  if (Array.isArray(parent)) parent.splice(Number(key), 1); else delete (parent as Record<string, unknown>)[key];
};

// ---------- the knowledge graph, built from the profile ----------
type GNode = { id: string; kind: string; label: string; deg: number; local?: boolean };
type GEdge = { a: string; b: string; rel: string; how: string };

function graph() {
  const nodes = new Map<string, GNode>();
  const edges: GEdge[] = [];
  const node = (id: string, kind: string, label: string, local?: boolean) => { if (!nodes.has(id)) nodes.set(id, { id, kind, label, deg: 0, local }); return id; };
  const edge = (a: string, b: string, rel: string, how: string) => { edges.push({ a, b, rel, how }); nodes.get(a)!.deg++; nodes.get(b)!.deg++; };
  const m = db.me;
  const person = node("person:me", "person", m.identity.name || "You");
  const tech = (name: string) => node(`tech:${name}`, "tech", name);

  (m.stack ?? []).forEach((t) => edge(person, tech(t.name), "uses", `${t.tier} · ${t.projects ?? 0} projects`));
  db.repos.forEach((r) => {
    const p = node(`project:${r.name}`, "project", r.name, !r.url);
    edge(person, p, "built", r.tagline || r.desc || "");
    (r.stack ?? (r.primary ? [r.primary] : [])).forEach((s) => edge(p, tech(s), "uses", "project stack"));
  });
  m.experience.forEach((e, i) => {
    const x = node(`experience:${i}`, "experience", `${e.role} @ ${e.org}`);
    const o = node(`org:${e.org}`, "org", e.org);
    edge(person, x, "worked", `${e.start} – ${e.end}`);
    edge(x, o, "at", e.location ?? "");
    (e.stack ?? []).forEach((s) => edge(x, tech(s), "uses", "on the job"));
  });
  m.education.forEach((e, i) => edge(person, node(`education:${i}`, "education", `${e.degree} ${e.field ?? ""}`.trim()), "studied", e.school));
  (m.achievements ?? []).forEach((a, i) => {
    const t = typeof a === "string" ? a : a.title;
    edge(person, node(`achievement:${i}`, "achievement", t), "earned", typeof a === "string" ? "" : a.date);
  });
  (m.claim_gaps ?? []).forEach((c) => edge(person, node(`claim:${c.name}`, "claim", c.name), "claims", c.evidence));
  Object.keys(m.answers).forEach((k) => edge(person, node(`answer:${k}`, "answer", k.replace(/_/g, " ")), "answered", String(m.answers[k] ?? "open")));
  m.links.forEach((l) => edge(person, node(`link:${l.id}`, "link", l.label), "links", l.url));
  (m.positioning?.avoid ?? []).forEach((a) => edge(person, node(`avoid:${a}`, "avoid", a), "avoids", "positioning"));
  if (m.target) edge(person, node("goal", "goal", "Target role"), "wants", m.target);
  return { nodes: [...nodes.values()], edges };
}

function explain(id: string) {
  const g = graph();
  const n = g.nodes.find((x) => x.id === id || x.label === id || x.id.endsWith(`:${id}`));
  if (!n) throw new Error(`Unknown node: ${id}`);
  const byId = new Map(g.nodes.map((x) => [x.id, x]));
  const links = g.edges
    .filter((e) => e.a === n.id || e.b === n.id)
    .map((e) => { const other = byId.get(e.a === n.id ? e.b : e.a)!; return { rel: e.rel, dir: (e.a === n.id ? "out" : "in") as "in" | "out", how: e.how, id: other.id, label: other.label, kind: other.kind }; });
  const r = n.kind === "project" ? repoBy(n.label) : undefined;
  const facts = r
    ? [{ k: "Language", v: r.primary ?? "–" }, { k: "Stars", v: String(r.stars) }, { k: "Status", v: r.status ?? "–" }]
    : [{ k: "Connections", v: String(links.length) }];
  return { id: n.id, kind: n.kind, label: n.label, text: r?.summary || r?.tagline || r?.desc || `${n.label} (${n.kind}) with ${links.length} connections.`, src: "profile", facts, links };
}

/** Flat list of human-readable facts, used by search and the job matcher. */
function facts(): string[] {
  const m = db.me;
  return [
    ...Object.entries(m.identity).filter(([k]) => k !== "avatar").map(([k, v]) => `${k}: ${v}`),
    ...m.experience.flatMap((e) => [`${e.role} at ${e.org} (${e.start} – ${e.end})`, ...(e.highlights ?? [])]),
    ...m.education.map((e) => `${e.degree} ${e.field ?? ""} at ${e.school}`),
    ...[...m.skills.strong, ...m.skills.working].map((s) => `skill: ${s}`),
    ...db.repos.map((r) => `project ${r.name}: ${r.tagline || r.desc}`),
    ...Object.entries(m.answers).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
  ];
}

function brief(): string {
  const m = db.me;
  const id = m.identity;
  return [
    `# ${id.name}`, id.headline, "", id.summary, "",
    `**Location:** ${id.location} · **Email:** ${id.email}`, `**Target:** ${m.target}`, "",
    "## Experience", ...m.experience.map((e) => `- ${e.role}, ${e.org} (${e.start} – ${e.end})`), "",
    "## Skills", `Strong: ${m.skills.strong.join(", ")}`, `Working: ${m.skills.working.join(", ")}`, "",
    "## Projects", ...db.repos.filter((r) => r.pinned).map((r) => `- ${r.name}: ${r.tagline || r.desc}`),
  ].join("\n");
}

function matchJob(text: string) {
  const lower = text.toLowerCase();
  const known = new Set([...(db.me.stack ?? []).map((t) => t.name), ...db.me.skills.strong, ...db.me.skills.working]);
  const vocab = ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Rust", "Docker", "AWS", "Python", "Kubernetes", "GraphQL", "Go", "Java", "Tailwind CSS", "Redis", "PHP", "Blockchain"];
  const avoid = new Set(db.me.positioning?.avoid ?? []);
  const requirements = vocab.filter((v) => lower.includes(v.toLowerCase())).map((term) => {
    if (avoid.has(term)) return { term, status: "avoid" as const, evidence: "Listed under things to avoid", node: `avoid:${term}` };
    if (known.has(term) && !db.me.skills.no_evidence.includes(term)) {
      const where = db.repos.filter((r) => r.stack?.includes(term)).map((r) => r.name);
      return { term, status: "backed" as const, evidence: where.length ? `Used in ${where.join(", ")}` : "Listed in your stack", node: `tech:${term}` };
    }
    return { term, status: "gap" as const, evidence: "No project or job shows this", node: null };
  });
  const backed = requirements.filter((r) => r.status === "backed").length;
  const gaps = requirements.filter((r) => r.status === "gap").length;
  const av = requirements.filter((r) => r.status === "avoid").length;
  return {
    score: requirements.length ? Math.round((backed / requirements.length) * 100) : 0, backed, gaps, avoid: av, requirements,
    note: requirements.length ? "Matched against your stack, skills and projects." : "No known technologies found in the text. Paste a full job post.",
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** One function per backend op. Unknown ops throw, like the real server did. */
export async function mockApi(op: string, a: Record<string, unknown> = {}): Promise<unknown> {
  await sleep(40); // a touch of latency so loading states are visible
  const s = (k: string) => String(a[k] ?? "");
  switch (op) {
    // ---- reads ----
    case "get": return clone(get(s("path")) ?? null);
    case "repos": return clone(db.repos);
    case "links": return clone(db.links);
    case "log": return clone(db.log.slice(0, Number(a.limit ?? 50)));
    case "brief": return brief();
    case "search": { const q = s("q").toLowerCase(); return facts().filter((f) => f.toLowerCase().includes(q)); }
    case "graph_export": return graph();
    case "graph_explain": return explain(s("node"));
    case "ask": {
      const q = s("q").toLowerCase();
      const g = graph();
      const seeds = g.nodes.filter((n) => q.split(/\W+/).some((w) => w.length > 2 && n.label.toLowerCase().includes(w))).map((n) => n.id).slice(0, 5);
      const neighbors = [...new Set(g.edges.filter((e) => seeds.includes(e.a) || seeds.includes(e.b)).map((e) => (seeds.includes(e.a) ? e.b : e.a)))].slice(0, 12);
      return { mode: "graph", seeds, neighbors, text: seeds.length ? `Found ${seeds.length} matching nodes and ${neighbors.length} related ones.` : "Nothing in the profile matches that yet." };
    }
    case "match_job": return matchJob(s("text"));
    case "usage": return clone(seed.usage);
    case "storage": {
      const by_kind: Record<string, { files: number; bytes: number }> = {};
      db.files.forEach((f) => { by_kind[f.kind] ??= { files: 0, bytes: 0 }; by_kind[f.kind].files++; by_kind[f.kind].bytes += f.size; });
      return { files: db.files.length, bytes: db.files.reduce((n, f) => n + f.size, 0), by_kind, duplicates: [] };
    }
    case "files": return clone(db.files.filter((f) => (!a.kind || f.kind === a.kind) && (!a.ref || f.links.some((l) => l.type === a.ref_type && l.ref === a.ref))));
    case "commits": return { fetched: now() - 3600, nodes: clone((db.commits[s("repo")] ?? []).slice(0, Number(a.limit ?? 100))) };
    case "feed": return Object.values(db.commits).flat().sort((x, y) => Date.parse(y.date) - Date.parse(x.date));
    case "commits_all": return { repos: Object.keys(db.commits).length, failed: [] };
    case "commit_detail": {
      const c = (db.commits[s("repo")] ?? []).find((x) => x.sha === s("sha"));
      const add = c?.add ?? 10, dl = c?.del ?? 2;
      return {
        message: c?.msg ?? "", url: `${repoBy(s("repo"))?.url ?? ""}/commit/${s("sha")}`, stats: { additions: add, deletions: dl, total: add + dl },
        files: [
          { name: "src/app/page.tsx", status: "modified", add: Math.ceil(add * 0.6), del: Math.ceil(dl * 0.5) },
          { name: "src/lib/data.ts", status: "modified", add: Math.floor(add * 0.3), del: Math.floor(dl * 0.5) },
          { name: "README.md", status: "modified", add: Math.floor(add * 0.1), del: 0 },
        ],
      };
    }
    case "project_extras": return { fetched: now(), issues: 7, prs: 2, release: { tag: "v1.4.0", date: seed.daysAgo(12), url: "https://github.com/example/releases" }, ci: [{ ok: true, at: seed.daysAgo(1) }, { ok: true, at: seed.daysAgo(2) }, { ok: false, at: seed.daysAgo(3) }] };
    case "link_history": return [0.2, 1, 2, 3, 5, 8].map((d, i) => ({ at: Math.floor((Date.now() - d * 864e5) / 1000), status: i === 3 ? "down" : (db.links[s("url")]?.status ?? "ok"), code: i === 3 ? 503 : (db.links[s("url")]?.code ?? 200), ms: 90 + i * 37 }));
    case "github_status": return { installed: true, logged_in: true, login: "example", name: db.me.identity.name, avatar: "/files/avatar.svg", bio: db.me.identity.headline, location: db.me.identity.location, company: "Northwind Labs", blog: "https://example.com", followers: 214, following: 51, public_repos: db.repos.filter((r) => !r.private && r.url).length, repos: db.repos.length, url: "https://github.com/example", since: "2016-04-02", synced: db.synced };
    case "mcp_status": return { server: { name: "hq", version: "0.1.0", command: "hq", args: ["mcp"], url: "http://localhost/mcp", responding: true, data: "(dummy data)" }, claude: { installed: true, registered: true, scope: "user", status: "connected" }, tools: clone(seed.mcpTools) };
    case "update_check": return { current: "0.1.0", latest: "0.1.0", newer: false, url: "", notes: null };

    // ---- writes ----
    case "set": snapshot(); set(s("path"), a.value); record(`set ${s("path")}`); return "Saved";
    case "append": snapshot(); append(s("path"), a.value); record(`append ${s("path")}`); return "Added";
    case "del": snapshot(); del(s("path")); record(`del ${s("path")}`); return "Removed";
    case "set_identity": snapshot(); Object.assign(db.me.identity, a); record(`set me/identity/${Object.keys(a)[0]}`); return "Saved";
    case "set_answer": snapshot(); db.me.answers[s("key")] = a.value; record(`set me/answers/${s("key")}`); return "Saved";
    case "set_avatar": db.me.identity.avatar = s("id"); return "Profile picture set";
    case "pin": { const r = repoBy(s("repo")); if (r) r.pinned = !!a.on; record(`pin ${s("repo")}`); return r?.pinned ? "Pinned" : "Unpinned"; }
    case "update_project": { snapshot(); const { name, ...rest } = a; const r = repoBy(String(name)); if (r) Object.assign(r, rest); return "Saved"; }
    case "undo": {
      const prev = history.pop();
      if (!prev) throw new Error("Nothing to undo");
      const p = JSON.parse(prev) as { me: Me; repos: Repo[] };
      db.me = p.me; db.repos = p.repos; record("undo"); return "Undone";
    }
    case "sync": db.synced = now(); record("sync"); return "Synced 9 repos (dummy)";
    case "check_links":
      Object.values(db.links).forEach((l) => { l.checked = new Date().toISOString(); });
      record("check_links"); return "Checked links";
    case "check_link": { const u = s("url"); db.links[u] = { code: 200, status: "ok", ms: 100 + Math.floor(Math.random() * 200), checked: new Date().toISOString() }; return "Checked"; }
    case "file_update": {
      const f = db.files.find((x) => x.id === s("id"));
      if (!f) throw new Error("No such file");
      if (a.current) db.files.forEach((x) => { if (x.kind === f.kind) x.current = x.id === f.id; });
      if (a.label !== undefined) f.label = s("label");
      if (a.note !== undefined) f.note = s("note");
      if (a.link) f.links.push(a.link as FileEntry["links"][number]);
      if (a.unlink) { const u = a.unlink as FileEntry["links"][number]; f.links = f.links.filter((l) => !(l.type === u.type && l.ref === u.ref)); }
      return "Saved";
    }
    case "file_delete": db.files = db.files.filter((f) => f.id !== s("id")); return "Deleted";
    case "capture_screenshot": throw new Error("Screenshots need a backend (not available with dummy data)");

    // ---- desktop / agent hooks that only make sense with the real app ----
    case "open_url": window.open(s("url"), "_blank", "noopener,noreferrer"); return "Opened";
    case "setup_agent": return { connected: true, lines: ["Dummy mode: nothing was installed."], mcp_url: "http://localhost/mcp", command: "hq" };
    case "github_connect": return { connected: true, installed: true, logged_in: true, login: "example", sync: "9 repos", stack: "11 technologies" };
  }
  throw new Error(`unknown op ${op}`);
}

/** Stand-in for uploads: keeps the file in memory as a blob URL. */
export async function mockUpload(file: File, opts: { kind: FileEntry["kind"]; link?: FileEntry["links"][number]; label?: string; note?: string }): Promise<FileEntry> {
  const entry: FileEntry = {
    id: URL.createObjectURL(file), name: file.name, ext: file.name.split(".").pop()?.toLowerCase() ?? "", mime: file.type, size: file.size,
    kind: opts.kind, added: now(), label: opts.label, note: opts.note, links: opts.link ? [opts.link] : [],
  };
  if (opts.kind === "resume") { db.files.forEach((f) => { if (f.kind === "resume") f.current = false; }); entry.current = true; }
  if (opts.kind === "avatar") db.me.identity.avatar = entry.id;
  db.files.unshift(entry);
  record(`Added ${file.name}`, "file");
  return entry;
}

