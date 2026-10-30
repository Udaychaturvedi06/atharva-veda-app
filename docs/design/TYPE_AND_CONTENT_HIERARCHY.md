# Typography & Content Hierarchy Specification

**Version:** V3 Design System  
**Date:** 30 October 2026  
**Fonts In Use:**
- Primary Display: **Cinzel** (Classical Latin Serif with epigraphic dignity)
- Primary UI & Prose: **Outfit** (Humanist geometric sans with high x-height and exceptional legibility)
- Sacred Scripture: **Noto Sans Devanagari** / **Tiro Devanagari Sanskrit** (Comprehensive Vedic accent & conjunct support)
- Transliteration / Metadata: **Outfit** + **Cinzel** (Precise IAST diacritics)

---

## 1. Type Scale & Optical Metrics

| Token | Family | Size (Fluid / Responsive) | Weight | Line Height | Tracking | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `display-1` | `Cinzel` | `clamp(2.2rem, 5vw, 3.8rem)` | 800 | 1.15 | `+0.02em` | Major archive collection title, hero heading |
| `display-2` | `Cinzel` | `clamp(1.6rem, 3.5vw, 2.5rem)` | 700 | 1.25 | `+0.02em` | Section headings, book headers |
| `display-3` | `Cinzel` | `clamp(1.2rem, 2.2vw, 1.7rem)` | 700 | 1.35 | `+0.01em` | Sukta title, hymn header |
| `sanskrit-lg` | `Noto Sans Devanagari` | `clamp(1.5rem, 3.0vw, 2.2rem)` | 500 / 600 | 1.90 | `0` | Primary sacred verse reading display |
| `sanskrit-md` | `Noto Sans Devanagari` | `clamp(1.2rem, 2.0vw, 1.5rem)` | 500 | 1.80 | `0` | Verse cards, daily meditation excerpts |
| `iast-prose` | `Outfit` | `1.05rem (17px)` | 400 | 1.70 | `+0.01em` | International Alphabet of Sanskrit Transliteration |
| `body-prose` | `Outfit` | `1.0rem (16px)` | 400 | 1.75 | `0` | English translation, commentaries, reading paragraphs |
| `metadata` | `Outfit` | `0.85rem (13.5px)` | 500 / 600 | 1.40 | `+0.04em` | References (e.g. `AVŚ 12.1.1`), meters, word glosses |

---

## 2. Sanskrit & IAST Diacritic Coverage Verification

All Devanagari conjuncts, Vedic accents, and IAST transliterations in the archive must render cleanly without clipping:

### Vedic Svaras (Accents)
- **Udatta (High Pitch):** represented canonically or with high mark.
- **Anudatta (Low Pitch):** Horizontal subscript line below the syllable (e.g. `स॒त्यं`, `पृ॒थि॒वीम्`).
- **Svarita (Falling Pitch):** Vertical superscript line above the syllable (e.g. `दी॒क्षा॑`, `रू॒पाणि॑`).
- **Dirgha Svarita (Extended):** Subscript three with accent (`त॒न्वो३॒`).

### Real Verification Sample Test:
```
Devanagari:
स॒त्यं बृ॒हद् ऋ॒तमु॒ग्रं दी॒क्षा तपो॒ ब्रह्म॑ य॒ज्ञः पृ॑थि॒वीं धा॑रयन्ति ।
सा नो॑ भू॒तस्य॒ भव्य॑स्य॒ पत्न्यु॒रुं लो॒कं पृ॑थि॒वी नः॑ कृणोतु ॥

IAST:
satyaṃ bṛhad ṛtamugraṃ dīkṣā tapo brahma yajñaḥ pṛthivīṃ dhārayanti |
sā no bhūtasya bhavyasya patnyuruṃ lokaṃ pṛthivī naḥ kṛṇotu ||
```

---

## 3. Reading Surface Content Hierarchy

When rendering any verse in the reader or card, the vertical rhythm must respect this strict sequence:

```
┌────────────────────────────────────────────────────────┐
│ [REFERENCE TAG]  Atharvaveda Saunaka · Kanda 12, Hymn 1│
│                                                        │
│  स॒त्यं बृ॒हद् ऋ॒तमु॒ग्रं दी॒क्षा तपो॒ ब्रह्म॑ य॒ज्ञः पृ॑थि॒वीं धा॑रयन्ति  │ (Noto Sans, 1.9 line-height)
│                                                        │
│  satyaṃ bṛhad ṛtamugraṃ dīkṣā tapo brahma...           │ (IAST, italicized silver)
│                                                        │
│  "Truth, Vast Cosmic Order, fierce consecration,       │ (Outfit, comfortable reading)
│   ardour, holy prayer, and sacrifice sustain the Earth"│
│                                                        │
│  ─── Living Margins / Commentary ────────────────────  │
│  • Vedic Meter: Triṣṭubh (11×4 syllables)              │
│  • Scholar Review: Pending Scholarly Colloquium        │
└────────────────────────────────────────────────────────┘
```
