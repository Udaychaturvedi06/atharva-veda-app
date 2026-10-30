# Implementation Roadmap & Release Gate Strategy

**Version:** V3 Audit  
**Date:** 30 October 2026  
**Guiding Philosophy:** Step-by-step verification, zero regressions, truth in engineering and content.  

---

## 1. Staged Execution Plan

```
   [ Prompt 0: Audit & Chat Contract Fix ]  ◄── CURRENT STAGE COMPLETED
                   │
                   ▼
   [ Prompt 1: Security & Reliability Baseline (P0 Fixes) ]
                   │
                   ▼
   [ Prompt 2: Design System & Editorial Visual Identity ]
                   │
                   ▼
   [ Prompt 3: Product Architecture & Progression Model ]
                   │
                   ▼
   [ Prompt 4: Motion & Resilience Prototype ]
                   │
                   ▼
   [ Prompt 5: Reader-First Homepage Redesign ]
                   │
                   ▼
   [ Prompt 6: Living Archive Reader & Living Margins ]
                   │
                   ▼
   [ Prompt 7: Library & Unified Data Access Layer ]
                   │
                   ▼
   [ Prompt 8: Learning, Progress & Arcade Integration ]
                   │
                   ▼
   [ Prompt 9: Adversarial QA, Accessibility & Stress Test ]
                   │
                   ▼
   [ Prompt 10: Final Coherence Review & Release Gate ]
```

---

## 2. Detailed Stage Breakdown

### Stage 0: Forensic Codebase & Contract Audit (Current)
- **Status:** **PASS / COMPLETED**
- **Changes Completed:**
  1. Identified and resolved AI Chat contract mismatch (`messages` vs `message/history`).
  2. Fixed Zod v4 `error.issues` bug preventing 500 server crashes on invalid input.
  3. Replaced missing `ws` dependency files in `node_modules`.
  4. Added native Node test suite (`tests/chat-contract.test.mjs`) with 5 automated test cases.
  5. Produced complete audit documentation suite in `docs/audit/`.

---

### Stage 1: Security and Reliability Baseline (Next Action)
- **Gate Requirement:** Review of critical security findings with project owner.
- **Scope of Work:**
  1. **Fail-Closed JWT Secret:** Enforce required `JWT_SECRET` in production; fail startup if missing. Remove predictable default in `.env.example`.
  2. **Admin Bootstrap Isolation:** Remove hardcoded `admin123` auto-seeding. Create safe CLI bootstrap command.
  3. **Repository Hygiene:** Untrack `users.json` from git (`git rm --cached users.json`), update `.gitignore`.
  4. **Authentication Truthfulness:** Remove deceptive offline "fake login" in `AuthContext.jsx`. Clearly isolate Guest exploration from failed real authentication.
  5. **Persistence Safeguards:** Document durability limitations on serverless environments and prepare migration strategy for user records.

---

### Stage 2: Visual Identity & Design System
- **Scope of Work:**
  1. Standardize 6 mineral/sacred tokens (Charcoal `#20211F`, Moonlit Silver `#D5D3CB`, Signal Red `#A83A32`, Sage Green `#87947A`, Walnut `#654B3C`, Amber `#C59A56`).
  2. Audit and eliminate legacy bright cyan/saffron/gold token aliases.
  3. Validate WCAG 2.2 AA contrast ratios across all semantic surface/text pairings.
  4. Optimize Devanagari typography, conjuncts, and IAST diacritics glyph coverage.
  5. Remove ubiquitous glassmorphism and glows from every component; apply expressive restraint.

---

### Stage 3: Product & Experience Architecture
- **Scope of Work:**
  1. Elevate reader and archive to primary product status.
  2. Demote games, ranks, and streaks to optional secondary destinations.
  3. Define unified content model schema: Collection -> Book -> Hymn -> Verse -> Layers.
  4. Implement deterministic progression event map: `User Action -> Event -> Persistence -> Derived Display`.

---

### Stage 4: Motion, Interaction & Device Resilience
- **Scope of Work:**
  1. Establish 5 motion categories: Ambient, Navigational, Interactive, Explanatory, Decorative.
  2. Connect `prefers-reduced-motion` to Lenis smooth scroll and Framer Motion transitions.
  3. Refactor `SacredScene` to respect reduced motion and graceful static fallbacks.
  4. Optimize mobile rendering by removing high-frequency shader work on handheld viewports.

---

### Stage 5: Reader-First Homepage ("The Unwritten Canvas")
- **Scope of Work:**
  1. Replace 5 Yajna lamps and game dials with clear orientation and direct archive entry.
  2. Immediate access to search, curated collections, and recent reading location.
  3. Ensure page is legible and visually compelling as a still screenshot without animation.

---

### Stage 6: Living Archive Reader & Living Margins
- **Scope of Work:**
  1. Multilayered reading experience: Source -> Text -> Transliteration -> Translation -> Commentary.
  2. Build Living Margins annotation drawer/sheet preserving scroll position.
  3. Replace fake `Math.random()` pitch scoring with validated audio or honest experimental labeling.
  4. Introduce content provenance badges (`verified`, `needs_review`, `generated`, `unavailable`).

---

### Stage 7: Library, Search & Data Access Layer
- **Scope of Work:**
  1. Connect `Library.jsx` and `CommandPalette` to a single canonical data access adapter.
  2. Display honest, data-backed counts rather than traditional totals presented as live files.
  3. Graceful empty states and search highlighting without corrupting Devanagari conjuncts.

---

### Stage 8: Learning, AI & Arcade Integration
- **Scope of Work:**
  1. Retain the 9 arcade mini-games inside a dedicated `/arcade` destination.
  2. Remove HP and Prana vitals from ordinary reading views.
  3. Visibly label all AI-generated explanations to prevent confusion with sacred source text.

---

### Stage 9 & 10: Adversarial QA & Final Coherence Review
- **Scope of Work:**
  1. Run automated lint, build, accessibility, and contract test suites.
  2. Execute adversarial QA matrix (network failure, token expiration, script rendering, keyboard navigation).
  3. Independent design director evaluation across the 12 coherence dimensions.

---

## 3. Rollback & Safety Plan

- **Savepoint `s1` (`ef898f65b56d9d1dc2c44cb5882664312f3b8c5b`):**
  A permanent savepoint is tagged and preserved locally and remotely on GitHub (`origin/s1`).
- **Emergency Rollback Procedure:**
  ```bash
  git reset --hard s1
  git clean -fd
  npm run build
  ```
- **New Stage Checkpointing:** Each completed stage will receive an incremental tag (`s2`, `s3`, etc.) upon owner approval.
