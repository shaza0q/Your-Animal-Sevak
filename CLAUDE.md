# Your Animal Sevak — Project Guide (CLAUDE.md)

> Multi-farm livestock / animal management platform. This file documents what the
> project does **today**, its architecture, known weak spots, and the ongoing
> revamp toward a fully typed, Postgres-backed stack.

---

## 1. What this project is

A full-stack web app for managing animals across multiple farms. The core jobs:

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
├── docker-compose.yml           # PostgreSQL (port 5432) + pgAdmin (opt-in, --profile tools)
├── server/                      # Node.js + Express backend — 100% TypeScript + Prisma
│   ├── index.ts                 # App entry — mounts all routes (no Mongoose, no MongoDB)
│   ├── tsconfig.json            # TypeScript config
│   ├── prisma.config.ts         # Prisma config (reads DATABASE_URL from .env)
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton — always import from here
│   │   └── pagination.ts        # parsePage, paginationMeta, paginated helpers
│   ├── prisma/
│   │   └── schema.prisma        # Canonical data model — single source of truth
│   ├── generated/prisma/        # Auto-generated Prisma client (run: npm run prisma:generate)
│   ├── scripts/
│   │   └── migrate-mongo-to-postgres.js  # One-time Mongo → Postgres migration script
│   ├── controllers/             # Route handlers — all TypeScript + Prisma
│   ├── routes/                  # Express routers — all TypeScript
│   ├── services/                # Business logic — all TypeScript + Prisma
│   ├── middlewares/             # All TypeScript (auth, farmAuth, animalFarmAuth, role, upload, CORS)
│   ├── common/
│   │   ├── enums/               # index.ts re-exports all Prisma enums (single source of truth)
│   │   ├── exceptions/          # deathCase.exceptions.ts
│   │   └── workflow/            # death-case.workflow.ts — typed state machine using Prisma enums
│   ├── types/
│   │   └── express.d.ts         # Express Request augmentation (req.user, req.farmRole)
│   ├── utils/
│   │   └── logger.ts            # Winston logger (default export)
│   └── seed/                    # Seed scripts
│
├── animal-haven-auth/           # Vite + React 18 + TypeScript frontend
│   └── src/
│       ├── pages/               # Route screens (Dashboard, AddAnimal, DeathCases, ...)
│       ├── components/          # Feature components + shadcn/ui in components/ui
│       │   ├── EmptyState.tsx   # Reusable empty state component (icon, title, description, action)
│       │   ├── ErrorMessage.tsx # Inline error card with optional retry button
│       │   ├── ErrorBoundary.tsx# React class error boundary — wraps entire app in App.tsx
│       │   ├── LineageSection.tsx # Animal lineage tree (parents + offspring + generation)
│       │   └── history/         # AnimalHistoryPage (TanStack Query), RecentHistory, HistoryItem
│       ├── api/                 # Per-endpoint axios wrappers — all .ts, all use @/lib/api instance
│       ├── lib/
│       │   ├── api.ts           # Axios instance (withCredentials, 401→redirect interceptor)
│       │   └── errorUtils.ts    # parseApiError, getErrorMessage — maps AxiosError by status
│       ├── hooks/               # TanStack Query hooks (useAnimalDetail, useAnimalHistory, etc.)
│       ├── utils/ enums/ interfaces/ types/ data/
│       └── App.tsx              # React Router route table
│
├── breedAnimal.json / diseaseAnimal.json / vaccineAnimal.json   # reference data
```

---

## 3. Current tech stack

**Backend** (`server/`)

- Runtime: Node.js, **Express 5**
- DB: **PostgreSQL** via **Prisma 7** — Mongoose fully removed
- Auth: `jsonwebtoken` + `bcryptjs`, `cookie-parser`
- Uploads: `multer` + `cloudinary`
- Logging: **winston** only
- Lang: **TypeScript** throughout — zero `.js` source files, zero Mongoose, zero MongoDB dependency

**Frontend** (`animal-haven-auth/`)
- **React 18 + TypeScript + Vite** (SWC)
- UI: **shadcn/ui** (Radix primitives) + **Tailwind CSS** + `framer-motion`, `lucide-react`
- Data: **TanStack Query v5** + **Axios** — all server state goes through TanStack Query
- Forms: `react-hook-form` + `zod`
- Routing: `react-router-dom` v6
- Charts: `recharts`

**Conventions to follow when editing**

- **Backend is TypeScript** — ES `import`/`export` syntax; 2-space indent.
- **Prisma client** — always import the singleton: `import prisma from '../lib/prisma'`.
  Never instantiate `new PrismaClient()` outside `lib/prisma.ts`.
- **Enums** — import from `'../common/enums'` (re-exports Prisma-generated types + values).
  Do not import directly from `'../generated/prisma'` in business code.
- **Death-case logic** must go through `common/workflow/death-case.workflow.ts` —
  it is the single source of truth for valid transitions and role permissions.
  The `/deathCases` route is mounted in `index.ts`.
- **Frontend API calls** — always use the `api` axios instance from `src/lib/api.ts`.
  Never use raw `axios` or `fetch` directly. Never import `API_BASE_URL` from `cache.js`.
- **Frontend server state** — use TanStack Query (`useQuery`/`useMutation`). Do not
  manage server data in `useState` + `useEffect` for new code.
- **Empty / error states** — use `EmptyState` and `ErrorMessage` components; follow the
  `loading → error → empty → content` render order on every page.
- **Soft-delete** — every `prisma.animal.find*` query **must** include `isDeleted: false`
  in the `where` clause. Use `findFirst({ where: { id, isDeleted: false } })` instead of
  `findUnique` when you need to add this filter.
- Frontend uses path alias `@/` → `src/`.

### Local run
```bash
# Start PostgreSQL (required)
docker compose up -d

# Backend — ts-node, port 8000
cd server && npm install && npm run dev

# Frontend — Vite, port 8080
cd animal-haven-auth && npm install && npm run dev

# Apply Prisma schema to Postgres (first time or after schema changes)
cd server && npm run prisma:migrate

# One-time data migration from MongoDB to PostgreSQL
cd server && npm run migrate:mongo   # add CLEAR_POSTGRES=true to re-run
```

---

## 4. Domain model

Defined in `server/prisma/schema.prisma` — the authoritative source. Summary:

- **User** — fullName, email, mobile, password, role (UserRole enum), isActive.
  Single consolidated model (replaces the old `user.js` + `newUsers.js` split).
- **Farm** — ownerId→User, createdById→User, name, animalTypes[], location, capacity, status.
- **FarmUser** — join table Farm↔User with role + isActive; unique `(farmId, userId)`.
- **Animal** — tagNumber, farmId, animalType, breed, gender, motherId/fatherId (self-refs → lineage),
  generation, weight, DOB, acquisitionDate, status (Active/Sold/Deceased), soft-delete `isDeleted`.
  Unique `(farmId, tagNumber)`. Prisma relation names: `offspringViaMother` / `offspringViaFather`.
- **AnimalUpdate** — per-animal event log (updateType + status + riskLevel,
  plus vaccine/disease/breeding/sale fields).
- **AnimalAssignment** — tracks which worker (caretaker/vet) is responsible for an animal.
- **Sale** — buyer info + price + dateSold linked to Animal + Farm.
- **BreedMaster / DiseaseMaster / VaccineMaster** — reference data tables.
- **Death-case cluster** — `DeceasedAnimalRecord` (root) + four 1-1 child tables:
  `DeathEvent`, `PostDeathHandling`, `LegalFinancial`, `MedicalContext`, `AuditMetadata`.
  Driven by the `WorkflowStatus` enum state machine.

---

## 5. Known issues & areas to improve

### 🔴 Security (address before any real deployment)
- **Secrets are committed** in `server/.env` (Cloudinary key/secret, JWT secret).
  Rotate these, remove from git history, move to a secret manager.
- ~~No `helmet`~~ ✅ `helmet()` added to `index.ts`.
- No rate limiting on any route — add `express-rate-limit` before production.
- JWT cookie needs `secure: true` in production (currently env-gated — verify `NODE_ENV=production` is set).
- No password-reset backend — `ForgotPassword` page exists but the endpoint does not.

### 🟠 Architecture — resolved
- ✅ Two parallel user models → consolidated into one `User` model.
- ✅ DB URL hardcoded → reads from `DATABASE_URL` env var; fails fast if missing.
- ✅ Hand-rolled file logger → removed; winston only.
- ✅ All routes, services, controllers, middlewares → TypeScript + Prisma. Zero Mongoose.
- ✅ Multi-step death-case mutations wrapped in `prisma.$transaction(...)`.
- ✅ Soft-delete (`isDeleted`) now consistently filtered in all Animal queries across
  services and the `animalFarmAuth` middleware. Convention: always use `findFirst` with
  `isDeleted: false` — never `findUnique` for Animal lookups outside the primary key.

### 🟡 Code quality / maintainability
- ✅ Codebase is 100% TypeScript — zero `.js` source files remain (frontend + backend).
- ✅ Dead frontend pages deleted: `AnimalByCategoryD.tsx`, `NewDeathCase1.tsx`, `FarmAnimals.tsx`.
- ✅ `AnimalHistoryPage` migrated to TanStack Query — window-based cache (`__historyCache`) fully removed.
- ✅ Comprehensive error handling layer: `errorUtils.ts`, `ErrorMessage`, `ErrorBoundary`,
  `api.ts` interceptor (401 → redirect, re-throws `AxiosError`), `onError` on all mutations.
- ✅ `EmptyState` component applied across all pages/sections; `loading → error → empty → content` order enforced.
- No automated tests anywhere; no CI.
- No API contract (OpenAPI / shared types) — FE wrappers hand-encode each route.
- ~~No pagination contract~~ ✅ Standard `{ data, pagination }` envelope on all list endpoints.
- `AnimalDetail1.tsx` is a legacy duplicate of `AnimalDetail.tsx` — should be deleted once confirmed unused.

### 🟢 Product gaps
- Dashboard/insights are per-farm; cross-farm analytics and exports aren't built out.
- Auth has no refresh-token rotation or password-reset backend wired to the `ForgotPassword` page.
- Death-case pages are wired to the live backend but have not been end-to-end tested.

---

## 6. Revamp — progress & remaining work

### Completed steps

1. ✅ **Stop the bleeding** — secrets removed from tracking, `DATABASE_URL` read from env,
   `log.txt` removed, `.gitignore` hardened.
2. ✅ **Consolidate user models** — single `User` in Prisma schema.
3. ✅ **Postgres + Prisma** — `schema.prisma` complete and validated, Prisma client
   generated, Docker Compose for local Postgres, `migrate-mongo-to-postgres.js` script.
4. ✅ **Port backend to TypeScript + Prisma** — complete:
   - ✅ Auth, Farm, Master, Animal, Assignments, Asset, Stat verticals
   - ✅ Death-case workflow state machine, service, controller, route — all Prisma + `$transaction`
   - ✅ All middlewares
   - ✅ `index.ts` — no Mongoose, no MongoDB, mounts all 9 route families
   - ✅ `models/` directory deleted; zero Mongoose schemas remain
5. ✅ **Pagination + API hygiene** — standard envelope, `lib/pagination.ts`, `helmet()`, Zod.
6. ✅ **Frontend UX layer** — complete:
   - ✅ `EmptyState`, `ErrorMessage`, `ErrorBoundary` components
   - ✅ `errorUtils.ts` — `parseApiError` maps AxiosError by status; field errors → `setError()`
   - ✅ `api.ts` interceptor — 401 redirect, re-throws `AxiosError` (not plain Error)
   - ✅ `onError` on all mutations; `isError` branches on all list pages
   - ✅ `LineageSection` — rich lineage tree with parent cards, offspring grid, generation badge
   - ✅ `AnimalHistoryPage` migrated to TanStack Query; `__historyCache` window cache deleted
   - ✅ `FarmInsights` stripped of all hardcoded mock data; shows real farm data only
   - ✅ `Directory` wired to real farm + staff data via `FarmStaffSection`; `FarmAnimals.tsx` deleted
   - ✅ New user journey fixed: farm card route bug, empty-state guidance, AddAnimal dead-end,
     `addAsset.js` → `addAsset.ts` using the `api` instance
   - ✅ Soft-delete consistently enforced in all Animal queries (services + auth middleware)

### Step 7 — Tests + CI (next)
- Add Vitest for unit tests (services, workflow logic, pagination helpers)
- Add Supertest for integration tests (route-level with a test DB)
- GitHub Actions CI: install → `tsc --noEmit` → test
- Priority: death-case workflow happy path + role-permission rejections

### Post-demo work (deferred)
- Password reset backend (`ForgotPassword` page exists, endpoint does not)
- `express-rate-limit` on auth routes
- JWT refresh token rotation
- Cross-farm analytics / exports on dashboard
- `AnimalDetail1.tsx` cleanup (rename or delete)

---

## 7. Quick reference — key files

| Concern | File |
|---|---|
| Server entry / routes mounted | `server/index.ts` |
| Prisma schema (data model) | `server/prisma/schema.prisma` |
| Prisma client singleton | `server/lib/prisma.ts` |
| Pagination helpers + types | `server/lib/pagination.ts` |
| Express type augmentation | `server/types/express.d.ts` |
| Shared enums (re-exports Prisma) | `server/common/enums/index.ts` |
| Auth controller | `server/controllers/authenticate.ts` |
| Animal service | `server/services/animal.service.ts` |
| Animal overview + dashboard stats | `server/services/animalOverview.service.ts` |
| Animal assignment service | `server/services/animalAssignment.service.ts` |
| Farm controller | `server/controllers/farmController.ts` |
| Farm user service | `server/services/farmUser.service.ts` |
| Death-case state machine (source of truth) | `server/common/workflow/death-case.workflow.ts` |
| Death-case business logic | `server/services/deathCase.service.ts` |
| Frontend route table | `animal-haven-auth/src/App.tsx` |
| Frontend axios client + interceptor | `animal-haven-auth/src/lib/api.ts` |
| Error parsing utility | `animal-haven-auth/src/lib/errorUtils.ts` |
| Reusable empty state | `animal-haven-auth/src/components/EmptyState.tsx` |
| Reusable inline error | `animal-haven-auth/src/components/ErrorMessage.tsx` |
| App-level error boundary | `animal-haven-auth/src/components/ErrorBoundary.tsx` |
| Animal lineage tree | `animal-haven-auth/src/components/LineageSection.tsx` |
| Full history page | `animal-haven-auth/src/components/history/AnimalHistoryPage.tsx` |
| TanStack Query history hook | `animal-haven-auth/src/hooks/useAnimalHistory.ts` |
