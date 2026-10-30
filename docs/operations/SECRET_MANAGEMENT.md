# Operational Guide: Secret Management, Bootstrap & Persistence

**Version:** V3 Security & Reliability Baseline  
**Date:** 30 October 2026  
**Audience:** System Administrators, DevOps, Security Reviewers  

---

## 1. Secrets Management

### 1.1 Generating Cryptographic Signing Secrets
For production deployments, `JWT_SECRET` must be generated using high-entropy cryptographic random bytes (minimum 256-bit / 32 bytes):

```bash
# Option A: OpenSSL
openssl rand -base64 32

# Option B: Node.js Crypto
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Configure this value in your environment or hosting platform dashboard (e.g., Vercel Project Settings > Environment Variables). **Never commit the production secret to git.**

### 1.2 Fail-Closed Production Behavior
The server executes a mandatory fail-closed assertion at startup in production (`NODE_ENV === 'production'`). If `JWT_SECRET` is unset:
- The server throws a fatal startup error: `FATAL: JWT_SECRET environment variable is mandatory in production.`
- No fallback string or default secret is substituted under any circumstances.

### 1.3 Secret Rotation Procedure
When rotating `JWT_SECRET`:
1. Generate a new 256-bit secret string.
2. Update the environment variable in the deployment environment.
3. Trigger a redeploy.
4. *Effect:* Existing active sessions will immediately invalidate safely with a 401 Unauthorized status, prompting users to re-authenticate with their credentials.

---

## 2. Administrator Account Bootstrap

### 2.1 Explicit CLI Bootstrap Tool
Automatic seeding of default passwords (e.g. `admin123`) has been completely removed from production runtime code.

To bootstrap an administrator account safely:
```bash
# Method A: Interactive / Flags
npm run auth:bootstrap -- --username=consecrated_admin --password=your_secure_passphrase

# Method B: Environment-supplied variables
ADMIN_USERNAME=consecrated_admin ADMIN_PASSWORD=your_secure_passphrase npm run auth:bootstrap
```

- Passwords must be at least 8 characters long.
- Credentials are hashed with bcrypt at cost factor 12.
- The password is never printed in terminal output, logs, or reports.

---

## 3. Persistence Boundaries & Production Durability

### 3.1 Serverless Ephemeral Limitations
On serverless platforms (e.g. Vercel Functions):
- Container filesystems are ephemeral. Any writes to `/tmp/users.json`, `/tmp/translation_cache.json`, or `/tmp/contact-messages.json` are lost when serverless instances cold-start or re-deploy.
- For local development and single-container persistent instances (Docker / VM), JSON file persistence operates with atomic file-swapping locks (`.tmp` write + atomic rename) to prevent database corruption.

### 3.2 Recommended Production Migration
For production deployments requiring durable user accounts:
- Connect Express to a managed database (PostgreSQL via Prisma/Drizzle or Supabase).
- Local JSON files are strictly excluded from git tracking (`.gitignore`) to safeguard user hashes and contact submissions.
