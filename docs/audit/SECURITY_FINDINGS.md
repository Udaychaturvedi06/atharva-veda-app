# Security Audit: Prioritised Findings & Vulnerability Register

**Version:** V3 Audit  
**Date:** 30 October 2026  
**Scope:** `api/index.js`, `src/contexts/AuthContext.jsx`, `src/pages/AdminDashboard.jsx`, repository root  
**Compliance Standard:** OWASP Top 10 API Security / Zero Exposure Policy  

> [!CAUTION]
> In accordance with the non-negotiable safety rules, NO actual secret values, passwords, private tokens, or password hashes are reproduced in this report. Only filenames, mechanisms, risks, and remediations are documented.

---

## Severity Summary

| Severity | Count | Primary Impact Areas |
| :--- | :--- | :--- |
| **P0 — Critical** | 4 | Hardcoded JWT secret, bootstrap admin password, tracked user credentials, ephemeral storage. |
| **P1 — High** | 2 | Deceptive offline login bypass, client-side admin restriction bypass. |
| **P2 — Medium** | 2 | Lack of rate limiting on AI/auth endpoints, unauthenticated contact submission file growth. |
| **P3 — Low** | 1 | IP logging in contact entries without disclosure. |

---

## 1. P0 (Critical) Findings

### SEC-01: Hardcoded JWT Fallback Signing Secret
- **Location:** `api/index.js:16`, `.env.example:9`
- **Vulnerability:** When the `JWT_SECRET` environment variable is not defined, the server silently falls back to a static, predictable string documented in git.
- **Impact:** An attacker who knows this fallback secret can generate valid arbitrary JWT tokens claiming `role: 'admin'`, completely bypassing token validation on all protected endpoints (`/api/search`, `/api/verse/translate`, `/api/chat`, `/api/auth/me`).
- **Remediation:**
  1. In production (`NODE_ENV === 'production'`), fail fast at startup if `process.env.JWT_SECRET` is missing. Do not supply any fallback.
  2. Replace `.env.example` line 9 with an explicit placeholder (`JWT_SECRET=your_secure_random_jwt_secret_here`).
  3. Rotate all existing tokens.

### SEC-02: Hardcoded Bootstrap Administrator Credential
- **Location:** `api/index.js:101-113`
- **Vulnerability:** If the user store does not exist at boot, the server automatically seeds a default account with username `admin` and a known, hardcoded password.
- **Impact:** Any fresh instance deployed without a pre-existing user store immediately exposes an administrative account with well-known credentials.
- **Remediation:**
  1. Eliminate automatic seeding of default credentials in production code.
  2. Implement an explicit, secure bootstrap script (`npm run auth:bootstrap`) requiring interactive input or environment-supplied parameters (`ADMIN_INIT_PASSWORD`).

### SEC-03: User Account Database Tracked in Git
- **Location:** `users.json` (root directory, tracked in git commit `2fe7a62`)
- **Vulnerability:** `users.json` containing real username records and bcrypt password hashes is tracked by Git.
- **Impact:** Exposure of password hashes enables offline dictionary and brute-force attacks against registered accounts.
- **Remediation:**
  1. Untrack `users.json` from git (`git rm --cached users.json`).
  2. Add `users.json` to `.gitignore`.
  3. Recommend that users who registered accounts on the deployment rotate their passwords.

### SEC-04: Ephemeral User & Cache Persistence in Production
- **Location:** `api/index.js:91-93, 190-192, 614-616`
- **Vulnerability:** In production (`NODE_ENV === 'production'`), file paths point to `/tmp/users.json`, `/tmp/translation_cache.json`, and `/tmp/contact-messages.json`.
- **Impact:** On serverless platforms (e.g., Vercel Functions), container instances are ephemeral. All registered user accounts, translation caches, and contact submissions are permanently lost when containers recycle.
- **Remediation:**
  1. Transition production persistence to a persistent managed database (Postgres, SQLite with persistent volume, or cloud KV/database).
  2. If JSON storage is retained for local development, mark it explicitly as local-only.

---

## 2. P1 (High) Findings

### SEC-05: Deceptive Offline "Fake Login" Behavior
- **Location:** `src/contexts/AuthContext.jsx:42-51, 72-80, 96-105`
- **Vulnerability:** When `/api/auth/login` or `/api/auth/register` fails due to a network error or server unavailability, `AuthContext` catches the error and fakes a successful session by writing a dummy token (`offline_token_...`) and user object with `{ isOffline: true }` to `localStorage`.
- **Impact:** Violates authentication truthfulness. The user believes they are securely logged in, but subsequent calls to protected server endpoints fail with 401 Unauthorized, creating confusing runtime behavior.
- **Remediation:**
  1. Remove automatic fake-login on network failure. Report the network error truthfully.
  2. Maintain a separate, explicitly labeled "Explore as Guest" mode that makes its offline/ephemeral status transparent.

### SEC-06: Client-Side Admin Chamber Bypass Button
- **Location:** `src/pages/AdminDashboard.jsx:64-65, 154-157`
- **Vulnerability:** When a non-admin visits `/admin`, the UI renders a button: `<Button onClick={() => setDevAdminBypass(true)}>Simulate Admin Access (Dev Mode)</Button>`. Clicking it sets `devAdminBypass: true` and reveals the entire dashboard.
- **Impact:** Bypasses authorization checks in the UI layer. While the current admin dashboard only renders simulated data, having a client bypass button sets a dangerous precedent.
- **Remediation:** Remove the development bypass button from production builds and enforce server-side role validation (`verifyAdmin`).

---

## 3. P2 (Medium) Findings

### SEC-07: Missing Rate Limiting on Authentication & AI Endpoints
- **Location:** `api/index.js`
- **Vulnerability:** Endpoints `/api/auth/login`, `/api/auth/register`, `/api/chat`, and `/api/verse/translate` have no rate limiting.
- **Impact:** Vulnerable to automated credential stuffing, brute force attacks, and rapid exhaustion of Gemini API quotas.
- **Remediation:** Implement `express-rate-limit` on authentication and AI routes.

### SEC-08: Unbounded Contact Form Submissions
- **Location:** `api/index.js:604-636`
- **Vulnerability:** `/api/contact` accepts unauthenticated POST requests and appends records directly to a JSON file without rate limiting or captcha.
- **Impact:** Potential disk space exhaustion or inbox spamming.
- **Remediation:** Bound payload sizes and apply strict IP rate limiting.
