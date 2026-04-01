# Settle Backend Project Document

## 1. Purpose

This document is the primary reference for the project.
Future design and implementation decisions should follow this document unless a later decision explicitly replaces it.

Project goal:
Build a RESTful backend service that tracks shared meal expenses inside groups, calculates each member's net balance, and supports settlement in bulk after some period instead of requiring daily bank transfers.

Tech baseline:
- Backend: NestJS
- Database: PostgreSQL
- Runtime: Node.js
- Local environment: Docker + Docker Compose

## 2. Problem Summary

Employees often pay a full lunch bill for the group and request repayment later.
The system must:
- record who paid
- record who participated
- record each participant's own consumed amount
- calculate net balances per group
- support later settlement
- reset balances after settlement is recorded

Important constraints:
- a group may have 2, 3, or more members
- only the participants of a specific meal are included in that expense
- one user can belong to many groups
- balances are isolated per group

## 3. Scope

Included in v1:
- user registration
- group creation
- group membership management
- expense creation inside a group
- per-group balance query
- settlement recording
- balance reset by settlement effect
- API documentation for resources and payloads

Out of scope for v1:
- bank integration
- push notification
- file receipt upload
- approval workflow for expenses
- audit-grade accounting
- multi-currency support

## 4. Core Concepts

### 4.1 User
A person who can join one or more groups and create expenses in groups where they are a member.

### 4.2 Group
A private space where a set of users track shared expenses together.
Balances are always calculated within the boundary of a single group.

### 4.3 Expense
A single meal or shared payment event.
One member is the payer.
Each participant has their own consumed amount.

### 4.4 Settlement
A record that members settled all or part of the outstanding balances.
Settlement changes balances just like a financial event.

## 5. Main Business Rules

### 5.1 User registration
Initial approach:
- any employee can register as a user
- local JWT authentication is used for v1
- basic registration can use `email`, `password`, `firstName`, and `lastName`

Future-ready note:
- this can later be replaced by company SSO without changing the expense domain model

### 5.2 Who can create an expense
Rule for v1:
- any registered user can create an expense only in groups where they are a member

Rationale:
- lunch expense entry should be low-friction
- restricting to only admins adds operational overhead with little value for this use case

Additional constraints:
- the payer must be a member of the group
- every participant must be a member of the group
- the payer may also be one of the participants
- participant amounts must be positive
- expense total must equal the sum of participant shares

### 5.3 Group visibility and membership rules
- a user can only see groups where they are a member
- the user who creates a group becomes the `owner`
- only the `owner` can add or remove members
- any registered user may be added into any group by that group's `owner`

### 5.4 Balance meaning
For a given group:
- positive balance: the user should receive money
- negative balance: the user owes money

### 5.5 Settlement behavior
When settlement is recorded:
- corresponding balances decrease accordingly
- if the full outstanding amount is settled, all affected members reach zero

## 6. Proposed Domain Model

### 6.1 Tables

#### `users`
- `id` uuid pk
- `email` varchar unique
- `password_hash` varchar
- `first_name` varchar nullable
- `last_name` varchar nullable
- `image_url` text nullable
- `last_seen_at` timestamptz nullable
- `created_at` timestamptz
- `updated_at` timestamptz

#### `groups`
- `id` uuid pk
- `name` varchar
- `description` text nullable
- `created_by` uuid fk -> users.id
- `created_at` timestamptz
- `updated_at` timestamptz

#### `group_members`
- `id` uuid pk
- `group_id` uuid fk -> groups.id
- `user_id` uuid fk -> users.id
- `role` varchar
- `joined_at` timestamptz
- unique `(group_id, user_id)`

Suggested roles:
- `owner`
- `member`

#### `expenses`
- `id` uuid pk
- `group_id` uuid fk -> groups.id
- `title` varchar
- `description` text nullable
- `paid_by_user_id` uuid fk -> users.id
- `total_amount` numeric(12,2)
- `currency` varchar default `MNT`
- `expense_date` date
- `created_by` uuid fk -> users.id
- `created_at` timestamptz
- `updated_at` timestamptz

#### `expense_participants`
- `id` uuid pk
- `expense_id` uuid fk -> expenses.id
- `user_id` uuid fk -> users.id
- `share_amount` numeric(12,2)
- unique `(expense_id, user_id)`

#### `settlements`
- `id` uuid pk
- `group_id` uuid fk -> groups.id
- `from_user_id` uuid fk -> users.id
- `to_user_id` uuid fk -> users.id
- `amount` numeric(12,2)
- `currency` varchar default `MNT`
- `settled_at` timestamptz
- `note` text nullable
- `created_by` uuid fk -> users.id
- `created_at` timestamptz

## 7. Balance Calculation Logic

For each expense:
- payer receives `total_amount`
- each participant owes their `share_amount`

Net effect per user for one expense:
- if user is payer: `+total_amount`
- if user is participant: `-share_amount`
- if user is both payer and participant: both rules apply

Settlement effect:
- `from_user` balance increases by `amount`
- `to_user` balance decreases by `amount`

Equivalent interpretation:
- debtor pays creditor, so debtor owes less and creditor should receive less

Formula:
- `net_balance = expense_credits - expense_debts - settlement_outgoing + settlement_incoming`

Preferred implementation strategy:
- compute balances from ledger-style records
- avoid storing mutable balance as the source of truth

## 8. Example

Group: Lunch Team

Expense:
- payer: Bataa
- participants:
  - Bataa: 12000
  - Ganaa: 15000
  - Bayaraa: 9000
- total: 36000

Result after this expense:
- Bataa: `+24000`
- Ganaa: `-15000`
- Bayaraa: `-9000`

Reason:
- Bataa paid 36000 total, but his own share is 12000
- therefore others owe him 24000 in net

## 9. REST API Direction

Primary resources:
- `/api/v1/users`
- `/api/v1/groups`
- `/api/v1/groups/:groupId/members`
- `/api/v1/groups/:groupId/expenses`
- `/api/v1/groups/:groupId/balances`
- `/api/v1/groups/:groupId/settlements`

Detailed endpoint contract documentation should be created next using:
- HTTP method
- URL
- path params
- query params
- request JSON
- response JSON
- example payloads
- validation rules
- error response examples

## 10. Suggested NestJS Module Structure

```text
src/
  main.ts
  app.module.ts
  common/
    filters/
    interceptors/
    pipes/
  modules/
    health/
    users/
      dto/
      entities/
      users.controller.ts
      users.service.ts
      users.module.ts
    groups/
      dto/
      entities/
      groups.controller.ts
      groups.service.ts
      groups.module.ts
    group-members/
    expenses/
      dto/
      entities/
      expenses.controller.ts
      expenses.service.ts
      expenses.module.ts
    balances/
      balances.controller.ts
      balances.service.ts
      balances.module.ts
    settlements/
      dto/
      entities/
      settlements.controller.ts
      settlements.service.ts
      settlements.module.ts
  database/
    migrations/
    seeds/
```

## 11. Local Development Strategy

Local environment should run with Docker Compose:
- `api` service for NestJS
- `db` service for PostgreSQL

Required environment variables:
- `PORT`
- `NODE_ENV`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

## 12. Initial Technical Decisions

- Use UUID primary keys for public-facing resources
- Use PostgreSQL `numeric(12,2)` for money
- Keep all balances scoped by `group_id`
- Use ledger-style aggregation instead of storing mutable summary balance
- Keep v1 auth simple
- Allow any group member to register an expense in that group

## 13. Open Decisions For Later

- JWT auth or session auth
- soft delete policy
- audit log granularity
- pagination standard
- optimistic locking for edits
- expense edit and delete policy after settlement exists
