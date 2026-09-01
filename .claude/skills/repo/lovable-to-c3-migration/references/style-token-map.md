# Style Token Mapping: Source App → C3 Design System

Lovable/AI-scaffolded apps ship their own color palette (custom CSS variables and Tailwind classes). The
C3 React template exposes a **fixed** set of design-system tokens. Translate as you port; do not invent
classes.

## Rule
Before using any Tailwind color/utility class, confirm it exists in
`ui/react/src/tailwind/c3TailwindTheme.css`. Only tokens defined there resolve. Common valid families:

| Purpose        | Valid C3 Tailwind classes                                              |
| -------------- | ---------------------------------------------------------------------- |
| Text           | `text-primary`, `text-secondary`, `text-accent`, `text-danger`, `text-success`, `text-warning`, `text-inverse` |
| Background     | `bg-primary`, `bg-secondary`, `bg-tertiary`, `bg-card`, `bg-accent`, `bg-menu`, `bg-hover`, `bg-selected` |
| Border         | `border-weak`, `border-strong`, `border-accent`, `border-danger`, `border-success`, `border-warning` |
| Card container | `c3-card` (composite card style)                                       |

Underlying CSS variables (usable in inline `style`/chart props with a fallback):
`--color-bg-card`, `--color-border-weak`, `--color-text-primary`, `--color-text-secondary`, etc.

## Typical translations (from the bay-vue-weather migration)

| Source (Lovable) class / var        | C3 replacement                          |
| ----------------------------------- | --------------------------------------- |
| `bg-page`, `bg-mist`                | `bg-primary`                            |
| `bg-panel`, `bg-fog`                | `bg-card`                               |
| `text-deep`                         | `text-primary`                          |
| `text-slateblue`                    | `text-secondary`                        |
| `text-brand`, `bg-brand`            | `text-accent`, `bg-accent`              |
| `text-marine` (accent)              | `text-accent`                           |
| high-rain / alert red               | `text-danger`                           |
| `ring-1 ring-deep/5`, `border-haze` | `border border-weak`                    |
| custom `var(--marine/amber/deep)` chart colors | keep as hardcoded hex (no token equivalent), e.g. `#2563eb`, `#d97706`, `#0f172a` |
| `font-mono` decorative              | drop, or keep only if intentional       |

## Charts (Recharts)
- The template already includes `recharts`. Wrap in `<ResponsiveContainer>`.
- For axis/tooltip styling, reference C3 CSS vars with hex fallbacks so it works in light/dark:
  ```ts
  const axis = {
    stroke: 'var(--color-border-weak, #cbd5e1)',
    tick: { fill: 'var(--color-text-secondary, #64748b)', fontSize: 10 },
    tickLine: false,
  };
  ```
- Series colors: pick fixed hexes or a small variant map; the C3 theme has no per-series chart palette.

## Icons
- Source apps often use `lucide-react` — the template's standard icon library. Keep those imports.
- If the source used FontAwesome Pro and `npm install` 401/403s, invoke the `c3-fontawesome-migration`
  skill.
