---
name: NEXUS LABS
description: Digital product studio; the work as one territory you pan across.
colors:
  red: "#FF3831"
  red-lift: "#FF5A4F"
  hover-green: "#3FBF6B"
  hover-violet: "#7A5CFF"
  hover-cyan: "#00E5FF"
  ground: "#181616"
  ground-deep: "#110F0F"
  panel: "#221F1E"
  cream: "#FFFDDB"
  muted: "#B8B49C"
  rule: "rgba(255, 253, 219, 0.14)"
  rule-strong: "rgba(255, 253, 219, 0.3)"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(40px, 4.4vw, 56px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(22px, 1.75vw, 34px)"
    fontWeight: 400
    lineHeight: 1
  cta:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(19px, 1.12vw, 24px)"
    fontWeight: 400
    lineHeight: 1
  body-lead:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
  nav:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontSize: "clamp(12px, 0.8vw, 14px)"
    fontWeight: 500
    letterSpacing: "0.04em"
  section-label:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.04em"
  readout:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    fontFeature: "tnum"
  ticker:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.04em"
rounded:
  none: "0px"
  cta: "6px"
  ticker: "8px"
spacing:
  rule: "1px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "28px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.ground}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.red-lift}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-quiet-hover:
    backgroundColor: "{colors.panel}"
  header-cta:
    backgroundColor: "{colors.red}"
    textColor: "{colors.cream}"
    typography: "{typography.cta}"
    rounded: "{rounded.cta}"
    padding: "0 10px"
  header-cta-hover:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.red}"
  header-cell-link:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.cream}"
    typography: "{typography.nav}"
    padding: "0 12px"
  header-cell-link-active:
    textColor: "{colors.red}"
  input-field:
    backgroundColor: "{colors.ground-deep}"
    textColor: "{colors.cream}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
  readout-chip:
    textColor: "{colors.muted}"
    typography: "{typography.readout}"
    padding: "4px 8px"
  ticker-pill:
    textColor: "{colors.cream}"
    typography: "{typography.ticker}"
    rounded: "{rounded.ticker}"
    width: "min(440px, calc(100% - 32px))"
  grid-label:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ground}"
    padding: "10px 12px"
  drawer:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.cream}"
    padding: "32px 28px 56px"
    width: "min(440px, 100vw)"
---

# Design System: NEXUS LABS

## Overview

**Creative North Star: "Night Territory"**

The studio's work is one territory seen at night: a warm near-black ground ruled by a faint cream grid, with dozens of project clusters laid across it and bent through a barrel lens, as if viewed from above. The territory is never still: it drifts slowly and keeps the direction of the visitor's last drag. Where the pointer passes, the nearby rules glow red, and the cluster under it takes a red frame. The page is a map, not a brochure. The chrome is near-black, cream, and one red, so the project imagery carries the rest of the colour.

Structure is boxed. The header is three rows of cells on 1px cream rules (the rule colour shows through a 1px grid gap), and every panel, list, and gallery uses the same device: flat dark fields divided by hairlines. Corners are square except the two marked exceptions, the header CTA and the ticker pill. Depth comes from tone and the lens, never from shadows.

The header is the one place colour plays. Each new hover zone takes the next colour in a fixed cycle (green, red, violet, cyan), and that colour sweeps through the masked logo or mark, fills the tagline type, and draws the tagline rules in from the side the hover came from. Everywhere else the interface keeps to red for action. Type has three voices: Instrument Serif for the human lines (taglines, drawer titles, the CTA), Manrope for interface and prose, Roboto Mono for labels and measurements (uppercase nav, drawer section labels, coordinates, the ticker).

This world replaces the earlier "Keystone Night" (Deep Slate, Luminous Cyan) by user direction on 2026-11-10. The Keystone colours remain inside the logo files only; on the site the logo renders as a cream mask.

**Key Characteristics:**
- Warm near-black ground with cream hairline rules; colour belongs to the work and to the header's hover sweep.
- Red is the single action colour, used as a solid block or as a line.
- Three-row boxed header on 1px rules; header hover cycles green, red, violet, cyan as hard-edged sweeps.
- A drifting, lensed grid whose rules glow red near the pointer.
- Serif for the human lines, sans for interface, uppercase mono for labels and readouts.
- Flat surfaces; depth by tone, vignette, and lens.

## Colors

A warm near-monochrome night palette with one red for action and a four-colour hover cycle confined to the header.

### Primary
- **Signal Red** (red): the single action colour. It fills the header CTA block and drawer action buttons, the skip link, text selection, the default focus outline, form accent controls, the underline on text links, the square separators in the ticker, the text of a pressed nav cell, drawer section labels, the input focus border, and, in the grid shader, the hover frame around a cluster and the glow on rules near the pointer.
- **Red Lift** (red-lift): hover state of drawer action buttons only. Never a standalone fill.

### Secondary
- **Hover Cycle** (hover-green, red, hover-violet, hover-cyan): the colours the header steps through, one per new hover zone, in that order. They appear only as the header's transient sweep: the logo and mark masks, the tagline type fill, the tagline rules, and the nav label hover colour. Nothing at rest uses them.

### Neutral
- **Warm Night** (ground): the ground for the page, header cells, drawers, the grid shader, and the fallback list. Also the text colour on red action buttons and in the grid hover label card.
- **Deep Night** (ground-deep): a darker well for form inputs; the ticker uses it at 0.9 alpha over the grid. Coordinate readouts use Warm Night at 0.9 alpha.
- **Ember Panel** (panel): hover fill of the quiet button only.
- **Cream** (cream): primary text, nav labels at rest, drawer titles, lead paragraphs, the logo and mark masks at rest, the grid rules (drawn at about 0.16 strength in the shader), the hover label card, the CTA text at rest and its hover ground, and the focus ring on red blocks.
- **Muted Parchment** (muted): secondary text (drawer paragraphs, list metadata, readouts, optional-field notes).
- **Rule** (rule): every structural line: header cell gaps, drawer edges, list dividers, gallery gutters, readout borders.
- **Rule Strong** (rule-strong): borders that must read as controls: inputs, the ticker pill, the quiet button's inset ring, the drawer scrollbar.

### Named Rules
**The One Red Rule.** Red is the only action colour. It appears as a solid block or as a line (focus, link underline, pressed label, frame, glow). The hover cycle colours never mark an action or a state that persists.

**The Header Plays Rule.** The four-colour cycle lives only in the masthead and only while hovered. Outside the header, colour at rest is cream, muted, and red.

**The Hard Sweep Rule.** Colour moves as a hard-edged two-colour field sliding through a shape (a 50/50 hard stop, 700ms on cubic-bezier(0.77, 0, 0.175, 1)), never as a soft blend. Soft decorative gradients do not exist in this system; the only other gradient is the ticker's edge-fade mask.

**The Cream Mask Rule.** The logo and mark render as CSS masks of the logo SVGs filled with cream (or the sweep colour). The coloured Keystone SVGs are not placed on the site.

## Typography

**Display Font:** Instrument Serif (with Georgia, serif), self-hosted, weight 400 only
**Body Font:** Manrope Variable (with system-ui, sans-serif), self-hosted
**Label/Mono Font:** Roboto Mono (with ui-monospace, monospace), weights 400 and 500, self-hosted

**Character:** A condensed, slightly literary serif sets the human statements against a dense geometric sans for the interface. Uppercase Roboto Mono labels the structure and reads the measurements, so it sounds like instrument markings rather than prose.

### Hierarchy
- **Display** (Instrument Serif 400, clamp(40px, 4.4vw, 56px), 0.98, -0.01em): drawer titles only; balanced wrapping.
- **Headline** (Instrument Serif 400, clamp(22px, 1.75vw, 34px), 1): the two header taglines; hidden below 1100px.
- **CTA** (Instrument Serif 400, clamp(19px, 1.12vw, 24px), 1, no wrap): the header "Começar um projeto" block only; 20px on phones, 18px below 380px.
- **Body Lead** (Manrope 400, 17px, 1.6, Cream): the first paragraph of a drawer.
- **Body** (Manrope 400, 15px, 1.6, Muted Parchment, max 62ch): drawer prose and service lists. Inputs set at 16px weight 500 so phones do not zoom.
- **Label** (Manrope 700, 13px): form labels; drawer close button at 12px 700; project kind at 14px 700. Drawer action buttons are Manrope 14px 800; the grid label card is 14px 800 over 12px.
- **Nav** (Roboto Mono 500, clamp(12px, 0.8vw, 14px), 0.04em, uppercase): header nav and contact cells.
- **Section Label** (Roboto Mono 500, 12px, 0.04em, uppercase, Signal Red): drawer sub-heads ("O que construímos", "Fale com a gente"), each heading the content directly below it.
- **Readout** (Roboto Mono 400, 12px, tabular figures): X/Y coordinate readouts.
- **Ticker** (Roboto Mono 500, 12px, 0.04em, uppercase): the scrolling ticker only.

### Named Rules
**The Three Voices Rule.** Serif for statements (taglines, drawer titles, the header CTA), Manrope for interface controls and prose, Roboto Mono uppercase for labels and measurements. Mono never sets prose or drawer titles; the serif sets no control except the header CTA.

**The Heavy Small Rule.** Interface text in Manrope runs small and heavy (12 to 14px at 700 to 800) rather than large and light.

## Layout

The app is a fixed 100dvh grid: a header row (clamp(132px, 9.8vw, 192px); 112px on phones) over a stage that fills the rest of the screen. The page itself does not scroll; drawers and the no-WebGL fallback list scroll inside themselves.

The desktop header is a five-column boxed grid (minmax(180px, 11vw) | flexible | minmax(320px, 27vw) | flexible | minmax(180px, 11vw)) on three equal rows. Left column: Sobre/Projetos cells in row 1, the mark spanning rows 2-3. Second and fourth columns: blank cells in rows 1 and 3 with the serif taglines in row 2, so each tagline sits between two rules. Centre: the logo spanning all three rows. Right column: contact links in row 1, the CTA spanning rows 2-3 inside an 8px inset. Cells sit on a 1px gap with the rule colour behind, so the rules are the gaps.

The header is split into three hover zones (left: nav and mark; logo; right: contact and CTA). The zone decides which taglines light up and from which side their rules draw in: from the left zone, the left tagline lights from the outside in; from the right zone, the right tagline; from the logo, both light outward from the centre.

The stage is full-bleed WebGL: the project grid in 3x2 tile clusters on 176x118px cells, odd cluster rows shifted, bent by a barrel lens and faded to a darker vignette at the edges. Coordinate readouts sit in the top corners (16px from the top, 20px from the sides) and the ticker sits bottom centre (22px up, at most 440px wide).

Drawers are fixed 440px panels (full width on phones) that open under the header: About and the project list from the left, a project and contact from the right. Body padding is 32px/28px/56px (24px/20px/48px on phones), with a sticky close bar on top.

Breakpoints: at 1100px the taglines and blank cells drop and the logo spans the middle three columns; at 760px the header becomes three columns on two rows (44px plus the remainder), nav over the left-aligned 150px logo, contact over the CTA, the mark hides, and project galleries go to one column; at 380px the logo and CTA shrink further.

Spacing rhythm: 1px structural gaps, then 8 / 12 / 16 / 28 / 32px, with list rows at 12px vertical padding and form fields 18px apart.

## Elevation & Depth

The system is flat. No element uses a drop shadow. Depth comes from three sources: tonal steps (Deep Night wells, Ember Panel hover), translucent dark plates (readouts and ticker at 0.9 alpha over the grid), and the grid's own optics (barrel lens, edge vignette to 60% ground, clusters at 0.9 brightness at rest, with unhovered clusters dimmed to 0.62 while one is hovered). Light in the grid is drawn, not cast: the red rule glow near the pointer and the red cluster frame. The only `box-shadow` value is an inset rule standing in for a border.

### Shadow Vocabulary
- **Quiet ring** (`box-shadow: inset 0 0 0 1px rgba(255, 253, 219, 0.3)`): border of the quiet button.

### Named Rules
**The No Lift Rule.** Nothing floats on a shadow. Separate surfaces with a hairline or a tonal step.

## Shapes

Square corners (0px) for header cells, drawer buttons, inputs (border-radius reset to 0), drawers, readouts, gallery images, and grid tiles. Two elements are rounded: the header CTA block (6px), which sits inset 8px inside its cell, and the ticker pill (8px). Borders are always 1px hairlines; galleries and the header build their rules from a 1px grid gap over the rule colour. Small marks are geometric squares: the 5px red square between ticker items and the CSS-drawn X (two 1.5px bars) in the close button.

## Components

### Buttons
Solid, square, and heavy.
- **Shape:** square (0px), 48px minimum height.
- **Primary:** Signal Red block, Warm Night text, Manrope 14px 800, 0 22px padding.
- **Hover / Focus:** hover lifts to Red Lift (160ms); press scales to 0.97 on cubic-bezier(0.23, 1, 0.32, 1); focus is a 2px cream outline offset 3px.
- **Quiet:** transparent with a 1px Rule Strong inset ring and cream text; hover fills Ember Panel. Shown only when a second submit option exists.

### Header CTA
- **Style:** Signal Red block filling its cell inside an 8px inset (6px on phones), 6px radius, cream serif label (CTA type), no wrap.
- **Hover:** the red layer wipes away to the right (clip-path, 520ms on cubic-bezier(0.77, 0, 0.175, 1)) to reveal cream, and the label turns red (300ms). Press scales to 0.97; focus is the cream outline offset 3px. The CTA's hover does not use the hover cycle.

### Header Cells
- **Style:** Warm Night cells on 1px rule gaps; nav labels in uppercase Roboto Mono, cream.
- **States:** hover turns the label the current hover-cycle colour (200ms, fine pointers only); pressed (drawer open) turns it Signal Red. No fill change.
- **Logo and mark:** cream masks; entering their zone slides the current hover colour through them left to right (700ms). Taglines fill with the same colour and their top and bottom rules (1px) scale in from the hover side.

### Inputs / Fields
- **Style:** Deep Night well, 1px Rule Strong border, square, 12px 14px padding, Manrope 16px 500 cream text. Labels stacked above (Label type) with an 8px gap; optional notes in Muted Parchment.
- **Focus:** border shifts to Signal Red (160ms), no outline.

### Drawers
- **Style:** Warm Night panel with a 1px rule on its inner edge, 440px wide, sliding in from its side over 420ms on cubic-bezier(0.32, 0.72, 0, 1).
- **Structure:** sticky close bar (right-aligned "Fechar" cell with a rule on its left edge, 44px high), then a serif display title that receives focus, lead paragraph, body, and red mono section labels over their content.
- **Lists:** rows separated by rules top and bottom, 12px vertical padding; project rows have a 96x64 thumbnail that scales to 1.03 on hover.
- **Gallery:** two-column image grid on 1px rule gaps, first and last image full width, 3:2 crops.

### Readouts and Ticker
- **Coordinate readout:** Warm Night plate at 0.9 alpha, 1px rule, Mono 12px Muted Parchment with tabular figures.
- **Ticker pill:** Deep Night at 0.9 alpha, 1px Rule Strong, 8px radius, uppercase Mono, edges faded with a horizontal mask, looping at 30s linear and pausing on hover; red 5px squares separate items. Hidden when the fallback list shows.

### Project Grid (signature)
A full-bleed WebGL plane: 3x2 tile clusters on a Warm Night ground with cream rules, bent by a barrel lens and vignetted. It drifts continuously (about 0.45px per frame); drag or flick pans it with momentum that eases back into the drift, and the drift takes the direction of the last drag. Rules within roughly 340 world px of the pointer glow red and thicken slightly. Hovering a cluster dims the others to 0.62 and draws a red frame inside its edge, and a cream label card (project name 14px 800, kind 12px) follows the pointer. Click opens the project drawer. The entrance is the lens settling from 1.55x to rest over 1400ms while tiles fade in. Under reduced motion it starts at rest and does not drift. Without WebGL, an auto-fill list of 260px project cards on rules replaces it.

## Do's and Don'ts

### Do:
- **Do** build structure from 1px cream rules (rgba(255, 253, 219, 0.14)) and flat Warm Night fields; use Rule Strong only for control borders.
- **Do** keep Signal Red as the one action colour, as a solid block or as a line.
- **Do** confine the green, red, violet, cyan hover cycle to the masthead, as hard-edged sweeps on cubic-bezier(0.77, 0, 0.175, 1) at about 700ms.
- **Do** render the logo and mark as cream masks.
- **Do** set statements in Instrument Serif, interface in Manrope at 12 to 14px heavy weights, and labels and measurements in uppercase Roboto Mono.
- **Do** keep corners square; the header CTA (6px) and the ticker pill (8px) are the only rounded elements.
- **Do** animate drawers on cubic-bezier(0.32, 0.72, 0, 1) and controls on cubic-bezier(0.23, 1, 0.32, 1) at about 160ms, and stop transitions, the ticker, and the grid drift under prefers-reduced-motion.
- **Do** gate hover styles behind `(hover: hover) and (pointer: fine)`.

### Don't:
- **Don't** add drop shadows or floating cards; separate with a hairline or a tonal step.
- **Don't** use the hover-cycle colours outside the header or for a persistent state.
- **Don't** use soft or decorative gradients; colour changes as a hard-edged sweep.
- **Don't** place the coloured Keystone logo files or the retired Deep Slate grounds on the site, or bring cyan back as an action colour (it lives only in the hover cycle).
- **Don't** set prose or drawer titles in Roboto Mono, or controls other than the header CTA in Instrument Serif.
- **Don't** round drawer buttons, inputs, cells, or drawers.
