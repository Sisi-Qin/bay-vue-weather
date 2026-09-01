# Git Branch Strategy for Migration Handoff

The user's end goal: create a C3 application from **repo + branch**. That only works if the branch
contains a valid C3 package (`<pkg>.c3pkg.json` at the package root) plus all required source files.

## Why `main` can't be used
The source repo's `main` is the original standalone app (Vue/React, hardcoded data, **no `.c3pkg.json`**).
C3 cannot detect a package there. The C3 scaffold + migrated app must live on a **separate branch**.

## Where the C3 scaffold comes from
In a C3 Code workspace connected to the repo, the workspace's initial commit already contains the full
C3 package scaffold (`<pkg>/<pkg>.c3pkg.json`, `ui/react/`, `resource/`, example resources). Your
migration work (`src/`, `data/`, UI edits) sits on top of it. So the branch you push already has the
scaffold — you're committing the migration delta.

## Flow
```bash
# 1. From the workspace branch, cut a clean, well-named branch
git checkout -b c3-migration          # or a name the user prefers

# 2. Stage ONLY package + skill files. Exclude scratch artifacts.
git add <pkg>/src <pkg>/data \
        <pkg>/ui/react/src/...        # the pages/components/interfaces you changed
git add .gitignore                    # if you fixed the lib/ ignore trap (gotcha #1)
#   Do NOT add: screenshots (*.png), /tmp clones, .cursor* files, build output (ui/content)

# 3. Commit with a clear message (end with the Co-Authored-By trailer per repo convention)
git commit -F - <<'MSG'
Migrate <app> to a C3 AI application
...
MSG

# 4. Push and set upstream
git push -u origin c3-migration
```

## Post-push verification (do not skip)
```bash
git ls-tree -r --name-only origin/c3-migration | grep c3pkg.json                 # must print the manifest
git ls-tree -r --name-only origin/c3-migration | grep 'ui/react/src/lib/utils.ts' # must print (gotcha #1)
git ls-tree -r --name-only origin/c3-migration | grep -E 'src/.*\.c3typ'          # entity types present
```
Report the branch name to the user and remind them: provisioning a fresh app will still need a one-time
frontend build (expected — gotcha #2).

## Do NOT, unless asked
- Merge into `main` or force-push `main`.
- Open a PR (offer it; don't do it unprompted).
- Rename the package or edit its name in `.c3pkg.json`.
