# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PWD-002 |
| **Title** | STC-PWD-FORGOT-004B: POST — Forgot password rate limit 429 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 7, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PWD-FORGOT-004B: STC-PWD-FORGOT-004/B \| Forgot password rate limit 429 — HTTP 404 Not Found; Excel-allowed HTTP {200, 429}. Also: expected [ 200, 429 ] to include 404 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/forgot-password \| Body: { "email": "marie.durand@patient.fr" } \| Headers: Content-Type: application/json |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/auth/forgot-password |
| **Screenshot** | Use Newman HTML/JSON export for this run for full request/response capture. |

---

## 3. Environment

| Field | Value |
|-------|--------|
| **Platform** | Backend API |
| **Operating System** | Windows 10 |
| **Browser** | N/A - API testing with Postman/Newman |

---

## 4. Bug Details

| Field | Value |
|-------|--------|
| **Precondition** | STC STC-PWD-FORGOT-004/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PWD-FORGOT-004/B \| Forgot password rate limit 429".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/forgot-password with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • Appels 1-5 : HTTP 200 OK • Appel 6+ : HTTP 429 Too Many Requests • Body: { statusCode: 429, code: 'RATE_LIMIT_EXCEEDED' } • Reset après 1h Allowed HTTP status (execution sheet): {200, 429}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 404 Not Found in 156 ms. 1 failed, 1 passed. expected [ 200, 429 ] to include 404 — expected [ 200, 429 ] to include 404 |

---

## 5. Bug Tracking

| Field | Value |
|-------|--------|
| **Assigned To** |  |
| **Severity** | ☒ Blocking ☒ Medium ☒ Minor  ☒ Weak|
| **Priority** | ☒ Immediate  ☒ high ☒ Medium  ☒ Low |
| **Status** | ☒ New ☒ High ☒ Closed  |
| **Bug Type** | ☒ Functional  ☒ UI  ☒ Performance  ☒ Security  ☒ Compatibility |
| **Resolution Date** |  |

---

## 6. Notes

| Field | Value |
|-------|--------|
| **Notes** | expected [ 200, 429 ] to include 404 \| Excel Expected Result requires HTTP in {200, 429}; received 404. |

