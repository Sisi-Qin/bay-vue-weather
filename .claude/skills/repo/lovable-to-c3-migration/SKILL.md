---
name: lovable-to-c3-migration
description: |
  Migrate a Lovable (or other AI-scaffolded / standalone) React or Vue web app into a real C3 AI
  application inside a C3 Code workspace. Use this skill when:
  (1) the user says something like "migrate this app to C3", "migrate this Lovable app", "turn this
      repo into a C3 app", or provides a GitHub URL / source folder of a standalone frontend app and
      asks to bring it into C3;
  (2) the source is a Lovable / bolt.new / v0 / hand-written React or Vue project (hardcoded data,
      TanStack or React Router, Tailwind + shadcn) that must become a C3 app with entity types, seed
      data, and a c3Action-wired frontend;
  (3) the user wants the migrated result pushed back to their repo on a branch so they can provision a
      C3 application from repo + branch.
  Do NOT use for: building a brand-new C3 app from a text spec (use c3-frontend / c3-backend-code
  directly), upgrading an existing C3 package version (c3-code-pkg-upgrade), or pure data-file
  ingestion (c3-data-ingestion).
core: false
category: workflow
version: 1.0.0
---

# Lovable → C3 Application Migration

Turn a standalone Lovable/AI-scaffolded React or Vue app into a **real C3 AI application**: C3 entity
types in `src/`, seed data in `data/`, and a C3 React frontend that fetches via `c3Action` — then push
the result to a branch the user can provision from.

The **goal UX**: user provides a source (GitHub URL or folder) + the keyword ("migrate this app to
C3"), then the agent runs this playbook end-to-end and reports back. Build the full scope in one pass
(Mode A); state assumptions inline and keep going.

> This skill assumes you are already inside a C3 Code workspace whose package folder (the one holding
> `<pkg>.c3pkg.json`) is where the app must be built. **Do NOT create a new package** — build into the
> existing one. The package name (e.g. `pkgXXXXXXXX`) is fixed; do not rename it.

## Prerequisites — read first

Before doing anything, follow the standard C3 workflow orientation:

1. Read `<pkg>/resource/WORKSPACE_SUMMARY.md` and `TEMPLATE_SUMMARY.md`.
2. Invoke `Skill({ skill: "c3-frontend" })` before any React change and
   `Skill({ skill: "c3-backend-code" })` before writing implementations.
3. If loading data from a provided file/source, use `Skill({ skill: "c3-data-ingestion" })`.

This skill orchestrates those; it does not replace them.

## The migration pipeline (run in order)

### 1. Acquire and study the source
- Clone the repo to a scratch dir (e.g. `/tmp/<name>`) with `--depth 1`, or read the provided folder.
- Read the source's `README.md` — Lovable apps often embed the original product spec there.
- Identify the **domain entities** (the nouns behind the data): every hardcoded array / TS data file /
  inline dataset becomes a **C3 entity type**. This is the core rule — a React app with hardcoded data
  is NOT a C3 app.
- Note the source stack so you know what to translate: router (TanStack/React Router → the template's
  `react-router-dom` `<Routes>`), styling (custom CSS vars → C3 design tokens), charts (usually
  Recharts, which the template already has), UI kit (usually shadcn — the template ships equivalents).

### 2. Model the backend (C3 types)
- For each domain entity, create `<pkg>/src/<TypeName>.c3typ` using the C3 MCP tool
  `generate_new_c3_type_from_description`, then write the file with fleshed-out comments (`!` for
  required fields, `{@link}` cross-refs). Default to an `entity type` mixing `Persistable`.
- Only add custom methods if the UI needs computed/aggregated data beyond built-in `fetch`/CRUD.
- Smoke-test each custom method with `runJsCode` (App MCP). Built-in `fetch` needs no test.

### 3. Load the data
- **Authored sample rows** ported from the source's hardcoded data → plain `data/<TypeName>/<TypeName>.json`
  (subfolder required). Each object needs an `id` + all required fields; **never** include `meta`.
- **A real file/DB/feed the user provided** → use the `c3-data-ingestion` skill instead.
- Run the App MCP `upsertSeedData` tool (no args) after writing/updating any seed or data file.
- Verify: `runJsCode` → `<Type>.fetch({ limit: 3, include: 'this' })` returns the rows. (Note: bare
  `return` at top level in `runJsCode` throws `SyntaxError: invalid return` — end with an expression,
  e.g. `res.count + ' ' + JSON.stringify(...)`.)

### 4. Port the frontend into the C3 React app (`<pkg>/ui/react/`)
- Rebuild pages under `src/pages/<PageName>/` and shared components under `src/components/`. Copy from
  `<pkg>/ui/react/resources/examples/` where possible; do not reinvent chrome.
- Add TS interfaces for each entity to `src/Interfaces.tsx`.
- Register every page as a `<Route>` in `src/App.tsx` and (top-level pages only) a nav item in
  `src/config/navigation.ts`. The template usually ships a `/` Dashboard route already — reuse it.
- Translate styling to C3 design tokens — see `references/style-token-map.md`. Do NOT invent Tailwind
  classes; only the tokens listed in the theme exist.
- Wire data with `c3Action('<Type>', 'fetch', { include: 'this', limit: N, order: ... })`. Pass the
  FetchSpec **directly** (no `{ spec: ... }` wrapper); use **flat dot-notation** in `include`. `fetch`
  returns `{ objs, count }`; custom methods return their value directly (no wrapper).
- Loading + error states: use `useErrorBoundary().reportError` in catch blocks; cancel async on unmount;
  always bound `fetch` with `limit`.
- **Delete all hardcoded/mock data files** once wiring is in place. There is no fallback after wire-up.

### 5. Verify (Tier 1 — always)
- Run `npm run build` in `<pkg>/ui/react`. It runs lint → tsc → vite build. **It requires the
  `VITE_C3_PKG` env var** (the package name), which the harness normally injects but is absent in a raw
  shell — run `VITE_C3_PKG=<pkg> npm run build`. Fix all lint/type errors (no unused imports, no `any`,
  escape JSX entities).
- Confirm the running UI fetches real data: navigate the preview at `http://localhost:9000` with the
  Playwright MCP (or replay each `c3Action` fetch via `runJsCode`). Rendered values must match seeded
  records, not placeholders.
- Check `<pkg>/gen/cache/Pkg.Issue/` for **critical** issues and fix them.

### 6. Guard against the known migration traps
**Run through `references/gotchas-checklist.md` before declaring done.** These are real failures
observed in past migrations that silently break provisioning from the pushed branch. The highest-impact
one: an over-broad `.gitignore` rule swallowing `ui/react/src/lib/utils.ts`.

### 7. Push to a branch the user can provision from
- The source repo's `main` is the original standalone app and has **no `.c3pkg.json`** — that's why a
  C3 app can't be created from it. The migrated C3 package (including `<pkg>.c3pkg.json`) must land on a
  dedicated branch.
- See `references/git-branch-strategy.md` for the exact flow (create branch, stage only package files —
  not screenshots/scratch — commit, push, verify `.c3pkg.json` + `utils.ts` present on the remote).
- Do NOT touch `main` or open a PR unless the user asks. Report the branch name so they can provision
  from repo + branch.

## Definition of done
- [ ] C3 entity type(s) in `src/` for every domain entity the UI shows
- [ ] Seed/data upserted and `fetch`-verified
- [ ] Frontend fetches via `c3Action`; no mock/hardcoded data files remain
- [ ] `npm run build` (with `VITE_C3_PKG`) passes clean
- [ ] UI renders real backend data at runtime (screenshot or fetch replay)
- [ ] No critical `Pkg.Issue`
- [ ] Gotchas checklist passed — especially `utils.ts` is git-tracked and `.c3pkg.json` is on the branch
- [ ] Migrated package pushed to a dedicated branch; branch name reported to the user

## References
- `references/gotchas-checklist.md` — the specific traps + how to detect/fix each.
- `references/style-token-map.md` — mapping source CSS/Tailwind → C3 design tokens.
- `references/git-branch-strategy.md` — branch/commit/push flow and what to stage vs. exclude.
