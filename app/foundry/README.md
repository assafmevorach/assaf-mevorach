# Foundry operations

Existing pages, global styles, and Next.js output mode are unchanged. Next.js 16 uses `proxy.ts` in place of the deprecated middleware filename. Only `/foundry/*` is matched. Pages recheck sessions; every data API independently authorizes requests.

## Deployment blockers

No KV credentials were available during implementation. The `FoundryKV` interface uses a fail-closed unavailable stub unless both environment variables are supplied. No in-memory production fallback exists.

- `KV_REST_API_URL`: Vercel KV / compatible Redis REST endpoint.
- `KV_REST_API_TOKEN`: server-only read/write token. Never use a public environment variable.
- `FOUNDRY_SETUP_TOKEN`: at least 32 random characters, generated outside source control. Required only until a password is set.
- `FOUNDRY_ORCHESTRATOR_TOKEN`: optional, separate random secret of at least 32 characters for machine updates.
- `FOUNDRY_PROCEDURES_URL` and `FOUNDRY_WEBSITE_BRIEF_URL`: actual HTTPS document links. Missing links are visibly marked, never fabricated.

Use HTTPS. Open `/foundry/login#setup=YOUR_SETUP_TOKEN` privately for first-time setup. The fragment is not sent in URL requests or referrers. Setup sends it in the JSON POST body and atomically stores the bcrypt hash only if no password exists. After setup remove the setup token from the deployment environment. The ordinary login form needs only a password. No reset flow exists.

Passwords require at least 12 Unicode characters and at most 72 UTF-8 bytes (bcrypt's input limit). Hash cost is 12. Setup and login share an atomic global limit of 20 attempts per 15-minute window. This deliberately conservative limit may temporarily block legitimate login during an attack. Session tokens contain 256 random bits; their SHA-256 digests identify JSON records in KV with a 30-day TTL and checked expiry. Cookies always use HttpOnly, Secure, SameSite=Lax, Path=/, and the `__Host-` prefix. Logout revokes the record and clears the cookie. Browser mutations require matching Origin and JSON content type.

## Data and automation

The single `foundry:dashboard` JSON record is seeded once with explicitly marked sample content. CAS retries preserve concurrent edits. Initial document links come from the environment only at seeding; update existing document rows through the API afterward. Updates are fetched every 30 seconds while the page is visible and when returning to it. This is a live KV view, not a connection to an external project system.

Authenticate machine requests with `Authorization: Bearer <FOUNDRY_ORCHESTRATOR_TOKEN>`. Browser requests use the session cookie and same-origin header. Never put the machine token in browser code. Both credentials can read and update the workspace; only machine-authenticated comments are attributed to Orchestrator.

- `GET /api/foundry/data`: returns the dashboard, including IDs.
- `POST /api/foundry/projects`: `{ "id": "optional existing ID", "project": "Website", "task": "Review copy", "status": "active" }`. Status is active, waiting, or blocked. Omit ID to create.
- `POST /api/foundry/waiting`: `{ "list": "waitingOnYou", "text": "Approve copy" }` creates an item. Use `{ "list": "waitingOnMe", "id": "existing ID", "done": true }` to toggle.
- `POST /api/foundry/documents`: `{ "id": "optional existing ID", "label": "Website brief", "url": "https://actual-document-url" }` creates or updates a link.
- `POST /api/foundry/inputs`: `{ "text": "A note", "project": "optional tag" }`.
- `POST /api/foundry/comments`: `{ "inputId": "existing ID", "text": "A reply" }`.
- `POST /api/foundry/setup`: `{ "password": "...", "setupToken": "..." }`. Returns 409 if already initialized.
- `POST /api/foundry/login`: `{ "password": "..." }`.
- `POST /api/foundry/logout`: revokes the current session.

All POST bodies are JSON, limited to 16 KiB. API errors return `{ "error": "..." }`; KV outages return 503. Private responses have no-store headers. Back up KV using the provider's tools. The data model is intended for a small private workspace.

## Verification

Run `npm run build`, then `node app/foundry/tests/verify.mjs`. The integration harness starts the production Next.js server and calls it through curl. It first checks missing credentials, then uses an isolated local Redis REST test double with ephemeral random credentials. It checks setup authorization and races, repeat setup, wrong passwords, missing and forged cookies, cookie flags, concurrent data writes, comment attribution, toggles, project updates, CSRF, storage outages, logout, session expiry, and rate limits. It shuts down both servers afterward. It does not connect to a real KV instance or verify iOS browser rendering; validate the real provider and HTTPS cookie flow after configuring a preview deployment.

The production build and Foundry-only ESLint checks passed during implementation. Repository-wide `npm run lint` reports an existing `react-hooks/set-state-in-effect` error in `components/Reveal.tsx:25`, which was left unchanged.
