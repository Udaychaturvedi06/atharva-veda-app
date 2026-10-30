# Progression Model & Event Flow Architecture

**Version:** V3 Architecture  
**Date:** 30 October 2026  
**Guiding Rule:** Progress must be grounded in genuine user actions. Reading is never penalized by game mechanics.  

---

## 1. Decoupling the Game HUD from the Reader

### The Problem in Legacy Implementation
Previously, opening `/verse/:book/:hymn/:verse` placed combat HP, Prana mana bars, and a "Tapasya Ascension" progress bar above the scripture, making sacred reading feel like a penalty-driven RPG with health depletion.

### The Remediation
1. **Context-Sensitive HUD:**
   - **During Reading (`/verse/...` and `/library`):** The Game HUD is minimized into a quiet, dignified utility bar showing only theme toggles, sound controls, and account profile. Combat vitals (HP / Prana) are **completely hidden**.
   - **During Arcade & Trials (`/arcade` and `/campaign`):** The full combat HUD (HP, Prana, Radiance Points) is actively displayed.
2. **No Penalties for Absence:**
   - Absence does not deplete user HP or degrade standing.
   - Streaks are treated as gentle positive reinforcement, not shame-based pressure.

---

## 2. Event-Driven Progression Flow

```
┌─────────────────────────────────┐
│        User Interaction         │  (e.g., Completing a quiz, reading a chapter)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│     Explicit Event Dispatch    │  { type: 'VERSE_COMPLETED', verseId, timestamp }
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      Persistence Layer          │  Updated in store state & persisted safely
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│    Derived Metrics (No Fakes)   │  versesMastered = actual unique completed IDs
└─────────────────────────────────┘
```

### Initial Store Initialization Rule
New user accounts must start with **zero fabricated progress**:
- `versesMastered: 0` (was previously hardcoded to 14)
- `quizzesWon: 0` (was previously hardcoded to 8)
- `mantrasRecited: 0` (was previously hardcoded to 36)
- `streak: 0` (was previously hardcoded to 3)
- `rp: 0` (was previously hardcoded to 120)

Demo mode accounts are clearly flagged as synthetic (`isOfflineDemo: true`).
