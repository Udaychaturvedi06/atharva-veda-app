# Implementation Audit: Four Vedas Corpus Architecture

**Application:** Atharva Veda Digital Sanctum  
**Target Milestone:** V4 Complete Four Vedas Digital Library  
**Date:** October 30, 2026  
**Auditor:** Principal Software Architect & Sanskrit Digital-Humanities Engineer  

---

## 1. Initial State Assessment

### 1.1 Existing Data & Scope
- **Previous Corpus Scope:** The application originated as a prototype focused on the Atharva Veda. While the UI in `src/pages/Library.jsx` displayed tabs for Rigveda, Samaveda, and Yajurveda, the actual underlying dataset consisted of only a handful of hardcoded sample verses:
  - **Atharvaveda:** 5 verified canonical cornerstone suktas (`src/data/canonicalVerses.js`).
  - **Rigveda:** 5 sample verses.
  - **Samaveda:** 3 sample verses.
  - **Yajurveda:** 3 sample verses.
- **Empty / Stub Directories:**
  - `json_data/`: Contained repository manifests and empty directories (`AtharvaVeda/`, `Rigveda/`, `Yajurveda/`) without actual JSON files.
  - `sacred-texts-repo/`: Contained a stub `index.js` with only 8 sample verses total.
- **Data Access Layer:** `src/services/dataAccess.js` had `archivalCount: 5` hardcoded for Atharvaveda and Rigveda, and `3` for Samaveda and Yajurveda.

### 1.2 Routing & Reader Infrastructure
- **Routing:** Supported `/library` and `/verse/:book/:hymn/:verse`. Route parameters assumed book/hymn/verse notation without recension awareness.
- **Verse Detail Reader (`src/pages/VerseDetail.jsx`):**
  - High-fidelity Devanagari typography with Noto Serif Devanagari.
  - Living margins and morphological anatomy for Atharvaveda cornerstone verses.
  - Just-in-Time audio recitation controller with millisecond-accurate audio clock synchronization.
- **Recitation & Speech Synthesis:**
  - JIT backend audio generator with single-flight concurrency lock (`api/services/tts/audioGenerationService.js`).
  - Local acoustic Vedic synthesizer producing 44.1kHz 16-bit PCM RIFF WAV audio with Udātta, Anudātta, and Svarita pitch contours.
  - Content-addressed persistent audio cache (`api/services/tts/audioCacheStorage.js`) with HTTP 206 Partial Content byte-range streaming.

---

## 2. Gap Analysis for V4 Four Vedas Scope

| Feature / Dimension | Existing State (V3) | Target State (V4) | Architectural Requirement |
| :--- | :--- | :--- | :--- |
| **Rigveda Coverage** | 5 sample verses | Complete 10 Maṇḍalas (1,028 Sūktas, 10,552 Mantras) | Ingest Śākala Saṁhitā with svara accents |
| **Yajurveda Coverage** | 3 sample verses | Complete Vājasaneyi Mādhyandina (40 Adhyāyas, 1,975 Mantras) + Kāṇva | Multi-recension support (Śukla & Kṛṣṇa) |
| **Samaveda Coverage** | 3 sample verses | Complete Pūrvārcika & Uttarārcika (1,875 Mantras) | Musical tradition notes + Griffith translation |
| **Atharvaveda Coverage** | 5 sample verses | Complete 20 Kāṇḍas (730 Sūktas, ~6,000 Mantras) | Śaunaka Saṁhitā with title & meter metadata |
| **Recension Awareness** | Single hardcoded recension string | Explicit schema: Veda $\to$ Recension $\to$ Division $\to$ Mantra | Normalized canonical data model |
| **Corpus Ingestion** | Manual JS file editing | Automated, repeatable, idempotent ingestion pipeline | `scripts/ingest-corpus.mjs` |
| **Corpus Validation** | None | Automated structural & numbering validation | Automated test suite verifying counts & gaps |
| **Reader Typography** | Fixed layout | Configurable font-size, line-height, reading themes | Responsive study reader |
| **Multi-Veda Search** | In-memory search over 16 sample items | Indexed search across all 4 Vedas with svara resilience | Lazy-loaded partition index |
| **Batch TTS Pipeline** | Manual single-verse JIT only | Scriptable batch pre-generation worker | Resumable queue with progress reporting |

---

## 3. Implementation Plan & Migration Strategy

1. **Corpus Acquisition:** Fetch machine-readable source data for all 4 Vedas from open digital repositories (DharmicData, GRETIL, Sanskrit Documents).
2. **Normalized Partitioning:** Rather than bundling tens of megabytes into client-side JavaScript, partition the normalized corpus into modular, on-demand JSON divisions served via `public/corpus/` and Express API endpoints.
3. **Data Model Integrity:** Assign immutable canonical IDs (`rv.1.1.1`, `yv.vs.1.1`, `sv.1.1.1`, `av.1.1.1`) preserving both accented and search-normalized representations.
4. **Universal Reader:** Generalize `VerseDetail.jsx` and `Library.jsx` to browse and read any text unit across all four Vedas with fluid navigation and full recitation capabilities.
5. **Quality Assurance:** Validate zero regressions across existing Atharva Veda gameplay, quiz, and chat functionalities.
