# XXX Platform — Authentication Module  
## Frontend Integration Test Cases (STC Format)

**Document type:** QA specification for Playwright (frontend ↔ backend integration)  
**Application context:** `Frontend to test` — Next.js XXX app, RTK Query (`authApi`), Redux auth slice, route guards (`ProtectedRoute`, `PublicRoute`)  
**Suffix:** All STC IDs use `/F` (frontend integration)  
**Automated tests:** `frontend-testing/tests/auth/*.spec.ts`  
**Test data source:** `frontend-testing/data/auth/kine.credentials.ts` (reads `frontend-testing/.env`)  
**Configure tests:** Copy `frontend-testing/.env.example` → `frontend-testing/.env` and set credentials.

> **Note:** Concrete values in the **local `.env` (reference)** column come from `frontend-testing/.env` in this workspace. Other environments must set their own `KINE_EMAIL` / `KINE_PASSWORD`; specs always read env vars, not hardcoded strings.

### Environment (from `.env` / `.env.example`)

| Variable | Purpose | `.env.example` | Local `.env` (reference) |
|----------|---------|----------------|-------------------------|
| `BASE_URL` | App under test | `https://kine.physio.agregatech.com` | `https://kine.physio.agregatech.com` |
| `APP_NAME` | Report label | `XXX Connect` | `XXX Connect` |
| `API_BASE_URL` | Identity host | `https://identity.physio.agregatech.com` | `https://identity.physio.agregatech.com` |
| `API_KINE_AUTH_PATH` | Auth path prefix | `/api/v1/kine/auth` | `/api/v1/kine/auth` |
| `API_KINE_PATH` | Kine API prefix | `/api/v1/kine` | `/api/v1/kine` |
| `KINE_EMAIL` | Registered practitioner | *(empty — required)* | `sophie.martin@cabinet-paris.fr` |
| `KINE_PASSWORD` | Valid password | *(empty — required)* | `KineAdmin123!` |
| `KINE_PHONE` | Optional phone login | *(empty)* | `+33601010101` |
| `KINE_PASSWORD_INVALID` | Wrong password (negative tests) | `WrongP@ssword1!` | `WrongP@ssword1!` |
| `VERIFICATION_CODE` | OTP override (optional) | *(empty)* | *(runtime / IMAP)* |
| `RESET_TOKEN` | Reset token override (optional) | *(empty)* | *(runtime)* |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Inbox for OTP emails | *(empty)* | *(optional)* |
| `OTP_SENDER` | Expected OTP sender | `it.purasolutions@gmail.com` | — |
| `PROJECT_NAME` | STC report metadata | `XXX & Connect` | `XXX & Connect` |
| `USER_ROLE_TESTED` | STC report metadata | `Kine practitioner (test account)` | — |

**Resolved API URLs** (from env above):

| Logical endpoint | Full URL |
|------------------|----------|
| Login | `https://identity.physio.agregatech.com/api/v1/kine/auth/login` |
| Logout | `https://identity.physio.agregatech.com/api/v1/kine/auth/logout` |
| Forgot password | `https://identity.physio.agregatech.com/api/v1/kine/auth/forgot-password` |
| Verify code | `https://identity.physio.agregatech.com/api/v1/kine/auth/verify-code` |
| Reset password | `https://identity.physio.agregatech.com/api/v1/kine/auth/reset-password` |
| Refresh token | `https://identity.physio.agregatech.com/api/v1/kine/auth/refresh-token` |
| Me (session) | `https://identity.physio.agregatech.com/api/v1/kine/me` |

**Code mapping:** `kineCredentials.email` → `KINE_EMAIL`, `kineCredentials.password` → `KINE_PASSWORD`, `kineCredentials.invalidPassword` → `KINE_PASSWORD_INVALID`.

### Shared test data (Playwright specs)

| Key | Env var | Value in local `.env` | Used in |
|-----|---------|----------------------|---------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` | Login, forgot-password, verify-code, reset, session |
| Password | `KINE_PASSWORD` | `KineAdmin123!` | Login, session |
| Invalid password | `KINE_PASSWORD_INVALID` | `WrongP@ssword1!` | STC-AUTH-002/F, STC-AUTH-028/F |
| Phone (optional) | `KINE_PHONE` | `+33601010101` | Phone-format login (if enabled) |
| Invalid OTP | — (constant in spec) | `999999` | STC-AUTH-015/F |
| New password (reset) | — (constant in spec) | `QaTest123!` | STC-AUTH-017/F – 020/F |
| Invalid login id | — (constant in spec) | `not-valid` | STC-AUTH-003/F |
| Short password | — | `12345` | STC-AUTH-003/F |
| Invalid forgot email | — | `not-an-email` | STC-AUTH-010/F |
| Invalid JWT | — | `invalid.jwt.token.value` | STC-AUTH-022/F |
| Stale token | — | `bogus-stale-token` | STC-AUTH-028/F |

### Shared routes (relative to `BASE_URL`)

| Route | Path | Full URL (local `.env`) |
|-------|------|-------------------------|
| Login | `/login` | `https://kine.physio.agregatech.com/login` |
| Dashboard | `/` | `https://kine.physio.agregatech.com/` |
| Forgot password | `/forgot-password` | `https://kine.physio.agregatech.com/forgot-password` |
| Verify code | `/verify-code?email=<encoded>` | `https://kine.physio.agregatech.com/verify-code?email=sophie.martin%40cabinet-paris.fr` |
| Reset password | `/reset-password?email=...&token=...` | *(token from verify-code response)* |
| Calendar (protected) | `/calendar` | `https://kine.physio.agregatech.com/calendar` |

---

## STC-AUTH-001/F

**STC ID:** STC-AUTH-001/F  
**Title:** Successful login — request, token persistence, redirect, and protected access  
**Priority:** P0  
**Module:** Authentication — Login  
**Endpoint:** `POST https://identity.physio.agregatech.com/api/v1/kine/auth/login`  
**Test Type:** Frontend integration (positive)

**Preconditions:**  
- App reachable at `BASE_URL` (`https://kine.physio.agregatech.com`).  
- `KINE_EMAIL` / `KINE_PASSWORD` set in `frontend-testing/.env` (e.g. `sophie.martin@cabinet-paris.fr` / `KineAdmin123!`).  
- `localStorage` cleared (`pc_access_token` absent).

**Postconditions:**  
- User authenticated; `pc_access_token` set; protected routes accessible without redirect to login.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Password | `KINE_PASSWORD` | `KineAdmin123!` |
| Request body | — | `{ "email": "sophie.martin@cabinet-paris.fr", "password": "KineAdmin123!" }` |

**Steps:**  
1. Open `/login`.  
2. Fill **Numéro ou adresse email** and **Mot de passe** with valid credentials.  
3. Submit the form.  
4. Assert one `POST /api/v1/kine/auth/login` with JSON body matching submitted email and password.  
5. Assert response `ok()` and body contains non-empty `accessToken`.  
6. Assert URL is not `/login` (dashboard / authenticated shell).  
7. Assert `localStorage.pc_access_token` equals response `accessToken`.  
8. Navigate to `/` again; assert URL does not end with `/login`.

**Expected Result:**  
- Login API succeeds with correct payload.  
- Access token persisted under `pc_access_token`.  
- User leaves login and stays authenticated on protected navigation.

**Acceptance Criteria:**  
- [ ] Exactly one login `POST` per submit.  
- [ ] Response status is 2xx and `accessToken` is present.  
- [ ] `pc_access_token` in `localStorage` matches API `accessToken`.  
- [ ] After `page.goto('/')`, user is not redirected to `/login`.

---

## STC-AUTH-002/F

**STC ID:** STC-AUTH-002/F  
**Title:** Login failure — invalid credentials, no session, redirect on protected access  
**Priority:** P0  
**Module:** Authentication — Login  
**Endpoint:** `POST /api/v1/kine/auth/login`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Cleared storage; user on `/login`.

**Postconditions:** No `pc_access_token`; user on login when accessing protected routes.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Password | `KINE_PASSWORD_INVALID` | `WrongP@ssword1!` |
| Request body | — | `{ "email": "sophie.martin@cabinet-paris.fr", "password": "WrongP@ssword1!" }` |

**Steps:**  
1. Open `/login`; accept error dialog if shown.  
2. Submit valid-format email with wrong password.  
3. Assert login `POST` is sent.  
4. Assert response `ok()` is false.  
5. Assert user remains on login page.  
6. Assert `pc_access_token` is falsy.  
7. Navigate to `/`; assert URL matches `/login`.

**Expected Result:**  
- API rejects credentials.  
- No token stored.  
- Protected route forces login.

**Acceptance Criteria:**  
- [ ] Login `POST` occurs with correct email and wrong password.  
- [ ] HTTP response is not successful.  
- [ ] `readAccessToken(page)` is falsy after failure.  
- [ ] `page.goto('/')` lands on `/login`.

---

## STC-AUTH-003/F

**STC ID:** STC-AUTH-003/F  
**Title:** Login form — client-side validation blocks submit and API call  
**Priority:** P1  
**Module:** Authentication — Login  
**Endpoint:** `POST /api/v1/kine/auth/login` (must not fire when invalid)  
**Test Type:** Frontend integration (validation)

**Preconditions:** Network listener counting login `POST`s; cleared storage.

**Postconditions:** No login request until all fields pass validation.

**Required Test Data:**

| Scenario | Email / phone | Password |
|----------|---------------|----------|
| Empty submit | (empty) | (empty) |
| Invalid identifier | `not-valid` | `123456` |
| Short password | `sophie.martin@cabinet-paris.fr` (`KINE_EMAIL`) | `12345` |
| Valid submit | `sophie.martin@cabinet-paris.fr` | `KineAdmin123!` (`KINE_PASSWORD`) |

**Steps:**  
1. Open `/login`; submit empty form → expect required-field message (`/obligatoire/i`); login `POST` count = 0.  
2. Fill `not-valid` + `123456`; submit → expect destructive text matching email/phone validation; login count = 0.  
3. Fill valid email + `12345`; submit → expect message matching `/mot de passe doit contenir au moins 6/i`; login count = 0.  
4. Fill valid credentials; submit → exactly one login `POST` (total count = 1).

**Expected Result:**  
- Invalid inputs show inline French validation.  
- Backend is never called until the form is valid.

**Acceptance Criteria:**  
- [ ] Empty submit: visible required error; zero login requests.  
- [ ] `not-valid`: visible email/phone error; zero login requests.  
- [ ] 5-char password: visible min-length error; zero login requests.  
- [ ] Valid credentials: exactly one login request.

---

## STC-AUTH-004/F

**STC ID:** STC-AUTH-004/F  
**Title:** Login — loading state, disabled inputs, and resilience to 5xx  
**Priority:** P1  
**Module:** Authentication — Login  
**Endpoint:** `POST /api/v1/kine/auth/login`  
**Test Type:** Frontend integration (UX + error handling)

**Preconditions:** Route mock on `**/api/v1/kine/auth/login`; valid credentials.

**Postconditions:** After retry, user can log in; inputs re-enabled after error.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Password | `KINE_PASSWORD` | `KineAdmin123!` |
| First response | — | HTTP 500, `{ "message": "Erreur serveur" }`, delay ~600 ms |
| Second response | — | Pass-through to identity API (success) |

**Steps:**  
1. Open `/login`; fill valid credentials; accept dialog on error.  
2. Submit with route mock: first call returns 500 after delay.  
3. While in flight: email and password inputs are **disabled**.  
4. After 500: inputs are **enabled** again.  
5. Submit again (mock allows continue); assert successful response and URL not `/login`.

**Expected Result:**  
- Inputs disabled during request; re-enabled after failure.  
- Second submit succeeds without page crash.

**Acceptance Criteria:**  
- [ ] During first submit, both inputs `toBeDisabled()`.  
- [ ] After 500, both inputs `toBeEnabled()`.  
- [ ] Second submit: response `ok()` and user leaves `/login`.

---

## STC-AUTH-005/F

**STC ID:** STC-AUTH-005/F  
**Title:** Server logout — POST /logout clears session and redirects to login  
**Priority:** P0  
**Module:** Authentication — Logout  
**Endpoint:** `POST /api/v1/kine/auth/logout`  
**Test Type:** Frontend integration (positive)

**Preconditions:** User logged in via `ensureAuthSession` (same as UI login). Note: sidebar uses client-only `logoutUser()`; this STC exercises server logout as `useLogoutMutation` would.

**Postconditions:** Token removed; `/` redirects to login.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Password | `KINE_PASSWORD` | `KineAdmin123!` |
| Logout URL | — | `POST https://identity.physio.agregatech.com/api/v1/kine/auth/logout` |
| Logout header | — | `Authorization: Bearer <accessToken from login>` |

**Steps:**  
1. Establish session; confirm `accessToken` present.  
2. Trigger server logout API (test harness equivalent to mutation).  
3. Assert `pc_access_token` removed.  
4. `page.goto('/')` → URL matches `/login`.

**Expected Result:**  
- Server logout clears client token.  
- Protected navigation requires login again.

**Acceptance Criteria:**  
- [ ] Session exists before logout (`accessToken` truthy).  
- [ ] After logout, `readAccessToken(page)` is falsy.  
- [ ] Navigating to `/` ends on `/login`.

---

## STC-AUTH-006/F

**STC ID:** STC-AUTH-006/F  
**Title:** Logout API failure — token may remain (current RTK behavior)  
**Priority:** P1  
**Module:** Authentication — Logout  
**Endpoint:** `POST /api/v1/kine/auth/logout`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Logged-in user; logout route mocked to 500.

**Postconditions:** Document actual behavior — token may remain until `queryFulfilled`.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Password | `KINE_PASSWORD` | `KineAdmin123!` |
| Mock response | — | HTTP 500, `{ "message": "Logout failed" }` |

**Steps:**  
1. Log in successfully.  
2. Mock `POST .../logout` → 500.  
3. Invoke logout `fetch` with Bearer token (mirrors mutation).  
4. Assert `pc_access_token` **still present** (current `onQueryStarted` only clears after success).

**Expected Result:**  
- Failed logout does not clear token with current implementation.  
- No uncaught exception.

**Acceptance Criteria:**  
- [ ] Logout API returns 500.  
- [ ] `readAccessToken(page)` remains truthy after failed logout.  
- [ ] Behavior documented for product decision (force-clear vs keep session).

---

## STC-AUTH-007/F

**STC ID:** STC-AUTH-007/F  
**Title:** Sidebar logout — client-only, no POST /logout (integration gap)  
**Priority:** P2  
**Module:** Authentication — Logout  
**Endpoint:** `POST /api/v1/kine/auth/logout` (expected when fully integrated)  
**Test Type:** Frontend integration (observability)

**Preconditions:** Logged in; sidebar ready; network monitor on logout path.

**Postconditions:** Client session cleared locally; server may still hold refresh token.

**Required Test Data:** Session via `KINE_EMAIL`=`sophie.martin@cabinet-paris.fr`, `KINE_PASSWORD`=`KineAdmin123!`.

**Steps:**  
1. Log in; wait for sidebar.  
2. Count `POST .../logout` requests.  
3. Click sidebar **Déconnexion**.  
4. Assert logout API call count = 0.  
5. Assert `pc_access_token` removed.

**Expected Result:**  
- Sidebar clears local state only.  
- No server invalidation call (documented gap).

**Acceptance Criteria:**  
- [ ] `logoutApiCalls === 0` after sidebar logout.  
- [ ] `readAccessToken(page)` is falsy after sidebar logout.

---

## STC-AUTH-008/F

**STC ID:** STC-AUTH-008/F  
**Title:** Post-logout navigation — protected routes redirect to login  
**Priority:** P1  
**Module:** Authentication — Logout  
**Endpoint:** N/A (client sidebar logout)  
**Test Type:** Frontend integration (navigation)

**Preconditions:** Logged in, then sidebar logout.

**Postconditions:** Only public routes reachable without login.

**Required Test Data:**

| URL | Expected after logout |
|-----|------------------------|
| `/calendar` | Redirect to `/login` |
| `/login` | Stays on `/login` |

**Steps:**  
1. Log in; go to `/calendar` (not on login).  
2. Sidebar logout.  
3. `page.goto('/calendar')` → URL matches `/login`.  
4. `page.goto('/login')` → URL ends with `/login`.

**Expected Result:**  
- Protected deep links blocked after logout.  
- Login page accessible when logged out.

**Acceptance Criteria:**  
- [ ] Before logout, `/calendar` does not show login URL.  
- [ ] After logout, `/calendar` redirects to `/login`.  
- [ ] `/login` loads without bounce when logged out.

---

## STC-AUTH-009/F

**STC ID:** STC-AUTH-009/F  
**Title:** Forgot password — valid email triggers API and navigates to verify-code  
**Priority:** P0  
**Module:** Authentication — Forgot password  
**Endpoint:** `POST /api/v1/kine/auth/forgot-password`  
**Test Type:** Frontend integration (positive)

**Preconditions:** Registered email in environment; cleared storage.

**Postconditions:** User on verify-code flow with email query param.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Request body | — | `{ "email": "sophie.martin@cabinet-paris.fr" }` |
| API URL | — | `POST https://identity.physio.agregatech.com/api/v1/kine/auth/forgot-password` |

**Steps:**  
1. Open `/forgot-password`.  
2. Submit registered email.  
3. Assert `POST` body equals `{ email }`.  
4. Assert navigation/outcome to verify-code with encoded `email` query (helper `waitForForgotPasswordOutcome`).

**Expected Result:**  
- Correct API payload.  
- User advances to verification step.

**Acceptance Criteria:**  
- [ ] Request `postDataJSON()` equals `{ email: "sophie.martin@cabinet-paris.fr" }`.  
- [ ] Page reaches verify-code outcome with email in URL or success UI per helper.

---

## STC-AUTH-010/F

**STC ID:** STC-AUTH-010/F  
**Title:** Forgot password — invalid email blocked without API call  
**Priority:** P1  
**Module:** Authentication — Forgot password  
**Endpoint:** `POST /api/v1/kine/auth/forgot-password` (must not fire when invalid)  
**Test Type:** Frontend integration (validation)

**Preconditions:** POST counter on forgot-password URL.

**Required Test Data:**

| Step | Input | Expected validation |
|------|--------|---------------------|
| Empty | (none) | `/obligatoire\|email valide/i` |
| Invalid | `not-an-email` | `/email valide/i` |
| Valid | `sophie.martin@cabinet-paris.fr` (`KINE_EMAIL`) | POST count ≥ 1 |

**Steps:**  
1. Open `/forgot-password`.  
2. Click submit empty → validation visible; POST count = 0.  
3. Fill `not-an-email`, submit → validation visible; POST count = 0.  
4. Submit valid email → POST count ≥ 1.

**Expected Result:**  
- Client validation prevents bad requests.  
- Valid email triggers exactly one API flow.

**Acceptance Criteria:**  
- [ ] Empty and invalid email: zero forgot-password POSTs.  
- [ ] Valid email: at least one forgot-password POST.

---

## STC-AUTH-011/F

**STC ID:** STC-AUTH-011/F  
**Title:** Forgot password — API 500 still shows success UI (obfuscation)  
**Priority:** P1  
**Module:** Authentication — Forgot password  
**Endpoint:** `POST /api/v1/kine/auth/forgot-password`  
**Test Type:** Frontend integration (negative / security UX)

**Preconditions:** Route mock returns 500.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Mock | — | HTTP 500, `{ "message": "Internal error" }` |

**Steps:**  
1. Mock forgot-password → 500.  
2. Submit valid email.  
3. Assert success heading visible (`/bo.te mail/i` on h2) — same as success path per current `catch` behavior.

**Expected Result:**  
- User sees “check your inbox” style UI even on server error.  
- No frontend crash.

**Acceptance Criteria:**  
- [ ] API returns 500.  
- [ ] Heading matching mailbox/check-email copy is visible.  
- [ ] Page remains stable (no white screen).

---

## STC-AUTH-012/F

**STC ID:** STC-AUTH-012/F  
**Title:** Forgot password — disabled controls and single in-flight request  
**Priority:** P2  
**Module:** Authentication — Forgot password  
**Endpoint:** `POST /api/v1/kine/auth/forgot-password`  
**Test Type:** Frontend integration (edge)

**Preconditions:** Route delayed ~800 ms.

**Required Test Data:** `KINE_EMAIL` = `sophie.martin@cabinet-paris.fr`

**Steps:**  
1. Fill email; submit.  
2. While loading: email input and submit button **disabled**.  
3. Force second click on submit.  
4. Assert `maxInFlight ≤ 1` for concurrent forgot-password calls.

**Expected Result:**  
- UI locked during request.  
- No duplicate parallel POSTs.

**Acceptance Criteria:**  
- [ ] Email input and submit `toBeDisabled()` during request.  
- [ ] `maxInFlight <= 1`.

---

## STC-AUTH-013/F

**STC ID:** STC-AUTH-013/F  
**Title:** Verify code — valid OTP navigates to reset-password with token  
**Priority:** P0  
**Module:** Authentication — Verify code  
**Endpoint:** `POST /api/v1/kine/auth/verify-code`  
**Test Type:** Frontend integration (positive)

**Preconditions:** OTP issued via `issueVerificationCode` (forgot-password + mail/API helper).

**Postconditions:** URL contains `email=` and `token=` on `/reset-password`.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Code | `VERIFICATION_CODE` or IMAP | 6-digit OTP from `issueVerificationCode` (Gmail: `GMAIL_USER`, sender `OTP_SENDER`) |
| Start URL | — | `https://kine.physio.agregatech.com/verify-code?email=sophie.martin%40cabinet-paris.fr` |
| Request body | — | `{ "email": "sophie.martin@cabinet-paris.fr", "code": "<6-digit OTP>" }` |

**Steps:**  
1. Open verify-code with encoded `KINE_EMAIL`.  
2. Enter OTP; submit **Valider code**.  
3. Assert verify `POST` body matches email and code.  
4. Assert URL matches `/reset-password` with `email=` and `token=` query params.

**Expected Result:**  
- Valid code exchanges for reset token in URL.  
- User can proceed to reset password.

**Acceptance Criteria:**  
- [ ] Verify request body includes correct `email` and `code`.  
- [ ] Final URL matches `ROUTES.RESET_PASSWORD` and contains `email=` and `token=`.

---

## STC-AUTH-014/F

**STC ID:** STC-AUTH-014/F  
**Title:** Verify code — incomplete code blocks API  
**Priority:** P1  
**Module:** Authentication — Verify code  
**Endpoint:** `POST /api/v1/kine/auth/verify-code`  
**Test Type:** Frontend integration (validation)

**Preconditions:** `/verify-code` with valid `email` query.

**Required Test Data:**

| Step | Code entered | Submit button |
|------|--------------|---------------|
| Partial | `12345` (5 digits) | Disabled |
| Complete | `123456` (6th digit) | Enabled → POST allowed |

**Steps:**  
1. Enter `12345`; assert submit **disabled**; verify POST count = 0.  
2. Fill 6th digit; assert submit **enabled**.  
3. Submit → verify POST may fire.

**Expected Result:**  
- Five digits cannot trigger verify API.  
- Six digits enable submit.

**Acceptance Criteria:**  
- [ ] With 5 digits: `submitButton.toBeDisabled()` and zero verify POSTs.  
- [ ] After 6th digit: `submitButton.toBeEnabled()`.

---

## STC-AUTH-015/F

**STC ID:** STC-AUTH-015/F  
**Title:** Verify code — wrong OTP shows error, no navigation  
**Priority:** P0  
**Module:** Authentication — Verify code  
**Endpoint:** `POST /api/v1/kine/auth/verify-code`  
**Test Type:** Frontend integration (negative)

**Preconditions:** `/verify-code?email=sophie.martin%40cabinet-paris.fr` (encoded `KINE_EMAIL`).

**Required Test Data:**

| Field | Env var | Value (local `.env` / spec) |
|-------|---------|----------------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Invalid OTP | — (constant) | `999999` |

**Steps:**  
1. Enter `999999`; submit.  
2. Assert inline error visible (`verifyCodePage.errorMessage`).  
3. Assert URL does not match `/reset-password`.  
4. Assert first digit input enabled after response.

**Expected Result:**  
- User stays on verify step with visible error.  
- No navigation to reset-password.

**Acceptance Criteria:**  
- [ ] `errorMessage.toBeVisible()`.  
- [ ] URL does not contain reset-password path.  
- [ ] Digit inputs re-enabled (`first().toBeEnabled()`).

---

## STC-AUTH-016/F

**STC ID:** STC-AUTH-016/F  
**Title:** Resend code — calls forgot-password again  
**Priority:** P1  
**Module:** Authentication — Verify code  
**Endpoint:** `POST /api/v1/kine/auth/forgot-password` (resend)  
**Test Type:** Frontend integration (multi-call)

**Preconditions:** `/verify-code?email=...`; accept dialog on success.

**Required Test Data:** `KINE_EMAIL` = `sophie.martin@cabinet-paris.fr`; optional prefilled digits `123456`.

**Steps:**  
1. Open verify-code with email.  
2. Click **Renvoyer code**.  
3. Assert forgot-password `POST` body `{ email }`.  
4. On success: all digit inputs empty; on failure: message `/Erreur lors du renvoi du code/i`.

**Expected Result:**  
- Resend reuses forgot-password endpoint with same email.  
- Inputs reset on success.

**Acceptance Criteria:**  
- [ ] Resend triggers forgot-password POST with `{ email: "sophie.martin@cabinet-paris.fr" }`.  
- [ ] Success: `expectAllDigitsEmpty()`; failure: resend error text visible.

---

## STC-AUTH-017/F

**STC ID:** STC-AUTH-017/F  
**Title:** Reset password — valid payload redirects to login  
**Priority:** P0  
**Module:** Authentication — Reset password  
**Endpoint:** `POST /api/v1/kine/auth/reset-password`  
**Test Type:** Frontend integration (positive)

**Preconditions:** `resetToken` from `obtainResetToken` (full forgot → verify flow).

**Postconditions:** User on `/login`; can sign in with new password (manual follow-up).

**Required Test Data:**

| Field | Env var | Value (local `.env` / runtime) |
|-------|---------|--------------------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| resetToken | `RESET_TOKEN` or flow | From `obtainResetToken` (forgot → verify) |
| newPassword | — (spec constant) | `QaTest123!` |
| confirmPassword | — | `QaTest123!` |
| Request body | — | `{ "email": "sophie.martin@cabinet-paris.fr", "resetToken": "<token>", "newPassword": "QaTest123!" }` |

**Steps:**  
1. Open `/reset-password?email=...&token=...`.  
2. Fill and submit matching passwords `QaTest123!`.  
3. Accept success dialog.  
4. Assert reset `POST` body matches email, token, and new password.  
5. Assert URL ends with `/login`.

**Expected Result:**  
- Reset API called with correct fields.  
- User redirected to login after success.

**Acceptance Criteria:**  
- [ ] `postDataJSON()` matches `{ email, resetToken, newPassword: "QaTest123!" }`.  
- [ ] Final URL matches `/login$`.

---

## STC-AUTH-018/F

**STC ID:** STC-AUTH-018/F  
**Title:** Reset password — missing query params redirect to forgot-password  
**Priority:** P1  
**Module:** Authentication — Reset password  
**Endpoint:** `POST /api/v1/kine/auth/reset-password` (must not fire)  
**Test Type:** Frontend integration (edge)

**Preconditions:** None.

**Required Test Data:** N/A (navigate to `/reset-password` without query).

**Steps:**  
1. Open `/reset-password` without `email` or `token`.  
2. Assert redirect to `/forgot-password`.  
3. Assert zero reset-password POSTs.

**Expected Result:**  
- Broken deep link handled safely.  
- No API call.

**Acceptance Criteria:**  
- [ ] URL matches `/forgot-password`.  
- [ ] Reset-password POST count = 0.

---

## STC-AUTH-019/F

**STC ID:** STC-AUTH-019/F  
**Title:** Reset password — validation and API error handling  
**Priority:** P1  
**Module:** Authentication — Reset password  
**Endpoint:** `POST /api/v1/kine/auth/reset-password`  
**Test Type:** Frontend integration (negative)

**Preconditions:** URL with `KINE_EMAIL` + token (`RESET_TOKEN` from env or `test-reset-token` fallback in spec).

**Required Test Data:**

| Scenario | Email | Password | Confirm | POST? |
|----------|-------|----------|---------|-------|
| Too short | `sophie.martin@cabinet-paris.fr` | `123` | `123` | No — `/6 caract/i` |
| Mismatch | `sophie.martin@cabinet-paris.fr` | `QaTest123!` | `DifferentPass1!` | No — `/ne correspondent pas/i` |
| API 400 | `sophie.martin@cabinet-paris.fr` | `QaTest123!` | `QaTest123!` | Yes — mock `{ "message": "Token invalide" }` |

**Steps:**  
1. Short password → validation visible; POST count = 0.  
2. Mismatch → validation visible; POST count = 0.  
3. Mock 400; submit valid pair → dialog/error; password input enabled after.

**Expected Result:**  
- Client blocks invalid payloads.  
- API error shown without crash; fields re-enabled.

**Acceptance Criteria:**  
- [ ] Short and mismatch cases: zero POSTs and destructive messages visible.  
- [ ] After mocked 400: `passwordInput.toBeEnabled()`.

---

## STC-AUTH-020/F

**STC ID:** STC-AUTH-020/F  
**Title:** Reset password — loading disables fields  
**Priority:** P2  
**Module:** Authentication — Reset password  
**Endpoint:** `POST /api/v1/kine/auth/reset-password`  
**Test Type:** Frontend integration (UX)

**Preconditions:** Route delay ~700 ms; token `test-reset-token` or env `RESET_TOKEN`.

**Required Test Data:** `KINE_EMAIL` = `sophie.martin@cabinet-paris.fr`, token, `QaTest123!` / `QaTest123!`

**Steps:**  
1. Open reset page with params; fill passwords; submit.  
2. During delay: password and confirm inputs **disabled**.

**Expected Result:**  
- Fields disabled while mutation in flight.

**Acceptance Criteria:**  
- [ ] After click, `passwordInput` and `confirmPasswordInput` are `toBeDisabled()`.

---

## STC-AUTH-021/F

**STC ID:** STC-AUTH-021/F  
**Title:** Session bootstrap — GET /me with Bearer after reload  
**Priority:** P0  
**Module:** Authentication — Me  
**Endpoint:** `GET /api/v1/kine/me`  
**Test Type:** Frontend integration (positive)

**Preconditions:** `chromium-auth` project with persisted session / token from prior login.

**Postconditions:** Dashboard loads without login redirect.

**Required Test Data:** Valid `pc_access_token` from authenticated storage state.

**Steps:**  
1. `page.goto('/')` with auth storage.  
2. If `GET /me` fires: `Authorization` header matches `Bearer ...`.  
3. Assert URL does not end with `/login`.

**Expected Result:**  
- Session restored via `/me` when needed.  
- Protected shell visible.

**Acceptance Criteria:**  
- [ ] When `/me` request occurs, `authorization` header starts with `bearer `.  
- [ ] User remains off `/login` on dashboard.

---

## STC-AUTH-022/F

**STC ID:** STC-AUTH-022/F  
**Title:** GET /me rejection — invalid token clears storage and redirects  
**Priority:** P0  
**Module:** Authentication — Me  
**Endpoint:** `GET /api/v1/kine/me`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Cleared storage; bogus token injected.

**Required Test Data:**

| Field | Value |
|-------|--------|
| Token | `invalid.jwt.token.value` (via `setAccessToken`) |

**Steps:**  
1. Set invalid token in `localStorage`.  
2. `page.goto('/')`.  
3. Assert `/me` response status 401 or 403.  
4. Assert `pc_access_token` removed.  
5. Assert URL matches `/login`.

**Expected Result:**  
- Invalid session cannot access app.  
- Client cleans up and sends user to login.

**Acceptance Criteria:**  
- [ ] `/me` returns 401 or 403.  
- [ ] `readAccessToken(page)` falsy after response.  
- [ ] Redirect to `/login`.

---

## STC-AUTH-023/F

**STC ID:** STC-AUTH-023/F  
**Title:** getMe skip — at most one GET /me after UI login  
**Priority:** P2  
**Module:** Authentication — Me  
**Endpoint:** `GET /api/v1/kine/me`  
**Test Type:** Frontend integration (edge)

**Preconditions:** Fresh UI login (user hydrated from login response).

**Required Test Data:** `KINE_EMAIL` = `sophie.martin@cabinet-paris.fr`, `KINE_PASSWORD` = `KineAdmin123!`

**Steps:**  
1. `loginViaUi` with kine credentials.  
2. Wait ~1.5 s; count `GET /me` requests.  
3. Assert count ≤ 1.

**Expected Result:**  
- No redundant session storms immediately after login.

**Acceptance Criteria:**  
- [ ] `meCalls <= 1` after login and short wait.

---

## STC-AUTH-024/F

**STC ID:** STC-AUTH-024/F  
**Title:** GET /me 5xx — spinner ends, token cleared, login redirect  
**Priority:** P1  
**Module:** Authentication — Me  
**Endpoint:** `GET /api/v1/kine/me`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Valid session then `/me` mocked to 500 on reload.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Password | `KINE_PASSWORD` | `KineAdmin123!` |
| Me URL | — | `GET https://identity.physio.agregatech.com/api/v1/kine/me` |
| Mock | — | HTTP 500, `{ "message": "Server error" }` |

**Steps:**  
1. Log in; mock `**/api/v1/kine/me**` → 500.  
2. Reload page.  
3. Assert loading spinner hidden within 15 s.  
4. Assert token cleared; URL matches `/login`.

**Expected Result:**  
- 5xx does not hang UI forever.  
- User ends unauthenticated on login.

**Acceptance Criteria:**  
- [ ] `.animate-spin` hidden within timeout.  
- [ ] `readAccessToken(page)` falsy.  
- [ ] URL matches `/login`.

---

## STC-AUTH-025/F

**STC ID:** STC-AUTH-025/F  
**Title:** Silent refresh — 401 on /me triggers refresh-token then retry  
**Priority:** P0  
**Module:** Authentication — Refresh  
**Endpoint:** `POST /api/v1/kine/auth/refresh-token`  
**Test Type:** Frontend integration (positive)

**Preconditions:** Same-tab session with `refreshToken` in Redux (`ensureAuthSession` using `KINE_EMAIL` / `KINE_PASSWORD`).

**Postconditions:** New access token applied; session continues.

**Required Test Data:**

| Field | Env var | Value (local `.env`) |
|-------|---------|----------------------|
| Email | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Password | `KINE_PASSWORD` | `KineAdmin123!` |
| Refresh URL | — | `POST https://identity.physio.agregatech.com/api/v1/kine/auth/refresh-token` |

| Step | Mock behavior |
|------|----------------|
| First `GET /me` | 401 |
| `POST refresh-token` | 200, `{ accessToken: "e2e-new-access-token", refreshToken: <same> }` |
| Second `GET /me` | 200 with user payload |

**Steps:**  
1. Log in; configure route mocks for `/me` and `refresh-token`.  
2. Reload to trigger `/me`.  
3. Assert refresh POST body contains session `refreshToken`.  
4. Session continues without manual re-login.

**Expected Result:**  
- 401 triggers refresh with stored refresh token.  
- Retry succeeds after new access token.

**Acceptance Criteria:**  
- [ ] Refresh request issued when `/me` returns 401.  
- [ ] Refresh POST body includes original `refreshToken`.  
- [ ] User not logged out after successful refresh mock.

---

## STC-AUTH-026/F

**STC ID:** STC-AUTH-026/F  
**Title:** Refresh failure — revoked token clears session  
**Priority:** P0  
**Module:** Authentication — Refresh  
**Endpoint:** `POST /api/v1/kine/auth/refresh-token`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Logged in; `/me` → 401; refresh → 401.

**Required Test Data:** Mock refresh body `{ "message": "revoked" }`, status 401.

**Steps:**  
1. `ensureAuthSession`; mock `/me` 401 and refresh 401.  
2. Reload.  
3. Assert refresh attempts ≤ 2 (no infinite loop).  
4. Assert `pc_access_token` cleared; URL tends to `/login`.

**Expected Result:**  
- Failed refresh logs user out.  
- No runaway refresh loop.

**Acceptance Criteria:**  
- [ ] `refreshAttempts <= 2`.  
- [ ] `readAccessToken(page)` falsy after flow.

---

## STC-AUTH-027/F

**STC ID:** STC-AUTH-027/F  
**Title:** 401 without refresh token — immediate logout, no refresh POST  
**Priority:** P1  
**Module:** Authentication — Refresh  
**Endpoint:** None (refresh must not be called)  
**Test Type:** Frontend integration (edge)

**Preconditions:** Login then **full page reload** (in-memory `refreshToken` lost).

**Required Test Data:** Session after `KINE_EMAIL`/`KINE_PASSWORD` login + reload; `/me` mocked to 401.

**Steps:**  
1. Log in; reload.  
2. Mock `/me` → 401.  
3. `page.goto('/')`.  
4. Assert zero refresh POSTs.  
5. Assert token cleared; URL `/login`.

**Expected Result:**  
- Matches `base-query.ts`: no refresh token → `logoutUser()` without refresh call.

**Acceptance Criteria:**  
- [ ] `refreshCalls === 0`.  
- [ ] `readAccessToken(page)` falsy.  
- [ ] URL matches `/login`.

---

## STC-AUTH-028/F

**STC ID:** STC-AUTH-028/F  
**Title:** Public endpoints omit Bearer; protected calls include Bearer  
**Priority:** P1  
**Module:** Authentication — Base query  
**Endpoint:** Login, forgot-password, verify-code, reset-password vs `GET /me`  
**Test Type:** Frontend integration (security)

**Preconditions:** `pc_access_token` set to `bogus-stale-token`.

**Required Test Data:**

| Flow | Env / input | Value (local `.env`) |
|------|-------------|----------------------|
| Login | `KINE_EMAIL`, `KINE_PASSWORD_INVALID` | `sophie.martin@cabinet-paris.fr`, `WrongP@ssword1!` |
| Forgot | `KINE_EMAIL` | `sophie.martin@cabinet-paris.fr` |
| Verify | — | OTP `999999` |
| Reset | — | token `fake-token`, password `QaTest123!` |
| Stale token in storage | — | `bogus-stale-token` |

**Steps:**  
1. Seed bogus token.  
2. Trigger login, forgot, verify, reset flows; collect request headers.  
3. For each public POST: `authorization` header **undefined**.  
4. If `GET /me` occurs: `authorization` matches `Bearer ...`.

**Expected Result:**  
- Stale token never sent on public auth routes.  
- Bearer attached on protected `/me`.

**Acceptance Criteria:**  
- [ ] All captured public auth requests have no `authorization` header.  
- [ ] If `/me` fires, `authorization` starts with `bearer `.

---

### Traceability summary

| Endpoint (logical) | STC IDs |
|--------------------|---------|
| `POST .../auth/login` | STC-AUTH-001/F – STC-AUTH-004/F |
| `POST .../auth/logout` | STC-AUTH-005/F – STC-AUTH-008/F |
| `POST .../auth/forgot-password` | STC-AUTH-009/F – STC-AUTH-012/F, STC-AUTH-016/F |
| `POST .../auth/verify-code` | STC-AUTH-013/F – STC-AUTH-015/F |
| `POST .../auth/reset-password` | STC-AUTH-017/F – STC-AUTH-020/F |
| `GET .../me` | STC-AUTH-021/F – STC-AUTH-024/F |
| `POST .../auth/refresh-token` | STC-AUTH-025/F – STC-AUTH-027/F |
| Public header policy | STC-AUTH-028/F |

---

*End of document.*
