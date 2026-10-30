# Token Map & Color Governance

**Version:** V3 Design System  
**Date:** 30 October 2026  
**Palette:** The 6 Organic Mineral & Sacred Elements  

---

## 1. The Core Color Roles

| Mineral / Element | Hex Value | Primary Semantic Role | Contrast on Canvas (`#161715` / `#20211F`) | Contrast on Surface (`#262724`) |
| :--- | :--- | :--- | :--- | :--- |
| **Charcoal Void** | `#161715` / `#20211F` | Primary structural canvas, viewport background, deep reading ground | *Canvas baseline* | N/A |
| **Moonlit Silver** | `#D5D3CB` | Primary readable text, hairline borders, structural rules | **11.2:1** (AAA) / **10.8:1** (AAA) | **9.1:1** (AAA) |
| **Amber** | `#C59A56` | Deliberate discovery, primary active selection, focus indicators | **6.5:1** (AA) / **6.3:1** (AA) | **5.3:1** (AA) |
| **Sage Green** | `#87947A` (Bright: `#9EAD91`) | Verified content status, completed learning checkpoints, quiet success | **5.2:1** (AA) / **5.0:1** (AA) (Text: `#9EAD91` **6.8:1**) | **4.4:1** (Text: **5.8:1**) |
| **Walnut Wood** | `#362820` / `#654B3C` | Archival storage surfaces, book headers, warm physical accents | Border / Surface depth | Surface accent |
| **Signal Red** | `#A83A32` (Text: `#E26D64`) | Rare editorial marks, critical alerts, error states, severe disruption | Badges / Icons: `#A83A32`<br>Text alerts: `#E26D64` (**5.1:1** AA) | Text: **4.3:1** |

---

## 2. Full Semantic Token Map (`src/styles/tokens.css`)

```css
:root {
  /* ========================================================
     1. PRIMITIVE MINERAL ROLES
     ======================================================== */
  --color-charcoal-0: #121312;      /* Deepest void */
  --color-charcoal-1: #161715;      /* Standard canvas */
  --color-charcoal-2: #20211F;      /* Structural panel base */
  --color-charcoal-3: #2A2B28;      /* Elevated surface / card */
  --color-charcoal-hover: #333430;  /* Surface hover */

  --color-silver-0: #FFFFFF;        /* Pure white (key highlights) */
  --color-silver-1: #EFEFE9;        /* High-emphasis text */
  --color-silver-2: #D5D3CB;        /* Moonlit silver body text (primary) */
  --color-silver-3: #96958E;        /* Secondary & metadata text */
  --color-silver-muted: #6E6D67;    /* Tertiary / disabled text */

  --color-amber-base: #C59A56;      /* Primary accent & discovery */
  --color-amber-bright: #D8AE6A;    /* Primary button & active indicator */
  --color-amber-subtle: rgba(197, 154, 86, 0.15); /* Focus & highlight wash */

  --color-sage-base: #87947A;       /* Verified status, success */
  --color-sage-text: #9EAD91;       /* Accessible text green */
  --color-sage-subtle: rgba(135, 148, 122, 0.16);

  --color-walnut-base: #654B3C;     /* Archival warmth */
  --color-walnut-dark: #362820;     /* Deep bark panel background */
  --color-walnut-border: rgba(101, 75, 60, 0.35);

  --color-red-base: #A83A32;        /* Alert & error marker */
  --color-red-text: #E26D64;        /* Accessible text red */
  --color-red-subtle: rgba(168, 58, 50, 0.16);

  /* ========================================================
     2. SEMANTIC ROLES
     ======================================================== */
  --surface-canvas: var(--color-charcoal-1);
  --surface-panel: var(--color-charcoal-2);
  --surface-card: var(--color-charcoal-3);
  --surface-card-hover: var(--color-charcoal-hover);
  --surface-archive: var(--color-walnut-dark);

  --text-primary: var(--color-silver-2);
  --text-secondary: var(--color-silver-3);
  --text-muted: var(--color-silver-muted);
  --text-heading: var(--color-silver-1);
  --text-accent: var(--color-amber-bright);
  --text-on-accent: var(--color-charcoal-0);

  --border-subtle: rgba(213, 211, 203, 0.10);
  --border-medium: rgba(213, 211, 203, 0.20);
  --border-accent: rgba(197, 154, 86, 0.45);
  --border-focus: var(--color-amber-bright);

  --action-primary: var(--color-amber-bright);
  --action-primary-hover: #E4BC7A;
  --action-primary-text: #161715;

  --status-verified: var(--color-sage-text);
  --status-review: var(--color-amber-base);
  --status-error: var(--color-red-text);

  /* ========================================================
     3. LEGACY TOKEN BRIDGES & COMPATIBILITY
     ======================================================== */
  --bg-space: var(--surface-canvas);
  --bg-card: var(--surface-card);
  --bg-card-hover: var(--surface-card-hover);
  --bg-0: var(--surface-canvas);
  --bg-1: var(--surface-panel);
  --bg-2: var(--surface-card);

  --silver-moon: var(--color-silver-2);
  --silver-muted: var(--color-silver-3);
  --amber-glow: var(--color-amber-base);
  --amber-radiance: var(--color-amber-bright);
  --sage-healing: var(--color-sage-base);
  --signal-red: var(--color-red-base);
  --wood-walnut: var(--color-walnut-dark);
  --wood-border: var(--color-walnut-border);

  --gold: var(--color-amber-base);
  --gold-bright: var(--color-amber-bright);
  --success: var(--color-sage-base);
  --danger: var(--color-red-base);
}
```

---

## 3. Strict Color Governance Rules

1. **No Ambient Glows on Structural Containers:** Do not use `box-shadow: 0 0 40px` or red glows as ambient decor.
2. **Never Color Everything Amber:** Amber is reserved exclusively for the currently focused/selected item, primary navigation indicator, and primary action button. Secondary actions use subtle silver hairline borders.
3. **Never Rely on Color Alone:** State changes (e.g. verified vs needs review) must always include a text label, icon, or explicit status attribute in addition to color.
4. **Legible Contrast Enforcement:** All text displayed on dark surfaces must maintain at least 4.5:1 contrast. Where `#A83A32` or `#87947A` are used for text, their accessible variants (`#E26D64` and `#9EAD91`) are automatically substituted.
