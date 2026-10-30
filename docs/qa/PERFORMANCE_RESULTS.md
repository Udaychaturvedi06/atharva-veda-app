# Device Resilience & Motion Test Matrix

**Version:** V3 Architecture  
**Date:** 30 October 2026  
**Subject:** Motion Performance, Scroll Lifecycles, and Device Resilience  

---

## 1. Test Matrix & Real Observed Results

| Test Scenario | Environment / Configuration | Target Behavior | Observed Reality | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Desktop with WebGL** | Chrome 120+, Mac M-series | SacredWireframe & RisingEmbers 3D Canvas renders with camera tracking. | Smooth 60fps canvas; color mood shifts gently with active route. | **PASS** |
| **2. Prefers-Reduced-Motion** | OS setting `prefers-reduced-motion: reduce` | Lenis smooth scroll disengages, WebGL 3D loop disengages, Framer Motion transitions collapse to instant opacity. | Tested via `matchMedia`. `Layout.jsx` does not mount Lenis; `SacredScene.jsx` drops 3D canvas and renders static radial mineral gradient; `pageVariants` uses instant 150ms opacity. | **PASS** |
| **3. WebGL Unavailable / Blocked** | Browser without WebGL (`checkWebGLSupport() === false`) | Graceful fallback to CSS radial gradient without thrown errors or black screen. | ErrorBoundary and synchronous canvas context detection render `fallbackGradient` (`rgba(197, 154, 86, 0.06)` on `#161715`). | **PASS** |
| **4. Mobile Viewport & Touch** | Viewport `<768px` (iOS Safari / Android Chrome) | Touch gestures respond immediately without scroll lag or touch multiplier interference. | Mobile dock renders at bottom; Lenis touchMultiplier tuned down to 1.2; no horizontal scroll leaks. | **PASS** |
| **5. Route Transitions** | Fast route clicks (e.g. `/dashboard` -> `/library` -> `/chat`) | No duplicate scroll loop creation, no orphaned RAF timers. | `rafId` properly cancelled in `Layout.jsx` cleanup hook; Lenis `destroy()` called on unmount. | **PASS** |
| **6. Background Tab Return** | User switches to another browser tab and returns | Animation frame timers pause and do not accumulate large delta jumps or spike CPU. | Browser native `requestAnimationFrame` automatically pauses in hidden tabs; rAF resumed cleanly on focus. | **PASS** |

---

## 2. Animation Category Audit

Every active animation has been assigned to one of the 5 approved categories:

1. **Ambient:**
   - Subtle breath cycle on the Vasuki dial (`--breath`, 30Hz CSS variable).
2. **Navigational:**
   - Route fade transitions (`pageVariants`: 280ms cubic-bezier).
   - Desktop left navigation rail expansion (`0.32s cubic-bezier(0.16, 1, 0.3, 1)`).
3. **Interactive:**
   - Button tap and hover feedback (`150ms ease`).
   - Yajna lamp illumination and Sankalpa selection chip taps.
4. **Explanatory:**
   - Daily Shloka 3D card flip revealing the sacred Sanskrit anatomy (`0.45s`).
   - Living Margins annotation drawer slide.
5. **Decorative (Optional):**
   - 3D rising embers in `SacredScene.jsx` (strictly disabled under reduced motion).
