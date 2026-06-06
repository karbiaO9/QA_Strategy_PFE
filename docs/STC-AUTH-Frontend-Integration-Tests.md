# XXX Platform � Authentication Module  
## Frontend Integration Test Cases (STC Format)

**Document type:** QA specification for Playwright (frontend ? backend integration)  
**Application context:** `Frontend to test` � Next.js XXX app, RTK Query (`authApi`), Redux auth slice, route guards (`ProtectedRoute`, `PublicRoute`)  
**Suffix:** All STC IDs use `/F` (frontend integration)

---

### Scope and implementation mapping

These cases validate **UI behavior, network integration, token/session handling, navigation, and error handling** � not isolated backend contract tests.

| Stakeholder / target path | Observed in `Frontend to test` (automation should match build) |
|---------------------------|----------------------------------------------------------------|
| `POST /api/v1/kine/auth/login` | Same (`auth-api.ts` ? `.../auth/login`) |
| `POST /api/v1/kine/auth/logout` | Same (`auth-api.ts` ? `.../auth/logout`). **Note:** `MainLayout` currently dispatches `logoutUser()` only; server logout may need wiring to `useLogoutMutation`. |
| `POST /api/v1/kine/auth/forgot-password` | Same |
| `POST /api/v1/kine/auth/verify-code` | Same |
| `POST /api/v1/kine/auth/reset-password` | Same |
| `GET /api/v1/kine/auth/me` | **Implemented as** `GET /api/v1/kine/me` (`getMe` in `auth-api.ts`). Assert this URL in Playwright unless the API is renamed server-side. |
| `POST /api/v1/kine/auth/refresh` | **Implemented as** `POST /api/v1/kine/auth/refresh-token` with JSON body `{ refreshToken }` (`base-query.ts`). |

**Token storage (reference):** Access token persisted in `localStorage` key `pc_access_token`; refresh token held in Redux memory after login (`auth-slice.ts`).

**Coverage:** At least **four** STCs per integrated endpoint above (**28** cases total).

---

## STC-AUTH-001/F

**STC ID:** STC-AUTH-001/F  
**Title:** Successful login � request, token persistence, redirect, and protected access  
**Priority:** P0  
**Module:** Authentication � Login  
**Endpoint:** `POST /api/v1/kine/auth/login`  
**Test Type:** Frontend integration (positive)

**Preconditions:**  
- XXX app is deployed or running locally with network access to the identity host.  
- Test user exists with known valid email (or phone per product rules) and password.  
- Browser storage is cleared (no `pc_access_token`).

**Postconditions:**  
- User is authenticated in UI; `pc_access_token` is set; session survives navigation to a protected route.

**Required Test Data:** Valid `email` (or value accepted by backend for login field), valid `password`, user with at least one profile if the app expects profile selection later.

**Steps:**  
1. Open the login page (`/login`).  
2. Enter valid credentials in **Num�ro ou adresse email** and **Mot de passe** (matching frontend validation: email or phone pattern, password length ? 6).  
3. Submit the form.  
4. Observe the browser network panel: a single `POST` to `/api/v1/kine/auth/login` with JSON body containing `email` and `password` (payload shape as sent by the app).  
5. Wait for a successful response carrying `accessToken`, `refreshToken`, `user`, `profiles`, and `lastProfileId` (or equivalent fields used by `setCredentials`).  
6. Verify Redux-driven UI: user is no longer on `/login` and is navigated to `/` (dashboard).  
7. Verify `localStorage` contains `pc_access_token` with the returned access token value.  
8. Open a protected area (e.g. refresh on `/` or navigate to another protected page) and confirm `ProtectedRoute` does not redirect to `/login` while the session is valid.

**Expected Result:**  
Login triggers the correct API call; tokens and user state are applied; access token is stored under `pc_access_token`; user lands on the post-login route and remains authenticated on protected routes.

---

## STC-AUTH-002/F

**STC ID:** STC-AUTH-002/F  
**Title:** Login failure � invalid credentials, API error surfaced, no partial auth state  
**Priority:** P0  
**Module:** Authentication � Login  
**Endpoint:** `POST /api/v1/kine/auth/login`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Cleared storage; user on `/login`.

**Postconditions:** No `pc_access_token`; user remains unauthenticated; still on or returned to login flow without dashboard content.

**Required Test Data:** Valid-format email/phone and wrong password, or non-existent account per environment policy.

**Steps:**  
1. Open `/login`.  
2. Enter syntactically valid email/phone and an incorrect password.  
3. Submit the form.  
4. Assert `POST /api/v1/kine/auth/login` is sent.  
5. Simulate or use backend rejection (e.g. 401/400 with error body).  
6. Verify the frontend shows failure feedback (e.g. browser `alert` with server `message` or default French failure text per `login/page.tsx`).  
7. Verify `localStorage` does not contain a new valid session (no `pc_access_token` or unchanged if test started clean).  
8. Verify no redirect to `/` occurs and protected URLs still redirect unauthenticated users to `/login`.

**Expected Result:**  
Failed login does not set credentials; user sees an error; no authenticated shell or dashboard access.

---

## STC-AUTH-003/F

**STC ID:** STC-AUTH-003/F  
**Title:** Login form � client-side validation blocks submit and prevents API call  
**Priority:** P1  
**Module:** Authentication � Login  
**Endpoint:** `POST /api/v1/kine/auth/login` (must not be called when invalid)  
**Test Type:** Frontend integration (edge / validation)

**Preconditions:** Network listener active; empty or invalid inputs available.

**Postconditions:** No login request until fields are valid.

**Required Test Data:** Invalid email/phone string, password shorter than 6 characters, empty fields.

**Steps:**  
1. Open `/login`.  
2. Leave fields empty and attempt submit; verify inline messages (required fields) and that **no** `POST .../login` request fires.  
3. Enter invalid email/phone (neither email nor 8�15 digit phone); submit; verify validation message and **no** login request.  
4. Enter valid email but password with fewer than 6 characters; verify message and **no** login request.  
5. Correct all fields to valid values and submit; verify **one** login request is then sent.

**Expected Result:**  
Zod/react-hook-form validation gates the API; invalid payloads never hit the backend.

---

## STC-AUTH-004/F

**STC ID:** STC-AUTH-004/F  
**Title:** Login � loading state, disabled inputs, and resilience to slow or 5xx responses  
**Priority:** P1  
**Module:** Authentication � Login  
**Endpoint:** `POST /api/v1/kine/auth/login`  
**Test Type:** Frontend integration (edge / UX + error handling)

**Preconditions:** Ability to throttle network or mock delayed/500 response for login.

**Postconditions:** UI returns to interactive state after completion; no unhandled exception; no stuck infinite loading on error.

**Required Test Data:** Valid credentials for slow path; optional mock for 500 with JSON body.

**Steps:**  
1. Open `/login`, enter valid credentials.  
2. Throttle login API to slow response; submit.  
3. While request is in flight, verify email and password inputs are **disabled** and loading reflects `isSubmitting || isApiLoading`.  
4. On intentional **5xx** (or network failure), verify user-visible error (alert or future toast) and that inputs are re-enabled.  
5. Confirm the app does not crash (no blank white screen; console free of uncaught errors for this flow).  
6. Retry with success and confirm normal completion still works.

**Expected Result:**  
Loading/disabled behavior matches RTK mutation state; 5xx/network errors are handled without breaking the page; retry succeeds.

---

## STC-AUTH-005/F

**STC ID:** STC-AUTH-005/F  
**Title:** Server logout � successful `POST /logout`, client state cleared, redirect to login  
**Priority:** P0  
**Module:** Authentication � Logout  
**Endpoint:** `POST /api/v1/kine/auth/logout`  
**Test Type:** Frontend integration (positive)

**Preconditions:** User is logged in (`pc_access_token` set, Redux authenticated). **If** the UI control is wired to `useLogoutMutation`, use it; otherwise document precondition as �feature flag / branch where logout triggers the mutation� or invoke the mutation from a test harness page.

**Postconditions:** Tokens cleared; unauthenticated; access to protected routes denied.

**Required Test Data:** Active session.

**Steps:**  
1. Log in successfully.  
2. From the authenticated shell, trigger the action that calls `useLogoutMutation` (sidebar or settings � per implemented UX).  
3. Assert `POST /api/v1/kine/auth/logout` is sent **with** `Authorization: Bearer <accessToken>` when the base query attaches it to non-public endpoints.  
4. On success, assert `logoutUser` side effects: `pc_access_token` removed from `localStorage`; Redux `isAuthenticated` false.  
5. Navigate to `/` or another protected URL; assert redirect to `/login` via `ProtectedRoute`.  
6. Verify no authenticated API calls succeed without re-login.

**Expected Result:**  
Logout hits the backend; client session is fully cleared; guards enforce public-only access until login.

---

## STC-AUTH-006/F

**STC ID:** STC-AUTH-006/F  
**Title:** Logout API failure � client handling and session policy  
**Priority:** P1  
**Module:** Authentication � Logout  
**Endpoint:** `POST /api/v1/kine/auth/logout`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Logged-in user; ability to force logout API to return 4xx/5xx.

**Postconditions:** Document expected product behavior (strict: still clear client; lenient: show error and keep session � assert actual app behavior).

**Required Test Data:** Mock failure on `POST .../logout`.

**Steps:**  
1. Log in successfully.  
2. Mock `POST /api/v1/kine/auth/logout` to fail (e.g. 500).  
3. Trigger logout from UI.  
4. Observe whether `onQueryStarted` still dispatches `logoutUser` only after `queryFulfilled` (per `auth-api.ts` � failure may **not** clear state).  
5. Verify user-visible error if any; verify whether token remains (current RTK pattern: local state may remain until fulfilled).  
6. If session remains, verify user can still navigate app or gets forced re-auth on next 401 � capture actual behavior for defect or spec alignment.

**Expected Result:**  
Test documents integration behavior under logout API failure (no silent crash); stakeholders can align on whether client must force-clear on error.

---

## STC-AUTH-007/F

**STC ID:** STC-AUTH-007/F  
**Title:** Sidebar �logout� � current client-only logout vs server invalidation (gap analysis)  
**Priority:** P2  
**Module:** Authentication � Logout  
**Endpoint:** `POST /api/v1/kine/auth/logout` (expected when integrated)  
**Test Type:** Frontend integration (observability / regression)

**Preconditions:** Logged-in user; network monitoring enabled.

**Postconditions:** Document whether `POST /logout` occurred.

**Required Test Data:** Active session.

**Steps:**  
1. Log in successfully.  
2. Open network tab cleared.  
3. Use sidebar **D�connexion** (`MainLayout` ? `dispatch(logoutUser())`).  
4. Assert whether `POST /api/v1/kine/auth/logout` appears.  
5. Assert `pc_access_token` is removed and user is treated as logged out on next full load or navigation per current guard logic.  
6. If no server call: record as **integration gap** � refresh token may still be valid server-side.

**Expected Result:**  
Playwright evidence shows actual integration state; team can track wiring of `useLogoutMutation` into `handleLogout`.

---

## STC-AUTH-008/F

**STC ID:** STC-AUTH-008/F  
**Title:** Post-logout navigation � deep link to protected route and public route behavior  
**Priority:** P1  
**Module:** Authentication � Logout  
**Endpoint:** `POST /api/v1/kine/auth/logout` (or client-only logout per current build)  
**Test Type:** Frontend integration (navigation)

**Preconditions:** Session then logout completed per product (client + server when available).

**Postconditions:** Only public routes accessible without login.

**Required Test Data:** URLs for `/login`, `/`, `/calendar` (or any protected path).

**Steps:**  
1. Log in and visit a protected deep link.  
2. Perform logout.  
3. Manually enter a protected URL in the address bar (or `page.goto`).  
4. Assert redirect to `/login` (or app�s configured auth entry).  
5. Open `/login` and assert `PublicRoute` does not bounce authenticated users (should show login when logged out).

**Expected Result:**  
Route protection and public/auth route symmetry behave correctly after logout.

---

## STC-AUTH-009/F

**STC ID:** STC-AUTH-009/F  
**Title:** Forgot password � valid email triggers API and navigates to verify-code with query param  
**Priority:** P0  
**Module:** Authentication � Forgot password  
**Endpoint:** `POST /api/v1/kine/auth/forgot-password`  
**Test Type:** Frontend integration (positive)

**Preconditions:** Registered email in environment; user on `/forgot-password`.

**Postconditions:** User on `/verify-code?email=...` (encoded) or success UI state per flow.

**Required Test Data:** Valid registered email.

**Steps:**  
1. Navigate to `/forgot-password`.  
2. Enter a valid email and submit.  
3. Assert `POST /api/v1/kine/auth/forgot-password` with JSON body `{ "email": "<submitted>" }`.  
4. On success, assert navigation to `/verify-code` with `email` query matching the submitted address (URL-encoded).  
5. Verify loading state during request (inputs disabled per `isLoading`).  
6. Verify success messaging path (either intermediate �check email� UI or direct navigation per current `forgot-password/page.tsx`).

**Expected Result:**  
Correct payload and navigation into the verification step; UX loading matches mutation state.

---

## STC-AUTH-010/F

**STC ID:** STC-AUTH-010/F  
**Title:** Forgot password � invalid email format blocked without API call  
**Priority:** P1  
**Module:** Authentication � Forgot password  
**Endpoint:** `POST /api/v1/kine/auth/forgot-password` (must not fire for invalid format)  
**Test Type:** Frontend integration (validation)

**Preconditions:** Network listener on `/forgot-password`.

**Required Test Data:** Malformed email strings.

**Steps:**  
1. Open `/forgot-password`.  
2. Submit empty email; assert required-field validation; no POST.  
3. Enter non-email string; assert French validation message; no POST.  
4. Enter valid format email; assert POST is sent.

**Expected Result:**  
Client validation prevents bad requests.

---

## STC-AUTH-011/F

**STC ID:** STC-AUTH-011/F  
**Title:** Forgot password � API error (4xx/5xx) and current �success obfuscation� behavior  
**Priority:** P1  
**Module:** Authentication � Forgot password  
**Endpoint:** `POST /api/v1/kine/auth/forgot-password`  
**Test Type:** Frontend integration (negative / security UX)

**Preconditions:** Ability to mock API failure.

**Required Test Data:** Valid-format email; mock 404/500 on forgot-password.

**Steps:**  
1. Open `/forgot-password`, enter valid-format email.  
2. Mock failed response from `POST .../forgot-password`.  
3. Submit and observe: current code sets `isEmailSent` true even in `catch` (user sees same as success).  
4. Assert whether navigation to `/verify-code` still occurs (it does on success path; on catch verify actual branch).  
5. Document whether this leaks distinguishability vs always-safe messaging; ensure no frontend crash.

**Expected Result:**  
Failure path is stable; QA captures whether UX should be adjusted (integration outcome, not only status code).

---

## STC-AUTH-012/F

**STC ID:** STC-AUTH-012/F  
**Title:** Forgot password � double submit / disabled control during in-flight request  
**Priority:** P2  
**Module:** Authentication � Forgot password  
**Endpoint:** `POST /api/v1/kine/auth/forgot-password`  
**Test Type:** Frontend integration (edge)

**Preconditions:** Throttled network.

**Required Test Data:** Valid email.

**Steps:**  
1. Open `/forgot-password`, enter email, submit.  
2. While loading, attempt second submit (Enter key or button); assert at most one in-flight request or idempotent handling.  
3. Verify submit control / inputs disabled during `isApiLoading`.

**Expected Result:**  
No duplicate spam requests; UI remains consistent under slow network.

---

## STC-AUTH-013/F

**STC ID:** STC-AUTH-013/F  
**Title:** Verify code � valid 6-digit code triggers API and navigates to reset-password with token  
**Priority:** P0  
**Module:** Authentication � Verify code  
**Endpoint:** `POST /api/v1/kine/auth/verify-code`  
**Test Type:** Frontend integration (positive)

**Preconditions:** User arrives at `/verify-code?email=<registered>` after forgot-password (or direct URL with valid email param). OTP known from test mail provider or mock.

**Postconditions:** On success, user is on `/reset-password?email=...&token=...`.

**Required Test Data:** Email, valid 6-digit OTP, API response including `resetToken`.

**Steps:**  
1. Open `/verify-code?email=` with encoded test email.  
2. Enter six digits (typing or paste of 6 digits).  
3. Submit **Valider code**.  
4. Assert `POST /api/v1/kine/auth/verify-code` with body containing `email` and `code` (6-digit string).  
5. On success with `resetToken`, assert navigation to `/reset-password` with `email` and `token` query params.  
6. Verify digit inputs disabled while `isVerifying`; submit button shows loading label.

**Expected Result:**  
Correct payload; transition to reset password with token in URL; loading UX correct.

---

## STC-AUTH-014/F

**STC ID:** STC-AUTH-014/F  
**Title:** Verify code � incomplete code blocked; client message without API call  
**Priority:** P1  
**Module:** Authentication � Verify code  
**Endpoint:** `POST /api/v1/kine/auth/verify-code`  
**Test Type:** Frontend integration (validation)

**Preconditions:** On `/verify-code` with valid `email` query.

**Required Test Data:** Partial code (e.g. 5 digits).

**Steps:**  
1. Enter only 5 digits.  
2. Assert submit button remains **disabled** (`code.join('').length !== 6`).  
3. Attempt form submit via DOM if possible; assert no verify POST.  
4. Enter 6th digit; assert button enables; then submit sends POST.

**Expected Result:**  
Incomplete codes cannot trigger the API; UX matches implementation.

---

## STC-AUTH-015/F

**STC ID:** STC-AUTH-015/F  
**Title:** Verify code � wrong or expired code shows inline error without navigation  
**Priority:** P0  
**Module:** Authentication � Verify code  
**Endpoint:** `POST /api/v1/kine/auth/verify-code`  
**Test Type:** Frontend integration (negative)

**Preconditions:** `/verify-code` with valid email param.

**Required Test Data:** Six digits that API rejects.

**Steps:**  
1. Enter 6 incorrect digits; submit.  
2. Assert `POST .../verify-code` returns error.  
3. Verify inline error text (`err.data?.message` or default invalid/expired French message).  
4. Verify URL does not change to `/reset-password`.  
5. Verify inputs re-enabled after request completes.

**Expected Result:**  
User stays on verify step with clear error; no spurious navigation.

---

## STC-AUTH-016/F

**STC ID:** STC-AUTH-016/F  
**Title:** Verify code � �Renvoyer code� triggers forgot-password again and UX feedback  
**Priority:** P1  
**Module:** Authentication � Verify code (+ integration with forgot-password)  
**Endpoint:** `POST /api/v1/kine/auth/verify-code` and `POST /api/v1/kine/auth/forgot-password`  
**Test Type:** Frontend integration (positive / multi-call)

**Preconditions:** `/verify-code?email=...`.

**Required Test Data:** Registered email.

**Steps:**  
1. Click **Renvoyer code**.  
2. Assert `POST /api/v1/kine/auth/forgot-password` with `{ email }`.  
3. On success, assert alert for new code sent (per `verify-code/page.tsx`).  
4. Assert code inputs reset and focus returns to first cell.  
5. During resend, assert resend control shows loading/disabled state.

**Expected Result:**  
Resend reuses forgot-password endpoint correctly; feedback and focus management work.

---

## STC-AUTH-017/F

**STC ID:** STC-AUTH-017/F  
**Title:** Reset password � valid payload completes and redirects to login  
**Priority:** P0  
**Module:** Authentication � Reset password  
**Endpoint:** `POST /api/v1/kine/auth/reset-password`  
**Test Type:** Frontend integration (positive)

**Preconditions:** Valid `email` and `resetToken` in URL from successful verify-code (or constructed for test env).

**Postconditions:** User on `/login`; can log in with new password.

**Required Test Data:** `email`, `resetToken`, new password ? 6 chars, matching confirm.

**Steps:**  
1. Open `/reset-password?email=...&token=...`.  
2. Fill new password and matching confirmation; submit.  
3. Assert `POST /api/v1/kine/auth/reset-password` with body `{ email, resetToken, newPassword }` (field names as in app).  
4. On success, assert success `alert` and `router.push('/login')`.  
5. Log in with new password to confirm end-to-end integration.

**Expected Result:**  
Correct JSON payload; success feedback; navigation to login; subsequent login succeeds.

---

## STC-AUTH-018/F

**STC ID:** STC-AUTH-018/F  
**Title:** Reset password � missing query params redirect to forgot-password  
**Priority:** P1  
**Module:** Authentication � Reset password  
**Endpoint:** `POST /api/v1/kine/auth/reset-password` (must not be called)  
**Test Type:** Frontend integration (edge)

**Preconditions:** None.

**Required Test Data:** N/A.

**Steps:**  
1. Navigate to `/reset-password` without `email` or `token`.  
2. Assert client redirect to `/forgot-password` per `useEffect` guard.  
3. Assert no reset-password POST.

**Expected Result:**  
Broken deep links are handled safely.

---

## STC-AUTH-019/F

**STC ID:** STC-AUTH-019/F  
**Title:** Reset password � validation errors and API error handling  
**Priority:** P1  
**Module:** Authentication � Reset password  
**Endpoint:** `POST /api/v1/kine/auth/reset-password`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Valid `email` and `token` in URL.

**Required Test Data:** Mismatched passwords, short password, mock API 400 with message.

**Steps:**  
1. Enter a password with fewer than 6 characters; assert inline validation; no POST.  
2. Enter different confirm password; assert mismatch message; no POST.  
3. With valid form fields, mock API error; assert `alert` shows server message or generic French error.  
4. Verify inputs re-enabled after failure; page does not crash.

**Expected Result:**  
Validation and API errors are visible; no uncaught exceptions.

---

## STC-AUTH-020/F

**STC ID:** STC-AUTH-020/F  
**Title:** Reset password � loading disables fields during mutation  
**Priority:** P2  
**Module:** Authentication � Reset password  
**Endpoint:** `POST /api/v1/kine/auth/reset-password`  
**Test Type:** Frontend integration (UX)

**Preconditions:** Valid reset URL; throttled network.

**Required Test Data:** Valid passwords.

**Steps:**  
1. Submit reset form with slow API.  
2. Assert password fields and submit disabled during `isSubmitting || isApiLoading`.  
3. After completion, controls re-enable (on error) or user navigates away (on success).

**Expected Result:**  
Loading state matches RTK mutation + form submitting state.

---

## STC-AUTH-021/F

**STC ID:** STC-AUTH-021/F  
**Title:** Session bootstrap � `GET /me` hydrates user after hard refresh with `pc_access_token` only  
**Priority:** P0  
**Module:** Authentication � Me (session)  
**Endpoint:** `GET /api/v1/kine/me` *(stakeholder alias: `/api/v1/kine/auth/me` � assert actual URL in network)*  
**Test Type:** Frontend integration (positive)

**Preconditions:** User has logged in previously; `pc_access_token` present; Redux may have been cleared (full page reload).

**Postconditions:** `isAuthenticated` true; `user` populated; `ProtectedRoute` shows app content.

**Required Test Data:** Valid token in `localStorage`.

**Steps:**  
1. Log in, then hard-refresh on a protected route (F5).  
2. Assert `GET https://<host>/api/v1/kine/me` (or relative equivalent) with `Authorization: Bearer <token>`.  
3. Wait for response; assert `getMe` fulfilled updates Redux (`user`, `profiles`, `isInitialized`).  
4. Assert loading spinner from `ProtectedRoute` disappears and children render.  
5. Assert `PublicRoute` would redirect away from `/login` if user navigates there while authenticated.

**Expected Result:**  
Token-only reload restores session via `/me`; guards resolve correctly.

---

## STC-AUTH-022/F

**STC ID:** STC-AUTH-022/F  
**Title:** `GET /me` rejection � invalid/expired token clears storage and redirects to login  
**Priority:** P0  
**Module:** Authentication � Me (session)  
**Endpoint:** `GET /api/v1/kine/me`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Set `pc_access_token` to garbage or expired token; open protected route.

**Required Test Data:** Invalid JWT string.

**Steps:**  
1. Manually set `localStorage.setItem('pc_access_token', '<invalid>')`.  
2. Navigate to `/` (protected).  
3. Assert `GET /api/v1/kine/me` returns 401/403.  
4. Assert `extraReducers` behavior: token removed from `localStorage`; `isAuthenticated` false after init.  
5. Assert redirect to `/login`.

**Expected Result:**  
Invalid session cannot access protected UI; client state cleaned per `auth-slice` matchers.

---

## STC-AUTH-023/F

**STC ID:** STC-AUTH-023/F  
**Title:** `getMe` skip logic � no redundant `/me` when `user` already in store after login  
**Priority:** P2  
**Module:** Authentication � Me (session)  
**Endpoint:** `GET /api/v1/kine/me`  
**Test Type:** Frontend integration (edge)

**Preconditions:** Fresh login without reload.

**Required Test Data:** Valid login.

**Steps:**  
1. Log in successfully (credentials include user).  
2. Monitor network on immediate landing on `/`.  
3. Assert `useGetMeQuery` skip condition (`skip: !accessToken || !!user`) results in **no** extra `GET /me` if `user` is already populated, OR document actual call pattern if `user` is null until `getMe` runs.  
4. Align assertion with observed Redux hydration from login response.

**Expected Result:**  
Documented, efficient (or intentional) fetch pattern; no duplicate session storms unless required.

---

## STC-AUTH-024/F

**STC ID:** STC-AUTH-024/F  
**Title:** `GET /me` server 5xx � loading exit and user-visible stability  
**Priority:** P1  
**Module:** Authentication � Me (session)  
**Endpoint:** `GET /api/v1/kine/me`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Valid token; mock `/me` to return 500.

**Required Test Data:** Valid `pc_access_token`.

**Steps:**  
1. With token set and user skipped path forcing fetch (e.g. clear user from state via devtools if needed), load protected route.  
2. Mock 500 on `/me`.  
3. Assert loading state ends (no infinite spinner).  
4. Assert matcher: rejected `getMe` clears token and sets `isInitialized` true.  
5. Assert user lands on login or null shell without white-screen crash.

**Expected Result:**  
5xx on session endpoint degrades gracefully to unauthenticated state per slice logic.

---

## STC-AUTH-025/F

**STC ID:** STC-AUTH-025/F  
**Title:** Silent refresh � 401 on protected auth call retries after `refresh-token` success  
**Priority:** P0  
**Module:** Authentication � Refresh  
**Endpoint:** `POST /api/v1/kine/auth/refresh-token` *(stakeholder alias: `/api/v1/kine/auth/refresh`)*  
**Test Type:** Frontend integration (positive)

**Preconditions:** User logged in with **refresh token in memory** (same tab, no full reload that loses in-memory refresh token � per current architecture). Access token expired or mocked to be rejected once.

**Postconditions:** New access token in store/`localStorage` update policy per `updateAccessToken`; original business request succeeds after retry.

**Required Test Data:** Scenario where first non-public request gets 401 then refresh succeeds.

**Steps:**  
1. Log in in the same tab (ensure `refreshToken` exists in Redux).  
2. Trigger an authenticated RTK call that uses `baseQueryWithReauth` (non-public endpoint).  
3. Mock first call 401, then `POST .../auth/refresh-token` returns `{ accessToken, refreshToken? }`, then original call 200.  
4. Assert sequence: initial request ? refresh POST with body `{ refreshToken }` ? retry original with new Bearer token.  
5. Assert `updateAccessToken` updated Redux; if implementation also writes `localStorage`, assert it.

**Expected Result:**  
Refresh pipeline matches `base-query.ts`; user session continues without manual re-login.

---

## STC-AUTH-026/F

**STC ID:** STC-AUTH-026/F  
**Title:** Refresh failure � revoked refresh token dispatches logout and blocks retries  
**Priority:** P0  
**Module:** Authentication � Refresh  
**Endpoint:** `POST /api/v1/kine/auth/refresh-token`  
**Test Type:** Frontend integration (negative)

**Preconditions:** Logged-in with refresh token in memory; mock refresh to fail (401/400).

**Required Test Data:** N/A.

**Steps:**  
1. Cause 401 on a protected request with valid refresh flow entry (`refreshToken` present).  
2. Mock `POST .../refresh-token` to fail.  
3. Assert `logoutUser` dispatched; `pc_access_token` cleared.  
4. Assert user redirected to login on next protected navigation or immediate effect per app.  
5. Assert no infinite refresh loop in network tab.

**Expected Result:**  
Failed refresh clears session safely; no runaway retries.

---

## STC-AUTH-027/F

**STC ID:** STC-AUTH-027/F  
**Title:** 401 without refresh token in memory � immediate logout path  
**Priority:** P1  
**Module:** Authentication � Refresh (degraded path)  
**Endpoint:** N/A (no refresh call)  
**Test Type:** Frontend integration (edge)

**Preconditions:** `pc_access_token` set in `localStorage` but page reloaded so Redux `refreshToken` is null (per `auth-slice` initial state).

**Required Test Data:** Token that triggers 401 on `/me` or other authed call.

**Steps:**  
1. Log in, hard refresh (memory refresh token lost).  
2. Mock `/me` or next authed call to 401 (or use expired access with backend returning 401).  
3. Assert `baseQueryWithReauth` branch: no `refreshToken` ? `logoutUser()` without calling refresh endpoint.  
4. Assert session cleared and login redirect.

**Expected Result:**  
Matches `base-query.ts` �No refresh token available ? Logout�.

---

## STC-AUTH-028/F

**STC ID:** STC-AUTH-028/F  
**Title:** Public endpoints never send Bearer on login/forgot/verify/reset per `PUBLIC_ENDPOINTS`  
**Priority:** P1  
**Module:** Authentication � Refresh / base query  
**Endpoint:** Cross-check with `POST /login`, `forgot-password`, `verify-code`, `reset-password`  
**Test Type:** Frontend integration (security / configuration)

**Preconditions:** Optionally seed invalid token in `localStorage` to ensure header logic does not leak token to public routes.

**Required Test Data:** Garbage token in storage.

**Steps:**  
1. Set bogus `pc_access_token`.  
2. Open `/login`, submit login request; assert `Authorization` header **absent** on `POST .../login` (per `prepareHeaders` public list).  
3. Repeat observation for forgot-password, verify-code, reset-password flows.  
4. Then call a non-public authed endpoint and assert Bearer **is** sent.

**Expected Result:**  
`PUBLIC_ENDPOINTS` configuration prevents attaching stale tokens to unauthenticated flows.

---

### Traceability summary

| Endpoint (logical) | STC IDs |
|--------------------|---------|
| `POST .../auth/login` | STC-AUTH-001/F � STC-AUTH-004/F |
| `POST .../auth/logout` | STC-AUTH-005/F � STC-AUTH-008/F |
| `POST .../auth/forgot-password` | STC-AUTH-009/F � STC-AUTH-012/F |
| `POST .../auth/verify-code` | STC-AUTH-013/F � STC-AUTH-016/F |
| `POST .../auth/reset-password` | STC-AUTH-017/F � STC-AUTH-020/F |
| `GET .../me` (see mapping) | STC-AUTH-021/F � STC-AUTH-024/F |
| `POST .../auth/refresh-token` (see mapping) | STC-AUTH-025/F � STC-AUTH-028/F |

---

*End of document.*
