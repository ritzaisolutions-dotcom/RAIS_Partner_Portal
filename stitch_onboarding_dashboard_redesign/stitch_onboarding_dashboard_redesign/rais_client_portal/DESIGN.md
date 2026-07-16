---
name: RAIS Client Portal
colors:
  surface: '#fff8f3'
  surface-dim: '#e2d9ce'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2e7'
  surface-container: '#f6ece1'
  surface-container-high: '#f1e7dc'
  surface-container-highest: '#ebe1d6'
  on-surface: '#1f1b14'
  on-surface-variant: '#4c463f'
  inverse-surface: '#353028'
  inverse-on-surface: '#f9efe4'
  outline: '#7d766e'
  outline-variant: '#cec5bc'
  surface-tint: '#645d56'
  primary: '#1a1610'
  on-primary: '#ffffff'
  primary-container: '#2f2a24'
  on-primary-container: '#999189'
  inverse-primary: '#cec5bc'
  secondary: '#a83905'
  on-secondary: '#ffffff'
  secondary-container: '#fc7642'
  on-secondary-container: '#631d00'
  tertiary: '#061a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#19300b'
  on-tertiary-container: '#7e9a69'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ebe1d7'
  primary-fixed-dim: '#cec5bc'
  on-primary-fixed: '#1f1b15'
  on-primary-fixed-variant: '#4c463f'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59b'
  on-secondary-fixed: '#380d00'
  on-secondary-fixed-variant: '#812900'
  tertiary-fixed: '#cdecb5'
  tertiary-fixed-dim: '#b2d09b'
  on-tertiary-fixed: '#0a2101'
  on-tertiary-fixed-variant: '#354d25'
  background: '#fff8f3'
  on-background: '#1f1b14'
  surface-variant: '#ebe1d6'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system for the RAIS Client Portal is built upon a foundation of editorial elegance and industrial precision. It targets a professional B2B audience—investors, stakeholders, and partners—who require clarity, speed, and a sense of established authority. 

The visual style is **High-Contrast Modernism**. It rejects gradients and soft shadows in favor of crisp boundaries, significant whitespace, and a sophisticated "paper-like" tactile quality. By pairing a high-contrast serif for headers with a neutral, systematic sans-serif for data, the UI evokes the feeling of a premium financial broadsheet reimagined for a digital workspace. The primary emotional response should be one of disciplined trust and architectural stability.

## Colors
The palette is rooted in earthen, sophisticated tones that diverge from standard "SaaS Blue." 

- **Charcoal (#2F2A24):** Used for primary text, deep-tone backgrounds, and critical UI anchors. It provides the "ink" in our editorial aesthetic.
- **Orange (#EC6A37):** The sole action color. Reserved for primary buttons, active states, and critical notifications. Use sparingly to maintain its impact.
- **Linen (#FBF8F3) & Linen Soft (#F5F0E8):** These form the "paper" of the interface. Linen is the base page color, while Linen Soft is used for inset modules and secondary containers to create subtle depth without shadows.
- **Stone (#7B746B):** Used for secondary text, borders, and disabled states.
- **Sage (#789464) & Dark Pistachio (#3C5A2A):** Used specifically for positive trends, growth metrics, and "complete" statuses, reinforcing a sense of organic, healthy progress.

## Typography
The typographic hierarchy creates a "Magazine-to-Data" transition. 

- **Headlines (Playfair Display):** Should be set with tight letter-spacing. Use for page titles, section headers, and high-level metric summaries. 
- **Body & Data (Inter):** Chosen for its exceptional legibility in dense tables and financial reports. 
- **Labels:** Always use Inter. Small labels should be set in semi-bold with slight tracking (0.05em) and uppercase to distinguish them from body narrative.

Avoid using Playfair Display for functional elements like buttons or navigation links; keep the serif reserved for "content" to maintain its prestige.

## Layout & Spacing
This design system utilizes a **Fixed Grid** philosophy for desktop to maintain the editorial "column" feel. 

- **Grid:** A 12-column grid with 24px gutters.
- **Rhythm:** All spacing (padding, margins) must be increments of 8px. 
- **Density:** Use generous padding within cards (32px or 40px) to allow the professional content to breathe. 
- **Responsiveness:** On mobile, margins shrink to 16px. Cards should stack vertically, and horizontal scrolling is permitted only for large data tables. 
- **Alignment:** Text-heavy sections should follow a strict left-alignment rule; center-alignment is prohibited to maintain the structured, architectural look.

## Elevation & Depth
In alignment with the high-contrast B2B aesthetic, this system avoids traditional drop shadows. Depth is achieved through **Tonal Layering** and **Structural Outlines**.

- **Level 0 (Base):** Linen (#FBF8F3).
- **Level 1 (Cards/Modules):** White (#FFFFFF) or Linen Soft (#F5F0E8) with a 1px solid border in Stone (#7B746B) at 30% opacity.
- **Interaction:** No "lifting" effect on hover. Instead, use a subtle background color shift (e.g., from White to Linen Soft) or a thickness increase in the border.
- **Dividers:** Use 1px solid lines in Stone (#7B746B) to separate content sections, echoing the look of a technical ledger.

## Shapes
To reflect the precision of the portal, shapes are kept disciplined and geometric. 

- **Corners:** Use a consistent 4px (Soft) radius for buttons, input fields, and cards. This provides just enough softness to feel modern without losing the "institutional" rigidity of a professional portal.
- **Icons:** Use 2px stroke weights. Icons should be functional and literal, avoiding overly rounded or "bubbly" styles.

## Components
- **Buttons:** 
  - *Primary:* Solid Charcoal or Orange, white text, 4px radius. No shadows.
  - *Secondary:* Transparent background, 1px Charcoal border.
- **Input Fields:** 
  - Background: White. Border: 1px Stone. On focus, the border changes to Charcoal (not Orange) to keep the focus professional.
- **Chips/Tags:** 
  - Use for status (e.g., "Active" in Sage, "Pending" in Stone). Use a light tinted background of the color with Dark Pistachio or Charcoal text.
- **Cards:** 
  - Always have a 1px border. No shadows. Header sections within cards should be separated by a 1px horizontal divider.
- **Data Tables:** 
  - High-density. Rows are separated by 1px Stone lines. Headers are set in Inter Label-SM (Uppercase). Alternate row striping is permitted using Linen Soft.
- **Navigation:** 
  - Sidebar navigation uses Linen Soft background to clearly distinguish the "controls" from the "canvas."