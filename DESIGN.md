# Design System Specification: The Architectural Minimalist

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Architect."** 

Unlike generic dark modes that rely on heavy outlines and flat black fills, this system treats the interface as a physical workspace of layered, obsidian-like materials. We are moving beyond the "Notion-clone" aesthetic by introducing an editorial rigor—utilizing intentional asymmetry, extreme typographic contrast, and a "depth-first" layout philosophy. The goal is a high-utility "pro-tool" environment that feels as quiet and focused as a brutalist library. 

We break the "template" look by favoring breathing room over density. Every element must earn its place on the `surface`.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep neutrals, moving from the absolute void of `#000000` to the soft warmth of charcoal.

### The "No-Line" Rule
Standard 1px solid borders are prohibited for structural sectioning. To define a sidebar from a main content area, use a background shift from `surface` (#0e0e0e) to `surface-container-low` (#131313). Contrast is born from tonal shifts, not "drawn" lines.

### Surface Hierarchy & Nesting
Depth is achieved through a "Stacked Obsidian" approach. Containers must follow a logical physical elevation:
- **Base Layer:** `surface` (#0e0e0e)
- **Secondary Workspace:** `surface-container` (#191a1a)
- **Elevated Components (Cards/Modals):** `surface-container-high` (#1f2020)
- **Active/Hover States:** `surface-bright` (#2b2c2c)

### The "Glass & Gradient" Rule
To elevate the "pro-tool" feel, floating elements (Command Palettes, Popovers) should utilize `surface-container-highest` at 80% opacity with a `24px` backdrop-blur. 
*Note: Main CTAs should use a subtle linear gradient from `primary` (#c6c6c7) to `primary_dim` (#b8b9b9) at a 145° angle to create a metallic, machined finish.*

---

## 3. Typography
We utilize **Inter** as the sole typeface, relying on the variable weight axis to create an editorial hierarchy.

- **Display (display-lg to sm):** These are your "Statement" headers. Use `display-md` (2.75rem) with `-0.04em` letter-spacing for a tight, Swiss-design feel.
- **Headlines & Titles:** These define the "blocks" of the tool. Use `headline-sm` (1.5rem) for section starts to command attention without overwhelming the data.
- **Body (body-md):** The workhorse. Set at `0.875rem` with a generous line-height (1.6) to ensure long-form legibility.
- **Labels (label-sm):** Used for metadata. Always use `on_surface_variant` (#acabab) to ensure they sit back in the visual hierarchy compared to primary data.

---

## 4. Elevation & Depth
We replace traditional box-shadows with **Tonal Layering**.

- **The Layering Principle:** Place a `surface-container-lowest` (#000000) element inside a `surface-container` (#191a1a) area to create a "recessed" well for input fields or code blocks.
- **Ambient Shadows:** For high-elevation floating modals, use an extra-diffused shadow: `0 24px 48px rgba(0,0,0,0.5)`. The shadow must feel like a natural light obstruction, not a glow.
- **The "Ghost Border" Fallback:** If a container sits on an identical tonal background, use the `outline_variant` (#474848) at **15% opacity**. This creates a "suggestion" of an edge that disappears into the dark.
- **Glassmorphism:** Use `surface-variant` with a backdrop blur for navigation bars that scroll over content, allowing the `on_background` text to peak through as blurred shapes.

---

## 5. Components

### Buttons
- **Primary:** `primary` (#c6c6c7) background with `on_primary` (#3f4041) text. Use `md` (0.375rem) rounding.
- **Secondary:** Transparent background with a `Ghost Border` and `on_surface` text.
- **Tertiary:** No background or border. Use `primary` color for text. Only for low-priority actions like "Cancel."

### Input Fields
Forbid the "boxed" look. Use `surface-container-lowest` as the background with a bottom-only `outline_variant` at 20% opacity. Upon focus, transition the bottom border to `primary` (#c6c6c7).

### Cards & Lists
**Forbid divider lines.** 
- Separate list items using the **Spacing Scale `2` (0.7rem)**. 
- Use a `surface-container-high` hover state to indicate interactivity. 
- For complex data grids, use alternating "Zebra" strips using `surface` and `surface-container-low` rather than horizontal rules.

### Chips
Small, utilitarian tags. Use `secondary_container` (#3b3c39) with `on_secondary_container` (#c0bfbc). Rounding must be `full` (9999px) to contrast against the mostly rectangular UI.

---

## 6. Do’s and Don’ts

### Do:
- **Use Generous Whitespace:** If in doubt, increase the margin. Use Spacing Scale `8` (2.75rem) between major sections.
- **Embrace Asymmetry:** Align primary content to a 65/35 split grid to create a sophisticated, custom-built feel.
- **Use Tonal Progress:** When a process is 50% done, use a `primary` to `primary_dim` gradient transition.

### Don’t:
- **Don't use 100% White:** Never use `#FFFFFF`. Use `on_surface` (#e7e5e5) to prevent eye strain in dark environments.
- **Don't use "Drop Shadows" on Cards:** Use background color shifts (Tonal Layering) instead.
- **Don't use Bold excessively:** Inter is powerful in "Medium" (500) and "SemiBold" (600). "Bold" (700) should be reserved only for `label-sm` buttons or extreme emphasis.