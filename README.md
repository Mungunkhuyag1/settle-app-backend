# Settle Backend

NestJS + PostgreSQL backend for tracking shared lunch expenses inside groups and settling balances later in bulk.

## Main Reference

Project requirements and design decisions are documented in:

- `docs/project-overview.md`

Use that file as the primary source of truth for future implementation work.

## Local Development

### 1. Prepare environment

```bash
cp .env.example .env
```

### 2. Start with Docker Compose

```bash
docker compose up --build
```

This starts:
- `api` on `http://localhost:3000`
- `db` on `localhost:5432`

### 3. Stop services

```bash
docker compose down
```

To remove the PostgreSQL volume too:

```bash
docker compose down -v
```

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

## Next Implementation Targets

- users module
- groups module
- group members module
- expenses module
- balances module
- settlements module

## Test Commands

```bash
npm run test
npm run test:e2e
```
