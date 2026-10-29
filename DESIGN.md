---
name: NextFilm — Video Store
mode: hybrid (Persuade at the counter, Operate in the aisles)
remember: "Feels made by a person, finds the right film, and is a pleasure to look at."
colors:
  floor: "#131512"       # shop floor after closing
  shelf: "#1b1e1a"
  shelf-2: "#252924"
  line: "#333831"
  line-strong: "#454b42"
  text: "#f1eee6"
  text-2: "#bdb9ae"
  text-3: "#928e84"
  label: "#ffd447"       # price-gun yellow: primary action, highlights
  label-ink: "#1b1712"
  sticker: "#c93a1e"     # rental-sticker red: badges, NEW, TOP 10
  neon: "#ff5b3a"        # sign red: the logo and active states only
  paper: "#f3ead3"       # index cards (staff picks)
  paper-ink: "#2a2420"
  pen: "#2b4f8a"         # biro blue on the cards
  receipt: "#fbf8f0"
type:
  display: "Archivo Variable, condensed (VHS spines, shelf labels, titles)"
  body: "Instrument Sans Variable"
  hand: "Kalam — staff-pick cards only"
  receipt: "IBM Plex Mono — the receipt and price tags only"
space: 4px base — 4, 8, 12, 16, 24, 32, 48, 64, 96
radius: { case: 3, card: 2, button: 6, sticker: 999 }
---

# NextFilm design system: the video store

## The idea

NextFilm is the neighbourhood video store you wish still existed. It's open late, the shelves are full, the clerk has opinions, and the regulars leave handwritten recommendations on the shelves. Every screen is a part of that store:

| Store | In the app |
| --- | --- |
| The counter | Home hero: tonight's featured film, with a rental sticker |
| The shelves | Rails of posters standing like cases, each shelf labelled with label-maker tape |
| The clerk | NextFilm AI ("Ask the clerk") |
| Staff-pick cards | Reddit community picks, as handwritten index cards |
| The aisles | Browse, with filters as aisle signs |
| Your receipt | The watchlist, printed like a rental slip |
| Membership card | Sign in / sign up |

If a new screen doesn't map to something in the store, it isn't designed yet.

## Principles

1. **Objects, not widgets.** Prefer a real store object (tape, sticker, card, receipt) over a generic UI pattern. But only where the object helps you understand the thing; the poster always wins.
2. **Tactile, not glossy.** Hard offset shadows that press down when clicked, slight rotations on stickers and cards, paper and tape textures. No glows, gradients on buttons, or glassmorphism.
3. **Every special font has one job.** Handwriting only on staff-pick cards. Mono only on the receipt and price tags. Everywhere else: Archivo for labels and titles, Instrument Sans for reading.
4. **Humour in the copy, never in the way.** "Be kind, rewind", "the clerk recommends", "due back: whenever". One line, then get out of the way.
5. **Honest states.** Loading shows rewinding tape reels or shelf-shaped skeletons, empty states say what to do next, errors say what happened.

## Colour

The floor is a near-black with a little green in it (old carpet, fluorescent tubes switched off). Two signage colours carry the brand: **price-gun yellow** for the one primary action and highlights, **sticker red** for badges. **Paper** and **receipt** are surfaces for objects, never for whole pages.

| Pair | Contrast |
| --- | --- |
| `text` on `floor` | 15.8:1 |
| `text-2` on `floor` | 9.4:1 |
| `text-3` on `floor` | 5.6:1 |
| `label-ink` on `label` | 12.5:1 |
| white on `sticker` | 5.1:1 |
| `paper-ink` on `paper` | 12.8:1 |
| `pen` on `paper` | 6.8:1 |

## Typography

- **Titles and labels:** Archivo, `font-stretch: 75%`, weight 800, uppercase. Shelf labels sit on black label-maker tape with slightly embossed white letters.
- **Section headings:** label-maker tape (`.tape`), rotated no more than 1.5°.
- **Body:** Instrument Sans 16px / 1.55.
- **Staff-pick cards:** Kalam 18–20px in biro blue on ruled paper.
- **Receipt and price tags:** IBM Plex Mono, uppercase, tabular numbers.

## Components

- **Push button**: 6px radius, 2px border in a darker shade, `box-shadow: 0 4px 0` of that shade. On hover it lifts 1px, on press it drops 4px and loses the shadow. Primary is yellow, secondary is shelf grey. (Pattern inspired by the 3D buttons on uiverse.io, MIT; written for this system.)
- **Rocker toggle**: the Films / Series switch, a two-position switch with a sliding thumb (inspired by uiverse.io switches).
- **Tape**: black label-maker strip, white embossed caps, notched ends.
- **Sticker**: round, rotated −8° to 8°, red or yellow, used for NEW, TOP 10 rank and ratings.
- **Case**: a poster card with a darker 5px spine on the left and a faint plastic sheen at the top. It stands on a shelf edge that casts a soft shadow.
- **Staff-pick card**: ruled index card, a strip of masking tape at the top, handwritten note, attribution in small print.
- **Receipt**: off-white slip, zig-zag torn edges, dashed rules, mono type.
- **Reels loader**: two cassette reels turning ("Rewinding…"). With reduced motion it's a still frame.

## Motion

Physical and short: buttons press (80ms), stickers settle when the hero changes (300ms), reels turn while loading. The hero backdrop cross-fades (700ms). Content is never hidden behind an animation, and `prefers-reduced-motion` turns all of it off.

## Layout

Page gutter `clamp(16px, 4vw, 56px)`. Shelves run edge to edge; reading text stays under 70ch. Touch targets are at least 44px. Mobile works from 320px.

## Credits

Interaction patterns (push buttons, rocker switches, loaders) are inspired by the community components on [uiverse.io](https://uiverse.io/elements) (MIT licence) and written from scratch to fit this system.
