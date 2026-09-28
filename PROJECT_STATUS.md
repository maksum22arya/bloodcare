# BloodCare — Project Status

_Last updated: 2026-09-17_

## Completed

**Infra**
- [x] `docker-compose.yml` — nginx service (`bloodcare`) + Flask API service (`bloodcare-api`), shared `bloodcare-internal` network, external `cloudflare` network, named volume `bloodcare-data` mounted at `/data`
- [x] `Dockerfile` (root, nginx/frontend image)
- [x] `nginx.conf` — serves `frontend/`, proxies `/api/` to `bloodcare-api:3000`, gzip, manifest content-type, SW no-cache rule

**Backend** (`backend/`)
- [x] `config.py`, `extensions.py` — SQLite path from `DATA_DIR` env (falls back to local `backend/data` outside Docker)
- [x] `models.py` — `Account` (name unique, birth_date, `.age` property) and `BloodPressureRecord` (cascade-deletes with account)
- [x] `services/classification.py` — AHA/ACC BP classification (crisis > stage2 > stage1 > elevated > normal, highest-severity wins), age-adjusted pulse ranges, recommendation/warning pools (3/4/5/6/8 items per category as required), trend analysis (latest vs. avg of prior 3, ±5 mmHg combined threshold)
- [x] `utils/validators.py` — account + reading input validation
- [x] `routes/accounts.py` — CRUD, case-insensitive uniqueness
- [x] Account deletion password protection — reads `DELETE_PASSWORD`, requires the password in `DELETE /api/accounts/<id>`, returns HTTP 403 for an incorrect password
- [x] `routes/readings.py` — `POST /api/check` (saves only if `account_id` given), `GET /api/accounts/<id>/history`
- [x] `app.py` (factory, error handlers, `/api/health`), `wsgi.py`, `Dockerfile`, `.dockerignore`

**Frontend** (`frontend/`)
- [x] `index.html` — fixed header (logo + tagline + hamburger), offcanvas menu (Create/Edit Account, History, direct Theme/Language toggles with icons), Dashboard / Result / History sections, Create Account + Manage Accounts + Delete Account modals, toast container
- [x] `css/style.css` — dark (#121212/#1E1E1E/#2A2A2A, default) + light healthcare (#ffffff/#f8fafc/#0ea5e9) theme tokens, category colors, crisis pulse animation, rounded cards, mobile-first
- [x] `js/api.js`, `i18n.js` (EN+ID, full dictionary incl. all recommendation/warning/category/pulse/trend ids), `theme.js`, `views.js`, `charts.js` (hand-rolled canvas line charts, no external chart lib), `accounts.js`, `dashboard.js`, `history.js`, `app.js`
- [x] Account deletion dialog — requires the configured delete password and displays translated invalid-password errors
- [x] Dashboard account selection resets to no account after a reading is saved, while the result analysis remains visible
- [x] UI spacing and layout audit — consistent spacing tokens, responsive dashboard form, balanced menu touch targets, and scannable elevated history cards
- [x] UI consistency pass — equal hamburger item rhythm, inherited icon colors, and modern healthcare light-theme palette
- [x] `manifest.webmanifest`, `sw.js` (cache-first shell, network-only `/api/`, offline navigation fallback)
- [x] `vendor/bootstrap/` — Bootstrap 5.3.3 vendored locally (offline-safe, no CDN dependency)
- [x] `icons/*` — pre-existing, referenced by manifest + header + apple-touch-icon

## Current task
Build complete. Final verification pass done (see below).

## Verification performed
- Cross-checked every DOM id referenced in JS against `index.html` — all present.
- Cross-checked every i18n key used dynamically in JS (categories, pulse status, trend, all `rec_*`/`warn_*` ids, error/account messages) against both `en` and `id` dictionaries in `i18n.js` — all present in both.
- Cross-checked API call paths in `api.js` against Flask blueprint routes in `routes/accounts.py` and `routes/readings.py` — match exactly (`/api/accounts`, `/api/accounts/<id>`, `/api/check`, `/api/accounts/<id>/history`).
- Confirmed Flask blueprint `url_prefix` + empty-string route (`@bp.get("")`) resolves correctly per Flask/Werkzeug blueprint registration rules.
- Confirmed SQLite URI construction (`sqlite:///` + absolute `DATA_DIR` path) yields the correct 4-slash absolute-path form.
- Confirmed `sw.js` `PRECACHE_URLS` js file list matches the actual 9 files in `frontend/js/`.
- Fixed a gap where `history.js` had no error handling around the history fetch (would have caused an unhandled rejection on network/404 errors) — now shows a toast and resets to the empty state.
- Fixed account CRUD error messages in `accounts.js` to map backend error codes to translated strings instead of showing raw English text in Indonesian mode.
- **Not verified by actually running**: no Docker or Python interpreter was available in this environment, so the build was never executed. Please run `docker compose up -d --build` and smoke-test before relying on this as final.

## Known issues / decisions made
- Backend listens on port **3000** inside the container to match `nginx.conf`'s proxy_pass target — do not change without updating nginx.
- Model is `BloodPressureRecord` (not `Reading`), per the latest instructions.
- No chart library is vendored; trend/systolic/diastolic charts use a small hand-written canvas line-chart function (`charts.js`) to keep the stack vanilla-JS-only and offline-safe.
- Backend containers run as root (default alpine python image) — acceptable for this scope; harden with a non-root user later if desired.
- Recommendation/warning text is looked up client-side by stable id (`rec_*`, `warn_*`) returned from the backend, so language never needs backend involvement.

## Next recommended task
Run `docker compose up -d --build` in an environment with Docker available, then manually smoke-test: create an account, submit a reading with/without an account selected, check the result screen, view history (charts + trend + cards), edit/delete an account, toggle theme and language, and verify the app installs/works offline as a PWA.
