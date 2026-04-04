# Amort

Controla el coste real de tus compras y suscripciones.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Auth)
- **Vercel** (hosting)

---

## Despliegue en 10 minutos

### 1. Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto gratis
2. En **SQL Editor**, pega y ejecuta el contenido de `supabase/migrations/001_init.sql`
3. Ve a **Settings → API** y copia:
   - `Project URL`
   - `anon public` key

### 2. Variables de entorno locales

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Instalar y probar localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 4. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/amort.git
git push -u origin main
```

### 5. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
2. Importa el repositorio `amort`
3. En **Environment Variables** añade las dos variables de Supabase
4. Haz clic en **Deploy**

¡Listo! Vercel redespliega automáticamente en cada `git push`.

---

## Estructura del proyecto

```
amort/
├── app/
│   ├── page.tsx              # Landing
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   └── page.tsx          # App principal
│   └── api/
│       ├── items/route.ts    # CRUD compras
│       └── subs/route.ts     # CRUD suscripciones
├── components/app/
│   ├── DashboardClient.tsx   # UI interactiva
│   └── DashboardNav.tsx      # Barra superior
├── lib/
│   ├── calc.ts               # Lógica de amortización
│   ├── types.ts              # Tipos TypeScript
│   ├── supabase-browser.ts   # Cliente frontend
│   └── supabase-server.ts    # Cliente backend
├── middleware.ts             # Protección de rutas
└── supabase/migrations/
    └── 001_init.sql          # Tablas y políticas RLS
```

## Funcionalidades

- ✅ Registro y login con email/contraseña
- ✅ Cada usuario ve solo sus propios datos (RLS)
- ✅ Añadir / editar / eliminar compras con amortización
- ✅ Añadir / editar / eliminar suscripciones
- ✅ Dashboard unificado con filtro Compras / Suscripciones
- ✅ Total mensual real (amortización activa + suscripciones)
- ✅ Detalle con outputs A, B y C por cada compra
- ✅ Landing page pública
