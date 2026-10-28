---
name: NextFilm — Cinematic
mode: hybrid (Persuade hero, Operate browsing)
colors:
  bg: "#0c0b0a"
  surface: "#151311"
  surface-2: "#1e1b18"
  line: "#2c2824"
  line-strong: "#3d3833"
  text: "#ede8e1"
  text-2: "#b3aca4"
  text-3: "#8b847c"
  accent: "#f0b03f"
  accent-ink: "#1a1306"
  danger: "#f2786a"
  success: "#7fd19a"
type:
  display: "Archivo Variable (width 62–125, weight 100–900)"
  body: "Instrument Sans Variable"
  scale: [12, 14, 16, 20, 25, 31, 39, 49, 61, 76]
space: 4px base — 4, 8, 12, 16, 24, 32, 48, 64, 96
radius: { sm: 4, md: 6, lg: 10, pill: 999 }
---

# NextFilm design system

## The scene

People open NextFilm in the evening, on a sofa or at a desk, trying to decide what to watch tonight. The room is dim and the films are the colour. So the interface is a screening room: a warm near-black ground, quiet type, and posters and backdrops doing the talking. Dark comes from that scene, not from "it's a movie site".

## Principles

1. **The film owns the frame.** Backdrops go edge to edge; UI chrome sits on top and gets out of the way.
2. **One accent, used sparingly.** Projector amber (`--accent`) marks the single primary action on a screen and the active state. Never a gradient, never a glow.
3. **Type like a title card.** Film titles use Archivo condensed and heavy, in capitals. Everything else is Instrument Sans in sentence case.
4. **Honest states.** Every list has a loading skeleton shaped like its content, an empty state with a next step, and an error that says what to do.
5. **No filler.** No invented stats, testimonials, newsletter boxes or dead links.

## Colour

| Token | Use | Contrast on `bg` |
| --- | --- | --- |
| `--text` `#ede8e1` | body and headings | 16.1:1 |
| `--text-2` `#b3aca4` | secondary copy, meta | 8.8:1 |
| `--text-3` `#8b847c` | captions, placeholders | 5.3:1 |
| `--accent` `#f0b03f` | primary button fill, focus ring, active nav, ratings | 10.3:1 |
| `--accent-ink` `#1a1306` | text on accent | 9.6:1 on accent |

Neutrals are warm (stone), never blue-grey. Surfaces step up in lightness (`bg` → `surface` → `surface-2`) to show elevation; shadows are reserved for floating layers (menus, dialogs) and always have a y-offset.

## Typography

- **Display** — Archivo, `font-stretch: 75%`, weight 800, uppercase, `line-height: 0.95`, `letter-spacing: 0.005em`. Hero titles `clamp(2.5rem, 7vw, 5.5rem)`; title-page heading `clamp(2.25rem, 5vw, 4.25rem)`.
- **Section headings** — Archivo, normal width, weight 700, 25px (20px mobile), sentence case.
- **Body** — Instrument Sans 16px / 1.55. Meta lines 14px with `font-variant-numeric: tabular-nums`.
- `text-wrap: balance` on headings, `pretty` on paragraphs. Curly quotes and a real ellipsis (…).

## Layout

- Page gutter `clamp(16px, 4vw, 56px)`; max content width 1440px for text blocks, rails run edge to edge.
- Rails: horizontal scroll with `scroll-snap`, poster width `clamp(128px, 14vw, 200px)`, 2:3 aspect, 6px radius. Prev/next buttons on pointer devices, swipe on touch.
- Breakpoints: 640, 900, 1200.
- Touch targets ≥ 44px.

## Motion

One authored moment: the hero backdrop cross-fades and settles (scale 1.04 → 1) when the featured film changes, 700ms ease-out. Everything else is instant or a 150ms colour/opacity change. Content is never hidden behind an entrance animation. `prefers-reduced-motion` removes the scale and stops hero auto-advance.

## Components

- **Button** — primary (accent fill, accent-ink text), secondary (surface-2 fill, line border), ghost (text only). 44px tall, 6px radius, icon + label.
- **Poster card** — poster, then title and `year · ★ rating` under it. Hover brightens the poster; focus shows a 2px accent ring offset 3px.
- **Top 10 rail** — oversized outlined numerals in Archivo beside each poster.
- **Ask bar** — the AI search: one large field, a submit button, and example prompts as chips.
- **Dialog** — native `<dialog>`, Esc to close, focus returns to the trigger.
- **Toast** — bottom-centre, `aria-live="polite"`, auto-dismiss after 3.5s.
