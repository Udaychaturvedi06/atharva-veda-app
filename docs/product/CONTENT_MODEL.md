# Canonical Content Model Schema

**Version:** V3 Architecture  
**Date:** 30 October 2026  
**Guiding Rule:** Distinguish original text, transliteration, translation, commentary, and AI explanation at both the data and UI layers.  

---

## 1. Passage Data Schema

```typescript
export interface VedicPassage {
  // Identifiers
  id: string;               // e.g. "av-12-1-1"
  veda: 'atharva' | 'rig' | 'sama' | 'yajur';
  shakha?: string;          // e.g. "Śaunaka", "Paippalāda", "Śākala"
  book: number;             // Kanda / Mandala / Adhyaya
  hymn: number;             // Sukta
  verse: number;            // Mantra / Richa / Shloka
  ref: string;              // Formatted reference, e.g. "AVŚ 12.1.1"

  // Layer 1: Canonical Devanagari with Svaras
  devanagari: string;       // Original Sanskrit with Anudatta/Svarita marks

  // Layer 2: Transliteration (IAST)
  iast: string;             // Exact diacritic romanization

  // Layer 3: Metrical Structure
  meter?: {
    name: string;           // e.g. "Triṣṭubh", "Anuṣṭubh", "Gāyatrī"
    pattern?: string;       // e.g. "11×4 syllables"
  };

  // Layer 4: Translation
  translation: {
    text: string;
    translator: string;     // e.g. "William Dwight Whitney", "Ralph T.H. Griffith"
    edition?: string;
    year?: number;
  };

  // Layer 5: Word-by-Word Analysis (Living Margins)
  words?: Array<{
    text: string;           // Sanskrit padapatha form
    root?: string;          // Dhatu / grammatical root
    gloss: string;          // Concise contextual English meaning
    swara?: ('udatta' | 'anudatta' | 'svarita')[];
    grammar?: string;       // Morphological tag (e.g. "nom. sg. masc.")
  }>;

  // Layer 6: Editorial Notes & Commentary
  commentary?: {
    traditional?: string;   // Sāyaṇa or traditional commentator (if available)
    esotericInsight?: string; // Philosophical / ecological reflection
    uncertainties?: string[]; // Specific phrases requiring scholarly clarification
  };

  // Layer 7: Provenance & Review Status
  provenance: {
    status: 'verified' | 'needs_review' | 'unverified' | 'unavailable';
    sourceRepository: string;
    license: string;
    lastReviewed?: string;
    reviewer?: string;
  };

  // Layer 8: Audio & Recitation Evidence
  audio?: {
    available: boolean;
    sourceUrl?: string;
    chanter?: string;
    shakhaTradition?: string;
    verifiedAccentAlignment: boolean;
  };

  // Layer 9: AI Explanation Boundary (STRICTLY SEPARATE)
  aiExplanation?: {
    content: string;
    model: string;          // e.g. "Gemini 2.5 Flash"
    generatedAt: string;
    disclaimer: "AI-generated contextual explanation. Not canonical scripture.";
  };
}
```

---

## 2. Inviolable Content Boundary Rules

1. **AI Output Is Never Merged into `translation`:** Generated explanations must always live under `aiExplanation` with an explicit computational disclaimer.
2. **Missing Passages Never Fall Back to Verse 1.1.1:** If a passage is not yet indexed, the system returns status `unavailable` with an honest empty state.
3. **Audio Must Have Real Provenance:** If audio data is unavailable, audio controls are disabled. No fake audio waveforms or synthesized pitches may be presented as human recitation.
