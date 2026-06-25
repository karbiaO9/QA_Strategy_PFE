# Software Test Case Sheet

**QA Governance / Test Evidence / Audit Traceability**

| Meta | Value |
|------|--------|
| **Document Ref** | QM-STC |
| **Version** | V02R00 |
| **Editor** | |
| **Verifier** | |
| **Issued** | |
| **Classification** | Internal - Confidential |

---

## 01 - Test Case Identification

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Project** *(required)* | Application under test | **STC ID** *(required)* | STC-SMOKE-AUTH-002 |
| **Test Suite ID** | | **Requirement ID** | |
| **Module / Component** | Authentication � Smoke | **Feature Name** | Smoke � forgot-password route loads |
| **Sprint ID** | Sprint 1 | **Release ID** | |
| **Build Number** |  | **API Version** |  |
| **Traceability Ref** | STC-SMOKE-AUTH-002 | **Compliance Impact** | - [ ] Yes - [ ] No - [ ] Partial |

**User Story** *(As a [role], I want to ... so that ...)*

Smoke � forgot-password route loads

**Test Objective** *(required)*

Smoke � forgot-password route loads

---

## 02 - Test Classification and Governance

**Test Type** *(required)*

- [ ] Functional - [ ] UI / UX - [ ] Integration - [ ] API - [ ] Performance - [ ] Security - [ ] Compatibility - [ ] Regression - [x] Smoke

**Priority** *(required)*

- [ ] Critical - [x] High - [ ] Medium - [ ] Low

**Risk Level**

- [ ] Critical - [ ] High - [ ] Medium - [ ] Low

**Execution Status**

- [ ] Not Run - [ ] In Progress - [x] Passed - [ ] Failed - [ ] Blocked - [ ] Skipped

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Regression Flag** | - [ ] Yes - [ ] No | **Automation Flag** | - [x] Automated - [ ] Manual - [x] Hybrid |
| **Automation Script Ref** | frontend-testing/tests/smoke/auth.smoke.spec.ts | **CI/CD Pipeline Ref** | CI pipeline (Playwright) |
| **Retest Required** | - [ ] Yes - [ ] No | **Defect Reference** | |
| **Security Classification** | - [ ] Public - [ ] Internal - [ ] Confidential - [ ] Restricted | **Approval Status** | - [ ] Draft - [ ] Under Review - [ ] Approved - [ ] Rejected |

---

## 03 - Test Run Information

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Tester Name** *(required)* | GitHub Actions | **Reviewer** | |
| **QA Validator** | | **Date(s) of Test** *(required)* | 7 Jun 2026 |
| **User Role Tested** | Kine practitioner (test account) | **Tenant / Organisation** | |
| **Execution Duration** | 00:02 | **Execution Cycle** | *(e.g. Cycle 1 / UAT)* |

---

## 04 - Test Environment

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Environment Type** | - [ ] Dev - [x] Staging - [ ] UAT - [ ] Production | **Application Version** *(required)* | See BUILD / APPLICATION_VERSION |
| **Server / Base URL** | https://kine.physio.agregatech.com | **API Endpoint** |  |
| **Browser** | Chromium (Playwright Desktop Chrome) | **Operating System** | linux |
| **Database** | | **Device / Form Factor** | |

---

## 05 - Preconditions, Postconditions and Dependencies

| Field | Content |
|-------|---------|
| **Preconditions** *(required)* | |
| **Postconditions** | |
| **Dependencies** | |
| **Assumptions** | |
| **Required Test Data** | *(reference vault / test-data store - do not paste secrets)* |
| **General Notes** | |

---

**Date:** _______________________ **Signature:** _______________________

*QM-STC / V02R00 | XXX & Connect x Pura Solutions SARL | Contrat PURA-PC-2025-001 | Ce document fait partie du dossier de livraison du sprint.*

---

## 06 - Test Script Steps / Results

| # | Action / Test Step | Test Data | Expected Result | Actual Result | Acceptance Criteria | Status | Defect Ref | Sev | Evidence Ref |
|---|-------------------|------------|-----------------|---------------|---------------------|--------|------------|-----|--------------|
| 1 | | | | | | | | | |

*Status:* Pass / Fail / Blocked / N/A. *Sev:* C Critical / H High / M Medium / L Low.

---

## 07 - Execution Summary

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Total Steps** | 1 | **Steps Passed** | 0 |
| **Steps Failed** | 0 | **Blocked / Skipped** | 0 |
|**Overall Result** | PASSED |
| **Evidence Reference** | *(screenshots, video, logs, S3 paths)* | **Attachment Reference** | *(Confluence, SharePoint, Drive, etc.)* |

**Execution Notes** :

Playwright status: passed
Project: chromium-guest
Base URL: https://kine.physio.agregatech.com
Spec source: /home/runner/work/QA_Strategy_PFE/QA_Strategy_PFE/Frontend to test/docs/STC-AUTH-Frontend-Integration-Tests - Copie.md

---

## 08 - Reviewer and Approval Workflow

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Reviewer Name** | | **Review Date** | |
| **QA Validator Name** | | **Validation Date** | |
| **Approver Name** | | **Approval Date** | |

**Review Comments** :


---

**Date:** _______________________ **Signature:** _______________________

*QM-STC / V02R00 | XXX & Connect x Pura Solutions SARL | Contrat PURA-PC-2025-001 | Ce document fait partie du dossier de livraison du sprint.*
---

*Playwright ? 2026-06-07T17:38:00.990Z ? Duration 1753ms ? Project chromium-guest ? Tester GitHub Actions*
