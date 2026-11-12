# Contributing

This repo is a React port of the Mayar Card v2 design system plus the gallery that documents it.

## Sources of truth

1. **The shipped Mayar Card app (v2 design)** — Svelte, `apps/frontend/src/lib/foundations/` and
   `src/lib/components/`. Its code is final. It sets every value, variant, state and copy.
2. **Wonder** — file "Mayar Card Dashboard", page "Design System" (and the Dashboard page for Patterns).
   The visual reference. Anything with no Wonder specimen is marked **code-only**.

When the two differ, **the code wins** (decision, 12 Nov 2026). Write the difference in the doc's `notes`.

## Layout

| Path | What |
| --- | --- |
| `src/registry/ui/<name>.tsx` | A component. This is the file people copy. One file per registry item. |
| `src/registry/ui/<name>.test.tsx` | Its tests. |
| `src/registry/lib/utils.ts` | `cn()`. |
| `src/registry/styles/theme.css` | Every token, the state variants and utilities. |
| `src/docs/components/<name>.tsx` | The gallery page data. Exports `doc: ComponentDoc`. Found automatically. |
| `src/docs/foundations/<name>.tsx` | A foundation page. Exports `doc: FoundationDoc`. Found automatically. |
| `src/examples/<name>/<example>.tsx` | One example. Default export. The gallery shows its source as the code. |
| `src/gallery/*` | Gallery shell. Not part of the design system. |

`registry.json` is generated from `src/registry` by `scripts/gen-registry.mjs`. Do not edit it.

## Component rules

- Registry files import only npm packages, `@/components/ui/*`, `@/lib/utils` and `@/hooks/*`. No relative imports.
- Style with Tailwind classes and the theme tokens only: `bg-primary`, `text-ink-2`, `rounded-lg`, `shadow-control`,
  `text-body-sm`. No hex values and no `var(--…)` where a utility exists.
- Variants with `cva`. Layers: `variant` → `size` → `className` → `render`.
- Interaction states use the theme variants, so the gallery can force them:
  `hover-fine:` (not `hover:`), `pressed:` (not `active:`), `focus-ring:outline-focus` (not `focus-visible:`), `opened:`.
- Behaviour comes from Base UI (`@base-ui/react/<part>`). Style its `data-*` attributes
  (`data-checked`, `data-disabled`, `data-starting-style`, …).
- Compound parts for multi-part UI (`Select`, `SelectTrigger`, `SelectContent`, …). Named exports, `data-slot` on each part.
- Spread the remaining props. Refs pass through (React 19 `ref` prop). Stateful parts support `value`/`defaultValue`.
- Icons go in `children` through `<Icon icon={…} />` (Hugeicons, stroke 1.5).
- Touch targets: at least 44×44 (`relative hit-44` when the visible box is smaller).
- Motion uses the `--motion-*` tokens, so reduced motion turns it off.
- A JSDoc block directly above the main component function. Its first sentence becomes the registry description.

## Doc rules

- `matrices`: rows × columns that show **every** variant and state on the Wonder page. Force interaction states
  with `force: 'hover' | 'pressed' | 'focus' | 'open'`. Mark anything not on the Wonder page with `codeOnly: true`.
- `playground`: controls for the main props, and a `code()` that returns the matching JSX (use `toJsx`).
- `examples`: real usage, written as a person would copy it. Indonesian product copy, as in the app.
- `notes`: every difference between Wonder and the app, and what this port does.

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```
