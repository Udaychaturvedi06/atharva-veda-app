# Forensic Codebase Audit: Architecture & Route Inventory

**Version:** V3 Audit  
**Date:** 30 October 2026  
**Project:** `Udaychaturvedi06/atharva-veda-app`  
**Auditor:** Principal Software Engineer & Architecture Reviewer  

---

## 1. Actual Runtime Baseline

| Subsystem | Verified Tool / Library | Version Observed | Notes |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | Node.js | `v26.12.0` | Native ESM execution, native `node:test` runner. |
| **Package Manager** | npm | `11.x` | `package-lock.json` lockfile v3. |
| **Frontend Framework** | React / React DOM | `^19.2.4` | StrictMode enabled, React 19 JSX runtime. |
| **Bundler & Tooling** | Vite / Rolldown Plugin | `v8.0.8` / Vite PWA `v1.2.0` | Fast dev server, service worker generation. |
| **Routing** | React Router DOM | `^7.14.0` | Client-side routing with route-level transitions. |
| **State Management** | Zustand | `^5.0.16` | Persisted via `localStorage` under key `'sutra-game-store'`. |
| **Animation & Motion** | Framer Motion | `^12.38.0` | `AnimatePresence mode="popLayout"`, spring transitions. |
| **Smooth Scrolling** | Lenis | `^1.3.27` | RAF loop mounted in `Layout.jsx`. |
| **3D Rendering** | Three.js / R3F / Drei | `^0.186.1` / `^9.8.2` / `^10.7.9` | `SacredScene` background canvas, fallback gradient. |
| **Validation** | Zod | `^4.4.3` | Upgraded to Zod v4 (uses `error.issues` instead of `error.errors`). |
| **Backend API** | Express | `^4.19.2` | Single file monolithic API in `api/index.js`. |
| **AI Integration** | `@google/genai` | `^1.49.0` (resolved `1.52.0`) | Gemini 2.5 Flash used for translation & chat. |
| **Test Runner** | Native Node Test Runner | Node `node:test` | Added `"test": "NODE_ENV=test node --test tests/**/*.test.mjs"`. |

---

## 2. Route & Feature Inventory

Every route has been forensically traced through `src/App.jsx`, its page component, data sources, and runtime contracts:

| Route | Component | Classification | Verified Runtime Behaviour & Dependencies |
| :--- | :--- | :--- | :--- |
| `/` | `Landing.jsx` | **Verified Functional** | Public landing page, features showcase, CTA redirects to `/dashboard` if authenticated. |
| `/login` | `Auth.jsx` | **Verified Functional (with Flaw)** | Real login/register against `/api/auth/*`. Contains simulated offline fallback on fetch error. |
| `/dashboard` | `Home.jsx` | **Verified Functional** | Central hub: 5 Yajna lamps, Vasuki dial, Arishadvarga duel, Shloka flip, Relic shelf. |
| `/library` | `Library.jsx` | **Simulated / Demo** | Displays rich Veda cards (`SUKTAS_DB`) stored locally in component; does not call `/api/library`. |
| `/verse/:book/:hymn/:verse` | `VerseDetail.jsx` | **Partially Implemented** | Only 3 verses exist in `CANONICAL_VERSES`. Any other parameter falls back to `1.1.1`. Pitch scoring uses `Math.random()`. |
| `/path` | `PadaSpiral.jsx` | **Implemented / Unverified** | Spiral learning path with nodes and unlocked stages. |
| `/campaign` | `Campaign.jsx` | **Verified Functional** | Arishadvarga trial nodes with combat mechanics tied to Zustand store. |
| `/chat` | `Chat.jsx` | **Verified Functional (Remediated)** | Previously broken due to contract mismatch; now fixed and verified with regression tests. |
| `/rankings` | `Rankings.jsx` | **Simulated / Demo** | Mock leaderboard of seekers with hardcoded RP values. |
| `/quiz` | `Quizzes.jsx` | **Verified Functional** | Multiple choice questions derived from `src/data/puzzles.js`. |
| `/arcade` | `Arcade.jsx` | **Verified Functional** | 9 retro mini-games in `src/arcade/games/` embedded in `ArcadeCabinet`. |
| `/arcade/:gameId`| `Arcade.jsx` | **Verified Functional** | Direct game launch via URL param (`om`, `chakra`, `chandas`, `agni`, `svara`, `sandhi`, `naga`, `mandala`, `runner`). |
| `/settings` | `Settings.jsx` | **Verified Functional** | Client-side preferences (theme, audio, haptics, reset data). |
| `/admin` | `AdminDashboard.jsx` | **Simulated / Insecure** | Entire seeker roster is mock data; includes a one-click "Simulate Admin Access (Dev Mode)" button. |
| `/about` | `About.jsx` | **Verified Functional** | Static editorial content. |
| `/founders` | `Founders.jsx` | **Verified Functional** | Static team overview. |
| `/contact` | `Contact.jsx` | **Verified Functional** | Connects to `/api/contact` which appends entries to `contact-messages.json`. |
| `/legal` | `Legal.jsx` | **Verified Functional** | Privacy, terms, and sacred disclaimer. |
| `/dev/playground` | `DevPlayground.jsx`| **Simulated / Demo** | Component sandbox and design element showcase. |

---

## 3. Architecture & Dependency Map

```
                  ┌──────────────────────────────────────────────┐
                  │                 Vite Client                  │
                  │   React 19 + React Router 7 + Framer Motion  │
                  └───────────────────────┬──────────────────────┘
                                          │
            ┌─────────────────────────────┼────────────────────────────┐
            ▼                             ▼                            ▼
  ┌───────────────────┐         ┌───────────────────┐        ┌───────────────────┐
  │   Zustand Store   │         │    SacredScene    │        │  Local Datasets   │
  │ 'sutra-game-store'│         │ Three.js 3D Canvas│        │ canonicalVerses.js│
  │  (localStorage)   │         │  (WebGL / Embers) │        │ puzzles.js/terms  │
  └───────────────────┘         └───────────────────┘        └───────────────────┘
            │
            ▼ (HTTP / JSON)
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │                           Express Backend (api/index.js)                     │
  │               Zod Validation Middleware (Fixed error.issues)                 │
  └─────────────┬─────────────────────────┬─────────────────────────┬────────────┘
                ▼                         ▼                         ▼
      ┌──────────────────┐      ┌──────────────────┐      ┌───────────────────┐
      │  Local JSON DB   │      │  divine-books    │      │  Google Gemini    │
      │   users.json     │      │sacred-texts-repo │      │  Gemini 2.5 Flash │
      │ translation_cache│      │  (5 total hymns) │      │ (Translation/Chat)│
      └──────────────────┘      └──────────────────┘      └───────────────────┘
```

---

## 4. Known Architectural Deficiencies

1. **Monolithic API vs Serverless Ephemeral Storage:** `api/index.js` assumes a stateful Node server writing to disk (`users.json`, `translation_cache.json`, `contact-messages.json`), but in production (Vercel Serverless) it defaults to `/tmp/`, causing state loss across invocations.
2. **Missing Central API Client:** The client performs ad-hoc `fetch('/api/...')` across scattered components rather than using a centralized API adapter with error handling and retry logic.
3. **Data Disconnect Between Library and Dataset:** The Library renders static `SUKTAS_DB` rather than reading from `divine-books` or `CANONICAL_VERSES`.
