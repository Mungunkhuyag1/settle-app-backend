# Settle Backend

NestJS + PostgreSQL backend for tracking shared lunch expenses inside groups and settling balances later in bulk.

## Main Reference

Project requirements and design decisions are documented in:

- `docs/project-overview.md`
- `docs/auth-users-api.md`
- `docs/groups-api.md`
- `docs/expenses-balances-settlements-api.md`
- `docs/frontend-web-api.md`

Use that file as the primary source of truth for future implementation work.

## Local Development

### 1. Prepare environment

```bash
cp .env.example .env
```

Update `.env` with your Neon PostgreSQL connection values.

Recommended:

```env
DATABASE_URL=postgresql://username:password@your-neon-host.neon.tech/neondb?sslmode=require
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d
```

### 2. Start locally

```bash
npm install
npm run start:dev
```

This starts:
- `api` on `http://localhost:3002`
- PostgreSQL is expected to be provided by Neon

### 3. Optional Docker API runtime

```bash
docker compose up --build
```

This runs only the NestJS API container. Database remains Neon-hosted.

## Current API

### Health Check

```http
GET /api/v1/health
```

Example response:

```json
{
  "name": "settle-app-backend",
  "status": "ok",
  "timestamp": "2026-04-01T00:00:00.000Z"
}
```

## Current Modules

- auth
- users
- groups
- group members
- expenses
- balances
- settlements

## User-Centric APIs

- `GET /api/v1/users/me/expenses`
- `GET /api/v1/users/me/settlements`
- `GET /api/v1/users/me/balances`

## Test Commands

```bash
npm run test
npm run test:e2e
```
