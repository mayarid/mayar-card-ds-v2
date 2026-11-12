# Mayar Card Design System v2

A gallery of the Mayar Card v2 design system: foundations, components, every variant and state, and the code for each one.

**Live:** https://mayarid.github.io/mayar-card-ds-v2/

- **Foundations** — colour, typography, radius, elevation, motion, icons, chart palette, layout.
- **Components** — React 19 + TypeScript, styled with Tailwind v4, behaviour from [Base UI](https://base-ui.com).
- **Every state** — each component page has a live playground and a variant × state grid. Hover, pressed, focus and open are forced, so you see them all at once, as on the Wonder boards.
- **Copy the code** — copy a usage snippet from any cell or example, the full source from the Source tab, or install with the shadcn CLI.

## Use a component in your app

```bash
# once: the theme (tokens, state variants, utilities) and cn()
npx shadcn@latest add https://mayarid.github.io/mayar-card-ds-v2/r/theme.json

# then any component
npx shadcn@latest add https://mayarid.github.io/mayar-card-ds-v2/r/button.json
```

Import the theme after Tailwind:

```css
@import "tailwindcss";
@import "./styles/mayar-theme.css";
```

See the Installation page for fonts and manual setup.

## Sources of truth

1. The Wonder file **Mayar Card Dashboard**, page **Design System** — tokens and specimens.
2. The shipped Mayar Card app — for what Wonder does not specify yet (motion, z-index, elevation composites, some variants and components). The gallery marks these **code-only**.

Where the two differ, Wonder wins, and the component page lists the difference under "Wonder vs code".

Light theme only.

## Develop

```bash
pnpm install
pnpm dev          # gallery at http://localhost:5173/mayar-card-ds-v2/
pnpm check        # typecheck + lint + test
pnpm build        # registry + production build into dist/
```

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before you add a component.

## Deploy

Every push to `main` runs typecheck, lint, tests and build, then deploys `dist/` to GitHub Pages.

## Fonts

Paper Mono: SIL Open Font License 1.1 (`public/fonts/paper-mono/OFL.txt`).
