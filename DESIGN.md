---
name: Adhyayan OS
description: A personal expedition atlas — dashboard, to-dos, habits, and journal drawn as sheets of one survey chart.
colors:
  canvas: "#e9ede8"
  surface: "#f3f5f1"
  surface-raised: "#fafbf9"
  surface-sunken: "#dee4dc"
  hairline: "#c6cfc3"
  hairline-strong: "#98a794"
  contour: "#d3dbd0"
  ink: "#1c2b26"
  ink-muted: "#4e6159"
  ink-faint: "#5b6a63"
  route: "#d94b10"
  route-deep: "#b03c06"
  route-ink: "#261003"
  pine: "#3c7d4e"
  pine-deep: "#2b6039"
  pine-ink: "#0d2114"
  glacier: "#4f8fae"
  glacier-deep: "#235f7e"
  danger: "#b3261e"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.01em"
  altitude:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.01em"
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Barlow, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.09em"
  mono:
    fontFamily: "Chivo Mono, monospace"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.12em"
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.route}"
    textColor: "{colors.route-ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  button-small-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  plate:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
  plot-check-done:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.surface-raised}"
    rounded: "{rounded.none}"
    size: "32px"
---

# Design System: Adhyayan OS

## Overview

**Creative North Star: "The Expedition Atlas"**

The app is one survey atlas: every page is a numbered sheet (01–06) of the same chart. Light mode is the day chart — cool glacier paper over a faint topographic contour ground — and dark mode is the night bivouac chart, the same sheet re-inked in pine-black under a headlamp. The same tokens carry both; `.dark` only re-inks them. Everything sits on square-cornered ruled plates that share hairlines like a map's neatlines, and data reads as a surveyor's chart table, not a pile of metric cards. The world explicitly refuses the dark card-grid fitness dashboard: no hero-metric tiles, no rings, no single neon accent.

Three overlay inks each hold one job: route orange means *act now / today / due / the line you're on*; pine green means *secured / done / a camp made*; glacier blue means *water and informational overlays*. Completion everywhere is the same gesture — a pennant waypoint flag planted with the `plant-in` drop-and-settle animation.

**Key Characteristics:**
- One chart, many sheets: every page opens with the same masthead grammar (condensed title, mono sheet-number · date coordinate).
- Square corners and single hairlines everywhere; rows share rules instead of owning boxes.
- Condensed altitude numerals, always tabular; tracked mono for coordinates and marginalia.
- Flat paper surfaces over a fixed contour-line ground; one real shadow in the whole app (the modal annex).
- Done = a planted flag, identically across habits, to-dos, and calendar.

## Colors

A cool glacier-paper neutral field carrying three saturated overlay inks, each with a single semantic job.

### Primary
- **Route Orange** (`route` #d94b10, dark #ff6d2e): the acting ink — today markers, due states, active nav, primary buttons, focus rings, carets, selection, progress toward a target. `route-deep` (#b03c06 / #ff8a55) for small tracked text on paper; `route-ink` (#261003) for text on a route-filled surface.

### Secondary
- **Pine Green** (`pine` #3c7d4e, dark #57a56e): the secured ink — completed habits, done tasks, met targets, planted flags. `pine-deep` and `pine-ink` mirror the route variants.

### Tertiary
- **Glacier Blue** (`glacier` #4f8fae, dark #5f9fc0): water intake and informational overlays only.
- **Danger Red** (`danger` #b3261e, dark #ff6459): overshoot and destructive actions.

### Neutral
- **Glacier Paper** (`canvas` #e9ede8, dark #0f1614): the page ground, always under the fixed SVG contour pattern.
- **Sheet Surface** (`surface` #f3f5f1, dark #151f1c): plate fill; `surface-raised` for hover/modal paper, `surface-sunken` for pressed states, gauges' empty track, and inset fields.
- **Hairline** (`hairline` #c6cfc3, dark #26332e): the universal 1px rule (set as the global default border color); `hairline-strong` (#98a794 / #3c4d45) for emphasized rules, underline fields, and outlined buttons.
- **Ink** (`ink` #1c2b26, dark #e6ece6): primary text; `ink-muted` for secondary text and labels; `ink-faint` for coordinates, empty states, and inactive icons.

### Named Rules
**The Three Inks Rule.** Route acts, pine secures, glacier is water. An accent never borrows another ink's job, and no fourth accent exists.
**The Re-Ink Rule.** Dark mode never introduces new tokens — the `.dark` block re-inks the same names (accents brighten, paper deepens). New components must theme through the tokens only.

## Typography

**Display Font:** Barlow Condensed (sans-serif fallback) — weights 500/600/700
**Body Font:** Barlow (sans-serif fallback) — weights 400/500/600
**Label/Mono Font:** Chivo Mono — weights 400/500

**Character:** A surveyor's chart voice — tall condensed mastheads and altitude figures, quiet workmanlike body text, and tightly tracked mono for coordinates and marginalia.

### Hierarchy
- **Sheet Title / Display** (`.sheet-title`: Barlow Condensed 600, 2rem page mastheads / 1.25rem modal titles, line-height 1): the chart masthead voice; every page and overlay opens with it.
- **Altitude** (`.altitude`: Barlow Condensed 600, 1.6rem in station rows up to 3rem in the log input, tabular-nums): all large data figures. Never render a big number in Barlow or the mono.
- **Body** (Barlow 400–500, 0.875rem): notes, list content, nav labels.
- **Map Label** (`.map-label`: Barlow 600, 11px, 0.09em tracking, uppercase, ink-muted): station names, plate headings, marginalia caps.
- **Coordinates** (Chivo Mono 400, 10–11px, 0.08–0.16em tracking, usually uppercase): sheet numbers, dates, targets, annotations like `SHEET 01 · 08 AUG 2026`.

### Named Rules
**The One Heading Rule.** The map-label IS the plate's heading. Never stack a second heading, kicker, or eyebrow above or below it.
**The Tabular Figures Rule.** All numerals in tables, gauges, and altitude figures are tabular (`font-variant-numeric: tabular-nums`); columns of numbers must not shimmy.

## Layout

Pages are centered sheets (`max-w-[1160px]`, 16px padding on phone, 32px on desktop) opened by the shared masthead: condensed title left, mono coordinate line top-right, one hairline rule beneath (SheetHeader). Desktop navigation is a fixed 224px "map legend" column on the left; on the phone it becomes a fixed bottom legend bar (60px min touch height, blurred `surface/95` backdrop) and content gains `pb-24` clearance.

Data lives in chart tables: one `.plate` whose rows are separated by `divide-y divide-hairline`, each row an aligned grid (label / reading / gauge / annotation on desktop, stacked to two lines on the phone). Sidebars are stacked plates with `space-y-4`. The spacing rhythm is a 4px grid used mostly at 8/12/16/20/32; plate interior padding is 16–20px, row padding ~14px × 12px. Progress gauges are 3px-tall bars on a `surface-sunken` track. The contour-ground background is `background-attachment: fixed`, so plates appear to slide over the terrain on scroll.

## Elevation & Depth

Flat by doctrine. Depth is conveyed tonally — `surface-sunken` for pressed/inset, `surface-raised` for hover and overlay paper — plus the single global hairline. Exactly one real shadow exists: the modal annex.

### Shadow Vocabulary
- **Annex shadow** (`box-shadow: 0 16px 48px -16px rgba(10,20,16,0.5)`): only on SheetModal, over an `ink/45` scrim.

### Named Rules
**The One Shadow Rule.** No component other than the modal annex casts a shadow. Hover and hierarchy are tonal (surface steps), never lifted.

## Shapes

Square corners everywhere — the neatline geometry of a ruled chart. `border-radius: 0` on plates, buttons, inputs, checks, and gauges; the only radius in the system is the 1px softening on the `:focus-visible` outline. Borders are single 1px hairlines; dashed hairline-strong borders mark open/unclaimed plots (the unchecked PlotCheck). Iconography is a hand-drawn stroke SVG set (1.5–1.6px strokes, round caps, `currentColor`) — never an icon-font or package glyph. The signature silhouette is the pennant waypoint flag: a staff with a notched pennant.

## Components

### Buttons
- **Shape:** hard square (0px radius); no shadows.
- **Primary:** route-filled with `route-ink` text, Barlow 600, ~12px vertical padding, full-width in modals ("Log it").
- **Secondary:** transparent with a 1px `hairline-strong` border, `ink-muted` text, Barlow 500.
- **Small action:** outlined `hairline-strong`, 12px text, `px-3 py-1.5` ("Arrange sheet").
- **Hover / Active:** text darkens to ink on hover; press is `active:scale-[0.98]` or a tonal step to `surface-sunken`. Focus is the global 2px route outline, 2px offset.

### Cards / Containers (Plates)
- **Corner Style:** square.
- **Background:** `surface`; hover rows step to `surface-raised`, pressed to `surface-sunken`.
- **Border:** one 1px `hairline`; rows inside share rules via `divide-y` instead of nesting boxes.
- **Shadow Strategy:** none (see The One Shadow Rule).
- **Internal Padding:** 16px (`p-4`), 20px in modals.

### Inputs / Fields
- **Style:** two idioms — underline fields (transparent background, `hairline-strong` bottom rule, altitude numerals for number entry with a mono unit suffix) and inset fields (`surface-sunken` fill, 1px hairline, square).
- **Focus:** route caret plus the global route focus-visible outline; checkboxes/radios use `accent-color: route`.
- **Placeholder / Empty:** `ink-faint`; empty readings render as `– –` with a mono `TAP TO LOG` prompt in `route-deep`.

### Navigation
- **Desktop legend column:** app title in sheet-title, `EXPEDITION ATLAS` mono strapline; items are Barlow 500 14px with a drawn icon and a mono sheet number (01–06). Active = `surface-sunken` row, route icon, `route-deep` number; hover = `surface-raised` + ink.
- **Phone legend bar:** icon over 10px label; active gets a route icon and a 2px route tick at the top edge of the item.

### Station Row (signature)
One line of the chart table: map-label name, altitude reading with mono unit, 3px progress gauge (route while in progress, pine when met, glacier for water, danger on overshoot), mono annotation. Tappable stations hover to `surface-raised` and press to `surface-sunken`.

### Waypoint Flag & PlotCheck (signature)
The unified completion mark. PlotCheck is the world's checkbox: a square plot, dashed `hairline-strong` on `surface-sunken/40` while open; pine-filled with a `surface-raised` WaypointFlag when secured, always entering with `plant-in`.

### SheetModal (signature)
The atlas's only overlay: bottom sheet on the phone, centered 26rem plate on desktop. `surface-raised` paper, hairline border, the annex shadow, sheet-title header with a drawn X close glyph, entering with `sheet-enter` (200ms translate-up fade). All dialogs and quick-log inputs route through it.

## Do's and Don'ts

### Do:
- **Do** open every page with the SheetHeader masthead and a mono `SHEET NN · DATE` coordinate line.
- **Do** render every completion as the WaypointFlag planted with `plant-in` (360ms, `cubic-bezier(0.16, 1, 0.3, 1)`), and every overlay through SheetModal.
- **Do** set all large figures in `.altitude` (Barlow Condensed 600, tabular) with mono unit suffixes.
- **Do** theme exclusively through the CSS custom properties so `.dark` re-inks everything for free.
- **Do** keep motion to the two named animations plus small transform/color transitions, all guarded by the `prefers-reduced-motion` reset.

### Don't:
- **Don't** round a corner, add a card shadow, or float a metric in its own hero tile — the refused world is the dark card-grid dashboard with rings and one neon accent.
- **Don't** let an ink moonlight: route never marks "done", pine never marks "act", glacier never leaves water/info.
- **Don't** import icon packages or glyph fonts; icons are drawn stroke SVGs on `currentColor`.
- **Don't** pair a map-label with a second heading, kicker, or eyebrow.
