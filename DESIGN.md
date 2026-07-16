---
name: Alex Meyer-Gleaves Blog
description: A bold cyberpunk-leaning technical blog designed for trust, clarity, and high-signal reading.
colors:
  neon-accent-light: "#218676"
  neon-accent-dark: "#41d1aa"
  page-bg-light: "#f8fafc"
  page-bg-dark: "#111827"
  surface-light: "#f9fafb"
  surface-dark: "#1f2937"
  border-light: "#e5e7eb"
  border-dark: "#374151"
  text-primary-light: "#111827"
  text-primary-dark: "#ffffff"
  text-secondary-light: "#4b5563"
  text-secondary-dark: "#d1d5db"
  text-muted-light: "#6b7280"
  text-muted-dark: "#9ca3af"
typography:
  display:
    fontFamily: "Nunito, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
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
  lg: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
components:
  button-interactive:
    backgroundColor: "{colors.border-light}"
    textColor: "{colors.text-secondary-light}"
    rounded: "{rounded.sm}"
    padding: "0.5rem"
  button-interactive-hover:
    backgroundColor: "#d1d5db"
    textColor: "{colors.text-secondary-light}"
    rounded: "{rounded.sm}"
    padding: "0.5rem"
  button-interactive-dark:
    backgroundColor: "{colors.border-dark}"
    textColor: "{colors.text-secondary-dark}"
    rounded: "{rounded.sm}"
    padding: "0.5rem"
  chip-tag:
    backgroundColor: "{colors.border-light}"
    textColor: "{colors.text-secondary-light}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.5rem"
  nav-link:
    textColor: "{colors.text-secondary-light}"
    typography: "{typography.label}"
  nav-link-accent:
    textColor: "{colors.neon-accent-light}"
    typography: "{typography.label}"
---

# Design System: Alex Meyer-Gleaves Blog

## 1. Overview

**Creative North Star: "The Neon Field Manual"**

This system pairs cyberpunk energy with engineering-grade readability. It is expressive where identity matters (accent moments, banner treatment, link interactions) and disciplined where comprehension matters (body copy contrast, predictable spacing, stable navigation patterns).

The visual language should feel technically fluent, not performative: bold enough to be memorable, quiet enough to keep long-form reading frictionless. Motion remains lightweight and functional (theme transitions, hover feedback), and the interface prioritizes legibility and information hierarchy over decorative noise.

This system explicitly rejects generic SaaS dashboard aesthetics, corporate consulting templates, and any redesign direction that erases the existing cyberpunk identity and visual energy.

**Key Characteristics:**
- High-contrast reading surfaces with dark/light parity.
- Neon accent used as signal, not as paint.
- Rounded interactive micro-surfaces for toggles, tags, and pagination controls.
- Friendly geometric heading voice over pragmatic body typography.
- Content-first rhythm optimized for technical scanning and depth reading.

## 2. Colors

The palette is a restrained cyberpunk system: slate/gray structural neutrals with a green-cyan neon accent reserved for moments of emphasis.

### Primary
- **Signal Teal** (#218676): Primary accent in light mode for links and gradient text emphasis.
- **Night Neon** (#41d1aa): Primary accent in dark mode for hover and highlighted interactive moments.

### Secondary (optional; omit if the project has only one accent)
- **No secondary accent by design**: The system intentionally preserves a single accent family to keep emphasis sharp.

### Neutral
- **Frosted Slate** (#f8fafc): Main light-mode page canvas.
- **Midnight Slate** (#111827): Main dark-mode page canvas.
- **Panel Mist** (#f9fafb) and **Panel Charcoal** (#1f2937): Elevated surfaces and overlays.
- **Structural Line** (#e5e7eb / #374151): Borders, dividers, and control boundaries in light/dark.
- **Ink Core** (#111827 / #ffffff): Primary text for long-form readability.
- **Ink Support** (#4b5563 / #d1d5db): Secondary text, metadata, and helper copy.

### Named Rules (optional, powerful)
**The Rare-Neon Rule.** Accent color appears only for intent-bearing elements (key links, emphasis gradients, active pagination), never as broad decorative fill.

**The Read-First Rule.** Body text always sits on high-contrast neutral fields; mood never outranks legibility.

## 3. Typography

**Display Font:** Nunito (with sans-serif fallback)  
**Body Font:** Cabin (with sans-serif fallback)  
**Label/Mono Font:** Inconsolata (with monospace fallback for code)

**Character:** Approachable technical voice: rounded heading forms deliver personality, while body and code stacks keep documentation-style clarity and scan speed.

### Hierarchy
- **Display** (700, 2.25rem, 1.2): Hero and key section headings.
- **Headline** (700, 1.5rem, 1.3): Post list titles and high-priority sectional headings.
- **Title** (600, 1.25rem, 1.35): Subsection titles and medium-prominence callouts.
- **Body** (400, 1rem, 1.6): Paragraph content and primary reading text (target line length: 65-75ch where possible).
- **Label** (700, 0.875rem, 1.3): Navigation links, metadata labels, and compact controls.

### Named Rules (optional)
**The Dual-Voice Rule.** Headings carry identity; body copy carries trust. Do not swap these duties.

## 4. Elevation

Depth is primarily tonal, not shadow-driven. The system communicates layer changes through background shifts, borders, and contrast transitions, with minimal visual effects. This keeps the interface crisp and avoids faux-3D noise while still signaling interactivity.

### Shadow Vocabulary (if applicable)
- **No persistent shadow scale**: Shadows are intentionally absent from base components.

### Named Rules (optional)
**The Flat-by-Default Rule.** Components stay visually flat at rest; interaction feedback comes from color/contrast transitions before any depth effect.

## 5. Components

### Buttons
- **Shape:** Soft utility corners (6px / 0.375rem) for icon controls and action chips.
- **Primary:** Interactive controls use neutral backgrounds with clear icon/text contrast.
- **Hover / Focus:** Hover shifts to a stronger neutral tone; focus should maintain equivalent prominence to hover with visible keyboard affordance.
- **Secondary / Ghost / Tertiary (if applicable):** Navigation links behave like ghost buttons, inheriting body tone and activating through accent color.

### Chips (if used)
- **Style:** Tag chips use muted neutral surfaces with compact text sizing.
- **State:** Hover preserves readability while raising contrast; selected/filter semantics should align with accent usage.

### Cards / Containers
- **Corner Style:** Containers are mostly square or lightly rounded, depending on context.
- **Background:** Light/dark neutral panels anchor content without competing with text.
- **Shadow Strategy:** Tonal separation only; no decorative glass or heavy shadow.
- **Border:** Subtle 1px neutral borders define list and footer structure.
- **Internal Padding:** Uses an 8px/12px/16px scale (0.5rem / 0.75rem / 1rem) with larger section spacing at 24px (1.5rem).

### Inputs / Fields
- **Style:** Interactive controls use neutral backgrounds and rounded utility geometry.
- **Focus:** Focus treatment should be explicit and high-contrast in both themes.
- **Error / Disabled:** Disabled states reduce contrast while preserving readability; error states should remain consistent with the single-accent discipline plus semantic color overlays when introduced.

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.** Bold label-weight links with icon pairing, accent hover transitions, and a mobile menu panel that preserves the same visual vocabulary as desktop.

## 6. Do's and Don'ts

### Do:
- **Do** preserve the existing cyberpunk identity and visual energy while keeping body copy contrast at readable levels.
- **Do** use accent greens as signal moments, not full-surface decoration.
- **Do** keep interaction geometry and spacing consistent across toggles, tags, and pagination controls.
- **Do** maintain dark/light mode parity so hierarchy and clarity remain consistent in either theme.

### Don't:
- **Don't** drift into generic SaaS dashboard aesthetics.
- **Don't** adopt corporate consulting templates.
- **Don't** replace the current visual language with a neutral redesign that erases the existing cyberpunk identity and visual energy.
- **Don't** introduce side-stripe accent borders, gradient text-only gimmicks, or decorative glassmorphism patterns.
