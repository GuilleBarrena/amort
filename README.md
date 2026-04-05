# Amort

> Know what everything you own *actually* costs you per month.

Amort is a minimalist open-source personal finance tool that does two things:

- **Amortization tracker** — set a monthly target for big purchases (laptop, camera, bike) and watch them pay themselves off over time. Know their real sale price today.
- **Subscription manager** — see every recurring charge in one place and your true monthly total across all of them.

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
```

`DATABASE_URL` is only needed to run migrations. Find it in Supabase under **Project Settings → Database → Connection string**.

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
  auth/              # Login & register pages
  dashboard/         # Main app (server component + data fetching)
components/app/
  DashboardClient    # All interactive UI & state
lib/
  types.ts           # Entry type (unified amort/sub)
  calc.ts            # Amortization math & formatting
scripts/
  migrate.js         # Migration runner (used at deploy time)
supabase/migrations/ # SQL migration files, applied in order
```

---

## License

MIT
