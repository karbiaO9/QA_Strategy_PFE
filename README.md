# XXXConnect Identity API QA Automation

Backend API test project for XXXConnect Identity Sprint 1 authentication tests using Postman + Newman with Markdown reporting.

## Project Purpose

- Execute Sprint 1 authentication STCs against `https://identity.physio.agregatech.com`
- Produce deterministic Markdown test artifacts:
  - STC reports (one file per STC)
  - Bug reports (only on failures)
  - SQTR report (aggregated sprint-level quality status)

## Folder Structure

```text
backend-testing/          # API / Newman / STC reporting
  postman/
  qa-config-sprint1/
  stc_sheets/
  reports/
  scripts/
  sprint1/

frontend-testing/         # Playwright + POM (auth, smoke, regression, STC markdown reports)

Frontend to test/         # XXX Next.js app under test
Backend to test/          # Backend source (if present)
```

## Install Dependencies

```bash
npm install
```

## Run Newman Collection

```bash
npm run test:api:auth
```

This writes:
- `backend-testing/reports/newman/auth-results.json`
- `backend-testing/reports/newman/auth-report.html`

## Generate Markdown Reports

```bash
npm run report:md
```

Or run all in one command:

```bash
npm run test:api:auth:report
```

### Newman + Markdown + n8n webhook (local automation)

After Newman and `generate-md-reports-from-newman.js` finish, uploads `.md` files under `backend-testing/reports/markdown` to your n8n webhook as **multipart/form-data**. By default **all files are sent in a single HTTP request** (multiple parts, same field name `file`), which matches how many n8n test webhooks behave. Use `WEBHOOK_UPLOAD_MODE=sequential` in `.env` if you need one POST per file.

```bash
npm run qa:newman:md:webhook
```

If reports are **already** generated and you only want to push them to n8n:

```bash
npm run qa:upload-markdown:webhook
```

That scans `reports/markdown` (override with `REPORTS_DIR` / `REPORT_GLOB` in `.env`) and sends each `.md` as `multipart/form-data` (`file` field by default).

Copy `.env.example` to `.env` and set `WEBHOOK_URL` (and optional `COLLECTION_PATH`, `ENVIRONMENT_PATH`, `NEWMAN_JSON_OUT`, `NEWMAN_CMD`, `REPORTS_DIR`, `REPORT_GLOB`, `WEBHOOK_FIELD_NAME`, `WEBHOOK_UPLOAD_MODE`) as needed. If `.env` is absent, the script still defaults the webhook to the local n8n test URL from the automation spec.

Generated files:
- `reports/markdown/stc/STC-AUTH-002B.md`
- `reports/markdown/stc/STC-AUTH-004B.md`
- `reports/markdown/stc/STC-AUTH-005B.md`
- `reports/markdown/stc/STC-AUTH-006B.md`
- `reports/markdown/stc/STC-AUTH-010B.md`
- `reports/markdown/bugs/BUG-AUTH-xxx.md` (only for failures)
- `reports/markdown/sqtr/SQTR-Sprint1-Auth.md`

## Known Data Gaps

- Patient phone numbers are missing by default; `patient_phone_marie` must be filled to validate phone/password login flow.

## Known Endpoint Mapping Warnings

- `STC-AUTH-006/B` description mentions Patient single-profile login, but mapped endpoint is Kine refresh.
- `STC-AUTH-010/B` description mentions Admin login, but mapped endpoint is Kine change-password.
- `STC-AUTH-002/B` description mentions invalid credentials/failure counter, but mapped endpoint is select-profile.

## Safety Note

- Do not run destructive change-password tests on real users unless a reversible test account and rollback strategy are provided.

## Credential Handling




- Local Postman environment contains credentials and is ignored in git via `.gitignore`.
