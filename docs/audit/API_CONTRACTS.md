# API Contracts & Endpoint Specification

**Version:** V3 Audit  
**Date:** 30 October 2026  
**Service:** Node / Express Backend (`api/index.js`)  
**Base URL:** Local `http://localhost:5001` / Vercel Serverless `/api/*`  

---

## 1. Endpoint Inventory & Contract Matrix

| Endpoint | Method | Auth Required | Request Payload / Query | Success Response (200/201) | Client Component / Usage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | None | `{ username: string, password: string }` | `{ success: true, token: string, user: { username, role } }` | `AuthContext.jsx` (`register`) | Verified Functional |
| `/api/auth/login` | `POST` | None | `{ username: string, password: string }` | `{ success: true, token: string, user: { username, role } }` | `AuthContext.jsx` (`login`) | Verified Functional |
| `/api/auth/guest` | `POST` | None | None | `{ success: true, token: string, user: { username, role, isGuest: true } }` | `AuthContext.jsx` (`loginAsGuest`) | Verified Functional |
| `/api/auth/me` | `GET` | Bearer JWT | None | `{ user: { username, role, ... } }` | Session revalidation | Implemented |
| `/api/library` | `GET` | None | Query param `?veda=rig\|atharva\|sama\|yajur` | Array of `{ book: number, title: string, suktas: [...] }` | *Unused by client* (`Library.jsx` uses local `SUKTAS_DB`) | Dormant |
| `/api/search` | `GET` | Bearer JWT | Query param `?q=keyword` | Array of `{ id, veda, book, hymn, verse, sanskrit, english, hindi, topics }` | *Unused by client* (Search uses client filters) | Dormant |
| `/api/verse` | `POST` | None | `{ veda: string, book: number, hymn: number, verse: number }` | `{ id, veda, book, hymn, verse, sanskrit, transliteration, english, hindi, ... }` | *Unused by client* (`VerseDetail.jsx` uses `CANONICAL_VERSES`) | Dormant |
| `/api/verse/translate`| `POST` | Bearer JWT | `{ veda, book, hymn, verse, sanskrit }` | `{ english, hindi, transliteration, practicalMeaning, topics, challenge }` | *Unused by client* | Dormant |
| `/api/chat` | `POST` | Bearer JWT | Canonical: `{ messages: [{ role, content }] }`<br>Legacy: `{ message, history }` | `{ reply: string }` | `src/pages/Chat.jsx` | **Fixed & Tested** (5 passing regression tests) |
| `/api/contact` | `POST` | None | `{ name: string, email: string, message: string }` | `{ success: true, message: string }` | `src/pages/Contact.jsx` | Verified Functional |

---

## 2. Forensic Investigation of the AI Chat Mismatch

### Problem Identified
Prior to Prompt 0 audit:
- Client (`src/pages/Chat.jsx`) dispatched:
  ```json
  {
    "message": "[Persona: Rishi Atharvan] Tell me about Prithvi Sukta",
    "history": [{ "role": "user", "text": "Namaste" }]
  }
  ```
- Backend (`api/index.js`) validated:
  ```javascript
  const chatRequestSchema = z.object({
    messages: z.array(
      z.object({
        role: z.enum(['user', 'assistant', 'model', 'system']),
        content: z.string().min(1)
      })
    )
  });
  ```
- Result: Schema validation strictly failed with `400 Bad Request`. The client intercepted the non-200 status and repeatedly rendered the hardcoded generic fallback:
  > *"ॐ। The celestial transmission wavers in the ether..."*

### Implemented Remediation
1. **Frontend Harmonization (`src/pages/Chat.jsx`):**
   Formatted outgoing payload to canonical `messages` array of `{ role: 'user' | 'assistant', content: string }`.
2. **Backend Dual-Format Compatibility (`api/index.js`):**
   Updated `chatRequestSchema` with `z.union`. If legacy `{ message, history }` is received, Zod's `.transform()` automatically maps it into canonical `{ messages: [...] }`.
3. **Zod v4 Error Property Fix (`api/index.js`):**
   Fixed `error.errors` (Zod v3) to `error.issues || error.errors` (Zod v4) in `validate()` middleware, eliminating 500 crashes on invalid inputs.
4. **Upstream AI Fallback:**
   Added graceful offline wisdom fallback when `GEMINI_API_KEY` is invalid or unset, preventing 500 internal server errors.
5. **Regression Test Suite (`tests/chat-contract.test.mjs`):**
   Added 5 automated tests verifying canonical format, legacy format, missing payload, empty strings, and 401 unauthorized handling.

---

## 3. Disconnected Endpoints Analysis

An unexpected finding of this audit is that **the frontend does not currently use 4 of the major backend endpoints**:
1. `/api/library`: The frontend `Library.jsx` contains an embedded JavaScript dictionary (`SUKTAS_DB`) rather than querying the backend.
2. `/api/search`: The search feature in `CommandPalette` and `Library` filters local in-memory objects rather than executing `/api/search`.
3. `/api/verse`: `VerseDetail.jsx` reads from `src/data/canonicalVerses.js` rather than querying `/api/verse`.
4. `/api/verse/translate`: Dynamic translation using Gemini is implemented on the server with local caching, but the reader does not call it.

*Recommendation for Prompt 3 & 7:* Unify the data layer so that the reader, search, and library consume a single canonical repository adapter instead of parallel disconnected data sets.
