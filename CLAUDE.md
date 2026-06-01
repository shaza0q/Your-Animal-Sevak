# Your Animal Sevak — Project Guide (CLAUDE.md)

> Multi-farm livestock / animal management platform. This file documents what the
> project does **today**, its architecture, known weak spots, and a recommended
> direction for a revamp built to scale to lakhs (10⁵–10⁶) of animal records.

---

## 1. What this project is

A full-stack web app for managing animals across multiple farms. The core jobs it
does right now:

- **Farm management** — create farms, assign users to farms with roles.
- **Animal records** — register animals (tag number, type, breed, gender, lineage
  via `motherId`/`fatherId`, weight, DOB, status), browse by farm and by category,
  view detail + history.
- **Animal updates / history** — time-stamped events per animal: Health, Weight,
  Vaccination, Breeding, Sale (with buyer info), each carrying status and risk level.
- **Death-case compliance workflow** — a formal, auditable state machine for
  reporting and processing animal deaths (vet confirmation, disposal, review,
  approval, archival), with role-based permissions per state and correction trails.
- **Reference data** — master lists for breeds, diseases, vaccines (also shipped as
  `breedAnimal.json`, `diseaseAnimal.json`, `vaccineAnimal.json` at repo root).
- **Auth** — signup/signin, JWT in cookies, bcrypt password hashing.
- **Media** — image upload via Cloudinary (e.g. animal/update photos).

---

## 2. Repository layout

```
Your-Animal-Sevak/
├── server/                  # Node.js + Express + Mongoose (MongoDB) backend
│   ├── index.js             # App entry, route mounting, DB connect
│   ├── connection.js        # mongoose.connect wrapper
│   ├── models/              # Mongoose schemas (animal, farm, user/newUser, etc.)
│   ├── controllers/         # Route handlers
│   ├── routes/              # Express routers (auth, animal, farms, deathCases, ...)
│   ├── services/            # Business logic (animal, deathCase, animalOverview, ...)
│   ├── middlewares/         # auth, farmAuth, role, upload, request logging, CORS
│   ├── common/
│   │   ├── enums/           # causeOfDeath, burialMethod, userRoles, workflow status
│   │   ├── exceptions/      # Typed domain exceptions
│   │   └── workflow/        # death-case.workflow.js (canonical state machine)
│   ├── types/{schemas,dtos} # (partial) TS-ish typing
│   ├── seed/                # Seed scripts
│   └── .env                 # ⚠️ committed secrets — see §5
│
├── animal-haven-auth/       # Vite + React 18 + TypeScript frontend
│   └── src/
│       ├── pages/           # Route screens (Dashboard, AddAnimal, DeathCases, ...)
│       ├── components/      # Feature components + shadcn/ui in components/ui
│       ├── api/             # Per-endpoint fetch/axios wrappers (mixed .js/.ts)
│       ├── lib/api.ts       # Axios instance (withCredentials, interceptors)
│       ├── hooks/ utils/ enums/ interfaces/ types/ data/
│       └── App.tsx          # React Router route table
│
├── breedAnimal.json / diseaseAnimal.json / vaccineAnimal.json   # reference data
```

---

## 3. Current tech stack

**Backend** (`server/`)
- Runtime: Node.js, **Express 5**
- DB: **MongoDB** via **Mongoose 8**
- Auth: `jsonwebtoken` + `bcrypt`/`bcryptjs`, `cookie-parser`
- Uploads: `multer` + `cloudinary`
- Logging: `winston` + a hand-rolled file logger; `chalk`
- Lang: **JavaScript (CommonJS)** — TS is listed in devDeps but not actually used

**Frontend** (`animal-haven-auth/`)
- **React 18 + TypeScript + Vite** (SWC)
- UI: **shadcn/ui** (Radix primitives) + **Tailwind CSS** + `framer-motion`, `lucide-react`
- Data: **TanStack Query v5** + **Axios**
- Forms: `react-hook-form` + `zod`
- Routing: `react-router-dom` v6
- Charts: `recharts`

**Conventions to follow when editing**
- Backend is CommonJS (`require`/`module.exports`); 2-space indent.
- Death-case logic must go through `common/workflow/death-case.workflow.js` —
  it is the single source of truth for valid transitions and role permissions.
- Frontend uses path alias `@/` → `src/`; new API calls use the `api` axios
  instance in `src/lib/api.ts`; server state goes through TanStack Query.

### Local run
```bash
# Backend (expects local MongoDB on 127.0.0.1:27017)
cd server && npm install && npm run dev      # nodemon, port 8000

# Frontend
cd animal-haven-auth && npm install && npm run dev   # Vite, port 8080
```

---

## 4. Domain model (as it exists)

- **Animal** — tagNumber, name, farmId, animalType (enum), breed, gender,
  motherId/fatherId (self-refs → lineage), generation, weight, DOB,
  acquisitionDate, status (Active/Sold/Deceased), soft-delete `isDeleted`.
  Indexed on tagNumber, farmId, status, DOB; unique `(farmId, tagNumber)`.
- **Farm** — owner, createdBy, name, animalTypes[], location, capacity, status.
- **AnimalUpdate** — the per-animal event log (updateType + status + riskLevel,
  plus vaccine/disease/breeding/sale fields). Well-indexed for per-animal and
  dashboard queries.
- **FarmUser** — join table farm↔user with role + isActive; unique `(farmId, userId)`.
- **Death-case schemas** — `deceasedAnimalRecord`, `deathEvent`, `deathRecord`,
  `deceasedAnimalSnapshot`, `postDeathHandling`, `legalFinancial`,
  `medicalRecordContext`, `correctionEntry`, `auditMetadata` — a rich,
  audit-oriented cluster driven by the workflow state machine.

---

## 5. Known issues & areas to improve

### 🔴 Security (address before any real deployment)
- **Secrets are committed** in `server/.env` (Cloudinary key/secret, JWT secret
  `'tokenfoken'`). Rotate these now, remove from git history, move to a secret
  manager, and `.gitignore` the file.
- **DB URL is hardcoded** in `server/index.js` (`mongodb://127.0.0.1:27017/...`),
  ignoring `MONGO_URL` in `.env`. Use the env var; fail fast if missing.
- No rate limiting, no `helmet`, no input validation layer on most routes.
- JWT secret is trivial; tokens in cookies need `httpOnly`/`secure`/`sameSite`
  audited.

### 🟠 Architecture & data integrity
- **Two parallel user models** (`user.js` → `User` and `newUsers.js` → `newUser`)
  with diverging role enums. Consolidate to one canonical user model.
- **No multi-document transactions.** The death-case workflow mutates several
  collections (record, event, animal status, updates). Without transactions a
  failure mid-flow leaves inconsistent state. (Mongo supports transactions only
  on replica sets.)
- Referential integrity (motherId/fatherId/farmId/userId) is enforced only in
  app code — Mongo won't stop orphaned refs.
- Soft-delete (`isDeleted`) is ad hoc and not consistently filtered everywhere.

### 🟡 Code quality / maintainability
- **Mixed JS/TS** on both sides (backend all JS despite TS deps; frontend `api/`
  mixes `.js` and `.ts`). No end-to-end type safety between FE and BE.
- **Duplicate/legacy screens**: `AnimalDetail.tsx` vs `AnimalDetail1.tsx`,
  `NewDeathCase.tsx` vs `NewDeathCase1.tsx`, `AnimalUpdate` vs `AnimalUpdateForm`.
  App.tsx imports `AnimalDetail1` as `AnimalDetail` — dead files should be deleted.
- Hand-rolled request logger writes to `log.txt` (a 380 KB+ file is committed) in
  parallel with winston. Pick one; don't commit logs.
- No automated tests anywhere; no CI.
- No API contract (OpenAPI / shared types) — FE wrappers hand-encode each route.
- No pagination contract visible on list endpoints — a hard blocker at scale.

### 🟢 Product gaps (from the routes/pages)
- Dashboard/insights exist but reporting is per-farm; cross-farm analytics and
  exports aren't built out.
- Auth has no refresh-token rotation or password-reset backend wired to the
  `ForgotPassword` page.

---

## 6. Revamp recommendation (scale target: lakhs of animals)

> Bottom line: at "thousands to lakhs" (10⁵–10⁶ rows) **the row count itself is
> trivial for any modern database** — both Postgres and MongoDB handle it on a
> laptop. The deciding factor is the **shape of the data and the consistency
> guarantees you need**, and this domain is strongly relational and audit-heavy.

### Recommended database + ORM: **PostgreSQL + Prisma**

**Why Postgres over the current MongoDB:**
- The data is highly relational: farms → animals → updates → death cases, plus
  self-referential lineage (mother/father), join tables (FarmUser), and a death
  workflow spanning many linked records. Today this is already simulated with
  `ObjectId` refs + `populate` — that's a relational model wearing a document
  costume.
- The death-case workflow needs **ACID multi-row transactions** and audit trails.
  Postgres gives this natively; Mongo requires a replica set and is fussier.
- **Foreign keys + constraints** prevent orphaned/invalid data the app currently
  must police by hand.
- Rich querying/reporting (cross-farm stats, lineage trees with recursive CTEs,
  vaccine/disease trends) is Postgres's strength.
- Scales comfortably to millions of rows with proper indexes + partitioning;
  add read replicas / connection pooling (PgBouncer) when needed.

**Why Prisma as the ORM:**
- First-class **TypeScript types generated from the schema** → real end-to-end
  type safety with the existing TS frontend (share generated types or a tRPC layer).
- Clean migrations (`prisma migrate`) — versioned, reviewable schema history.
- Great DX, relations, transactions (`$transaction`), and a single source of truth
  (`schema.prisma`).
- **Alternative if you want lighter/faster & SQL-first:** **Drizzle ORM** — thinner,
  closer to raw SQL, excellent TS inference, no engine binary. Pick Drizzle if the
  team is comfortable writing SQL; pick Prisma for the smoother all-in-one DX.

**If you prefer to stay on MongoDB** (valid if you want to avoid a data migration):
keep Mongoose but (a) run a **replica set** so transactions work, (b) wrap every
multi-collection workflow step in a transaction, (c) add schema validation at the
DB level, and (d) be disciplined about indexes + pagination. This is the lower-risk
path; Postgres is the more future-proof one.

### Recommended overall stack for the revamp
- **Backend:** migrate `server/` to **TypeScript**. Keep Express, or step up to
  **NestJS** (structure, DI, validation, guards map cleanly onto the existing
  controller/service/role-middleware split and the workflow state machine).
- **Validation:** **Zod** end-to-end (already used on the frontend) — share schemas,
  or generate DTOs.
- **API contract:** adopt **tRPC** (if monorepo, fully typed) or **OpenAPI** for a
  documented, versioned, paginated API. Mandate cursor-based pagination on all lists.
- **Frontend:** keep it — React + Vite + TS + shadcn/ui + TanStack Query is a solid,
  modern choice. No change needed beyond consuming the typed API and deleting the
  duplicate screens.
- **Infra/quality:** add `helmet`, rate limiting, request validation, structured
  logging (one logger), `.env` via a secret manager, a test suite (Vitest +
  Supertest), and CI. Consider a **monorepo** (pnpm/turborepo) so FE and BE share
  types.

### Suggested migration order
1. **Stop the bleeding:** rotate & remove committed secrets; read `MONGO_URL` from
   env; stop committing `log.txt`.
2. Consolidate the two user models into one.
3. Decide DB direction (Postgres+Prisma recommended). Model `schema.prisma` from the
   existing Mongoose schemas; write a one-off migration script from Mongo → Postgres.
4. Port backend to TypeScript service-by-service (start with animal + auth, then the
   death-case workflow — port the state machine first since it's already centralized).
5. Add pagination + the typed API contract; point the frontend at it and delete
   legacy duplicate pages.
6. Add tests + CI.

---

## 7. Quick reference — key files

| Concern | File |
|---|---|
| Server entry / routes mounted | `server/index.js` |
| DB connection | `server/connection.js` |
| Death-case state machine (source of truth) | `server/common/workflow/death-case.workflow.js` |
| Death-case business logic | `server/services/deathCase.service.js` |
| Core animal schema | `server/models/animal.js` |
| Per-animal event log | `server/models/animalUpdate.js` |
| Frontend route table | `animal-haven-auth/src/App.tsx` |
| Frontend axios client | `animal-haven-auth/src/lib/api.ts` |
```
