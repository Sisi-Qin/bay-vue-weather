# Migration Gotchas Checklist

Real failures observed migrating Lovable apps into C3. Each one silently breaks the build or breaks
provisioning from the pushed branch. **Walk this list before declaring the migration done.** For each:
what goes wrong, how to detect it, how to fix it.

---

## 1. `.gitignore` swallows `ui/react/src/lib/utils.ts` (HIGH IMPACT)

**Symptom:** After provisioning a new C3 app from the migrated branch, the frontend build fails —
dozens of `components/ui/*` files import `cn` from `@/lib/utils`, but the file is absent. An agent
"fixes" it by recreating `utils.ts` by hand. It works, but the fix doesn't persist to the branch.

**Root cause:** The template's root `.gitignore` has Python build-artifact patterns `lib/` and `lib64/`
written **unanchored**. A bare `lib/` matches **any** directory named `lib` at any depth — including
`ui/react/src/lib/` — so `utils.ts` (the shadcn `cn` helper: `twMerge(clsx(...))`) is never committed.

**Detect:**
```bash
git check-ignore -v <pkg>/ui/react/src/lib/utils.ts
# If it prints a matching .gitignore line, the file is being ignored.
```
Also confirm the file exists on disk (`ls <pkg>/ui/react/src/lib/utils.ts`) but is NOT in the commit
(`git ls-tree -r --name-only HEAD | grep lib/utils.ts`).

**Fix:** Anchor the Python patterns to the repo root so they only match top-level build output:
```
# in root .gitignore, change:
lib/            ->  /lib/
lib64/          ->  /lib64/
```
Then force-add and commit the file:
```bash
git add .gitignore
git add <pkg>/ui/react/src/lib/utils.ts   # now un-ignored; use -f only if the rule can't be changed
```
Verify `git check-ignore -v <pkg>/ui/react/src/lib/utils.ts` prints nothing and `git check-ignore -v
lib/foo.py` still matches `/lib/` (root Python output still ignored).

> Generalize: after staging, run `git status --ignored --porcelain | grep 'src/'` to catch ANY required
> source file an over-broad ignore rule is hiding (not just `utils.ts`).

---

## 2. Un-built frontend on fresh provision (EXPECTED — not a bug)

**Symptom:** On a freshly provisioned app, `ui/content/<pkg>/index.html` is missing and the UI won't
serve until a build runs.

**Root cause:** `ui/content/<pkg>/` is the **compiled output** of `npm run build` and is intentionally
git-ignored (`<pkg>/ui/.gitignore` has a `content` rule). Build artifacts are never committed. In the
C3 Code workspace the dev server builds automatically; on a brand-new provision from a repo branch, the
frontend must be built once.

**Fix / expectation:** This is normal for **every** C3 app, not a migration defect. Run
`VITE_C3_PKG=<pkg> npm run build` once. Do not try to commit `ui/content/`. Mention to the user that a
one-time build is the expected final step.

---

## 3. `npm run build` fails with "VITE_C3_PKG is not set"

**Symptom:** `error during build: Error: VITE_C3_PKG is not set` from `vite.config.mts`.

**Root cause:** The build reads `VITE_C3_PKG` (the package name). The C3 Code harness injects it, but a
plain shell you spawn for validation does not have it.

**Fix:** Prefix the command: `VITE_C3_PKG=<pkg> npm run build`. Do not create/edit `.env` files to set
it.

---

## 4. Source uses custom CSS variables / a bespoke palette

**Symptom:** Ported components reference colors like `var(--marine)`, `bg-mist`, `text-slateblue`, or
Tailwind classes like `bg-page`, `text-brand` that render as unstyled/black because they don't exist in
the C3 theme.

**Root cause:** Lovable apps ship their own design tokens. The C3 template exposes a fixed set of
design-system tokens only.

**Fix:** Translate to C3 tokens — see `style-token-map.md`. Verify class names against
`ui/react/src/tailwind/c3TailwindTheme.css` before using them; only tokens defined there exist. For
chart stroke/fill where no token fits, hardcoded hex is acceptable.

---

## 5. Hardcoded data left behind after wiring

**Symptom:** UI still renders from a TS data file (e.g. `src/lib/weather-data.ts`,
`src/data/mockData.ts`) instead of the backend; or a broken fetch silently falls back to mock data.

**Root cause:** Migration ported the source's inline dataset as a temporary placeholder and never
removed it after wiring `c3Action`.

**Fix:** After wire-up, delete every mock/hardcoded data file and inline array. There is no fallback —
a failed `c3Action` must surface as a visible UI error. Confirm with `grep` that no page imports a local
data module.

---

## 6. `runJsCode` "invalid return" when verifying fetch

**Symptom:** `SyntaxError: invalid return` when running a quick `WeatherReading.fetch(...)` check.

**Root cause:** The snippet is evaluated in a context where a top-level `return` is illegal.

**Fix:** End the snippet with an expression instead of `return`:
```js
var res = MyType.fetch({ limit: 3, include: 'this' });
res.count + ' :: ' + JSON.stringify(res.objs);
```

---

## 7. Missing `.c3pkg.json` on the target branch (blocks provisioning entirely)

**Symptom:** Creating a C3 application from the repo fails because no package is detected.

**Root cause:** The source repo's `main` (the original standalone app) has no `<pkg>.c3pkg.json`. Only
the C3-scaffolded branch does.

**Detect:**
```bash
git ls-tree -r --name-only origin/<branch> | grep c3pkg.json
```

**Fix:** Ensure the migrated package — including `<pkg>/<pkg>.c3pkg.json` — is committed to the branch
you push. Verify it (and `utils.ts`) are present on the **remote** branch after pushing. See
`git-branch-strategy.md`.

---

## 8. FetchSpec shape errors (500s from `c3Action`)

**Symptom:** `c3Action(..., 'fetch', ...)` returns 500 and the page shows an error / no data.

**Root cause / fix:**
- Do NOT wrap the spec: pass the FetchSpec as the 3rd arg directly, not `{ spec: {...} }`.
- Use **flat dot-notation** in `include` (`'this, ref.id, ref.name'`), never parenthetical
  `ref.(id,name)`.
- Always bound with `limit` (unbounded fetch can freeze the preview).
