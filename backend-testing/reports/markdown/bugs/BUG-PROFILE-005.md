# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PROFILE-005 |
| **Title** | STC-PROFILE-ADD-009B: POST — Add STUDENT with justificatif |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 7, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PROFILE-ADD-009B: STC-PROFILE-ADD-009/B \| Add STUDENT with justificatif — assertion failure (HTTP 401 Unauthorized). expected [ 201, 400 ] to include 401 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/profiles \| Body: { "profileType": "STUDENT", "schoolIfmk": "IFMK Lyon", "academicYear": "2024-2025", "justificatifUrl": "https://s3.example/justif.pdf" } \| Headers: Content-Type: application/json; X-Profile-Id: 6a0e174e73797a63a4ac8467 |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/profiles |
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
| **Precondition** | STC STC-PROFILE-ADD-009/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PROFILE-ADD-009/B \| Add STUDENT with justificatif".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/profiles with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • Profil STUDENT créé • N patients fictifs créés (1 par template) • Chaque clone : source=fictif, isTemplate=false, ownerId=kineId • Les patients sont rattachés au tenant de l'étudiant Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 401 Unauthorized in 154 ms. 1 failed, 1 passed. expected [ 201, 400 ] to include 401 — expected [ 201, 400 ] to include 401 |

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
| **Notes** | expected [ 201, 400 ] to include 401 |

