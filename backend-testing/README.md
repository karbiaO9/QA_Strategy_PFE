# Backend testing

API and backend QA assets for XXX Connect (Postman, Newman, STC reports, sprint data).

## Layout

| Folder | Purpose |
|--------|---------|
| `postman/` | Postman collections and environments |
| `qa-config-sprint1/` | Sprint 1 project config and user stories |
| `stc_sheets/` | STC sheet notes and references |
| `reports/` | Newman output, markdown STCs/bugs/SQTR, templates |
| `scripts/` | Newman runners, report generators, Postman builders |
| `sprint1/` | Excel execution-ready sheets and sprint tables |

## Commands

Run from the **repository root** (see root `package.json`):

```bash
npm run test:physio:chain
npm run postman:physio-backend
npm run report:md:physio
```
