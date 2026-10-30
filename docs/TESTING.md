# Testing & Verification Guide (V4 Release)
**Comprehensive Test Suites, Corpus Verification, and Quality Assurance Standards**

---

## 1. Test Architecture Overview

The Atharva Veda application incorporates a multi-layered automated testing framework utilizing the native Node.js test runner (`node --test`). The test suite validates scriptural corpus integrity, data access, text-to-speech recitation, audio synchronization, security, progression tracking, and adversarial resilience.

### Test Suites Inventory

| Suite | File | Test Cases | Scope |
|---|---|---|---|
| **Corpus Integrity** | `tests/corpus-integrity.test.mjs` | 4 | Validates all 20,081 canonical mantras, partition files, schemas, and Vedic svara preservation |
| **Four Vedas Reader** | `tests/four-vedas-reader.test.mjs` | 4 | Validates multi-Veda partition lazy loading, memory caching, and catalog integrity |
| **Vedic Recitation System** | `tests/recitation-system.test.mjs` | 13 | Tests persistent cache, acoustic synthesizer, single-flight locks, HTTP 206 streaming, and audio clock sync |
| **Data Access Layer** | `tests/data-access.test.mjs` | 6 | Validates search across Devanagari, IAST, English, coordinates, and highlighting |
| **Living Archive & Reader** | `tests/reader-recitation.test.mjs` | 3 | Validates cornerstone hymn schemas, grammatical token glosses, and svara tags |
| **Learning Progression** | `tests/learning-progression.test.mjs` | 4 | Validates RP progression, rank thresholds, and anti-inflation logic |
| **AI Chat Contract** | `tests/chat-contract.test.mjs` | 5 | Tests payload normalization, auth checks, and error responses |
| **Authentication & Security** | `tests/security-auth.test.mjs` | 5 | Validates JWT token issuance, guest access, password minimums, and invalid credentials |
| **Adversarial & Stress** | `tests/adversarial-qa.test.mjs` | 8 | Tests SQLi/XSS resilience, oversized payloads, Devanagari conjunct stress, and regex injection |
| **Total** | **11 Suites** | **60 Tests** | **100% Pass Rate** |

---

## 2. Running Automated Tests

### 2.1 Complete Test Suite
To run all 11 test suites:
```bash
npm test
```
*Note: In containerized or sandboxed environments that restrict loopback socket binding, ensure network/socket permissions are available for the Express test servers.*

### 2.2 Corpus Integrity & Philological Verification
To verify only the Four Vedas text partitions, svara marks, and 20,081 mantras:
```bash
node --test tests/corpus-integrity.test.mjs tests/four-vedas-reader.test.mjs
```

### 2.3 Recitation & Audio System Tests
To test audio generation, caching, and playback synchronization:
```bash
node --test tests/recitation-system.test.mjs
```

---

## 3. Code Quality & Build Verification

### 3.1 Static Analysis & Linting
Run ESLint to check for syntax errors, undeclared variables, or code style deviations:
```bash
npm run lint
```
*Expected result: 0 errors, 0 warnings.*

### 3.2 Production Build
Compile client bundles and progressive web app service workers with Vite:
```bash
npm run build
```
*Expected result: Clean bundle generation in `dist/`.*

---

## 4. Batch Audio Generation CLI

To pre-synthesize audio assets for a specific Veda division or partition:
```bash
node scripts/batch-audio-generation.mjs --veda=atharva --division=1 --limit=10 --concurrency=2
```

Flags:
- `--veda`: Target Veda (`atharva`, `rig`, `yajur`, `sama`). Default: `atharva`.
- `--division`: Target division number (e.g. Kāṇḍa or Maṇḍala). Default: `1`.
- `--limit`: Maximum number of verses to synthesize. Default: `10`.
- `--concurrency`: Number of concurrent synthesis jobs. Default: `2`.
- `--resume`: Skip verses that already exist in `public/audio_cache/`.
