# Workspace Summary

> This is the **work-to-date** summary of this workspace. Read it first at the start of a chat to
> recall what has been done; update it as you make meaningful changes. Keep it concise — a map.

## Current state

Migrated the **Bay Area Weather Watch** dashboard (a Lovable app,
`github.com/Sisi-Qin/bay-vue-weather`) into a real C3 app. Single-page dashboard: title, 3 charts
(min temp, max temp, chance of rain over 30 days) + a daily readings table. All data comes from a
C3 entity type via `c3Action` — no hardcoded frontend data.

## Packages

- `pkgec62e67f` (main package) — the weather dashboard app.

## Backend types

- `src/WeatherReading.c3typ` — entity type (mixes Persistable). Fields: `date!` (string, "Feb 01"),
  `label` (string, chart x-axis), `weather!` (string; Fog/Cloud/Overcast/Clear/Rain/Drizzle),
  `minTemp!` (double °F), `maxTemp!` (double °F), `rainChance!` (double, 0–100 %). Built-in
  CRUD/fetch only; no custom methods.

## UI pages / routes

- `/` (nav item "Dashboard", already scaffolded) → `ui/react/src/pages/Dashboard/Dashboard.tsx`.
  Fetches `WeatherReading.fetch({ include: 'this', order: 'ascending(id)', limit: 100 })` via
  `c3Action`, computes Mean Hi / Mean Lo / Rain Days, renders 3 charts + table. Loading skeletons +
  `useErrorBoundary` error handling; cancel-on-unmount.
- `ui/react/src/components/WeatherChartCard/WeatherChartCard.tsx` — Recharts Area/Bar chart card
  (variants: marine/amber/deep). Uses C3 design tokens (bg-card, border-weak, text-primary/secondary/accent).
- `WeatherReading` interface added to `ui/react/src/Interfaces.tsx`.

## Seed / data

- `data/WeatherReading/WeatherReading.json` — 30 days of readings (`seed_weatherreading_01..30`),
  upserted via `upsertSeedData`. Verified fetchable (count=30).

## Key decisions

- Ported the app's hardcoded `weather-data.ts` array into C3 `data/` (plain entity, no SeedData mixin).
- Original Lovable app used custom CSS color vars (--marine, --mist, etc.) + TanStack Router; replaced
  with C3 design-system Tailwind tokens and the existing react-router-dom `/` route.
- Chart colors hardcoded as hex (marine #2563eb, amber #d97706, deep #0f172a) since the C3 theme
  has no direct equivalents.
- Build validation requires `VITE_C3_PKG=pkgec62e67f` env var when running `npm run build` manually.
