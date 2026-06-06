# Frontend to test � Routes Test Inventory

**Document type:** QA route catalog for Playwright / STC traceability  
**Source:** Next.js App Router (`app/**/page.tsx`), `config/routes.ts`, sidebar configs, in-app navigation  
**Last updated:** 2026-05-18

---

## Overview

The workspace contains **two separate Next.js applications** in an Nx monorepo:

| App | Path | Dev port | Primary platform |
|-----|------|----------|------------------|
| **XXX** | `apps/physio` | **3001** | XXX (kine) � auth guards implemented |
| **Admin** | `apps/admin` | **3000** | Admin back-office � no route guards yet |

Route groups such as `(auth)` and `(protected)` are **not** part of the URL path.

---

## Summary counts

| App | Public / auth routes | Protected routes | Dynamic detail routes | Total `page.tsx` |
|-----|----------------------|------------------|----------------------|------------------|
| **XXX** | 11 (+ 2 query variants) | 9 | 2 | **21** |
| **Admin** | 4 | 13 | � | **17** |
| **Combined** | | | | **38** |

---

## XXX app (`apps/physio`)

**Base URL (dev):** `http://localhost:3001`

### Public routes � `(auth)/` layout + `PublicRoute` guard

| Route | Page file | Notes |
|-------|-----------|--------|
| `/login` | `app/(auth)/login/page.tsx` | Redirects to `/` when authenticated |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Navigates to `/verify-code?email=...` on submit |
| `/verify-code` | `app/(auth)/verify-code/page.tsx` | Requires `?email=` query param |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Requires `?email=` and `?token=` query params |
| `/signup` | `app/(auth)/signup/page.tsx` | Linked from login |
| `/signup/assistant` | `app/(auth)/signup/assistant/page.tsx` | Standalone assistant registration form |
| `/signup/practitioner` | `app/(auth)/signup/practitioner/page.tsx` | Standalone practitioner registration form |
| `/create-profile` | `app/(auth)/create-profile/page.tsx` | Linked from select-profile and sidebar |
| `/create-profile/assistant` | `app/(auth)/create-profile/assistant/page.tsx` | Assistant profile creation |
| `/create-profile/practitioner` | `app/(auth)/create-profile/practitioner/page.tsx` | Practitioner profile creation |
| `/select-profile` | `app/(auth)/select-profile/page.tsx` | Post-login profile selection |

#### Query-param route variants (XXX auth)

| Route pattern | When used |
|---------------|-----------|
| `/verify-code?email={encodedEmail}` | After successful forgot-password submit |
| `/reset-password?email={encodedEmail}&token={resetToken}` | After successful verify-code |

#### Public route guard behavior

- Authenticated user visiting any public auth route ? redirect to **`/`**
- Missing `email` on `/verify-code` ? redirect to **`/forgot-password`**
- Missing `email` or `token` on `/reset-password` ? redirect to **`/forgot-password`**

---

### Protected routes � `(protected)/` layout + `ProtectedRoute` (via `MainLayout`)

| Route | Page file | Sidebar (`config/sidebar.ts`) |
|-------|-----------|-------------------------------|
| `/` | `app/(protected)/(dashboard)/page.tsx` | Yes � Tableau de bord |
| `/patients` | `app/(protected)/patients/page.tsx` | Yes � Patients |
| `/patients/1` | `app/(protected)/patients/1/page.tsx` | No (detail; list navigates here) |
| `/calendar` | `app/(protected)/calendar/page.tsx` | Yes � Calendrier |
| `/library` | `app/(protected)/library/page.tsx` | Yes � Biblioth�que |
| `/programs` | `app/(protected)/programs/page.tsx` | Yes � Programmes affect�s |
| `/practitioners` | `app/(protected)/practitioners/page.tsx` | Yes � Praticiens |
| `/practitioners/1` | `app/(protected)/practitioners/1/page.tsx` | No (detail; list navigates here) |
| `/settings` | `app/(protected)/settings/page.tsx` | Yes � Param�tres |

#### Protected route guard behavior

- Unauthenticated user ? redirect to **`/login`**
- Session bootstrap: `GET /api/v1/kine/me` when `localStorage` key `pc_access_token` exists but Redux `user` is missing
- Loading spinner shown while `getMe` is in flight or auth is not initialized

---

### XXX navigation flows

```
/login ??????????????????????????????? /
/forgot-password ???????????????????? /verify-code?email=...
/verify-code ??????????????????????? /reset-password?email=...&token=...
/reset-password ?????????????????????? /login
/login ??(link)??? /signup
/select-profile ???????????????????? /  or  /create-profile
/patients ??(row click)??? /patients/1
/practitioners ??(row click)??? /practitioners/1
sidebar ??(logout)??? client state cleared (no route change)
```

---

## Admin app (`apps/admin`)

**Base URL (dev):** `http://localhost:3000`  
**Route constants:** `apps/admin/config/routes.ts`  
**Sidebar:** `apps/admin/config/sidebar.ts`

> **Note:** Admin has **no** `ProtectedRoute` / `PublicRoute` guards. All routes are currently reachable without authentication.

### Auth routes � `(auth)/` layout

| Route | Constant (`ROUTES`) | Page file |
|-------|---------------------|-----------|
| `/login` | `LOGIN` | `app/(auth)/login/page.tsx` |
| `/forgot-password` | `FORGOT_PASSWORD` | `app/(auth)/forgot-password/page.tsx` |
| `/verify-otp` | `VERIFY_OTP` | `app/(auth)/verify-otp/page.tsx` |
| `/reset-password` | `RESET_PASSWORD` | `app/(auth)/reset-password/page.tsx` |

#### Admin auth navigation flow

```
/login ????????????????????????????? /forgot-password
/forgot-password ??????????????????? /verify-otp
/verify-otp ???????????????????????? /reset-password
/reset-password ???????????????????? /login
/login (success) ??????????????????? /
```

---

### Protected layout routes � `(protected)/` layout

| Route | Constant (`ROUTES`) | Sidebar | Page file |
|-------|---------------------|---------|-----------|
| `/` | `DASHBOARD` | Yes | `app/(protected)/(dashboard)/page.tsx` |
| `/access-management/modules` | `ACCESS_MODULES` | Yes (sub-item) | `access-management/modules/page.tsx` |
| `/access-management/permissions` | `ACCESS_PERMISSIONS` | Yes (sub-item) | `access-management/permissions/page.tsx` |
| `/access-management/actions` | `ACCESS_ACTIONS` | Yes (sub-item) | `access-management/actions/page.tsx` |
| `/roles` | `ROLES` | Yes | `roles/page.tsx` |
| `/users` | `USERS` | Yes | `users/page.tsx` |
| `/clinics` | `CLINICS` | Yes | `clinics/page.tsx` |
| `/library` | `LIBRARY` | Yes | `library/page.tsx` |
| `/notifications` | `NOTIFICATIONS` | Yes | `notifications/page.tsx` |
| `/ai-supervision` | `AI_SUPERVISION` | Yes | `ai-supervision/page.tsx` |
| `/plans` | `PLANS` | Yes | `plans/page.tsx` |
| `/faqs` | `FAQS` | Yes | `faqs/page.tsx` |
| `/support` | `SUPPORT` | Yes | `support/page.tsx` |
| `/settings` | `SETTINGS` | **No** | `settings/page.tsx` |

---

## Testing priority

| Priority | Routes | Rationale |
|----------|--------|-----------|
| **P0** | XXX: `/login`, `/forgot-password`, `/verify-code`, `/reset-password`, `/` | Auth API integration + route guards |
| **P0** | XXX: protected deep links (e.g. `/calendar`, `/patients`) | Unauthenticated redirect to `/login` |
| **P0** | XXX: `/select-profile` | Post-login profile flow |
| **P1** | XXX: `/signup`, `/signup/assistant`, `/signup/practitioner` | Registration (`POST .../auth/register`) |
| **P1** | XXX: `/create-profile`, `/create-profile/assistant`, `/create-profile/practitioner` | Profile creation flow |
| **P1** | XXX: remaining protected sidebar routes | Smoke + permissions when CASL is wired |
| **P2** | XXX: `/patients/1`, `/practitioners/1` | Detail pages (hardcoded segment `1`) |
| **P1** | Admin: `/login`, `/forgot-password`, `/verify-otp`, `/reset-password` | Admin auth UX (separate from XXX `verify-code`) |
| **P2** | Admin: all `(protected)` routes | UI smoke; guards not implemented |

---

## Known gaps (test planning)

| Gap | Impact on testing |
|-----|-------------------|
| Admin has no route guards | Protected URLs reachable without login until guards are added |
| `/settings` exists on Admin but is not in sidebar | Must be tested via direct URL navigation |
| `/patients/1` and `/practitioners/1` use fixed segment `1` | Not dynamic `[id]` routes yet � parameterize when API supports it |
| XXX sidebar logout calls `logoutUser()` only | Does not trigger `POST /api/v1/kine/auth/logout` (see auth STC doc) |
| XXX `GET /me` is `/api/v1/kine/me` (not `/auth/me`) | Assert correct URL in network tests |
| XXX refresh is `POST .../auth/refresh-token` (not `/auth/refresh`) | Assert correct URL in network tests |

---

## Full route list (copy-paste for Playwright)

### XXX � all paths

```
/login
/forgot-password
/verify-code
/verify-code?email=test@example.com
/reset-password
/reset-password?email=test@example.com&token=mock-token
/signup
/signup/assistant
/signup/practitioner
/create-profile
/create-profile/assistant
/create-profile/practitioner
/select-profile
/
/patients
/patients/1
/calendar
/library
/programs
/practitioners
/practitioners/1
/settings
```

### Admin � all paths

```
/login
/forgot-password
/verify-otp
/reset-password
/
/access-management/modules
/access-management/permissions
/access-management/actions
/roles
/users
/clinics
/library
/notifications
/ai-supervision
/plans
/faqs
/support
/settings
```

---

## Related documents

- [STC-AUTH-Frontend-Integration-Tests.md](./STC-AUTH-Frontend-Integration-Tests.md) � Authentication module frontend integration STCs (XXX)

---

*End of document.*
