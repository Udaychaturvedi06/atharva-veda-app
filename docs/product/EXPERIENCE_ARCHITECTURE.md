# Experience Architecture: The Living Archive

**Version:** V3 Architecture  
**Date:** 30 October 2026  
**Product Premise:** A reader-first digital archive with an optional learning and practice layer.  

---

## 1. The Primary User Journey

The architecture pivots away from forced gamified RPG funnels to an evidence-based textual discovery journey:

```
   ┌─────────────┐       ┌──────────────┐       ┌──────────────┐       ┌─────────────────┐       ┌──────────────┐
   │  DISCOVER   │  ──▶  │     READ     │  ──▶  │  UNDERSTAND  │  ──▶  │ LISTEN/PRACTISE │  ──▶  │   REMEMBER   │
   │   Archive   │       │ Verses & Text│       │Living Margins│       │ Recitation &    │       │ Bookmarks &  │
   │  & Search   │       │ Multi-layer  │       │ & Commentary │       │ Audio Evidence  │       │ Real History │
   └─────────────┘       └──────────────┘       └──────────────┘       └─────────────────┘       └──────────────┘
```

### Destination Hierarchy
1. **Primary Archive (Always First-Class):**
   - **Discover & Read:** Open search, curated collections (Atharvaveda, Rigveda, Samaveda, Yajurveda), direct verse reference loader (e.g. `12.1.1`).
   - **Understand:** Multilayered reading surface (Devanagari, IAST, Translation, Commentary) and the Living Margins annotation drawer.
2. **Optional Learning Layer (Secondary):**
   - **Learn:** Pada learning path (`/path`), vocabulary, meter drills, and structured comprehension quizzes (`/quiz`).
3. **Optional Arcade & Companion (Tertiary / Separate Destinations):**
   - **Ask:** AI Rishi guide (`/chat`), explicitly labeled as computational interpretation.
   - **Practice:** The 9 retro arcade mini-games (`/arcade`), accessible independently without gating archive access.

---

## 2. Navigation Architecture

To make the product instantly understandable without overwhelming users, navigation is organized into clean functional groups:

| Destination | Route | Core Function | Primary / Optional |
| :--- | :--- | :--- | :--- |
| **Sanctuary (Home)** | `/dashboard` | Archive entrance, direct passage search, recent reading resume, daily contemplation. | **Primary** |
| **Manuscripts (Library)** | `/library` | Browse collections, books, and hymns across textual traditions. | **Primary** |
| **Reader** | `/verse/:book/:hymn/:verse` | Multilayer reading, word analysis, and marginal notes. | **Primary** |
| **Path (Pada)** | `/path` | Structured progressive learning modules and meter mastery. | *Optional (Learning)* |
| **Quizzes** | `/quiz` | Spaced recall, Sanskrit word roots, and Vedic concepts. | *Optional (Learning)* |
| **Arcade Hub** | `/arcade` | 9 standalone rhythm, meter, and compound mini-games. | *Optional (Arcade)* |
| **Rishi AI** | `/chat` | Philosophical exploration; source-cited questions. | *Optional (AI Guide)* |
| **Altar (Settings)** | `/settings` | Audio synthesis, theme, accessibility, data backup & reset. | *Utility* |

---

## 3. Strict Homepage Rules
- **No Forced Cinematic Intro:** No blocking splash screen, 3D intro sequence, or obligatory wait times.
- **Immediate Archive Access:** The first viewport immediately explains the archive's scope and provides a direct search / verse jump input.
- **No Mandatory Scroll Gating:** Users do not need to scroll through 700vh of animations to reach content.
- **Resilient Offline / Demo Mode:** The homepage remains fully legible and functional with JavaScript animations or WebGL disabled.
