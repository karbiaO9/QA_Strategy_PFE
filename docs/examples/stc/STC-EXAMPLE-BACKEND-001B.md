# Software Test Case Sheet � Example (Backend)

**Document:** QM-STC � V02R00 (simplified for report) � **Type:** API / Backend

---

## 01 � Identification

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-AUTH-KINE-001/B |
| **User story** | US-C.1 � As a physiotherapist, I want to log in so that I can access my profiles. |
| **Requirement** | BE-C1-01 |
| **Module** | Authentication � Kine login |
| **Test objective** | Verify that valid credentials return tokens and profile list via `POST /api/v1/kine/auth/login`. |

**Acceptance criteria (summary)**

- Request body: `{ email, password }`
- **200 OK:** `accessToken`, `refreshToken`, `user`, `profiles[]`
- **401** if credentials are invalid
- **403** if account is inactive

---

## 02 � Classification

| Field | Value |
|-------|--------|
| **Test type** | API � Integration |
| **Priority** | High |
| **Execution** | Automated (Postman / Newman) |

---

## 03 � Test run

| Field | Value |
|-------|--------|
| **Tester** | |
| **Date** | |
| **Duration** | |

---

## 04 � Environment

| Field | Value |
|-------|--------|
| **Environment** | Staging |
| **Base URL** | `https://identity.physio.agregatech.com` |
| **Endpoint** | `POST /api/v1/kine/auth/login` |
| **Tool** | Newman (CI) / Postman (manual) |
| **OS** | Windows 10 |

---

## 05 � Preconditions

- Identity API is reachable.
- Test user exists with known email and password (stored in Postman environment, not in this sheet).

---

## 06 � Test script steps

| # | Action | Test data | Expected result | Actual result | Status |
|---|--------|-----------|-----------------|---------------|--------|
| 1 | Send login request with valid credentials | `POST �/auth/login`<br>Body: `{ "email": "user@example.com", "password": "***" }` | HTTP **200**; response contains `accessToken`, `refreshToken`, and `profiles` array | | |

---

## 07 � Execution summary

| Field | Value |
|-------|--------|
| **Overall result** | |
| **Evidence reference** | |
| **Notes** | |

---

*Prefilled specification � execution fields (actual result, status, summary) to be completed during test run.*
