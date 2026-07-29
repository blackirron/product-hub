# PM Network

**"GitHub for Product Managers"** — a place for PMs to share case-study decks, follow each other's work, and find courses and events, backed by a proper typed API instead of a spreadsheet-and-Notion stack.

🔗 **Live demo:** https://product-hub-app.onrender.com/

## What it does

- **Decks** — upload and browse PM case studies / presentations, star the ones you like, and surface what's trending
- **Network** — follow other PMs, build a public profile
- **Courses & Events** — a directory of PM learning resources and case competitions
- **Stats** — live platform counters (users, decks, stars, courses, upcoming events)

## Architecture

A pnpm monorepo split into typed, independently-buildable packages rather than one tangled app:

```
lib/
├── db/           Postgres schema (Drizzle ORM) — source of truth for the data model
├── api-spec/      OpenAPI 3.1 spec — source of truth for the API contract
├── api-zod/       Zod schemas generated from the OpenAPI spec
└── api-client-react/  React Query hooks generated from the same spec

artifacts/
├── api-server/    Express 5 API (routes: users, decks, courses, events, stats, health)
└── pm-network/    React + Vite frontend (Home, Explore, Network, Courses, Events, Profile, UploadDeck)
```

The OpenAPI spec is the single source of truth: request/response shapes are generated *once* into both the Zod validators the server uses and the React Query hooks the frontend uses, via Orval. Change the spec, run codegen, both sides update — no manually-kept-in-sync DTOs.

## Stack

- **Runtime:** Node.js 24, TypeScript 5.9, pnpm workspaces
- **API:** Express 5
- **DB:** PostgreSQL + Drizzle ORM
- **Validation:** Zod (`zod/v4`, `drizzle-zod`)
- **Codegen:** Orval (OpenAPI → Zod schemas + React Query hooks)
- **Build:** esbuild

## Running locally

```bash
# install
pnpm install

# set DATABASE_URL (Postgres connection string) in the environment

# push the DB schema (dev only)
pnpm --filter @workspace/db run push

# run the API (port 5000)
pnpm --filter @workspace/api-server run dev
```

Other useful scripts:
```bash
pnpm run typecheck                              # full workspace typecheck
pnpm run build                                   # typecheck + build all packages
pnpm --filter @workspace/api-spec run codegen    # regenerate hooks/schemas from openapi.yaml
```

## API

Full contract lives in `lib/api-spec/openapi.yaml`. At a glance:

| Resource | Endpoints |
|---|---|
| `/users` | list, profile, follow/unfollow |
| `/decks` | list, trending, create, update, delete, star |
| `/courses` | list |
| `/events` | list, upcoming |
| `/stats` | platform-wide counters |
| `/healthz` | health check |
