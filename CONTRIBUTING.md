# Contributing

This repo is a React port of the Mayar Card v2 design system plus the gallery that documents it.

## Sources of truth

1. **The shipped Mayar Card app (v2 design)** — Svelte, `apps/frontend/src/lib/foundations/` and
   `src/lib/components/`. Its code is final. It sets every value, variant, state and copy.
2. **Wonder** — file "Mayar Card Dashboard", page "Design System" (and the Dashboard page for Patterns).
   The visual reference. Anything with no Wonder specimen is marked **code-only**.

When the two differ, **the code wins** (decision, 12 Nov 2026). Write the difference in the doc's `notes`.
The gallery does not show it. See [Gallery copy and provenance](#gallery-copy-and-provenance).

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
- `notes`: every difference between Wonder and the app, and what this port does. Contributor data: the gallery does not render it.

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## Gallery copy and provenance

The public gallery does not show where a part comes from. There are no Wonder, code-only or Base UI badges in the
page chrome, and no "Wonder vs code" section. Provenance is contributor information. It lives here and in the doc data.

### Where the data lives

| Field | File | What it records |
| --- | --- | --- |
| `spec: 'wonder' \| 'code-only'` | `src/docs/components/<name>.tsx` | `wonder`: the part has a specimen on the Wonder Design System page. `code-only`: it comes from the shipped app only. |
| `wonderRef` | same | Where the specimen lives in Wonder. |
| `baseUi` | same | The Base UI part under the component. The gallery shows it as one line in the Source section. |
| `notes` | same | Every difference between Wonder and the app, and what this port does. |
| `codeOnly: true` | `examples`, matrix rows and columns, colour tokens | A variant, state, example or token that is not on the Wonder page. |

Keep filling these fields. Tests read `spec` from the manifest. The gallery does not render the other fields.

### Rules for public copy

- Write for a person who has never seen Wonder or the Mayar codebase.
- Plain English, short sentences, one idea in each sentence.
- Say what the part is and when to use it. Do not say where it came from.
- Product examples stay in Indonesian, as in the app.

### Foundations

- **Colors.** Wonder is the source for the semantic tokens. These tokens are code-only: `container`, `surface-strong`,
  `on-primary` (Wonder uses `on-brand`), `on-inverted`, `on-danger` and `info`.
- **Typography.** The usage rules come from the Wonder Typography Guide and the shipped app.
- **Radius.** The scale comes from Wonder. `rounded-btn` (Wonder `r-btn`, 12px) is in the theme for parity with Wonder. No
  component uses it.
- **Elevation.** Wonder has the shadow colours. Every shadow composite (`shadow-ring`, `shadow-control`, `shadow-raised`,
  and so on) is code-only: the shipped app combines them.
- **Motion.** Wonder has no motion tokens. Every duration, easing and keyframe is code-only, from the app's `motion.css`.
- **Layout.** Container (Wonder `container`, theme `max-w-layout`) and gutter (Wonder `gutter`) come from Wonder. The
  z-index scale is code-only.
- **Icons.** The Wonder icon library (Design System, Hugeicons) could not be listed for the Icons page. The page shows the
  full app set. Add any Wonder-only icons to `src/docs/foundations/_parts/app-icons.ts`.
- **Chart palette.** The rules come from the Wonder Chart Palette Guide and the shipped app. "Perjalanan" is the label in
  the Wonder frames; it is the same slot as "Perjalanan Dinas".

#### Radius names in Wonder

| Theme | Wonder |
| --- | --- |
| `rounded-sm` | `radius/sm` |
| `rounded-md` | `radius/md` |
| `rounded-lg` | `radius/lg` |
| `rounded-xl` | `radius/xl` |
| `rounded-2xl` | `radius/2xl` |
| `rounded-3xl` | `radius/3xl` |
| `rounded-card` | `r-card (alias radius/3xl)` |
| `rounded-media` | `r-media` |
| `rounded-panel` | `r-panel` |
| `rounded-pill` | `r-pill` |
| `rounded-btn` | `r-btn (alias radius/2xl)` |

#### Colour names in Wonder

Every other colour has the same name in Wonder and in the theme. "—" means the token is code-only.

| Theme | Wonder |
| --- | --- |
| `well` | `ui/well` |
| `switch-off` | `ui/switch-off` |
| `state-hover` | `state/hover` |
| `state-pressed` | `state/pressed` |
| `brand-blue` | `brand/blue` |
| `brand-pink` | `brand/pink` |
| `ghost-hover-bg` | `ui/ghost-hover-bg` |
| `ghost-hover-border` | `ui/ghost-hover-border` |
| `pink-light` | `ui/pink-light` |
| `pink-text` | `ui/pink-text` |
| `highlight-inset` | `highlight/inset` |
| `shadow-ring` | `shadow/ring` |
| `shadow-drop` | `shadow/drop` |
| `shadow-ambient` | `shadow/ambient` |
| `shadow-modal` | `shadow/modal` |
| `on-primary` | — (Wonder uses on-brand) |
| `on-inverted` | — |
| `on-danger` | — |
| `info` | — |
| `container` | — |
| `surface-strong` | — (= dark/surface) |

#### Wonder values that are not in the theme

Reference only. No class or variable exists for them. Source: Wonder file "Mayar Card Dashboard", tokens on page
`791e4d7e-317a-53f9-8677-071f1e90bae3`, read on 12 Nov 2026.

**Dark set (`dark/*`).** Not in use: the system ships a light theme only.

| Wonder token | Value | Note |
| --- | --- | --- |
| `dark/canvas` | `#0b0d12` |  |
| `dark/surface` | `#14171f` | Same value as code-only surface-strong. |
| `dark/raised` | `#1a1e27` |  |
| `dark/well` | `#20242e` |  |
| `dark/border` | `#252a34` |  |
| `dark/ink` | `#eceef3` |  |
| `dark/ink-2` | `#a8aebc` |  |
| `dark/muted` | `#868d9c` |  |
| `dark/primary` | `#8f9cf2` |  |
| `dark/primary-soft` | `#232a52` |  |

**Pattern tokens (phase 2).** Card skins, the card face, and the auth hero and story backgrounds.

| Wonder token | Value | Note |
| --- | --- | --- |
| `skin/royal-1` | `#3a4bf0` |  |
| `skin/royal-2` | `#1e2db0` |  |
| `skin/royal-3` | `#16208a` |  |
| `skin/midnight-1` | `#1f2235` |  |
| `skin/midnight-2` | `#0e0f1a` |  |
| `skin/midnight-3` | `#15162a` |  |
| `skin/emerald-1` | `#16b57a` |  |
| `skin/emerald-2` | `#0e8f5e` |  |
| `skin/emerald-3` | `#0a6e49` |  |
| `skin/gold-1` | `#e8c66b` |  |
| `skin/gold-2` | `#b8923e` |  |
| `skin/gold-3` | `#7e601f` |  |
| `skin/silver-1` | `#aeb4c2` |  |
| `skin/silver-2` | `#7a8092` |  |
| `skin/silver-3` | `#565c6e` |  |
| `skin/graphite-1` | `#4a4f63` |  |
| `skin/graphite-2` | `#2a2d3c` |  |
| `skin/graphite-3` | `#1d1f2b` |  |
| `skin/magenta-1` | `#f0568f` |  |
| `skin/magenta-2` | `#c9156a` |  |
| `skin/magenta-3` | `#9e1457` |  |
| `skin/chroma-1` | `#6a5cf0` |  |
| `skin/chroma-2` | `#c13be0` |  |
| `skin/chroma-3` | `#f0568f` |  |
| `skin/chroma-4` | `#22b5c9` |  |
| `skin/matrix-1` | `#0f3322` |  |
| `skin/matrix-2` | `#06160e` |  |
| `skin/matrix-3` | `#0a2e1e` |  |
| `card/chip-1` | `#f6dc9a` |  |
| `card/chip-2` | `#d8b65e` |  |
| `card/chip-3` | `#b8923e` | Alias of skin/gold-2. |
| `card/mc-red` | `#eb001b` |  |
| `card/mc-orange` | `#f79e1b` |  |
| `hero/g1` | `#f6f7fe` |  |
| `hero/g2` | `#eff0fd` | Auth page background, stop 2. |
| `hero/g3` | `#cfd3fa` | Auth page soft glow. |
| `hero/g4` | `#9c9cf0` |  |
| `hero/g5` | `#5b4fd6` |  |
| `hero/lead` | `#3e4556` |  |
| `story/g1` | `#f8f9fc` | Auth page background, stop 1. |
| `story/g2` | `#f3f4fb` |  |
| `story/g3` | `#eeeff9` | Auth page background, stop 3. |
| `story/g4` | `#eae9f6` |  |
| `story/g5` | `#e7e5f4` |  |
| `ui/demo-panel` | `#0e1220` | Dark demo panel behind specimens. |

Also in Wonder: `card/mono` (Wonder: JetBrains Mono; this system uses Paper Mono for all mono text).

### Components

Snapshot of the doc data on 13 Nov 2026. The doc files are the live source. If they differ, the doc files win.

#### Action Menu

- Source: code-only (shipped app, no Wonder specimen)
- Base UI: [Menu](https://base-ui.com/react/components/menu)
- Code-only variants and states: Trigger × states: Secondary; Trigger × states: Icon; Trigger × states: Icon ghost; Trigger × states: Default; Trigger × states: Hover; Trigger × states: Pressed; Trigger × states: Focus; Trigger × states: Open; Trigger × states: Disabled; Items × states: Label; Items × states: Icon + label; Items × states: Label + description; Items × states: Danger; Items × states: Default; Items × states: Hover; Items × states: Pressed; Items × states: Highlighted; Items × states: Disabled; Open menu (static): With icons; Open menu (static): Labels only; Open menu (static): Open
- Code-only examples: Row menu; Header menu; With descriptions
- Wonder vs code:
  - Code-only: no Action Menu specimen on the Wonder Design System page. The shipped app code is the source of truth (decision, 12 Nov 2026); every value comes from ActionMenu.svelte.
  - The app defaults the trigger label to "Aksi lain" and the menu width to 260px. Here the label is the trigger children (or its aria-label on the icon variants); the panel is 260px, and className sets another width.
  - The app takes an items array (label, icon, tone, separated, href). This port composes items as children: ActionMenuItem, ActionMenuLinkItem, ActionMenuSeparator, ActionMenuHeader.
  - Keyboard, focus and outside press come from Base UI Menu. Base UI highlights items (data-highlighted) and keeps focus on the menu, where the app moves DOM focus to each item; the paint is the same.
  - The app positions a fixed menu by hand and closes it on scroll. Base UI positions it with Floating UI (flip, shift) and keeps it open on scroll.
  - z-index: --z-dropdown (40) in every case. The app uses --z-sticky for its in-flow (absolute) menu, which a portal does not need.
  - The app menu enters with its own keyframe (opacity + scale --motion-dropdown-pre-scale 0.97) at --motion-quick. The theme menu-in is the same keyframe; this port sets its duration to --motion-quick.
  - The app rail menu (side="right") sits 12px from the trigger with the bottom edges aligned. Here: side="right" align="end" sideOffset={12}.

#### Animated Number

- Source: code-only (shipped app, no Wonder specimen)
- Code-only variants and states: Format × state: Rupiah; Format × state: Plain; Format × state: Percent
- Code-only examples: Balance after a top-up; Hidden balance; Period switch
- Wonder vs code:
  - Code-only: Animated Number has no specimen on the Wonder Design System page. Behaviour comes from AnimatedNumber.svelte; the app code is final (decision, 12 Nov 2026).
  - Same as the app: NumberFlow (@number-flow/react) rolls each changed digit, with transform and spin timing 350ms and opacity 150ms on the smooth-out curve. Where NumberFlow cannot animate, the same text renders in a plain span.
  - Digits use tabular-nums on the inherited font, as in the app (no monospace font).
  - Screen readers get the final value once (an sr-only copy), and the moving text is aria-hidden. Under reduced motion the value snaps.

#### Avatar

- Source: code-only (shipped app, no Wonder specimen)
- Base UI: [Avatar](https://base-ui.com/react/components/avatar)
- Code-only variants and states: Sizes × tones: 24; Sizes × tones: 28; Sizes × tones: 32; Sizes × tones: 36; Sizes × tones: 40; Sizes × tones: 48; Sizes × tones: 56; Fallback content (32): Primary; Fallback content (32): Tint; Fallback content (32): Neutral
- Code-only examples: With a name; With an image; Member list
- Wonder vs code:
  - Code-only: Avatar has no specimen on the Wonder Design System page. The Dashboard page uses avatars in "Tim"; values come from Avatar.svelte.
  - The app avatar is initials only. This port adds AvatarImage through Base UI Avatar; the initials stay as the fallback.
  - The app takes name and email props on the avatar; here they go to AvatarFallback as one name prop (pass name || email).

#### Badge

- Source: Wonder spec
- Wonder: Mayar Card Design System › Badge
- Base UI: [useRender](https://base-ui.com/react/utils/use-render)
- Code-only variants and states: Variants × sizes: Well; Shapes and icon (MD): Well
- Wonder vs code:
  - The shipped app code is final (decision, 12 Nov 2026). Every value here comes from the app Badge.svelte; Wonder is the visual reference.
  - well is code-only: the console "Belum" (not started) chip. Wonder does not show it.
  - The app has an icon prop (12px, or 14px for the review status chip). This port takes the icon in children; the start padding shrinks by 2px when the first child is an svg. For the 14px chip, add className="[&_svg]:size-3.5".

#### Balance Card

- Source: Wonder spec
- Wonder: Dashboard › Balance Card Tab Saldo Akun v2, Balance Card Hidden v2, Balance Card Error v2
- Base UI: [Toggle](https://base-ui.com/react/components/toggle)
- Code-only variants and states: Variants × states: card; Variants × states: strip; Variants × states: Loading; Tile interaction states: Hover; Tile interaction states: Pressed; Tile interaction states: Focus; Captions: text; Captions: delta-neutral; Captions: low
- Code-only examples: With actions; Top-up strip; Low balance; Loading
- Wonder vs code:
  - The shipped app code is the source of truth (decision 2026-11-12). Wonder is the visual reference only.
  - Value and caption: the app keeps the 12px tile gap between the value and the caption or delta row; the chip and its period ("vs 30 hari lalu") sit 6px apart. Wonder pulls the delta row up to 6px under the value.
  - Hide toggle: the app renders the ghost icon Button (32px, radius lg, ink-2 glyph). Wonder shows radius md and a muted glyph.
  - Strip: one row with a 24px gap (16px under 768px), as the top-up page.
  - Amounts: the full figure ("Rp 48.250.000") with tabular digits on every balance and budget amount. Wonder prints short figures ("Rp 48,25 jt").
  - The strip variant, the neutral delta, the low-balance warning and the loading bones come from the app (top-up page, Beranda), not from a Wonder specimen.
  - The value animates with AnimatedNumber (NumberFlow, as the app). No count-up on mount; reduced motion snaps.
  - Tiles as tabs: the app wires role="tab", arrow keys and the chart panel itself. This pattern styles aria-selected and leaves the tab logic to the page (or the Tabs primitive).

#### Budget Card

- Source: Wonder spec
- Wonder: Dashboard › Budget Card Option B Remaining Rows, Budget Error v2
- Code-only variants and states: Item status: Hidden balance; Item status: Near (85–99%); Item status: At (100%); Card states: Empty; Card states: Loading
- Code-only examples: Hidden balance; No budget; Loading
- Wonder vs code:
  - The shipped app code is the source of truth (decision 2026-11-12). Wonder is the visual reference only.
  - This follows the Beranda Anggaran module (Wonder Option B "Remaining Rows"). Wonder "Budget Card Current" (spent "dari" limit in the top row, no foot) is not ported.
  - Amounts: the app writes "Rp 8.240.000 / Rp 10.000.000" in the rows and the foot. Wonder writes "dari".
  - Over percent: the app paints it danger-text at the normal weight. Wonder sets it medium.
  - Foot: the app has no fill, only the hairline. Wonder fills it with ui-well.
  - Bar: the UsageBar ramp of the app (primary mixed into surface at 45 / 65 / 82 / 100%, danger at 100%+). Wonder paints primary-300 / primary-500 steps.
  - Amounts are full figures ("Rp 48.250.000") with tabular digits.
  - Near and at the limit have no Wonder specimen; their thresholds come from the backend (near ≥ 85%, at = exactly 100%).

#### Button

- Source: Wonder spec
- Wonder: Mayar Card Design System › Button Guide Section
- Base UI: [useRender](https://base-ui.com/react/utils/use-render)
- Code-only variants and states: Variants × states (MD): Success Subtle; Variants × states (MD): Link Muted; Sizes × states (Primary): XL; Options (MD): Success Subtle
- Wonder vs code:
  - The shipped app code is the source of truth (decision, 12 Nov 2026). Wonder is the visual reference.
  - Wonder has an r-btn token of 12px; the app uses 8px (SM, MD, XL) and 10px (LG), as the Wonder specimens do.
  - success-subtle, link-muted and XL come from the app and are not on the Wonder page.
  - As in the app, aria-disabled on a button is a soft disable (focusable, no click), and a disabled or loading link does not navigate.
  - The app takes icon and iconPosition props; this port puts icons in children. The app sets aria-pressed with a pressed prop; here you set aria-pressed directly.
  - Every button has a hit area of at least 44×44 (an invisible ::before), so touch targets pass without a change to the visible size.

#### Card Face

- Source: Wonder spec
- Wonder: Dashboard › Card Face Master v2, Card Skin * v2, Kartu Owner Grid v2, Detail Kartu * v2, Kartu Loading v2
- Code-only variants and states: Sizes × states (Midnight): Thumb 48
- Code-only examples: Freeze and unfreeze; Interactive: hammer to unfreeze; Thumbnail
- Wonder vs code:
  - Source of truth: the shipped app (CardFace.svelte, CardTile.svelte, card-gradients.ts). Wonder is the visual reference; where they differ, this port follows the app.
  - Number and expiry use font-mono (Paper Mono), the one mono font of the system, as in the app. Wonder card/mono names JetBrains Mono.
  - Mastercard mark: the real logo of the app (mastercard.svg), 30px high. Wonder draws two circles (card/mc-red, card/mc-orange at 90%).
  - Chip lines: rgba(120,90,30,0.5) and Mayar swoosh #E91E78, as in the app. Wonder uses skin/gold-3 at 60% and brand/pink.
  - Hero shadow (elevated): the app float, 0 30px 60px -22px ink 60% and 0 14px 28px -16px primary 35%. Wonder shows a smaller 0 6px 16px -6px navy shadow. The app turns the shadow on by default and off on tiles and thumbnails; here elevated is opt-in.
  - Hero veils, as in the app: ink at 55% with a 3px blur for frozen, pending and closed. Frozen: snowflake 34px (#9DB7FF), "Kartu dibekukan" 15px, "Transaksi untuk sementara ditolak". Pending: a 32px ring spinner, "Sedang diproses", "Kartu sedang diaktifkan". Closed: circle-x 34px, "Kartu ditutup" and the date in body-sm medium. Wonder shows a midnight / royal tint, 36px Hugeicons and other copy.
  - Tile overlay (below 300px), as in the app CardTile: frozen is a soft centre scrim (inverted 52%) with a 24px snowflake and a caption-lg title, also over the WebGL ice; pending is primary-deep at 55% with a spinning loader; a closed tile goes grey at 70% opacity with no overlay.
  - Theme request: the app colours --color-card-swoosh (#e91e78), --color-card-chip-line (#785a1e80), --color-card-mc-overlap (#ff5f00) and --color-card-frost-icon (#9db7ff) have no token yet. The component reads these vars and falls back to the exact app value.
  - The holder line truncates at 190px (not in the app), so a long name never runs into BERLAKU.
  - Code-only: the WebGL ice of the app (card-freeze-effect). It refracts a snapshot of the face (html-to-image) through procedural ice (fbm noise and voronoi plates): the ice grows in on freeze, melts on thaw, and with onShatter the holder can hammer it apart. Same shader, timings (1500ms freeze, 1600ms thaw) and break rules as the app.
  - While the WebGL ice is on screen, the hero veil and the "Kartu dibekukan" label are not shown, as in the app. The card name still ends in "dibekukan". The CSS frost and label show before the snapshot is ready, without WebGL, when the shader fails or the context is lost, in matrices (freezeEffect="css") and on thumbnails.
  - Not in the app: a keyboard path for the hammer. The breakable card has a "Pecahkan es untuk membuka kartu" control; Enter or Space is one hit, and three hits break the ice (also without WebGL). A polite status line counts the hits.
  - The CSS frost (corners, cold tint, sheen) is the fallback for the WebGL ice. The app fallback also draws frost ferns, an idle shimmer and an animated hammer; this port leaves those out.
  - WebGL budget: a breakable card holds one live context while it is frozen. Look-only frozen cards share at most 4 short-lived contexts on the page, and each one is released when its ice settles.
  - Code-only (not on the Wonder page): the 48px thumbnail and width="auto". The app has no expired state, so there is none here.

#### Card Freeze Effect

- Source: code-only (shipped app, no Wonder specimen)
- Code-only examples: Interactive: hammer to unfreeze; On your own surface (look only)
- Wonder vs code:
  - Port of the app CardFreezeEffect.svelte: the same fragment shader (fbm noise, voronoi plates, droplets, bubbles, cracks, shards), freeze and thaw ramps with mid-flight inversion, hammer cursor, crack and knock-out rules, the 70% collapse cascade, the look-only context pool (4) and the html-to-image snapshot with a drawn placeholder.
  - Not in the app: the keyboard control (three Enter / Space hits, with a status line), a pause while the card is off screen, and reduced motion that also stops the idle twinkle and breaks the ice at once instead of the cascade.
  - The app does not cancel its frame loop on unmount; this port cancels requestAnimationFrame, removes every listener, frees the GL objects and loses the context.
  - Colours of the placeholder texture come from the theme tokens (card-chip, card-mc, skin-midnight). The shader colours are the app values, as GLSL floats.

#### Checkbox

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › Checkbox
- Base UI: [Checkbox](https://base-ui.com/react/components/checkbox)
- Code-only variants and states: Tile: Unchecked; Tile: Checked; Tile: Indeterminate
- Code-only examples: Tile grid
- Wonder vs code:
  - The shipped app (Checkbox.svelte) is the source of truth; Wonder is the visual reference. Where they differ, the app wins.
  - The box shadow is a 1px ring plus a 1px drop (no ambient layer), as in the app, so it is not shadow-control.
  - The tick uses pathLength="1" for the stroke-dashoffset draw, so the app's getTotalLength() measure is not necessary.
  - The app gates the draw behind an "is-init" class. Here a CSS transition does not run on first paint, so a checked box mounts drawn without a gate.
  - The tile variant comes from the app (KYC revision grid) and is not on the Wonder page. Its focus outline sits 2px outside the tile, as in the app.
  - Props and ref go to the Base UI checkbox (the app put rest props on the label and ref on the native input).

#### Choice Card

- Source: Wonder spec
- Wonder: Mayar Card Design System › Selection › Choice Card
- Base UI: [RadioGroup + Radio](https://base-ui.com/react/components/radio)
- Code-only variants and states: Variants × states: Leading; Variants × states: Icon; Variants × states: Method; Variants × states: List
- Code-only examples: Leading radio; Icon disc; Method; Bank list
- Wonder vs code:
  - The shipped app (ChoiceCard.svelte) is the source of truth; Wonder is the visual reference. Where they differ, the app wins.
  - The app used native radios inside a <label>. This port uses Base UI RadioGroup + Radio (render as a <div>), with a hidden native input for forms.
  - The app soft-disable (aria-disabled, focusable) is not ported: use disabled, or readOnly on the card (Base UI) for a focusable card that cannot be picked.
  - The app ChoiceCardPair takes an items array and a legend. Here the pair is a layout part: put ChoiceCard children in it, and name the group on ChoiceCardGroup (aria-label or a <fieldset> + <legend>).
  - leading, icon, method and list are code-only (Top Up v2, KYC v2 and card actions screens).

#### Combobox

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › Select / Combobox (open, combobox, empty)
- Base UI: [Combobox](https://base-ui.com/react/components/combobox)
- Code-only variants and states: Popup states: Loading
- Wonder vs code:
  - The shipped app is the source of truth (decision, 12 Nov 2026). Every value here comes from Combobox.svelte; Wonder is the visual reference.
  - The app hand-rolled the listbox (filtering, highlight, flip, close timers, empty debounce). This port uses Base UI Combobox with the input inside the popup, so combobox-logic.ts is not ported: Base UI filters by label (case-insensitive), skips disabled items, positions and flips the popup. loopFocus={false} and autoHighlight match the app's moveEnabledIndex (stop at the ends) and its first-match highlight while typing.
  - The popup is exactly as wide as the trigger. Its shadow is the app's own (ring, 0 12px 32px -8px drop colour, 0 4px 8px -2px ambient): softer than shadow-popover, which uses the modal colour.
  - The search row has no placeholder in the app, only the search icon. Its name is "Cari" by default; the app uses "Cari " + the trigger name, so pass that as aria-label.
  - The app's default empty copy is "Tim tidak ditemukan" / "Periksa ejaan atau buat tim baru." and its loading copy "Memuat hasil…". Here the copy is the children of ComboboxEmpty and ComboboxStatus.
  - The menu uses z-(--z-modal) like the app, so it paints over a Dialog or Popover.
  - The trigger keeps the focus ring and drops the hover wash while the popup is open, like the app.
  - ComboboxClear is code-only: neither the app nor Wonder has a clear button in the search row.

#### Dialog

- Source: code-only (shipped app, no Wonder specimen)
- Base UI: [Dialog](https://base-ui.com/react/components/dialog)
- Code-only variants and states: Header × close paths (MD): Plain; Header × close paths (MD): Divided; Header × close paths (MD): None; Header × close paths (MD): Stacked; Header × close paths (MD): dismiss auto; Header × close paths (MD): no-close-button; Header × close paths (MD): Busy; Sizes: SM; Sizes: MD; Sizes: LG; Sizes: Plain header; Placement × footer: Center; Placement × footer: Drawer; Placement × footer: Actions; Placement × footer: Start control + actions; Placement × footer: No footer; Trigger × states: Primary; Trigger × states: Secondary; Trigger × states: Danger; Trigger × states: Default; Trigger × states: Hover; Trigger × states: Pressed; Trigger × states: Focus; Trigger × states: Open; Alert dialog: Danger confirm; Alert dialog: Primary confirm; Alert dialog: SM
- Code-only examples: Form dialog; Drawer; Confirm (AlertDialog); Mandatory gate; Busy while saving
- Wonder vs code:
  - Code-only: the Wonder Design System page has no Dialog specimen. The shipped app code is the source of truth (decision, 12 Nov 2026); every value comes from Dialog.svelte + DialogFooter.svelte.
  - Header padding: plain 12 12 12 24 (16 12 4 24 with a description, close aligned to the top); divided 14 16 14 24 with or without a description; stacked 20 24 16 (24 24 20 with media). Close button: 36px on plain, 32px on divided, stacked and corner.
  - The app uses a native <dialog> with showModal(). This port uses Base UI Dialog: focus trap, Esc, outside press and focus return come from Base UI. The overlay is a Backdrop element at z --z-modal instead of ::backdrop in the top layer.
  - Base UI already ignores a press that starts inside the panel and ends on the overlay, as the app does by hand.
  - The app takes title, description and footer as props. This port composes them as parts (DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter). The footer "start" slot is a control with className="mr-auto".
  - The app has a width prop (e.g. 440 for QRIS activation). Here, set className="max-w-[440px]" on DialogContent.
  - Shadows as in the app: shadow-dialog (ring + 0 24px 64px -12px modal) on the centre panel, shadow-drawer (ring + 0 24px 48px modal) on the drawer.
  - The app puts an IconDisc (40, tint, 20px glyph) above the title with an `icon` prop. Here, pass `<IconDisc size={40} tone="tint">` to DialogHeader `media`.
  - Motion is entrance only, as in the app: dialog-in / drawer-in on the panel and fade-in on the overlay at --motion-dialog-open. No exit motion.
  - AlertDialog is new in this port (the app confirms with a Dialog). It reuses the Dialog parts.

#### Empty State

- Source: code-only (shipped app, no Wonder specimen)
- Code-only variants and states: Sizes × content: MD; Sizes × content: SM; Disc tones (SM): Neutral; Disc tones (SM): Danger; Disc tones (SM): Primary; Disc tones (SM): Well
- Code-only examples: No data yet; Error; No match (SM, in a card)
- Wonder vs code:
  - Code-only: Empty State has no specimen on the Wonder Design System page. The Dashboard page has empty panels; values come from EmptyState.svelte.
  - The app takes title, description, icon and actions as props/snippets. This port uses compound parts; titleAs becomes render on EmptyStateTitle.

#### Field

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › Field
- Base UI: [Field](https://base-ui.com/react/components/field)
- Code-only variants and states: Parts × value: Counter
- Code-only examples: Counter in the label row
- Wonder vs code:
  - The shipped app code (Field.svelte) is the source of truth (decision, 12 Nov 2026). Wonder is the visual reference.
  - Field.svelte took label, helper and error as props and gave the child snippet { id, describedBy, invalid }. This port uses compound parts on Base UI Field, so ids and aria-describedby are automatic.
  - The Svelte "aside" snippet is FieldHeader here and is code-only (KYC / Register v2).
  - The Svelte pair put one helper or error under the grid for both controls. Here a FieldPair takes any element after the two fields across both columns; link it with aria-describedby on the FieldPair.
  - As in the app, the shake is opt-in: change shakeSignal after a failed submit. The control and message rows shake (280ms: 2 × shake-a + 2 × shake-b, smooth-out); the label does not. A change of invalid alone does not shake.
  - In the app, "(opsional)" sits outside the <label>. Here it is inside FieldLabel, so it is part of the accessible name.

#### Filter Panel

- Source: Wonder spec
- Wonder: Dashboard › Transaksi C Filter Panel / Filter Active / Filter No Match v2
- Base UI: [Popover + ToggleGroup](https://base-ui.com/react/components/popover)
- Code-only variants and states: Trigger × states: Disabled; Open panel (static): Kartu checklist
- Code-only examples: Card status checklist
- Wonder vs code:
  - The shipped app code is the source of truth (decision 2026-11-12). Wonder is the visual reference only.
  - Open trigger: the app fills it with canvas (the hover colour) and eases only background-color; the trigger has a pointer cursor. Wonder fills the open trigger with component.
  - Panel shadow: the app uses the Popover elevation (shadow-popover). Wonder shows ring + 0 16px 32px shadow-modal.
  - Status, Tipe and Struk chips: the app allows one choice each (its Toggle Group SM, a press on the pressed chip keeps it on). FilterPanelChips does the same by default; pass multiple for a list. Wonder shows multi-select chips (Pending and Gagal both on) with a transparent fill.
  - Status labels follow the app: Berhasil, Menunggu, Ditolak, Dibalik. Wonder writes "Pending" and "Gagal".
  - Amount and ID inputs: the app uses Input LG (radius xl) with the default "Rp" prefix (ink-2 medium). Wonder shows radius lg at 36px and a muted prefix.
  - Sumber: the app trigger is 36px, radius lg, with a pointer cursor; FilterPanelSelect uses the Select LG trigger with rounded-lg, cursor-pointer and an eased hover fill.
  - Date: the app pairs presets with a range calendar (DateRangeCalendar). This port skips the calendar: preset chips (one choice) and two native date inputs.
  - The ID Transaksi text field is not a part: put an Input in a FilterPanelSection and set the draft through useFilterPanel().setField.
  - The Wonder Kartu checklist board ("Card Filter Status Checklist") is a non-v2 hex specimen; the checklist uses the v2 Checkbox and is marked code-only.

#### Icon Disc

- Source: code-only (shipped app, no Wonder specimen)
- Code-only variants and states: Tones × shapes (40): Neutral; Tones × shapes (40): Well; Tones × shapes (40): Primary; Tones × shapes (40): Tint; Tones × shapes (40): Success; Tones × shapes (40): Warning; Tones × shapes (40): Danger; Tones × shapes (40): Ring; Tones × shapes (40): Surface; Sizes × shapes (Primary): 24; Sizes × shapes (Primary): 28; Sizes × shapes (Primary): 32; Sizes × shapes (Primary): 36; Sizes × shapes (Primary): 40; Sizes × shapes (Primary): 44; Sizes × shapes (Primary): 48; Sizes × shapes (Primary): 56
- Code-only examples: Tones; Notification row
- Wonder vs code:
  - Code-only: Icon Disc has no specimen on the Wonder Design System page. Values come from the shipped app (IconDisc.svelte); the app code is final (decision, 12 Nov 2026).
  - Size 28 is not in the app IconDisc scale. The app draws 28px discs by hand: the request-access and KYC tracker dots (circle, 16px glyph) and the budget category chip (radius md). This port adds 28 so those and the Plan Badge row can use the primitive.
  - The app passes the glyph size by hand; this port also sizes a child svg from the disc size, so the Icon default (16px) is overridden.
  - Tone ring uses a 1px Tailwind ring in primary-light; the app uses the same 0 0 0 1px box-shadow.

#### Input

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › Input
- Base UI: [Input](https://base-ui.com/react/components/input)
- Code-only variants and states: Content (LG): Clear; Danger tone: Danger
- Code-only examples: Clear button; Type to confirm
- Wonder vs code:
  - The shipped app code (Input.svelte) is the source of truth (decision, 12 Nov 2026). Wonder is the visual reference.
  - tone="danger" and the clear button come from the app (Pengaturan v2 and Admin Pengguna v2) and are not on the Wonder page.
  - As in the app, only the background (hover) has a transition; the focus ring changes at once. The clear icon is 16px at every size.
  - Under a coarse pointer the text is 16px for every size, so iOS does not zoom.
  - Input does not shake by itself, as in the app. Use shakeSignal on the Field after a failed submit.
  - The Svelte "prefix" prop is the InputPrefix part here, given to leading. "icon" and "kbd" are the leading and trailing slots.

#### Kbd

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › Kbd
- Wonder vs code:
  - Renders a native <kbd>. Size: 20px tall, min-width 20px, 6px side padding, radius sm, caption-sm 11/16 medium.
  - Values come from the shipped app (Kbd.svelte), which is the source of truth (decision, 12 Nov 2026). Wonder is the visual reference.
  - The app takes the text as a keys prop or children; this port takes children only.

#### Notice

- Source: code-only (shipped app, no Wonder specimen)
- Code-only variants and states: Tones × variants: Info; Tones × variants: Neutral; Tones × variants: Success; Tones × variants: Warning; Tones × variants: Danger; Tones × variants: Banner; Tones × variants: Inline; Options (banner): Info; Options (banner): Neutral; Options (banner): Success; Options (banner): Warning; Options (banner): Danger; Options (banner): Title + action; Options (banner): bodyTone tone; Options (banner): No icon
- Code-only examples: Page banner; Inline in a form; Several lines
- Wonder vs code:
  - Code-only: no Notice specimen on the Wonder Design System page. It comes from the shipped app (Notice.svelte), built from the admin StateBanner and the inline notice copies.
  - Icons: info and neutral use information-circle, success checkmark-circle-02, warning alert-02 (triangle), danger alert-circle, as in the app.
  - The app takes an icon name; this port takes a Hugeicons icon object (or false).

#### OTP / PIN input

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › OTP
- Base UI: [OTP Field](https://base-ui.com/react/components/otp-field)
- Code-only variants and states: Sizes × states: MD · 4 digits; Sizes × states: LG
- Code-only examples: PIN
- Wonder vs code:
  - The shipped app (OtpInput.svelte) is the source of truth; Wonder is the visual reference. Where they differ, the app wins.
  - LG (44×52, focus halo, dot) is the PIN gate from the shipped app (Kartu Actions v2) and is code-only, as is the 4-digit length.
  - Built on Base UI OTPField, which gives digit-only input, paste, arrow keys, Backspace and autocomplete="one-time-code". The app used one native input per slot with its own key handling.
  - Slot names are the app default ("Digit 2 of 6"). The first slot takes the field label, because Base UI ignores aria-label on the first slot. The app labelled the group "One-time code" and every slot with a digit name.
  - autoFocus is the app "autofocus": it focuses the first slot on mount and when a controlled value clears after a wrong PIN.
  - The app shake runs for 2 × shake-a + 2 × shake-b (280ms) with ease-smooth-out on each step; the theme animate-shake runs for 2 × a + 3 × b (340ms).

#### PIN Gate

- Source: Wonder spec
- Wonder: Dashboard › Kartu Action PIN A Verify / Wrong PIN / Locked / Set Create / Set Confirm v2
- Base UI: [OTPField + Dialog](https://base-ui.com/react/components/otp-field)
- Code-only variants and states: States × form: Checking; States × form: Locked (timed); States × form: Success; States × form: Inline
- Code-only examples: Inline, client-side lock; Server tries and lock
- Wonder vs code:
  - The shipped app code is the source of truth (decision 2026-11-12). Wonder is the visual reference only.
  - Wonder specifies Verify (empty), Wrong PIN, Locked, Set Create and Set Confirm in the dialog. Checking, Success, the timed lock and the inline form are code-only.
  - Wrong PIN: the app line is "PIN salah, coba lagi" (or the server message). Wonder shows "PIN salah. Sisa 4 percobaan sebelum PIN terkunci."
  - Locked: the app line is "PIN terkunci sementara. Coba beberapa saat lagi." (or the server message), with no time. With retryAfter or lockedUntil the gate unlocks by itself at the end.
  - Dialog surface: the app uses its Dialog elevation; PinGateDialog keeps the Dialog default. Wonder shows a 0 24px 48px shadow-modal drop.
  - Checking (spinner + "Memeriksa PIN…") and Success ("PIN benar.") lines are additions of this port; the app leaves the line empty while it checks and closes on a match. Pass checkingMessage="" / successMessage="" for the app behaviour.
  - Wonder subtitle is ink-2, as the app; DialogDescription is muted by default, so the examples pass className="text-ink-2".
  - The step dots of confirm (6px, the active one 16px wide) come from the app; the Set Confirm specimen has the same shape.

#### Plan Badge

- Source: Wonder spec
- Wonder: Mayar Card Dashboard › Dashboard › Plan Badge (Starter, Business, Enterprise Unlimited, Free, Suspended, Rail)
- Base UI: [useRender](https://base-ui.com/react/utils/use-render)
- Code-only variants and states: Tier × layout: With usage; Tier × layout: Row as link · focus; Chip × size: Starter; Chip × size: Business; Chip × size: Enterprise; Chip × size: Free; Chip × size: Suspended; Chip × size: SM; Chip × size: MD; Chip × size: LG; Chip × size: MD pill
- Code-only examples: Chip in a page header
- Wonder vs code:
  - Source of truth: the shipped app. Wonder is the visual reference; where they differ, this port follows the app.
  - Chip: the app Tim header uses <Badge variant="brand" size="md">Paket {tier}</Badge> for every tier, also Free. PlanBadgeChip matches it. The suspended (warning, "berakhir") chip is not in the app; it stays opt-in.
  - Row: the app has no row badge (its sidebar footer shows the Plan Quota card), so the row follows the Wonder specimen and paints it with the app tokens of the quota card: the tier in primary, the quota line in muted, and a lapsed plan in semibold warning-text. Wonder shows a #eef1ff disc, #2d3dec ink and #b47908 for the lapsed line.
  - The disc is the 28px primary IconDisc (16px glyph). Wonder draws a 15px glyph.
  - The quota line comes from getPlanQuota in plan-quota.tsx, so the badge and the quota card always say the same thing ("7 terpakai · 3 tersedia", "Paket berakhir").
  - The "Row as link" focus state and the "With usage" line are code-only.

#### Plan Quota

- Source: Wonder spec
- Wonder: Mayar Card Dashboard › Dashboard › Plan Quota Card Normal / Near Limit / Full v2
- Base UI: [useRender](https://base-ui.com/react/utils/use-render)
- Code-only variants and states: Status × state: Over; Status × state: Unlimited; Status × state: Usage unknown; Status × state: Suspended; Status × state: Link · focus
- Code-only examples: Unlimited and suspended
- Wonder vs code:
  - Source of truth: the app Sidebar.svelte plan quota card. Wonder is the visual reference; where they differ, this port follows the app.
  - Radius 16px (3xl), as in the app. Wonder shows 14px.
  - Tones: the app keeps the well card and the primary tier at every status, and the bar uses the blue usage ramp (red only at 100%). Wonder shows a warning card and fill near the limit and a danger card and fill when full.
  - Legend: one line "3 terpakai · 7 tersedia" in muted caption-lg, as in the app. Over the quota it reads "12 terpakai · 0 tersedia". Wonder splits it into two parts with semibold numbers.
  - Description: always "Kuota kartu aktif paket Anda." (the app). Wonder changes it near the limit and when full.
  - Upgrade action: Wonder shows an "Upgrade paket" button on the full card. The app sidebar card has none (the whole card links to settings), so PlanQuotaAction is opt-in.
  - status (ok, near, at, over, unlimited, unknown, suspended) stays in getPlanQuota and data-status as information, e.g. to show the upgrade action. near (80%+) changes nothing on screen.
  - Over quota, unlimited, unknown usage and suspended are code-only (from the app). Focus on a linked card is code-only; the app has no hover style on the card.

#### Popover

- Source: code-only (shipped app, no Wonder specimen)
- Base UI: [Popover](https://base-ui.com/react/components/popover)
- Code-only variants and states: Trigger × states: Secondary; Trigger × states: Ghost icon; Trigger × states: Default; Trigger × states: Hover; Trigger × states: Pressed; Trigger × states: Focus; Trigger × states: Open; Open panel (static): Filter; Open panel (static): Notifications; Open panel (static): Empty result; Open panel (static): Open; Placement: Bottom; Placement: Top; Placement: align start; Placement: align end
- Code-only examples: Filter panel; Notifications; Controlled
- Wonder vs code:
  - Code-only: no Popover specimen on the Wonder Design System page. The shipped app code is the source of truth (decision, 12 Nov 2026); every value comes from Popover.svelte.
  - The app takes a `width` prop in px (capped at the viewport minus 32px). Here, set className="w-[280px]" on PopoverContent; the max-w-[calc(100vw-32px)] cap stays.
  - The app requires a `label` (the panel is role="dialog" with aria-label). Here, give PopoverContent an aria-label or render a PopoverTitle.
  - The app positions the panel by hand (absolute / fixed strategy, flip, nudge into the viewport) and closes a fixed panel on scroll. Base UI Popover positions it with Floating UI: it flips, shifts and follows scroll, so it does not close on scroll.
  - canvas-anchor.ts in the app turns a control on a CSS-scaled canvas into a virtual anchor. Base UI measures the real client rect, which includes CSS transforms; pass anchor= (an element or a virtual element) if you need another anchor.
  - placement="bottom-end" in the app is side="bottom" align="end" here (the default).
  - The app panel enters with menu-in at --motion-quick (150ms). The theme menu-in animation uses --motion-dropdown-open (250ms), so the panel sets the animation duration back to --motion-quick.
  - z-index: the positioner uses --z-popover (50), as in the app.

#### Radio

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › Radio
- Base UI: [Radio Group](https://base-ui.com/react/components/radio)
- Wonder vs code:
  - The shipped app (Radio.svelte) is the source of truth; Wonder is the visual reference. Where they differ, the app wins.
  - The app groups radios by a shared name and syncs peers with a document listener. Here Base UI RadioGroup owns the value, roving focus and arrow keys.
  - A disabled checked radio keeps a white dot on the grey disabled fill, as in the app.

#### Section Card

- Source: code-only (shipped app, no Wonder specimen)
- Code-only variants and states: Parts: Title only; Parts: With aside; Parts: With foot; Parts: Flush body
- Code-only examples: Basic; Flush list with foot
- Wonder vs code:
  - Code-only: no specimen on the Wonder page. Source: the admin user detail cards in the shipped app.
  - The app took title, aside and foot as props and snippets. This port uses compound parts; the title gives the region its name.

#### Select

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › Select / Combobox
- Base UI: [Select](https://base-ui.com/react/components/select)
- Code-only variants and states: Variants × states (LG): Active filter; Variants × states (LG): Leading; Open menu: Action row
- Code-only examples: Filter (active tone)
- Wonder vs code:
  - The shipped app is the source of truth (decision, 12 Nov 2026). Every value here comes from Select.svelte; Wonder is the visual reference.
  - The focus ring shows on any focus of the trigger (the app uses :focus-within), not only on keyboard focus.
  - The menu is exactly as wide as the trigger, like the app.
  - The menu uses z-(--z-modal) like the app (design/forms.md: "Select / Combobox menus --v2-z-modal"), not --z-dropdown: a menu in a Dialog (z-modal) or Popover (z-popover) must paint over it.
  - The app portals the menu into an open <dialog>. With Base UI the menu portals to <body> and Base UI nests it in the Dialog's floating tree, so outside click and Esc close only the menu.
  - invalid is aria-invalid on the trigger (or Field.Root invalid), not a separate prop. displayLabel is SelectValue children.
  - The app shakes the Select on an invalid submit (is-shaking). This port leaves that to the Field; use animate-shake on the trigger if you need it.
  - The active tone, the action row and SelectLeading come from the app and are not on the Wonder page.
  - The app test helpers (pickSelectOption, readSelectOptions) are ported into select.test.tsx.

#### Sidebar

- Source: Wonder spec
- Wonder: Mayar Card Dashboard › Dashboard › Sidebar v2, Sidebar Collapsed v2, Sidebar Collapsed KYC Locked v2, Nav Item / Nav Icon State v2
- Base UI: [Tooltip, Collapsible, useRender](https://base-ui.com/react/components/tooltip)
- Code-only variants and states: Item × state, expanded and collapsed: Disabled; Sidebar × layout: Quota near limit; Icon buttons × state: Pressed; Icon buttons × state: Expanded (panel open)
- Code-only examples: Mobile drawer
- Wonder vs code:
  - Source of truth: the shipped app (Sidebar.svelte, routes/+layout.svelte). Wonder is the visual reference; where they differ, this port follows the app. Shared values: 264/68px, item 36px, radius xl, gap 10.
  - First group label: "Utama", as in the app. Wonder shows "Menu".
  - Item icons are 17px, also on the rail, as in the app. Wonder shows 18px rail icons.
  - Item count: the app nav has no count. SidebarItemCount uses the app Badge (brand, SM, pill), so it matches the other chips. Wonder "Nav Item Badge" shows a semibold primary-light pill. The rail shows a 7px primary dot with a canvas ring.
  - Phone drawer (accessibility fix, not in the app): it is a modal Base UI Dialog named "Menu". Focus moves into it on open, Tab and Shift+Tab stay inside, the page behind is inert and does not scroll, and focus goes back to the trigger on close. Escape, a press on the backdrop, the ✕ and a nav tap close it. It is not in the DOM while closed (the app keeps it off screen with inert).
  - KYC rail notice: a real link to the settings page, as in the app ("Verifikasi diperlukan — buka Pengaturan"). Pass render={<Link to="/settings" />} for a router link. The expanded card is a note with no link, as in the app.
  - The app shows tooltips with CSS on hover and focus. This port uses Base UI Tooltip (portal, collision handling), disabled while expanded.
  - Disabled items, the pressed and expanded icon button, and the item count are code-only (not on the Wonder page).
  - Inactive items keep role="link" with aria-disabled: an <a> without href cannot carry aria-label on the rail.
  - The ⌘K shortcut and the search field are not part of this file: compose Input inside SidebarExpandedOnly (see the App shell example).

#### Skeleton

- Source: code-only (shipped app, no Wonder specimen)
- Code-only variants and states: Radius × fill: sm; Radius × fill: md; Radius × fill: lg; Radius × fill: xl; Radius × fill: 2xl; Radius × fill: full; Radius × fill: Well + shimmer; Radius × fill: Component + shimmer
- Code-only examples: List rows; Balance card with shimmer
- Wonder vs code:
  - Code-only: Skeleton has no specimen on the Wonder Design System page. Values come from Skeleton.svelte.
  - Every app skeleton is static, and the app code is final (decision, 12 Nov 2026). The shimmer prop is an opt-in addition of this port (animate-shimmer, motion-safe only). It is off by default, so a default bone equals the app bone.

#### Steps

- Source: code-only (shipped app, no Wonder specimen)
- Code-only variants and states: Current step × step count: Current 1; Current step × step count: Current 2; Current step × step count: Current 3; Current step × step count: Current 4
- Code-only examples: Verification flow; Long labels
- Wonder vs code:
  - Code-only: Steps has no specimen on the Wonder Design System page. Values come from Steps.svelte.
  - The app takes a steps array; this port uses <Step> children, so each label can hold any content.

#### Surface

- Source: Wonder spec
- Wonder: Mayar Card Design System › Card (Surface)
- Base UI: [useRender](https://base-ui.com/react/utils/use-render)
- Wonder vs code:
  - The shipped app code is final (decision, 12 Nov 2026). Every value here comes from the app Surface.svelte; Wonder is the visual reference.
  - variant="container" paints the white surface, not the code-only `container` colour token.
  - The related ring is requested on the child (nested.ring) and drawn by the parent with :has().
  - The app also accepts `surface` as a deprecated alias of `variant`. This port keeps only `variant`.

#### Switch

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › Switch Block
- Base UI: [Switch](https://base-ui.com/react/components/switch)
- Wonder vs code:
  - The shipped app (Switch.svelte) is the source of truth; Wonder is the visual reference. Where they differ, the app wins.
  - The app animates the thumb with keyframes (1px overshoot at 55%, only after the first user change). This port uses one translate transition on ease-toggle (cubic-bezier(0.34, 1.35, 0.64, 1)). Its overshoot is about 1px, and a CSS transition does not run on first paint, so the result is the same without new keyframes in theme.css.
  - The track colour changes at once (the app sets its transition to 0ms).
  - The app requires a label. Here the label is optional, but a switch without one must have an aria-label.

#### Tabs

- Source: Wonder spec
- Wonder: Mayar Card Design System › Selection › Tabs Segmented, Tabs Line
- Base UI: [Tabs](https://base-ui.com/react/components/tabs)
- Code-only variants and states: Segmented × states: SM · count; Segmented × states: MD · fill; Segmented × states: MD · loading count; Line × states: Primary tone · count; Line × states: Count tone primary; Line × states: Count tone tint; Line × states: Loading count; Nav links × states: Segmented; Nav links × states: Line; Nav links × states: Line · primary tone · count; Nav links × states: Line · count tone tint
- Code-only examples: Line with counts; Fill (controlled); Unread count; With a header; Nav links; Full-height nav bar; Loading counts
- Wonder vs code:
  - The shipped app is the source of truth (decision, 12 Nov 2026). Values and behaviour come from Tabs.svelte; Wonder is the visual reference.
  - The sliding pill and underline use Base UI Tabs.Indicator (--active-tab-* variables) with --motion-tabs and ease-smooth-out. TabsNav measures its active link with a small layout effect, as the app does. The first position snaps.
  - Base UI keeps a disabled tab focusable (aria-disabled), so arrow keys stop on it but do not activate it. The app skipped disabled tabs.
  - The app takes an items array and renders the tabs, panels, header and links from it. This port is compositional: TabsHeader replaces the header snippet, TabsNav + TabsLink replace link mode (items with href), and panel-less tabs are a Tabs without TabsPanel (pass aria-controls on each tab).
  - Not ported: the SvelteKit keepfocus and noscroll flags (use your router options on the link), and the app vertical layout (the app stacks a vertical rail above the panels; this port puts it beside them).
  - Wonder shows segmented MD/SM and neutral line tabs. tone, countTone, fill, loading counts, scrollable, fullHeight, the header, nav links and vertical orientation are code-only.
  - countTone="tint" on segmented tabs uses the same round pill as countTone="primary" (the app only changes the colours there).

#### Textarea

- Source: Wonder spec
- Wonder: Mayar Forms Inputs Guide › Textarea
- Base UI: [Field.Control](https://base-ui.com/react/components/field)
- Code-only variants and states: Sizes × states (Default): MD; Sizes × states (Default): XL
- Wonder vs code:
  - The shipped app code (Textarea.svelte) is the source of truth (decision, 12 Nov 2026). Wonder is the visual reference.
  - The app has sizes MD / LG / XL and no ghost. Wonder shows a ghost Textarea; this port keeps it (transparent, border-focus ring on focus, as Input ghost). The app does not use it. MD and XL are not on the Wonder page.
  - As in the app: no paint transition, no shake, and the disabled field keeps the control shadow.
  - Built on Base UI Field.Control with render={<textarea />}, so it takes its label, description and invalid state from a Field.

#### Toast

- Source: Wonder spec
- Wonder: Mayar Toast Guide
- Base UI: [Toast](https://base-ui.com/react/components/toast)
- Code-only examples: Outside React
- Wonder vs code:
  - The shipped app code is the source of truth (decision, 12 Nov 2026); values come from Toast.svelte, ToastViewport.svelte and toast.ts, built from the Wonder Mayar Toast Guide.
  - Built on Base UI Toast: timers, pause on hover and focus, the stack and the live region come from Base UI. Swipe to dismiss is off by default, as in the app; pass swipeDirection to <Toast> to turn it on.
  - Stack as in the app: each card sits on the bottom edge at its own height, lifts 12px per step and scales 1 / 0.95 / 0.9. Hover or focus sets the scale back to 1 at the same 12px step (the cards still overlap); it does not spread them apart.
  - Roles: Base UI renders each toast as role="dialog" in a polite region named "Notifikasi". An error toast has priority "high", which Base UI announces through an assertive region. The app puts role="status" / role="alert" on the card.
  - Base UI hides the close and cancel buttons from assistive tech until the stack is expanded or focused.
  - Motion: open 350 / close 250 smooth-out, rise --motion-toast-distance, scale --motion-toast-scale, blur --motion-toast-blur. The loading icon is the shared Spinner (Hugeicons loading-03, 1s linear), as in the app.
  - The theme reduced-motion block does not zero --motion-toast-open/close; the toast uses motion-reduce:transition-none and drops the blur instead, as the app does.
  - The app card is a fixed 356px; this port caps it at the viewport width (max-w-full) so it does not overflow a 320px phone.
  - Info uses help-circle (a question mark), as in Wonder and the app. It reads as help, not info: flagged, not changed.

#### Toggle Group

- Source: Wonder spec
- Wonder: Mayar Card Design System › Selection › Toggle Group
- Base UI: [ToggleGroup](https://base-ui.com/react/components/toggle-group)
- Code-only variants and states: Variants × states: Chips SM; Variants × states: Segmented; Variants × states: Track MD; Variants × states: Track SM; Variants × states: Track icon; Variants × states: Chips icon; Variants × states: Chips SM multiple; Variants × states: Track multiple
- Code-only examples: Small chips; Amount presets; Period track; Multiple (controlled); View switch
- Wonder vs code:
  - The shipped app is the source of truth (decision, 12 Nov 2026). Values and behaviour come from ToggleGroup.svelte; Wonder is the visual reference.
  - Semantics: the app default renders radios (role="radio") and its `pressed` mode renders aria-pressed buttons. Base UI ToggleGroup only renders aria-pressed buttons, so this port always uses the app `pressed` mode: exactly one item stays pressed.
  - Focus: as in the app, Tab into the group lands on the pressed item (Base UI alone would start on the first item).
  - multiple is new in this port (the app has no multi-select toggle group). It is the Base UI multiple mode with a string[] value.
  - The app makes an item square (32px) when it holds only an icon, and switches to the 28px view-switch geometry when every item is icon-only. This port uses size="icon" for the view switch; a single icon item inside a text group is not square.
  - The app has no small segmented item, so size="sm" on segmented keeps the 32px radius-lg item.
  - Wonder shows only the chips (MD). Chips SM, segmented, track, the icon size and multiple are code-only.
  - The track pill is measured with a small layout effect (local offsets) and tweens with --motion-tabs and ease-smooth-out, as the app slidingPill does; a resize snaps it.

#### Transaction List

- Source: Wonder spec
- Wonder: Dashboard › Transaksi C Default v2 (Day Grouped List)
- Base UI: [useRender](https://base-ui.com/react/utils/use-render)
- Code-only variants and states: Type × status (feed): REVERSED; Row states: Cards; Row states: Hover; Row states: Pressed; Row states: Focus; Row states: Selected; Category discs: Pemasaran; Category discs: Operasional; Category discs: Perjalanan Dinas; Category discs: Perjalanan; Category discs: Lainnya; Category discs: Uncategorized; Category discs: Iklan & Marketing; Category discs: Transport & Logistik; Category discs: Software & Langganan; Category discs: Perangkat lunak; Category discs: Transportasi; Category discs: Kopi Tim; Status badge: Badge; Status badge: With icon; Loading: Cards; Loading: Skeleton
- Code-only examples: Day cards
- Wonder vs code:
  - The shipped app code is the source of truth (decision 2026-11-12). Wonder is the visual reference only.
  - Row status: the app renders the status Badge ("Menunggu" warning, "Ditolak" danger, "Dibalik" default) 2px under the amount; TransactionRowStatus does the same. Wonder shows caption-lg medium coloured text with the labels "Pending" / "Gagal".
  - Meta line: the app keeps the time out of the truncation. Wonder has one truncating meta line.
  - REVERSED ("Dibalik"), hover, pressed, focus, selected and the day-cards layout come from the app; Wonder has no feed specimen for them.
  - Pressed (sunken) and selected (primary tint) are additions of this port; the app has hover (canvas) and a highlight tint on the QRIS cards.
  - The detail drawer stays out of this pattern; the example composes it with Dialog placement="drawer".

#### Usage Bar

- Source: code-only (shipped app, no Wonder specimen)
- Base UI: [Meter](https://base-ui.com/react/components/meter)
- Code-only variants and states: Usage ramp × height: 30% (p1); Usage ramp × height: 60% (p2); Usage ramp × height: 80% (p3); Usage ramp × height: 95% (p4); Usage ramp × height: 120% (over); Usage ramp × height: 0%; Usage ramp × height: 85% (warning); Colour override (share bars): chart-1; Colour override (share bars): chart-2; Colour override (share bars): chart-3; Colour override (share bars): chart-4; Colour override (share bars): chart-5; Colour override (share bars): chart-6
- Code-only examples: Label and value; Budget list; Category share
- Wonder vs code:
  - Code-only: Usage Bar has no specimen on the Wonder Design System page. The Dashboard "Anggaran" panel uses it; values come from UsageBar.svelte and lib/usage-tone.ts.
  - Built on Base UI Meter (role="meter"), the same role the app uses when the bar has a label. Without a label and without children it is aria-hidden, as in the app.
  - The app takes value + max or percent. This port takes value, min and max (percent = value with max 100).
  - The ramp colours p1–p3 are color-mix of primary and surface (45 / 65 / 82%), as in the app; there is no theme token for them.
  - The fill uses animate-bar-fill once on mount; --motion-bar-fill is 0ms under reduced motion.
  - The app code is final (decision, 12 Nov 2026). The warning tone is a port extra: the app ramp (lib/usage-tone.ts) is "never amber", and the Sidebar plan quota uses the blue ramp (red at 100%). The tone is opt-in and the default ramp is unchanged.

#### Copy that moved out of the gallery

These lines used to be on public pages. They are provenance, so they are here now.

- Budget card, example "Load error": "Wonder Budget Error v2."
- Field, matrix: "Each Field part from the Wonder guide."
- Filter panel, matrix row "Transaksi" was "Transaksi (Wonder)": the Wonder specimen values.
- Icon disc, matrix: "Code-only: there is no Wonder specimen."
- Kbd, matrix and example: "The four keys of the Wonder row." and "The keys from the Wonder row."
- Plan badge: "The six Wonder specimens". The "Chip × size" matrix is code-only.
- Surface, matrix: "Wonder specimens: Elevated, Container Elevated, Divided and Nested."
- Balance card, delta matrix: neutral and the low-balance warning are code-only.
- Input: the "Danger tone" matrix is code-only.
- Select API: `SelectTrigger tone="active"`, `SelectLeading` and `SelectItem tone="action"` are code-only.
- Installation, state variants: use them "so the states match Wonder".
