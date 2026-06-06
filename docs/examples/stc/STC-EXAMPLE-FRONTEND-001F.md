# Software Test Case Sheet � Example (Frontend)

**Document:** QM-STC � V02R00 (simplified for report) � **Type:** UI / Frontend integration

---

## 01 � Identification

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-AUTH-001/F |
| **User story** | US-C.1 � As a physiotherapist, I want to log in from the web app so that I reach my dashboard. |
| **Module** | Authentication � Login page |
| **Test objective** | Verify that the login UI calls the API, stores the session, and redirects to a protected route. |

**Acceptance criteria (summary)**

- Valid credentials trigger `POST /api/v1/kine/auth/login`
- Access token saved in browser (`localStorage`: `pc_access_token`)
- User leaves `/login` and can open protected pages without being sent back to login

---

## 02 � Classification

| Field | Value |
|-------|--------|
| **Test type** | Functional � UI � Integration |
| **Priority** | P0 (Critical) |
| **Execution** | Automated (Playwright) |

---

## 03 � Test run

| Field | Value |
|-------|--------|
| **Tester** | |
| **Date** | |
| **Browser** | Chromium (Playwright) |

---

## 04 � Environment

| Field | Value |
|-------|--------|
| **Environment** | Local / Staging frontend |
| **App URL** | `http://localhost:3000` (or deployed XXX app) |
| **API** | `POST /api/v1/kine/auth/login` |
| **Tool** | Playwright |

---

## 05 � Preconditions

- XXX web app is running and can reach the identity API.
- Valid test user credentials are configured in the test data file.
- Browser storage is empty (no existing session).

---

## 06 � Test script steps

| # | Action | Test data | Expected result | Actual result | Status |
|---|--------|-----------|-----------------|---------------|--------|
| 1 | Open login page | Navigate to `/login` | Login form is displayed | | |
| 2 | Enter credentials and submit | Valid email + password | One `POST` to `/auth/login` with JSON body | | |
| 3 | Check API response | � | HTTP **200**; body includes `accessToken` | | |
| 4 | Check session and navigation | � | Token in `localStorage`; URL is not `/login`; dashboard loads | | |
| 5 | Open protected route | Go to `/` (dashboard) | User stays authenticated (no redirect to login) | | |

---

## 07 � Execution summary

| Field | Value |
|-------|--------|
| **Overall result** | |
| **Evidence reference** | |
| **Automated test ref** | `frontend-testing/tests/auth/login.spec.ts` |
| **Notes** | |

---

*Prefilled specification � execution fields (actual result, status, summary) to be completed during test run.*
