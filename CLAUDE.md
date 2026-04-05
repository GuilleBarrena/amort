# Amort — Claude Code Context

## Project Overview
Amort is a personal finance web app for tracking amortizations (large purchases depreciated over time) and subscriptions. UI is in Spanish (es-ES).

**Stack:** Next.js 14 App Router · Supabase (PostgreSQL + Auth + RLS) · TypeScript · CSS Modules

## Architecture
- **App Router:** server components for data fetching, one main interactive client component
- **Database:** Supabase/Postgres. Migrations in `supabase/migrations/`, run via `node scripts/migrate.js`
- **Auth:** Supabase Auth + Row Level Security enforces per-user data isolation at DB level
- **UI:** `components/app/DashboardClient.tsx` handles all interactive state (list, detail, add/edit, close views)

## Data Model
All data lives in a single `entries` table with a `type` discriminator (`'amort'` | `'sub'`).

### Close / Delete lifecycle
- **Option A — genuine close:** `POST /api/entries/[id]/close` sets `closed_at`, `close_type` (`'sold'`|`'cancelled'`), and either `sale_price` (amort) or `total_expenses` (sub). Kept in DB, shown in historial.
- **Option B — error delete:** `DELETE /api/entries/[id]` sets `deleted_at` (soft delete). Never shown again.
- All queries filter `deleted_at IS NULL`. Closed entries are returned but excluded from totals.

## Key Files
| File | Purpose |
|------|---------|
| `app/api/entries/route.ts` | GET all entries (excludes deleted), POST new |
| `app/api/entries/[id]/route.ts` | PUT update, DELETE (soft) |
| `app/api/entries/[id]/close/route.ts` | POST close entry (Option A) |
| `app/dashboard/page.tsx` | Server component — fetches entries, passes to DashboardClient |
| `components/app/DashboardClient.tsx` | All interactive UI |
| `lib/types.ts` | Entry and AmortCalc TypeScript interfaces |
| `lib/calc.ts` | Amortization math (calcAmort, monthlyFromSub, diffMonths, fmt, fmtDate) |
| `supabase/migrations/` | Ordered SQL migrations |
| `scripts/migrate.js` | Idempotent migration runner (tracks applied via `_migrations` table) |

## Running Migrations
```bash
node scripts/migrate.js
```
