---
name: Alex Meyer-Gleaves Blog
description: A neon-industrial technical blog balancing expressive cyberpunk styling with disciplined long-form readability.
colors:
  signal-amber: "#de8b3a"
  signal-teal: "#3fd3c6"
  page-bg-light: "#f3f8f9"
  page-bg-dark: "#071822"
  panel-light: "#f6fafb"
  panel-dark: "#081b24"
  border-light: "#7ba2ac"
  border-dark: "#1f4856"
  text-primary-light: "#163642"
  text-primary-dark: "#c2dbe0"
  text-secondary-light: "#456a76"
  text-secondary-dark: "#7fa7b0"
  code-bg-light: "#dce7ea"
  code-bg-dark: "#102833"
typography:
  display:
    fontFamily: "Nunito, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Cabin, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Nunito, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.3
  code:
    fontFamily: "Inconsolata, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  xxl: "2rem"
components:
  control-base:
    backgroundColor: "#eff6f8"
    textColor: "#10303b"
    rounded: "{rounded.sm}"
    padding: "0.5rem"
  control-base-dark:
    backgroundColor: "#0d2530"
    textColor: "#b6d7dc"
    rounded: "{rounded.sm}"
    padding: "0.5rem"
  signal-chip:
    backgroundColor: "#f6ecdf"
    textColor: "#975815"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
  signal-chip-dark:
    backgroundColor: "#12333d"
    textColor: "#8ce0d8"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
  nav-link:
    textColor: "#123744"
    typography: "{typography.label}"
  nav-link-dark:
    textColor: "#b8d9de"
    typography: "{typography.label}"
---

# Design System: Alex Meyer-Gleaves Blog

## 1. Overview

**Creative North Star: "The Neon Field Manual"**

This system now reads as neon-industrial rather than minimal cyber: dual accent signals (amber + teal), layered atmospheric backgrounds, and scanner-like interaction effects shape the visual voice. The site keeps its editorial utility, but the styling has become more cinematic and tactile.

The interface still prioritizes technical readability through strong foreground/background contrast, stable type scale, and restrained body copy rhythm. Motion is intentional and state-driven (scanner sweeps, pulse halos, hover lifts), with a reduced-motion fallback that collapses animation to near-instant transitions.

This system explicitly rejects generic SaaS dashboard aesthetics, corporate consulting templates, and any redesign direction that erases the existing cyberpunk identity and visual energy.

**Key Characteristics:**
- Dual-accent signal language (amber and teal) used as semantic emphasis rails.
- Atmosphere layers (radial glows + subtle grid field) framing content without reducing legibility.
- Scanner and pulse interaction motifs on controls and navigation.
- Rounded utility controls with stronger panel geometry (`rounded-2xl`) for cards/surfaces.
- Code and table theming integrated into the same cybernetic palette.

## 2. Colors

The palette is now a committed cyberpunk duo: amber warmth and teal coolness balanced over deep blue-slate neutrals.

### Primary
- **Signal Amber** (#de8b3a): Warm emphasis for active highlights, icon accents, and interaction glow.
- **Signal Teal** (#3fd3c6): Cool emphasis for dark-mode focus, hover treatments, and motion glints.

### Neutral
- **Mist Field** (#f3f8f9): Light-mode base canvas.
- **Deep Bay** (#071822): Dark-mode base canvas.
- **Panel Glass** (#f6fafb / #081b24): Surface containers, nav bars, and footer blocks.
- **Structural Rail** (#7ba2ac / #1f4856): Border and edge framing in light/dark.
- **Ink Main** (#163642 / #c2dbe0): Primary reading text.
- **Ink Support** (#456a76 / #7fa7b0): Secondary metadata and support text.
- **Code Surfaces** (#dce7ea / #102833): Inline code chip backgrounds.

### Named Rules (optional, powerful)
**The Dual-Signal Rule.** Amber and teal must appear as paired signals, never as competing decorative floods.

**The Read-First Rule.** Body text remains high-contrast against neutral fields; atmosphere layers never degrade readability.

## 3. Typography

**Display Font:** Nunito (with sans-serif fallback)  
**Body Font:** Cabin (with sans-serif fallback)  
**Label/Mono Font:** Inconsolata (with monospace fallback for code)

**Character:** Technical but expressive: strong, friendly heading weight with practical body/coding typography for deep reading.

### Hierarchy
- **Display** (800, 2.5rem, 1.2): Hero identity and major section headings.
- **Headline** (700, 1.5rem, 1.3): Post list titles and high-priority sectional headings.
- **Title** (600, 1.25rem, 1.35): Subsection titles and medium-prominence callouts.
- **Body** (400, 1rem, 1.6): Paragraph content and primary reading text (target line length: 65-75ch where possible).
- **Label** (700, 0.875rem, 1.3): Navigation links, metadata labels, and compact controls.

### Named Rules (optional)
**The Dual-Voice Rule.** Headings carry identity; body copy carries trust. Do not swap these duties.

## 4. Elevation

Depth is hybrid: tonal layering plus controlled glow/shadow stacks. Surfaces use translucent backgrounds and soft blur, while controls gain depth only during interaction through micro-lift and pulse effects.

### Shadow Vocabulary (if applicable)
- **Ambient Surface** (`0 20px 45px rgba(6,24,37,0.08)`): Light-mode panel depth for cards and container surfaces.
- **Night Surface** (`0 26px 50px rgba(3,10,18,0.45)`): Dark-mode panel depth to separate content layers.
- **Interaction Halo** (`0 0 12px rgba(222,139,58,0.22)` / `0 0 14px rgba(63,211,198,0.24)`): Scanner/pulse feedback for interactive controls.

### Named Rules (optional)
**The Controlled-Glow Rule.** Glow is reserved for interaction and framing moments; persistent ambient haze must stay subtle.

## 5. Components

### Buttons
- **Shape:** Utility controls use compact rounded corners (6px / 0.375rem); signature CTA outlines use larger radii.
- **Primary:** `bg-interactive` buttons use layered neutral fills with high-contrast text and border rails.
- **Hover / Focus:** `cyber-scanner` sweep + micro-lift + ring focus treatment in accent color.
- **Secondary / Ghost / Tertiary (if applicable):** `neon-outline-btn` and nav links operate as ghost/signal controls with accent border or underline feedback.

### Chips (if used)
- **Style:** Tag and signal chips are rounded-full with amber/teal semantic tinting and high local contrast.
- **State:** Hover introduces subtle lift and background intensification; keyboard focus uses accent-colored rings.

### Cards / Containers
- **Corner Style:** Panels and cards use generous geometry (`rounded-2xl`) for container-level grouping.
- **Background:** Translucent light/dark panels (`surface-panel`, `cyber-card`) preserve context behind content.
- **Shadow Strategy:** Soft ambient shadows at rest with stronger hover shadows for card affordance.
- **Border:** Color-tinted neutral rails reinforce structure without hard edges.
- **Internal Padding:** Core panel spacing follows 20px-24px (`p-5`, `p-6`) with compact controls on 8px-12px.

### Inputs / Fields
- **Style:** Field-like controls inherit `bg-interactive` surface language.
- **Focus:** Always visible focus rings in amber/teal variants by theme.
- **Error / Disabled:** Disabled controls maintain legibility with lowered opacity; semantic states should layer over, not replace, the core interaction vocabulary.

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.** Navigation combines icon-led labels, scanner underlines, and a translucent/glow nav rail; mobile menu retains the same visual language with bordered panel treatment.

## 6. Do's and Don'ts

### Do:
- **Do** preserve the existing cyberpunk identity and visual energy while keeping body copy contrast at readable levels.
- **Do** use amber and teal as a coordinated dual-signal pair.
- **Do** keep scanner/pulse motion tied to interaction states, with reduced-motion parity.
- **Do** keep interaction geometry and spacing consistent across toggles, tags, pagination, and nav controls.
- **Do** maintain dark/light mode parity so hierarchy and clarity remain consistent in either theme.

### Don't:
- **Don't** drift into generic SaaS dashboard aesthetics.
- **Don't** adopt corporate consulting templates.
- **Don't** replace the current visual language with a neutral redesign that erases the existing cyberpunk identity and visual energy.
- **Don't** introduce side-stripe accent borders or hero-metric template scaffolding.
- **Don't** use decorative glow everywhere; concentrated signal moments are the point.
