# XXX Connect � Frontend Playwright Framework

TypeScript + Playwright test framework for the XXX frontend (`Frontend to test`), using **Page Object Model (POM)**, reusable **storageState** authentication, and **STC V02R00** markdown reporting.

## Structure

```text
frontend-testing/
??? tests/              # Specs by suite (auth, smoke, regression)
??? pages/              # Page objects
??? components/         # Reusable UI components (form fragments)
??? fixtures/           # Extended test + STC annotations
??? utils/              # API helpers, reporters, evidence
??? constants/          # Routes, API paths, tags
??? data/               # Credentials and environment JSON
??? reports/            # html, junit, allure, markdown (STC)
??? screenshots/        # Failure copies for evidence refs
??? videos/             # Reserved / CI artifacts
??? traces/             # Reserved / CI artifacts
??? playwright/.auth/   # Generated storageState (gitignored)
??? global-setup.ts     # API login ? storageState
??? global-teardown.ts
??? playwright.config.ts
```

## Prerequisites

1. **Node.js** ? 18  
2. **XXX app** reachable (default `https://kine.physio.agregatech.com`). For local runs, set `BASE_URL=http://localhost:3001` in `.env`.

3. Copy `.env.example` ? `.env` and set credentials (aligned with `backend-testing/postman`).

## Install & run

```bash
cd frontend-testing
npm install
npx playwright install chromium
npm test
```

### Targeted runs

| Command | Description |
|---------|-------------|
| `npm run test:auth` | Auth specs with authenticated project |
| `npm run test:smoke` | `@smoke` tagged tests (guest) |
| `npm run test:regression` | `@regression` (authenticated) |
| `npm run test:integration` | `@integration` API + UI tests |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | Open HTML report |

## Authentication (storageState)

`global-setup.ts`:

1. Calls `POST /api/v1/kine/auth/login` with `KINE_EMAIL` / `KINE_PASSWORD`
2. Opens `BASE_URL` and sets `localStorage.pc_access_token`
3. Saves `playwright/.auth/physio-kine.json`

Projects:

- **chromium-guest** � empty storage (login / validation flows)
- **chromium-auth** � uses saved storageState (session / protected routes)

## STC markdown reports

Custom reporter: `utils/reporters/stc-markdown-reporter.ts`

- Loads template: `backend-testing/reports/templates/STC Software Test Case Sheet template V02R00.md`
- Writes one file per test with `stc` annotation ? `reports/markdown/STC-AUTH-001-F.md`

Annotate tests:

```typescript
test('STC-AUTH-001/F ...', {
  annotation: stcAnnotations({
    stcId: 'STC-AUTH-001/F',
    module: 'Authentication � Login',
    priority: 'P0',
    endpoint: 'POST /api/v1/kine/auth/login',
  }),
}, async ({ loginPage }) => { ... });
```

## CI/CD

Set environment variables:

- `CI=true`
- `BASE_URL`, `KINE_EMAIL`, `KINE_PASSWORD`
- `WORKERS`, `RETRIES`

Artifacts: `reports/html`, `reports/junit/results.xml`, `reports/allure-results`, `reports/markdown/`.

## Auth STC coverage (28 tests)

| Spec file | STC IDs |
|-----------|---------|
| `tests/auth/login.spec.ts` | 001/F � 004/F |
| `tests/auth/logout.spec.ts` | 005/F � 008/F |
| `tests/auth/forgetpassword.spec.ts` | 009/F � 012/F |
| `tests/auth/verify-code.spec.ts` | 013/F � 016/F |
| `tests/auth/reset-password.spec.ts` | 017/F � 020/F |
| `tests/auth/me.spec.ts` | 021/F � 024/F |
| `tests/auth/refresh.spec.ts` | 025/F � 028/F |

Run all auth STCs: `npm run test:auth` or `npx playwright test tests/auth`

**Env for password chain:** set `VERIFICATION_CODE` and `RESET_TOKEN` in `.env` after forgot-password / verify-code (013, 017).

## Invitation & Profile STC coverage (6 STCs)

Frontend API-integration suites driving the live backend
(`https://kine.physio.agregatech.com`).

| Spec file | STC ID | Endpoint |
|-----------|--------|----------|
| `tests/invitations/create-invitation.spec.ts` | STC-INVIT-GEN-003/B | `POST /kine/auth/invitations` |
| `tests/invitations/invitation-preview.spec.ts` | STC-INVIT-GEN-004/B | `POST /kine/auth/invitations/preview` |
| `tests/invitations/invitation-assistant.spec.ts` | STC-INVIT-ASST-002/B | `POST /kine/auth/invitations` |
| `tests/invitations/invitation-attach.spec.ts` | STC-INVIT-ATTACH-002/B | `POST /kine/auth/invitations/attach` |
| `tests/profiles/select-profile.spec.ts` | STC-PROFILE-SELECT-003/B | `POST /kine/auth/select-profile` |
| `tests/profiles/add-profile.spec.ts` | STC-PROFILE-ADD-003/B | `POST /kine/profiles` |

Projects (see `playwright.config.ts`):

- **chromium-kine-admin** - cabinet-admin storageState; runs `tests/invitations`
  (creating invitations requires Kine admin rights). Public deep-link /
  register specs clear storage per-test.
- **chromium-kine** - member storageState; runs `tests/profiles`
  (switcher + add profile require a logged-in Kine).

Run:

```bash
npx playwright test tests/invitations --project=chromium-kine-admin
npx playwright test tests/profiles    --project=chromium-kine
```

**Required `.env`:**

- `KINE_ADMIN_EMAIL` / `KINE_ADMIN_PASSWORD` - Kine admin (invitation creation).
  Falls back to `KINE_EMAIL` / `KINE_PASSWORD` when unset.
- `KINE_EMAIL` / `KINE_PASSWORD` - member account (profile switcher / add).
- `INVITATION_ID` *(optional)* - a live, unconsumed invitation id; enables the
  preview-prefill and attach success paths. Without it those positive paths
  `test.skip()` while validation and 401/403/409 error-handling paths still run.

Every spec degrades to `test.skip()` (never a hard failure) when its
credentials, switcher, or invitation data are unavailable - so the suite is
safe to run in any environment. Negative/error paths (client validation,
HTTP 401/403/409) use route interception for determinism; positive paths hit
the real backend and create real data (invitations use unique
`KINE_EMAIL+tag` addresses to avoid collisions).

## Adding tests

1. Add page/component under `pages/` or `components/`
2. Use `fixtures/test.fixture.ts` (`loginPage`, `dashboardPage`, �)
3. Tag: `@smoke`, `@regression`, `@integration`, `@auth`
4. Add STC annotation for markdown output
5. Place spec under `tests/auth`, `tests/smoke`, or `tests/regression`

## Related docs

- STC spec: `Frontend to test/docs/STC-AUTH-Frontend-Integration-Tests.md`
- Backend Postman env: `backend-testing/postman/physio-backend/PHYSIO-Backend-Execution.postman_environment.json`
