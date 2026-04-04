# EasyFollowUp Product Refactor Blueprint

## 1) Target Product Definition

EasyFollowUp becomes a focused, multi-tenant SaaS CRM for small teams:
- Fast lead capture
- Follow-up reminders and history
- Team collaboration in one organization
- Subscription billing

### Product Positioning
- Not a marketplace
- Not an ERP
- Not an academic management suite
- Core job: help teams convert leads with minimal friction

## 2) Final Domain Model (Lean)

### Core Entities
- Organization
- User
- Lead
- FollowUp
- Subscription

### Target Relationships
- One `Organization` has many `User`
- One `Organization` has many `Lead`
- One `Lead` has many `FollowUp`
- One `Organization` has one active `Subscription`

## 3) Target Prisma Schema (Recommended)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

enum UserRole {
  OWNER
  MEMBER
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  WON
  LOST
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELED
}

model Organization {
  id             String         @id @default(auto()) @map("_id") @db.ObjectId
  name           String
  slug           String         @unique
  users          User[]
  leads          Lead[]
  subscription   Subscription?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

model User {
  id             String         @id @default(auto()) @map("_id") @db.ObjectId
  orgId          String         @db.ObjectId
  organization   Organization   @relation(fields: [orgId], references: [id])
  name           String
  email          String         @unique
  role           UserRole       @default(MEMBER)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([orgId])
}

model Lead {
  id             String         @id @default(auto()) @map("_id") @db.ObjectId
  orgId          String         @db.ObjectId
  organization   Organization   @relation(fields: [orgId], references: [id])
  name           String
  phone          String?
  email          String?
  status         LeadStatus     @default(NEW)
  source         String?
  notes          String?
  followUps      FollowUp[]
  createdById    String?        @db.ObjectId
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([orgId, createdAt])
  @@index([orgId, status])
  @@index([phone])
  @@index([email])
}

model FollowUp {
  id             String         @id @default(auto()) @map("_id") @db.ObjectId
  leadId          String         @db.ObjectId
  lead            Lead           @relation(fields: [leadId], references: [id])
  note            String
  nextDate        DateTime?
  completed       Boolean        @default(false)
  createdById     String?        @db.ObjectId
  createdAt       DateTime       @default(now())

  @@index([leadId, createdAt])
  @@index([nextDate])
}

model Subscription {
  id                 String              @id @default(auto()) @map("_id") @db.ObjectId
  orgId              String              @unique @db.ObjectId
  organization       Organization        @relation(fields: [orgId], references: [id])
  planKey            String
  status             SubscriptionStatus  @default(TRIAL)
  razorpaySubId      String?
  stripeSubId        String?
  currentPeriodEnd   DateTime?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  @@index([status])
}
```

## 4) What To Remove vs Keep

### Remove (Phase-out)
- `Student`, `Course`, `Batch`, `Teacher`, fee planning/payment academic models
- EasyFollowUp claim marketplace logic (`GlobalLead`, `TenantLeadAccess`, `LeadClaim`, scoring/audit tied only to marketplace)
- Heavy modules not required for lead follow-up MVP

### Keep (Refactor)
- Auth foundation (OTP/email session logic)
- Lead and contact log code (convert contact log into follow-up abstraction)
- Billing integrations and webhook handlers (adapt to org subscription)
- Shared UI primitives, table components, validation utilities

## 5) API Refactor Contract

### Base
- `/api/v1/org`
- `/api/v1/users`
- `/api/v1/leads`
- `/api/v1/followups`
- `/api/v1/subscription`

### Rules
- Every handler resolves user session first
- Every query enforces org scope

```ts
const orgId = session.user.orgId;
await prisma.lead.findMany({ where: { orgId } });
```

### Suggested Endpoints
- `POST /org` create org during onboarding
- `POST /users/invite` invite member
- `GET /leads` list leads with filter/pagination
- `POST /leads` create lead
- `POST /leads/import` CSV import
- `GET /followups/upcoming` upcoming reminders
- `POST /followups` create follow-up
- `PATCH /followups/:id` complete/update
- `POST /subscription/checkout` start Razorpay/Stripe checkout
- `POST /subscription/webhook/razorpay`
- `POST /subscription/webhook/stripe`

## 6) Frontend Refactor (Navbar Dashboard)

### Route Shape

```txt
src/app/
  (dashboard)/
    layout.tsx
    page.tsx
    leads/page.tsx
    followups/page.tsx
    team/page.tsx
    billing/page.tsx
```

### Layout Pattern
- Top navbar only
- No left sidebar
- Fast page transitions and compact cards/tables

### Navbar Items
- Dashboard
- Leads
- Follow-ups
- Team
- Billing
- Profile

### UX Requirements
- Leads table with status/date filters
- Lead quick-add modal
- CSV import with validation summary
- Follow-up list with overdue highlight
- Upcoming reminders widget on dashboard

## 7) Billing Design

### Plan Strategy
- `FREE`: limited leads/users
- `PRO`: larger limits

```ts
export const PLANS = {
  FREE: { leads: 100, users: 1 },
  PRO: { leads: 5000, users: 5 },
} as const;
```

### Gateway Split
- Razorpay for INR-based organizations
- Stripe for global organizations
- Unified subscription status model in DB

## 8) Theme Refactor (Blue Primary)

### Target
- Primary color uses blue-600 equivalent (`#2563EB`)

### Implementation Options
- CSS variables in global theme tokens
- Tailwind extension with `primary`

Example token:

```css
:root {
  --primary: 37 99 235;
}
```

## 9) Migration Plan (Safe, Phased)

## Phase 0: Freeze + Backups
- Snapshot production database
- Create feature flag: `crmV2Enabled`
- Keep old routes operational during migration

## Phase 1: Introduce New Models in Parallel
- Add `Organization`, `FollowUp`, simplified `Lead` fields if needed
- Keep old models untouched
- Ship read adapters

## Phase 2: Data Mapping
- Map old `Institute`/`Tenant` to `Organization`
- Map users to `orgId`
- Map contact logs to follow-ups
- Preserve IDs in mapping table for rollback traceability

Pseudo-flow:

```ts
for (const oldLead of legacyLeads) {
  const lead = await prisma.lead.create({
    data: {
      orgId: mapInstituteToOrg(oldLead.instituteId),
      name: oldLead.name ?? "Unknown",
      phone: oldLead.primaryPhone ?? oldLead.phone,
      email: oldLead.email,
      status: mapStatus(oldLead.status),
      source: String(oldLead.source ?? "MANUAL"),
      notes: oldLead.notes,
    },
  });

  await prisma.followUp.createMany({
    data: oldLead.contactLogs.map((log) => ({
      leadId: lead.id,
      note: log.notes ?? "",
      nextDate: null,
      createdAt: log.createdAt,
    })),
  });
}
```

## Phase 3: API Switch
- Add v2 endpoints scoped to `orgId`
- Migrate frontend pages one section at a time
- Keep old API under fallback for a short deprecation window

## Phase 4: UI Switch
- Replace sidebar layout in dashboard group with navbar layout
- Move lead/follow-up flows to new pages
- Keep redirects from old URLs

## Phase 5: Cleanup
- Remove deprecated models/routes/modules
- Remove old feature flags
- Run full regression test suite

## 10) Suggested Folder Mapping in Current Repository

### Keep and evolve
- `src/features/auth`
- `src/features/lead`
- `src/features/contact-log` -> rename/reshape to `followup`
- `src/features/subscription`
- `src/lib/billing`
- `src/app/(dashboard)`

### Gradually deprecate
- `src/features/EasyFollowUp`
- `src/features/tenant` (if only marketplace logic)
- Academic-only modules tied to student/course lifecycle

## 11) Execution Order (Practical)

1. Implement new Prisma models in additive mode
2. Build org-scoped middleware/helper used by all APIs
3. Ship `/leads` + `/followups` v2 endpoints
4. Build navbar dashboard layout and move lead/follow-up UI
5. Add CSV import and upcoming reminder widgets
6. Integrate Stripe in parallel to existing Razorpay flow
7. Migrate old data and verify metrics parity
8. Remove legacy code after one release cycle

## 12) Definition of Done

- All lead and follow-up pages use org-scoped APIs
- No sidebar remains in dashboard layout
- Old complex tenant marketplace logic disabled/removed
- Billing works for both Razorpay and Stripe
- Theme uses blue primary consistently
- Migration scripts are rerunnable and idempotent
- E2E tests pass for auth, leads, follow-ups, billing

## 13) Risks and Mitigations

- Risk: data mismatch during migration
  - Mitigation: mapping table + dry-run mode + row counts verification
- Risk: API regressions during cutover
  - Mitigation: dual-write or read-fallback window
- Risk: billing state divergence across gateways
  - Mitigation: webhook idempotency keys + unified status mapper

## 14) Recommendation

Treat this as a controlled v2 rollout, not a hard rewrite:
- Add new models and routes first
- Migrate and verify data
- Switch UI progressively
- Remove legacy only after parity is confirmed
