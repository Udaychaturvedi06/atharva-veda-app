# Motion Principles & Device Resilience

**Version:** V3 Design System  
**Date:** 30 October 2026  

---

## 1. The Five Motion Categories

Every animation in the product must belong to one of these five categories:

| Category | Role | Example | Execution Rule |
| :--- | :--- | :--- | :--- |
| **1. Ambient** | Subtle environmental presence | Breath pulse on lamp wick, slow particle movement | Must immediately pause when out of view; throttled to 30Hz or CSS variable. |
| **2. Navigational** | Explains user location & orientation | Route transitions, drawer slide, panel expansion | 250ms–350ms duration; cubic-bezier easing `cubic-bezier(0.16, 1, 0.3, 1)`. |
| **3. Interactive** | Confirms immediate user input | Button tap feedback, chip selection, bookmark toggle | 100ms–150ms; spring dampening with zero lag. |
| **4. Explanatory** | Reveals information structure | Living Margins drawer unfolding, word root inspector | Must not displace primary reading scroll position. |
| **5. Decorative** | Lowest priority ornamental motion | Embers, glow bloom | Optional; strictly disabled when reduced-motion is requested. |

---

## 2. Prefers-Reduced-Motion Specification

When a user enables `prefers-reduced-motion: reduce` in their operating system or settings:
1. **Framer Motion:** All page transition animations (`pageVariants`) collapse to instant opacity fades or zero-duration transitions.
2. **Lenis Smooth Scroll:** Smooth wheel and touch multipliers are disabled; standard browser native scrolling is preserved.
3. **Three.js (`SacredScene`):** Particle movement loops and wireframe rotation are halted; scene renders a static, elegant mineral gradient backdrop (`fallbackGradient`).
4. **CSS Transitions:** Continuous keyframe spins (`@keyframes spin`, `@keyframes float`) become static.

---

## 3. Ban on Disruptive Motion Patterns

- **No Scroll Hijacking:** The user's scroll wheel must always correspond 1:1 with content traversal.
- **No Mandatory Multi-Scene Scroll Sequences:** Reading content must never be gated behind 700vh of forced narrative scrolling.
- **No Blocking Intro Animations:** Users must be able to interact with the interface immediately upon page mount.
