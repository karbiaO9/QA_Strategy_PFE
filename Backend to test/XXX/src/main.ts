
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { requireEnv } from './common/config/env';
import { AuthErrorCode } from './common/exceptions/auth-error-codes';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [requireEnv('RABBITMQ_URL')],
      queue: 'identity_queue',
      queueOptions: { durable: false },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      // Wrap class-validator failures in our standard error envelope so the
      // frontend can switch on `code` for ALL errors (validation included).
      exceptionFactory: (errors: ValidationError[]) => {
        const flat = flattenValidationErrors(errors);
        return new BadRequestException({
          code: AuthErrorCode.VALIDATION_FAILED,
          message: 'Request payload is invalid.',
          errors: flat,
        });
      },
    }),
  );

  // Serve email-template assets (logo, etc.) so transactional emails can
  // reference them via an absolute URL. The folder is copied to dist by
  // nest-cli.json `assets`. Public path: /assets/email/*
  app.useStaticAssets(
    join(__dirname, 'common', 'mailer', 'templates', 'assets'),
    { prefix: '/assets/email/' },
  );

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('XXX & Connect — Identity & RBAC Service (service1)')
    .setDescription(
      `## Service 1 — Identity, Authentication, multi-profile RBAC

Central microservice managing **Accounts** (identity), **Profiles** (work contexts) and
**permissions** for the entire XXX & Connect platform.

_Each section below is collapsible — click the title to show / hide details._

<details>
<summary><b>1. L1 / L2 architecture — Account vs Profile</b> &nbsp;·&nbsp; <i>Two-layer model: Account (\`kines\` collection) + Profiles (separate \`kineprofiles\` collection, 1..N per Account, joined server-side).</i></summary>


| Layer | Storage | Carries | Shared across profiles of the same Account |
| ----- | ------- | ------- | ------------------------------------------ |
| **L1 — Account** (\`kines\` collection) | one doc per kine | unique email, password, last name, first name, phone, \`professionalNumber\`, photo, platform status, \`lastProfileId\` | **yes** — the identity |
| **L2 — Profile** (\`kineprofiles\` collection, top-level) | one doc per profile, references parent kine via \`kineId\` | \`cabinetId\`, \`roleId\`, \`profileType\`, subscription, freemium, ToS, \`isCabinetAdmin\`, profile-specific metadata | **no** — each profile is isolated |

A single kine can have **1..N profiles** (e.g. solo LIBERAL + MEMBER of a group cabinet). Each profile lives as its own document in the \`kineprofiles\` collection with a \`kineId\` backref to its owning Kine. Business data (patients, programs, assessments) is strictly partitioned per profile via CASL conditions.

**API contract preserved**: every response that historically carried \`profiles[]\` (login, /me, select-profile) still carries it — populated server-side by \`KinesService.attachProfiles()\` from the kineprofiles collection. The frontend does not need to change anything.

**Direct Mongo queries**: to list a kine's profiles use \`db.kineprofiles.find({ kineId: <id> })\`. The \`Kine\` document no longer has an embedded \`profiles\` array.

**Profile types (enum \`profileType\`)**: \`LIBERAL | REMPLACANT | ADMIN_GROUP | MEMBER | STUDENT | ASSISTANT\`.

</details>

<details>
<summary><b>2. Guard chain (global order)</b> &nbsp;·&nbsp; <i>JwtAuthGuard → ProfileGuard → PoliciesGuard. Active profile resolved via X-Profile-Id header; CASL applies tenant conditions.</i></summary>


Every request flows through 3 guards via \`APP_GUARD\`:

1. **JwtAuthGuard** — verifies the Bearer JWT, sets \`request.user = { sub, email, type, ... }\` (skipped on \`@Public()\`).
2. **ProfileGuard** — for kine requests (\`type === 'kine'\`), resolves the active profile from the
   \`X-Profile-Id\` header, checks the profile exists and is active, places \`cabinetId\` in the CLS.
   No-op for admin / patient. Use \`@SkipProfileGuard()\` to bypass (e.g. \`/me\`, \`/logout\`).
3. **PoliciesGuard** — runs \`@CheckPolicies\` handlers via CASL and applies tenant conditions.

**Kine JWT**: carries only \`{ sub, email, type }\`. The cabinet and role come from the active profile (header) —
allows switching without re-login.

</details>

<details>
<summary><b>3. Registration — the 6 kine profile flavours</b> &nbsp;·&nbsp; <i>Endpoints register / invitations / accept-invitation. Standalone screen vs invitation, full MEMBER/ASSISTANT scenario.</i></summary>


Two screens / two flows per the spec:

**Screen 1 — adaptive form (standalone)**: a single endpoint, the request's \`profileType\`
determines required fields via \`@ValidateIf\` and the server flow.

| Endpoint | profileType | Cabinet created | Pro number? |
| -------- | ----------- | --------------- | ----------- |
| \`POST /api/v1/kine/auth/register\` | \`LIBERAL\` (with \`isReplacement: true\` for REMPLACANT) | yes, no SIRET | required |
| \`POST /api/v1/kine/auth/register\` | \`ADMIN_GROUP\` | yes, with SIRET (Luhn) | required |
| \`POST /api/v1/kine/auth/register\` | \`STUDENT\` | no | forbidden |

**Screen 2 — registration via invitation**: a cabinet admin generates a link, the kine accepts.

| Endpoint | Auth | Target profileType | Pro number? |
| -------- | ---- | ------------------ | ----------- |
| \`POST /api/v1/kine/auth/invitations\` (generation) | cabinet admin or SUPER_ADMIN | \`MEMBER\` or \`ASSISTANT\` | — |
| \`POST /api/v1/kine/auth/accept-invitation\` (acceptance) | public (signed token) | \`MEMBER\` (ADELI/RPPS required) or \`ASSISTANT\` (no pro number) | depends on type |

**Patient**: standalone registration via \`POST /api/v1/patient/auth/register\`.

**Shared password rules**: min 8 characters, 1 uppercase, 1 digit, 1 special character.
\`passwordConfirmation\` is required on every registration flow.

#### Full scenario (MEMBER or ASSISTANT invitation)

1. **Admin** (Sophie, ADMIN_GROUP profile in Paris) signs in via \`POST /api/v1/kine/auth/login\`.
2. She calls \`POST /api/v1/kine/auth/invitations\` with \`{ email, targetProfileType: 'MEMBER' | 'ASSISTANT' }\` —
   the server derives \`cabinetId\` from her ADMIN_GROUP profile and returns a **signed JWT** (TTL 7 days) carrying
   \`{ cabinetId, invitedEmail, targetProfileType, roleId, invitedByKineId }\`.
3. The token is embedded in an email link (e.g. \`https://app.physio.fr/accept?token=<JWT>\`).
4. The invitee opens the link: the frontend pre-fills the cabinet name + proposed role (decoded from the JWT client-side).
5. The invitee fills the form and submits \`POST /api/v1/kine/auth/accept-invitation\` with
   \`{ invitationToken, firstName, lastName, password, passwordConfirmation, cguAccepted[, professionalNumber if MEMBER] }\`.
6. The server verifies the JWT, creates the L1 Kine + writes a \`MEMBER\` or \`ASSISTANT\` row in the \`kineprofiles\` collection
   tied to the cabinet, and returns \`{ success, message, email }\`. **No session is auto-issued** — the invitee
   must sign in via \`POST /api/v1/kine/auth/login\` then pick their profile via \`POST /api/v1/kine/auth/select-profile\`.

**Note**: every registration endpoint (\`register\`, \`accept-invitation\`, \`registerPatient\`) now returns a
success message instead of a session. The flow is always: **register -> login -> select profile**.

</details>

<details>
<summary><b>4. Service health check</b> &nbsp;·&nbsp; <i>GET / restricted to SUPER_ADMIN — protected via the CASL wildcard can('manage', 'all').</i></summary>


\`GET /\` returns the service health. **Protection**: Bearer JWT + **SUPER_ADMIN** only (enforced via the
CASL wildcard \`can('manage', 'all')\` granted by \`CaslAbilityFactory\` only for that role). The lock icon
shows in Swagger — you must authenticate via \`POST /api/admin/v1/auth/login\` with
\`admin@physioconnect.com\` / \`Admin123!\` before getting 200.

</details>

<details>
<summary><b>5. How to use this Swagger</b> &nbsp;·&nbsp; <i>Steps to test: seed → login → Authorize → X-Profile-Id header. Per-role scenarios included.</i></summary>


1. Run the seed: \`npm run seed\` (or \`npm run seed -- --fresh\` to wipe and reseed).
2. Call a \`POST .../auth/login\` endpoint (tabs \`auth-kine\`, \`auth-patient\`, \`auth-admin\`). The pre-filled
   examples cover the 6 kine profile types + 1 patient + 1 admin.
3. Copy the \`accessToken\` from the response.
4. Click **Authorize** (lock icon, top right), paste the token, validate.
5. **Kine only — profile selection (login step 2)**: the response of \`POST /api/v1/kine/auth/login\` does
   NOT contain permissions, just \`profiles[]\` (summary) + \`lastProfileId\`. Call
   \`POST /api/v1/kine/auth/select-profile\` with \`{ "profileId": "<one id from profiles[]>" }\` to obtain
   \`{ user, profile, permissions, rules }\`; the server records the choice via \`lastProfileId\` for the next login.
6. For business endpoints (kine): add the header \`X-Profile-Id: <selected profile id>\` (same id sent to
   \`/select-profile\`).
7. \`GET /api/v1/kine/me\` returns \`{ user, profiles[summary], lastProfileId, activeProfile, permissions, rules }\` —
   if \`lastProfileId\` is set and valid, \`activeProfile\` / \`permissions\` / \`rules\` are rehydrated automatically.
8. To test \`GET /\` (health) you need a SUPER_ADMIN token.
9. To test invitation: login \`qa.admin@physioconnect.fr\` (password \`QaAdmin123!\`, ADMIN_GROUP + VERIFIED, dedicated tester) — or \`sophie.martin@cabinet-paris.fr\` / \`pierre.roux@cabinet-lyon.fr\` — then \`POST /api/v1/kine/auth/invitations\`
   -> copy \`invitationToken\` -> call \`POST /api/v1/kine/auth/accept-invitation\` (public endpoint, no Authorize
   required). Response is \`{ success, message, email \`}\` — the invitee must then sign in like any kine (steps 2-5).

</details>

<details>
<summary><b>6. Test accounts (after seed — see src/seeds/seed.ts)</b> &nbsp;·&nbsp; <i>Seeded accounts grouped by family (ADMIN / KINE / PATIENT) with the matching endpoint tree.</i></summary>

Accounts are split into 3 families. Each family has its own URL prefix and its own auth endpoints —
a KINE account CANNOT sign in via \`/api/admin/v1/auth/login\` and vice versa.

> **Login by email OR phone** (kine + patient only — admins have no phone column). On every kine
> and patient \`/auth/login\`, the body field \`email\` accepts either the email or the phone number
> stored on the account (resolution server-side via \`$or\` { email, phone }). The DTO field name
> stays \`email\` for client compatibility — just paste the phone in there. Admin login stays
> email-only.

---

#### ADMIN — platform back-office

| Role | Name | Email | Phone | Password |
| ---- | ---- | ----- | ----- | -------- |
| SUPER_ADMIN | Thomas Platform | \`admin@physioconnect.com\` | — (admin schema has no phone) | \`Admin123!\` |

---

#### KINE — healthcare professional

| Profile (L2) | Name | Cabinet | Email | Phone (login alt.) | Password |
| ------------ | ---- | ------- | ----- | ------------------ | -------- |
| ADMIN_GROUP | Sophie Martin | Cabinet Paris Centre | \`sophie.martin@cabinet-paris.fr\` | \`+33601010101\` | \`KineAdmin123!\` |
| MEMBER | Ali Dupont | Cabinet Paris Centre | \`ali.dupont@cabinet-paris.fr\` | \`+33601010102\` | \`Kine123!\` |
| MEMBER | Lea Bernard | Cabinet Paris Centre | \`lea.bernard@cabinet-paris.fr\` | \`+33601010103\` | \`Kine123!\` |
| REMPLACANT | Nadia Benali | Cabinet Paris Centre | \`nadia.benali@cabinet-paris.fr\` | \`+33601010104\` | \`Kine123!\` |
| ADMIN_GROUP | Pierre Roux | Cabinet Lyon Bellecour | \`pierre.roux@cabinet-lyon.fr\` | \`+33602020201\` | \`KineAdmin123!\` |
| MEMBER | Camille Petit | Cabinet Lyon Bellecour | \`camille.petit@cabinet-lyon.fr\` | \`+33602020202\` | \`Kine123!\` |
| ASSISTANT | Thomas Garnier | Cabinet Lyon Bellecour | \`thomas.garnier@cabinet-lyon.fr\` | \`+33602020203\` | \`Assistant123!\` |
| LIBERAL | Julien Leroy | Cabinet Nice (solo) | \`julien.leroy@cabinet-nice.fr\` | \`+33603030301\` | \`Kine123!\` |
| STUDENT | Emma Laurent | — (no cabinet) | \`emma.laurent@student.fr\` | — (no phone in seed) | \`Student123!\` |
| ADMIN_GROUP **(QA — invitations)** | QA Admin | Cabinet QA Invitations | \`qa.admin@physioconnect.fr\` | \`+33699990088\` | \`QaAdmin123!\` |

> **Dedicated invitation-flow tester** — \`qa.admin@physioconnect.fr\` is auto-flipped to \`verificationStatus=VERIFIED\` at seed time. Use this account to test \`POST /api/v1/kine/auth/invitations\` end-to-end (real SMTP delivery to any recipient mailbox). Sophie / Pierre also work, but QA Admin is the clean dedicated account.

---

#### PATIENT — end user


| Name | Linked to (kine) | Cabinet | Email | Phone (login alt.) | Password |
| ---- | ---------------- | ------- | ----- | ------------------ | -------- |
| Marie Durand | Ali Dupont | Cabinet Paris Centre | \`marie.durand@patient.fr\` | \`+33611111111\` | \`Patient123!\` |
| Paul Martin | Lea Bernard | Cabinet Paris Centre | \`paul.martin@patient.fr\` | \`+33611111122\` | \`Patient123!\` |
| Lucas Moreau | Camille Petit | Cabinet Lyon Bellecour | \`lucas.moreau@patient.fr\` | \`+33622222222\` | \`Patient123!\` |

> **Manual Swagger test (login by phone)** — paste the phone (in E.164 format, exactly as seeded
> above, e.g. \`+33601010101\`) in the \`email\` field of the \`/auth/login\` request body. Example body
> for \`POST /api/v1/kine/auth/login\` :
> \`{ "email": "+33601010101", "password": "KineAdmin123!" }\` — equivalent to logging in as Sophie.

---

**Shared endpoints (available to all 3 families with the family-specific prefix)**: \`POST .../auth/logout\`, \`POST .../auth/refresh\`, \`POST .../auth/forgot-password\`, \`POST .../auth/verify-code\`, \`POST .../auth/reset-password\`, \`POST .../auth/change-password\`, \`GET .../me\`, \`PATCH .../me\`.

</details>

<details>
<summary><b>7. Response format login / select-profile / /me (kine)</b> &nbsp;·&nbsp; <i>Two-step flow: /login returns the minimal envelope + profiles[summary] + lastProfileId, /select-profile returns CASL permissions, /me auto-rehydrates from lastProfileId.</i></summary>


**Step 1 — \`POST /api/v1/kine/auth/login\`**

Minimal envelope: no embedded permissions, just identity + the list of profiles. The frontend renders
the switcher; \`lastProfileId\` lets it pre-select the last-used profile.

\`\`\`json
{
  "accessToken": "eyJ...",
  "refreshToken": "rt_...",
  "user": {
    "id": "Kine ObjectId",
    "firstName": "Ali",
    "lastName": "Dupont",
    "email": "ali.dupont@cabinet-paris.fr",
    "profilePhoto": null,
    "phone": "+33601010102",
    "professionalNumber": "10000000002",
    "verificationStatus": "PENDING"
  },
  "profiles": [
    {
      "id": "profile ObjectId",
      "profileType": "MEMBER",
      "cabinetId": "cabinet ObjectId",
      "cabinetName": "Cabinet Paris Centre",
      "role": { "slug": "KINE" },
      "isActive": true
    }
  ],
  "lastProfileId": "profile ObjectId | null"
}
\`\`\`

**Step 2 — \`POST /api/v1/kine/auth/select-profile\`** with \`{ "profileId": "<id>" }\`

Resolves CASL permissions, stamps \`lastProfileId\` + \`lastLoginAt\` on the Account:

\`\`\`json
{
  "user": { /* same identity payload as login */ },
  "profile": {
    "id": "profile ObjectId",
    "profileType": "MEMBER",
    "cabinetId": "cabinet ObjectId",
    "cabinetName": "Cabinet Paris Centre",
    "roleId": "role ObjectId",
    "role": { "slug": "KINE" },
    "isActive": true,
    "subscription": { "planId": null, "source": "inherited" },
    "additionalMetadata": {},
    "cguAcceptedAt": "2026-04-22T...",
    "permissions": [
      { "action": "READ", "subject": "PATIENT", "conditions": { "cabinetId": "..." } },
      { "action": "UPDATE", "subject": "PATIENT", "conditions": { "ownerId": "...", "cabinetId": "..." } }
    ]
  },
  "permissions": [ /* = profile.permissions, top-level mirror for frontend convenience.
                       Identical to a CASL raw-rules array — feed it directly into
                       createMongoAbility(...) on the front. inverted=true marks an
                       explicit cannot rule (revoked override). */ ]
}
\`\`\`

**\`GET /api/v1/kine/me\`** (post-refresh rehydration) — **2 possible shapes**

_Shape A — active profile resolved_ (\`lastProfileId\` valid and profile active):

\`\`\`json
{
  "user":        { /* L1 identity */ },
  "profile":     { /* full envelope of the last profile: cabinet, role, subscription, metadata, permissions */ },
  "permissions": [ /* = profile.permissions, top-level mirror — CASL raw-rules array */ ]
}
\`\`\`

_Shape B — no selection yet_ (\`lastProfileId=null\` or profile disabled / deleted):

\`\`\`json
{
  "user":               { /* L1 identity */ },
  "profile":            null,
  "permissions":        null,
  "availableProfiles":  [ /* summaries to feed the switcher */ ]
}
\`\`\`

The frontend reads \`profile === null\` as "show the switcher and call \`/select-profile\`".

> **i18n note**: every entity that lives in the seed (Action, Module, Permission, Role) is returned with its
> stable key only (\`slug\` / \`code\`) — no \`name\` or \`description\` field. The frontend resolves human-readable
> labels from its own translation bundle keyed by that slug. User-entered free-text fields (cabinet name,
> first / last names) keep their \`name\` as data.

</details>

<details>
<summary><b>8. Self-service account management (L1) + profiles (L2)</b> &nbsp;·&nbsp; <i>change-password, PATCH /me (strict whitelist), PATCH /kine/profiles/:profileId (self-suspension, LIBERAL/STUDENT flags).</i></summary>


Every Account has three self-service endpoints after login:

| Endpoint | Scope | Body |
| -------- | ----- | ---- |
| \`POST .../auth/change-password\` | admin / kine / patient | \`{ currentPassword, newPassword, newPasswordConfirmation }\` — bcrypt verify, rehash cost 12, refresh-token revocation, CASL invalidation. Refused if \`new === current\` (\`PASSWORD_SAME_AS_OLD\`). |
| \`PATCH .../me\` | admin / kine / patient | Strict whitelist per type (last name, first name, photo, phone, ...). Email, \`professionalNumber\`, \`verificationStatus\`, \`roleId\`, \`status\`, \`uniqueCode\` (patient) ARE NOT mutable via self. |
| \`PATCH /api/v1/kine/profiles/:profileId\` | kine only | Mutates ONE row in the \`kineprofiles\` collection (server-side ownership check via \`kineId\`). Accepts \`isActive: false\` (self-suspension); a \`isActive: true\` payload is rejected with **403 \`PROFILE_ACTIVATION_ADMIN_ONLY\`** (reactivation reserved to SUPER_ADMIN). Also accepts \`school / academicYear / justificatifUrl\` (STUDENT only) — sending these on a non-STUDENT profile fails with **400 \`FIELD_NOT_APPLICABLE\`**. Returns 404 \`PROFILE_NOT_FOUND\` if the profile id is not owned by the calling kine. |

</details>

<details>
<summary><b>9. Registration via invitation</b> &nbsp;·&nbsp; <i>3 endpoints (generation, public preview, accept or attach). Existing-Account handling, single-use tokens via Redis (jti).</i></summary>


Three endpoints:

1. \`POST /api/v1/kine/auth/invitations\` — admin generates an invitation; the response carries \`invitationUrl\` ready to copy, \`cabinetName\`, \`expiresAt\`, \`emailDelivered\` (\`true\` when SMTP is wired, \`false\` otherwise — the link is then handed over manually).
2. \`POST /api/v1/kine/auth/invitations/preview\` *(public, idempotent)* — the frontend decodes the token and receives \`{ accountExists, existingAccountKind, cabinetName, roleSlug, targetProfileType, invitedEmail, expiresAt }\`. Lets it route to the right screen.
3. Two possible screens after preview:
   - \`accountExists=false\` → \`POST /api/v1/kine/auth/accept-invitation\` (full form, creates the Account + profile).
   - \`accountExists=true\` → \`POST /api/v1/kine/auth/invitations/attach\` (\`{ invitationToken, password, professionalNumber? }\` — backend authenticates then **adds a profile** to the existing Account — **no new Account**).

Invitation tokens are **single-use** via a \`jti\` stored in Redis (\`invitation:{jti}:used\`); any replay returns \`INVITATION_ALREADY_USED\` (409).

</details>

<details>
<summary><b>10. Subscription per profile</b> &nbsp;·&nbsp; <i>subscriptionPlanId lives on the kineprofiles row. MEMBER/ASSISTANT inheritance, freemium per type (30d or 3 months for STUDENT), admin-only scope.</i></summary>


Invariant applied across the whole service:

- \`subscriptionPlanId\` and the \`freemium\` state live on the **kineprofile document** (\`kineprofiles\` collection, one row per profile).
- A kine with multiple profiles has as many subscription states as profiles. \`/me\` exposes \`subscription: { planId, source: 'profile' | 'inherited' | null }\` per profile.
- MEMBER / ASSISTANT leave \`subscriptionPlanId = null\` — they inherit the cabinet's plan.
- LIBERAL / REMPLACANT / ADMIN_GROUP get a 30-day freemium by default.
- STUDENT gets a 3-month freemium.
- Only the admin endpoint \`POST /api/admin/v1/kines/:id/profiles\` accepts a \`subscriptionPlanId\` in the body (passed via \`scope=admin\`). Self-add strips the field.
- Direct admin operations on existing profiles use the \`/api/admin/v1/kine-profiles\` surface: \`GET /?kineId=\`, \`GET /:id\`, \`PATCH /:id\`, \`DELETE /:id\` (each gated by CASL READ/UPDATE on \`KINE\`).

</details>

<details>
<summary><b>11. ADELI / RPPS verification</b> &nbsp;·&nbsp; <i>Workflow PENDING → VERIFIED / REJECTED, audit trail, platform-wide uniqueness via partial index, admin endpoints.</i></summary>


- At registration, \`verificationStatus\` becomes \`PENDING\` as soon as a \`professionalNumber\` is provided. Audit fields: \`verifiedAt\`, \`verifiedByAdminId\`, \`verificationRejectionReason\`.
- Platform-wide uniqueness via partial index \`ux_kines_professionalNumber_active\` (\`status=ACTIVE\`). Deactivation frees the number (\`PROFESSIONAL_NUMBER_ALREADY_USED\` — 409).
- Admin screen:
  - \`GET /api/admin/v1/kines/verifications?status=PENDING|VERIFIED|REJECTED\`
  - \`PATCH /api/admin/v1/kines/:id/verification\` with \`{ decision: APPROVE|REJECT|RESET, rejectionReason? }\`.

</details>

<details>
<summary><b>12. Redis keys used by the service</b> &nbsp;·&nbsp; <i>Key table (refresh_token, password reset, invitation jti, CASL perms cache, rate-limit) + REDIS_URL / REDIS_KEY_PREFIX config.</i></summary>


| Key (prefixed by \`REDIS_KEY_PREFIX\` if set) | Usage | TTL |
| -------------------------------------------- | ----- | --- |
| \`auth:{sub}:refresh_token\`                   | user refresh token                     | 7d  |
| \`reset:{email}:code\`                         | bcrypt-hashed 6-digit code             | 10min |
| \`reset:{email}:attempts\`                     | attempts counter (max 3)               | 10min |
| \`reset:{email}:token\`                        | single-use 64-hex resetToken           | 10min |
| \`invitation:{jti}:used\`                      | flag: invitation consumed              | = JWT exp |
| \`perms:{sub}\` / \`perms:profile:{id}\`         | CASL cache (versioned rules array)     | 1h  |
| \`rl:login:{email}\`                           | rate-limit login (10/min)              | 1min |
| \`rl:forgot:{email}\`                          | rate-limit forgot-password (5/hour)    | 1h  |

Config:

- \`REDIS_URL\` (required in prod). In-memory fallback in dev if absent.
- \`REDIS_KEY_PREFIX\` (optional) — prefixes every key, lets you share a cluster across environments.

</details>

<details>
<summary><b>13. Error codes</b> &nbsp;·&nbsp; <i>Full table of business and HTTP codes returned by the service (auth, profile, password, invitation, ADELI/RPPS, upload, rate-limit).</i></summary>


| Code | HTTP | Description |
| ---- | ---- | ----------- |
Every error response follows the shape \`{ statusCode, message: { code, message } }\`. The \`code\` field is the machine-readable application code listed below — frontends should switch on \`code\`, not on the human-readable \`message\`. Codes are centralized in \`src/common/exceptions/auth-error-codes.ts\`.

| Code | HTTP | Description |
| ---- | ---- | ----------- |
| \`TOKEN_MISSING\` / \`TOKEN_INVALID\` / \`TOKEN_EXPIRED\` | 401 | JWT access issue. \`TOKEN_INVALID\` also fires when the per-user token version has been bumped (re-login / password-change / logout invalidates older sessions). |
| \`INVALID_CREDENTIALS\` | 401 | Invalid email/password. |
| \`OAUTH_LOGIN_FAILED\` / \`OAUTH_EMAIL_NOT_VERIFIED\` | 401 | Google/Apple OIDC failure. \`OAUTH_EMAIL_NOT_VERIFIED\` is reserved for the specific case where the provider returned an unverified email. |
| \`OAUTH_ACCOUNT_MISMATCH\` | 409 | Email matches an existing patient with a different OAuth providerId attached. |
| \`PERMISSION_DENIED\` | 403 | CASL policy refuses access. |
| \`KINE_INACTIVE\` | 403 | The Kine L1 account is suspended (\`status !== 'ACTIVE'\`). Returned by select-profile, add-profile, and create-invitation flows. |
| \`PROFILE_INACTIVE\` | 403 | The selected profile is disabled (\`isActive: false\`). |
| \`PROFILE_ACTIVATION_ADMIN_ONLY\` | 403 | Non-admin attempted to set \`isActive: true\` via PATCH /kine/profiles/:id (self-suspension via \`isActive: false\` is allowed). |
| \`PROFILE_HEADER_MISSING\` / \`PROFILE_ID_INVALID\` | 400 | \`X-Profile-Id\` missing or malformed. |
| \`PROFILE_NOT_FOUND\` | 404 | Profile id does not match any kineprofiles row owned by the calling kine. |
| \`KINE_NOT_FOUND\` / \`PATIENT_NOT_FOUND\` / \`CABINET_NOT_FOUND\` / \`ROLE_NOT_FOUND\` | 404 | Resource does not exist. |
| \`FIELD_NOT_APPLICABLE\` | 400 | DTO carried fields not relevant to the target \`profileType\` (e.g. \`school\` on a non-STUDENT profile). |
| \`CODE_INVALID\` / \`CODE_EXPIRED\` / \`CODE_TOO_MANY_ATTEMPTS\` | 400 | Reset-password flow. |
| \`RESET_TOKEN_INVALID\` | 400 | Reset token expired or already consumed. |
| \`PASSWORD_SAME_AS_OLD\` | 400 | Change-password: new == current. |
| \`EMAIL_ALREADY_USED\` | 409 | An Account already exists with this email (cross admin/kine/patient). |
| \`ACCOUNT_ALREADY_EXISTS\` | 409 | Reserved for invitation flows when a future operation would conflict with an existing account. |
| \`PROFILE_ALREADY_EXISTS\` | 409 | Duplicate (profileType, cabinetId) on add-profile. |
| \`PROFESSIONAL_NUMBER_REQUIRED\` / \`PROFESSIONAL_NUMBER_FORBIDDEN\` | 400 | ADELI/RPPS rule per profileType. |
| \`PROFESSIONAL_NUMBER_ALREADY_USED\` | 409 | Professional number already linked to an active Account. |
| \`REJECTION_REASON_REQUIRED\` | 400 | PATCH /verification without a reason on REJECT. |
| \`INVITATION_ALREADY_USED\` | 409 | Invitation link already consumed (jti seen in Redis). |
| \`INVITATION_EXPIRED\` | 401 | Invitation JWT past its 7-day TTL. |
| \`INVITATION_ACCOUNT_MISMATCH\` | 409 | Invitation email belongs to admin/patient (not kine). |
| \`STUDENT_JUSTIFICATIF_REQUIRED\` / \`JUSTIFICATIF_REQUIRED\` | 400 | STUDENT: neither file nor URL supporting document supplied. |
| \`FILE_TYPE_NOT_ALLOWED\` / \`FILE_TOO_LARGE\` | 400 / 413 | Upload rejected (MIME allowlist / 5 MB cap). |
| \`REFRESH_TOKEN_INVALID\` | 401 | Refresh token expired, rotated, or revoked. |
| \`RATE_LIMITED\` | 429 | Limit reached (login 10/min, forgot-password 5/hour). |

</details>

<details>
<summary><b>14. Email delivery (SMTP)</b> &nbsp;·&nbsp; <i>Two outbound flows: kine invitations + password reset codes. Driver auto-fallback (smtp -> log) if creds incomplete.</i></summary>

The service ships with a thin \`MailerService\` (\`src/common/mailer/mailer.service.ts\`) that wraps **nodemailer**. It is consumed by \`AuthService\` for the two flows below — there is **no in-app inbox**, the recipient receives a real email at the address registered on their Account.

**Driver matrix**

| \`MAIL_DRIVER\` | Behaviour |
| -------------- | --------- |
| \`log\`         | Envelopes printed to the Nest logger only — no SMTP attempt. Default in unit tests. |
| \`smtp\`        | Delivered via nodemailer to the configured relay. If \`MAIL_HOST\` / \`MAIL_USER\` / \`MAIL_PASSWORD\` are empty OR nodemailer init throws, the service warns at boot and **silently falls back to \`log\`** — the API never crashes on mailer errors. |

**Required env (when \`MAIL_DRIVER=smtp\`)**

| Var | Notes |
| --- | ----- |
| \`MAIL_HOST\`     | e.g. \`smtp.gmail.com\`, \`email-smtp.eu-west-3.amazonaws.com\`, \`smtp-relay.brevo.com\`. |
| \`MAIL_PORT\`     | \`465\` (implicit TLS) or \`587\` (STARTTLS). |
| \`MAIL_SECURE\`   | \`true\` if port 465, \`false\` if 587. Mismatch hangs on connect. |
| \`MAIL_USER\`     | SMTP login. |
| \`MAIL_PASSWORD\` | SMTP password. For Gmail this **must** be a 16-char Google App Password — regular passwords are rejected. |
| \`MAIL_FROM\`     | \`Display Name <addr@domain>\`. For Gmail must equal \`MAIL_USER\` (otherwise rewritten). For domain-based providers, must be a sender that has DKIM/SPF published — otherwise messages land in spam. |

**Outbound flow #1 — Kine invitation**

- Triggered by: \`POST /api/v1/kine/auth/invitations\` (cabinet admin or SUPER_ADMIN).
- Subject: *"Invitation a rejoindre XXXConnect..."*
- Body: link to \`\${FRONTEND_BASE_URL}\${FRONTEND_INVITATION_PATH}?token=<JWT>\` (TTL 7d).
- Response field \`emailDelivered\`: \`true\` only when \`MAIL_DRIVER=smtp\` AND nodemailer reported success. \`false\` if log driver, missing creds, or SMTP error — the response still carries \`invitationUrl\` so the inviter can hand the link over manually.

**Outbound flow #2 — Password reset code**

- Triggered by: \`POST /api/v1/{kine|admin|patient}/auth/forgot-password\` (3 routes, same service method).
- Subject: *"Reinitialisation de votre mot de passe XXXConnect"*
- Body: a 6-digit code, TTL = \`RESET_CODE_TTL_SECONDS\` (10 min). The code is bcrypt-hashed in Redis under \`reset:{email}:code\` — only the plaintext copy in the email lets the user complete \`/verify-code\`.
- **Anti-enumeration**: the endpoint always returns \`{success: true}\`, regardless of whether the email exists. Mailer failures are swallowed (logged only) — never surfaced to the client.
- Rate limit: 5 requests / hour / email (\`RATE_LIMIT_FORGOT_MAX\`).

**Boot-time signal**

On startup you will see one of:

\`\`\`
Mailer initialised in SMTP mode (smtp.gmail.com:465, secure=true).
Mailer initialised in LOG mode (driver=log).
MAIL_DRIVER=smtp but MAIL_HOST / MAIL_USER / MAIL_PASSWORD are incomplete -- falling back to LOG driver.
Mailer SMTP init failed (...). Falling back to LOG driver.
\`\`\`

</details>
`,

)
    .setVersion('1.2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'accessToken obtained via a POST .../auth/login endpoint. Sent as Authorization: Bearer <token>.',
      },
      'access-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-Profile-Id',
        description:
          'ObjectId of a kine profile (row in the `kineprofiles` collection). Required on kine business endpoints. Retrievable via GET /api/v1/kine/me.',
      },
      'x-profile-id',
    )
    .addTag('health', 'Service health check (SUPER_ADMIN only)')
    .addTag('auth-kine', 'Kine authentication and registration — /api/v1/kine/auth')
    .addTag('auth-patient', 'Patient authentication and registration — /api/v1/patient/auth')
    .addTag('auth-admin', 'Platform admin authentication — /api/admin/v1/auth')
    .addTag('admins', 'Back-office admin management (SUPER_ADMIN required)')
    .addTag('kines', 'Back-office kine management — L1 identity CRUD only')
    .addTag('kine-profiles', 'Back-office per-profile (L2) management — list/get/update/delete on the kineprofiles collection (admin scope)')
    .addTag('roles', 'System and custom role management (RBAC)')
    .addTag('permissions', 'Catalog of available permissions (RBAC)')
    .addTag('modules', 'Modules / business domains (RBAC metadata)')
    .addTag('actions', 'CASL actions / verbs (RBAC metadata)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
    },
  });

  await app.startAllMicroservices();
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Identity Service is running on port: ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();

// Flatten class-validator's nested ValidationError[] into a flat list of
// { field, msg } pairs the frontend can render directly.
function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): Array<{ field: string; msg: string }> {
  const flat: Array<{ field: string; msg: string }> = [];
  for (const err of errors) {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property;
    if (err.constraints) {
      for (const msg of Object.values(err.constraints)) {
        flat.push({ field: path, msg });
      }
    }
    if (err.children?.length) {
      flat.push(...flattenValidationErrors(err.children, path));
    }
  }
  return flat;
}
