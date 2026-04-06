# Amort

> Know what everything you own *actually* costs you per month.

Amort is a minimalist open-source personal finance tool that does three things:

- **Amortization tracker** — set a monthly target for big purchases (laptop, camera, bike) and watch them pay themselves off over time. Know their real sale price today.
- **Subscription manager** — see every recurring charge in one place and your true monthly total across all of them.
- **Open Banking sync** — connect your bank via PSD2/Open Banking (GoCardless), auto-import transactions, and categorise them manually.

---

## Stack

- [Next.js 14](https://nextjs.org/) — App Router, server components
- [Supabase](https://supabase.com/) — Postgres, Auth, Row Level Security
- [Vercel](https://vercel.com/) — deployment with automatic migrations on build

---

## Running locally

```bash
git clone https://github.com/GuilleBarrena/Amort.git
cd Amort
npm install
```

Copy the env example and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Open Banking (GoCardless) — optional, only needed for bank sync
GOCARDLESS_SECRET_ID=your-secret-id
GOCARDLESS_SECRET_KEY=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`DATABASE_URL` is only needed to run migrations. Find it in Supabase under **Project Settings → Database → Connection string**.

`GOCARDLESS_SECRET_ID` and `GOCARDLESS_SECRET_KEY` are obtained from the [GoCardless Bank Account Data](https://bankaccountdata.gocardless.com/) dashboard (free tier supports ~2,300 EU banks). `NEXT_PUBLIC_APP_URL` must match your deployment URL so the OAuth callback redirects correctly.

Run migrations and start the dev server:

```bash
npm run migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Import the repo in [Vercel](https://vercel.com)
2. Add the three env vars above under **Environment Variables**
3. Set the **Build Command** to:
   ```
   npm run migrate && next build
   ```

Migrations run automatically on every deploy and are idempotent — already-applied files are skipped. If a migration fails, the build fails and the previous version keeps running.

---

## Project structure

```
app/
  api/entries/       # Unified REST API (amort + sub)
  api/banking/       # Open Banking: connect, callback, sync, connections, institutions
  api/transactions/  # Transaction list + category update
  auth/              # Login & register pages
  dashboard/         # Main app (server component + data fetching)
components/app/
  DashboardClient    # All interactive UI & state
  BankingView        # Open Banking UI (connect, sync, transaction list)
lib/
  types.ts           # Entry, BankConnection, Transaction types
  calc.ts            # Amortization math & formatting
  gocardless.ts      # GoCardless API client
scripts/
  migrate.js         # Migration runner (used at deploy time)
supabase/migrations/ # SQL migration files, applied in order
```

---

## License

MIT
