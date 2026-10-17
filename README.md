# profile-ui

A dashboard UI as a standalone Next.js app. Everything runs on dummy data; there is no backend.
The display name lives in `lib/brand.ts`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, shadcn/ui on Base UI, Recharts, Motion, lucide icons.

## How data flows

```
components/*  ──▶  api(op, args)  in lib/hq.ts  ──▶  mockApi()  in lib/mock/api.ts  ──▶  lib/mock/data.ts
```

- **`lib/mock/data.ts`**: all dummy content (person, jobs, education, skills, projects, links, files, commits, activity). Edit this to change what the UI shows.
- **`lib/mock/api.ts`**: answers each "op" the UI asks for (`get`, `repos`, `feed`, `graph_export`, `match_job`, …). Writes such as pin, edit or delete change an in-memory copy, so the UI behaves as if it's live until you refresh.
- **`lib/hq.ts`**: the shared types (`Me`, `Repo`, `Commit`, `FileEntry`, …) and the single `api()` function every component calls.
- **`public/files/`**: dummy avatar, screenshots and resume PDFs. A file `id` such as `resume-2026.pdf` is served from `/files/resume-2026.pdf`.

## Plugging in a real backend

You only need to change one function. Replace the body of `api()` in `lib/hq.ts`:

```ts
export async function api<T = unknown>(op: string, args: object = {}): Promise<T> {
  const r = await fetch(`/api/${op}`, { method: "POST", body: JSON.stringify(args) });
  return (await r.json()) as T;
}
```

Then implement the ops your pages need. `lib/mock/api.ts` is the reference: each `case` shows the exact response shape a component expects. Uploads go through `uploadFile()` in the same file.

## Reusing pieces in another project

| Folder | What's in it | Depends on |
| --- | --- | --- |
| `components/ui/` | shadcn/ui primitives (button, card, dialog, table, select, command, tooltip, …) | `lib/utils.ts`, Tailwind tokens in `app/globals.css` |
| `components/kit/` | Generic building blocks: data table, activity heatmap, commit graph, career timeline, tech badges, status icons | `components/ui`, a few types from `lib/hq.ts` |
| `components/evilcharts/` | Styled Recharts wrappers (bar, pie, tooltip, legend, brush) | `recharts` |
| `components/shell/` | App frame: top bar, sidebar, tab bar, ⌘K search, right-hand inspector | `components/ui`, `lib/selection.tsx` |
| `components/hq/` | The actual pages (home orbit, profile, projects, graph, commits, resume, files, integrations, …) | everything above + `api()` |
| `components/GradientASCII.jsx` | The animated ASCII/WebGL2 backdrop used in banners | nothing |

To copy pieces into another Next.js + Tailwind 4 app:

1. Copy `app/globals.css` (theme tokens and colors) and `lib/utils.ts`.
2. Copy the folders you want, keeping the `@/` import alias (`tsconfig.json` → `"paths": { "@/*": ["./*"] }`).
3. Install the matching dependencies from `package.json`.
4. For `components/hq/*` pages, also bring `lib/hq.ts` + `lib/mock/`, or point `api()` at your own data.

The app runs in dark mode by default (the `dark` class on `<html>` in `app/layout.tsx`).

## Notes

- Some actions belonged to the original desktop app: capturing screenshots, connecting GitHub and registering an MCP agent. With dummy data they either show a canned success or a clear error toast.
- License: MIT (see `LICENSE`). A third-party MIT notice is in `THIRD_PARTY_NOTICES.md` and must stay with the code.
