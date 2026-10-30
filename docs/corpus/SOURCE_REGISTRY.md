# Source Registry: The Four Vedas Digital Archive

**Milestone:** V4 Digital Humanities Release  
**Status:** Canonical Registry Active  
**License Standards:** Open Database License (ODbL) / Public Domain Vedic Epigraphy  

---

## 1. Scope and Philological Provenance

The Atharva Veda Digital Sanctum provides dedicated, scholarly access to all four Vedas. We explicitly record the recension, textual tradition, source repository, and historical edition for every imported line of text.

| Veda | Sanskrit Name | Primary Recension | Historical Critical Editions | Machine Source | Text Division Hierarchy | Accent Integrity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Rigveda** | ऋग्वेदः | Śākala Śākhā | Max Müller (1890–1892), Aufrecht (1877), VedaWeb | DharmicData / Vedic Heritage Portal | 10 Maṇḍalas $\to$ 1,028 Sūktas $\to$ 10,552 Mantras | Full Vedic Svara (Udātta, Anudātta, Svarita) |
| **Yajurveda (Śukla)** | यजुर्वेदः (शुक्ल) | Vājasaneyi Mādhyandina | Albrecht Weber (1852), Pt. S. D. Satwalekar (1927) | DharmicData / Vedic Heritage Portal | 40 Adhyāyas $\to$ 1,975 Mantras | Full Vedic Svara (Udātta, Anudātta, Svarita) |
| **Yajurveda (Kāṇva)** | यजुर्वेदः (काण्व) | Vājasaneyi Kāṇva | Wilhelm Caland (1926–1935), IGNCA Edition | DharmicData / IGNCA | Adhyāyas 2–40 $\to$ 2,086 Mantras | Full Vedic Svara |
| **Samaveda** | सामवेदः | Kauthuma Śākhā | Theodor Benfey (1848), Satyavrata Samashrami (1878) | DharmicData / GRETIL / Griffith | 2 Ārcikas (Pūrvārcika, Uttarārcika) $\to$ 15 Prapāṭhakas $\to$ 1,875 Mantras | Gāna musical notation in oral tradition; metric text preserved |
| **Atharvaveda** | अथर्ववेदः | Śaunaka Śākhā | Whitney & Roth (1856), S. P. Pandit (1898), Vishva Bandhu | DharmicData / Vedic Heritage Portal | 20 Kāṇḍas $\to$ 730 Sūktas $\to$ 5,977 Mantras | Full Vedic Svara (Udātta, Anudātta, Svarita) |

---

## 2. Distinction of Textual Traditions

### 2.1 The Two Yajurvedas: Śukla vs Kṛṣṇa
- **Śukla Yajurveda (White Yajurveda):** Pure verse mantras separated strictly from prose ritual explanations (Brāhmaṇa). Represented in our archive by the **Vājasaneyi Mādhyandina Saṁhitā** (Northern & Western India tradition) and **Vājasaneyi Kāṇva Saṁhitā** (Southern & Eastern India tradition).
- **Kṛṣṇa Yajurveda (Black Yajurveda):** Mantras and explanatory theological prose (Brāhmaṇa) are interwoven. Represented by the Taittirīya, Maitrāyaṇī, and Kaṭha traditions.

### 2.2 The Two Atharvavedas: Śaunaka vs Paippalāda
- **Śaunaka Śākhā:** The standard, universally preserved recension containing 20 Kāṇḍas and 730 Sūktas, fully imported into this application.
- **Paippalāda Śākhā:** Preserved in unique birch-bark manuscripts from Kashmir and palm-leaf manuscripts from Odisha; identified in the registry as a secondary research tradition.

### 2.3 Samaveda: Ārcika vs Gāna
- **Ārcika (Verse Text):** The metric lyrics, largely drawn from the Rigveda (especially Books 8 and 9), arranged for chanting. Divided into *Pūrvārcika* (first collection) and *Uttarārcika* (second collection).
- **Gāna (Songbooks):** The actual musical renditions featuring musical elongations, insertions (*stobhas*), and modal intonations (*Grāmegeya*, *Āraṇyageya*, *Ūha*, *Ūhya*). The application clearly distinguishes between the Ārcika textual reading and specialised Sāmagāna musical chanting.

---

## 3. Data Integrity & Ingestion Standards

1. **Non-Destructive Parsing:** Original Devanagari text with Vedic combining characters (e.g. `\u0951` Svarita, `\u0952` Anudātta) is preserved immutably in `accentedText`.
2. **Search Normalization:** Derived unaccented strings (`searchText`) are generated strictly for fuzzy search matching without overwriting canonical text.
3. **Cross-Referencing:** Every text unit is indexed by a deterministic, human-readable coordinate identifier (`rv.1.1.1`, `yv.vs.1.1`, `sv.1.1.1`, `av.12.1.1`).
