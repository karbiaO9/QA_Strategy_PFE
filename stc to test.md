# Frontend API Integration Test Cases

| STC ID | Linked US ID | Ticket Ref | TC Type | Priority | Scenario | Endpoint | Method | Expected Code |
|---|---|---|---|---|---|---|---|---|
| STC-INVIT-GEN-003/B | US-B.1 | FE-K-API-B1-01 | Frontend Intégration API | MEDIUM | API integration creation invitation | `/api/v1/kine/auth/invitations` | POST | 201 Created |
| STC-INVIT-GEN-004/B | US-B.1 | FE-K-API-B1-02 | Frontend Intégration API | HIGH | Preview + finalisation inscription invitation | `/api/v1/kine/auth/invitations/preview` | POST | N/A |
| STC-INVIT-ASST-002/B | US-B.2 | FE-K-API-B2-01 | Frontend Intégration API | MEDIUM | Assistant registration integration | `/api/v1/kine/auth/invitations` | POST | N/A |
| STC-INVIT-ATTACH-002/B | US-B.3 | FE-K-API-B3-01 | Frontend Intégration API | HIGH | Attach invitation + Switcher update | `/api/v1/kine/auth/invitations/attach` | POST | 201 Created |
| STC-PROFILE-SELECT-003/B | US-E.1 | FE-K-API-E1-01 | Frontend Intégration API | HIGH | Switcher integration (`X-Profile-Id`) | `/api/v1/kine/auth/select-profile` | POST | N/A |
| STC-PROFILE-ADD-003/B | US-E.2 | FE-K-API-E2-01 | Frontend Intégration API | MEDIUM | Add profile + refresh Switcher | `/api/v1/kine/profiles` | POST | 201 Created |

---

## STC-INVIT-GEN-003/B

**Preconditions**
- Next.js frontend deployed
- Backend API accessible (mock ou réel)

**Payload / Test Data**
- N/A (à compléter)

**Steps**
1. Open the screen / launch the user flow
2. Fill form with valid data
3. Trigger API call: `/api/v1/kine/auth/invitations`
4. Verify API call in network tab
5. Verify UI response (success message, redirect, state update)
6. Verify backend persistence

**Acceptance Criteria**
- `InvitationsService.create()` implémenté
- Success message affiché après envoi
- Gestion erreurs:
  - rôle insuffisant
  - email invalide
- Rafraîchissement liste invitations

**Expected Result**
- Cas nominal validé selon AC du ticket

---

## STC-INVIT-GEN-004/B

**Preconditions**
- Next.js frontend deployed
- Backend API accessible (mock ou réel)

**Steps**
1. Open the screen / launch user flow
2. Fill form with valid data
3. Trigger API call: `/api/v1/kine/auth/invitations/preview`
4. Verify network request
5. Verify UI response
6. Verify backend persistence

**Acceptance Criteria**
- `InvitationsService.preview()` implémenté
- Formulaire pré-rempli avec email non modifiable
- `InvitationsService.complete()` via POST `/invitations/complete`
- Création:
  - Compte
  - Profil MEMBER
  - `cabinetId` de l'inviteur
- Redirection dashboard après succès

**Expected Result**
- Cas nominal validé selon AC du ticket

---

## STC-INVIT-ASST-002/B

**Preconditions**
- Next.js frontend deployed
- Backend API accessible (mock ou réel)

**Acceptance Criteria**
- POST `/invitations/complete` avec données Assistant
- Profil créé avec `profileType=ASSISTANT`
- Redirection dashboard après succès

**Expected Result**
- Cas nominal validé selon AC du ticket

---

## STC-INVIT-ATTACH-002/B

**Preconditions**
- Next.js frontend deployed
- Backend API accessible
- Existing Kine account with valid login

**Acceptance Criteria**
- `InvitationsService.attach()` implémenté
- Switcher profils mis à jour
- Redirection dashboard nouveau profil
- Gestion erreurs:
  - HTTP 401 mot de passe incorrect
  - HTTP 409 invitation consommée

**Expected Result**
- Cas nominal validé selon AC du ticket

---

## STC-PROFILE-SELECT-003/B

**Preconditions**
- Next.js frontend deployed
- Backend API accessible
- Existing Kine account
- User logged in with valid accessToken
- At least 1 profile available

**Acceptance Criteria**
- HTTP interceptor ajoute `X-Profile-Id`
- `setActiveProfile()` met à jour global state
- Appel `/me` après switch
- Redirect `/dashboard`
- Gestion HTTP 403 profil inactif

**Expected Result**
- Cas nominal validé selon AC du ticket

---

## STC-PROFILE-ADD-003/B

**Preconditions**
- Next.js frontend deployed
- Backend API accessible
- Existing Kine account

**Acceptance Criteria**
- `ProfilesService.create()` implémenté
- Nouveau profil ajouté au Switcher
- Success message affiché
- Gestion HTTP 409 freemium déjà existant

**Expected Result**
- Cas nominal validé selon AC du ticket