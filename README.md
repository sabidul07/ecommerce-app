# Atelier — Premium Ecommerce Marketplace

A production-ready ecommerce web application built with **Next.js 14 (App Router)**, **TypeScript**, **Supabase**, and **Tailwind CSS**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage) |
| Deployment | Vercel |

---

## Features

- **Auth** — Email/password signup, login, session management, protected routes
- **Products** — List, browse, and delete products with image upload
- **Cart** — Add/remove/update quantities, persistent in session
- **Orders** — Checkout creates orders + order items in the database
- **Dashboard** — View own listings and order history
- **Storage** — Product images stored in Supabase Storage with public URLs
- **RLS** — Full Row Level Security on all tables

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd ecommerce-app
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**, choose a name and strong database password
3. Wait ~2 minutes for the project to provision
4. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the SQL Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run** (or press `Ctrl+Enter`)

This will create:
- Tables: `profiles`, `products`, `orders`, `order_items`
- All RLS policies
- Storage bucket `images` with policies
- Auto-profile trigger on sign-up

### 5. Verify Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Confirm the `images` bucket exists and is set to **Public**
3. If not, create it manually: Storage → New Bucket → Name: `images` → ✅ Public bucket

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
ecommerce-app/
├── app/
│   ├── layout.tsx          # Root layout with CartProvider + Navbar
│   ├── page.tsx            # Homepage / Hero
│   ├── globals.css         # Tailwind + design system
│   ├── login/
│   │   └── page.tsx        # Login form
│   ├── signup/
│   │   └── page.tsx        # Signup form
│   ├── products/
│   │   └── page.tsx        # Public product grid (SSR)
│   ├── upload-product/
│   │   └── page.tsx        # Create listing with image upload
│   ├── dashboard/
│   │   └── page.tsx        # User dashboard (listings + orders)
│   └── cart/
│       └── page.tsx        # Cart + checkout
│
├── components/
│   ├── Navbar.tsx          # Sticky nav with cart count + user menu
│   ├── ProductCard.tsx     # Product tile with add-to-cart
│   ├── DeleteProductButton.tsx  # Client button for deleting listings
│   └── LoadingSpinner.tsx  # Reusable spinner
│
├── context/
│   └── CartContext.tsx     # Cart state (React context)
│
├── lib/
│   ├── supabase.ts         # Browser client
│   ├── supabase-server.ts  # Server component client
│   └── supabase-middleware.ts  # Middleware session refresh
│
├── types/
│   └── index.ts            # TypeScript interfaces
│
├── middleware.ts            # Route protection
├── supabase-schema.sql     # Full database setup
├── tailwind.config.ts
├── next.config.js
└── .env.local.example
```

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, FK → auth.users |
| name | TEXT | |
| created_at | TIMESTAMPTZ | |

### `products`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | TEXT | max 120 chars |
| price | NUMERIC(10,2) | > 0 |
| image | TEXT | public storage URL |
| user_id | UUID | FK → auth.users |
| created_at | TIMESTAMPTZ | |

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| total | NUMERIC(10,2) | |
| created_at | TIMESTAMPTZ | |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| order_id | UUID | FK → orders |
| product_id | UUID | FK → products |
| quantity | INTEGER | > 0 |

---

## RLS Policy Summary

| Table | Policy | Who |
|---|---|---|
| profiles | SELECT / INSERT / UPDATE | Own row only |
| products | SELECT | Everyone (public) |
| products | INSERT / UPDATE / DELETE | Owner only |
| orders | SELECT / INSERT | Own rows only |
| order_items | SELECT / INSERT | Via own orders |
| storage.objects (images) | SELECT | Public |
| storage.objects (images) | INSERT | Authenticated users |
| storage.objects (images) | DELETE | File owner |

---

## Deployment to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/ecommerce-app.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Root Directory: leave as `.`

### Step 3 — Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL     = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
```

Set for **Production**, **Preview**, and **Development** environments.

### Step 4 — Deploy

Click **Deploy**. Vercel will build and deploy your app. You'll receive a live URL like `https://your-app.vercel.app`.

### Step 5 — Update Supabase Auth Settings (important!)

1. In Supabase → **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Common Issues

### "relation does not exist" error
→ Run the `supabase-schema.sql` file in the Supabase SQL Editor.

### Images not showing
→ Ensure the `images` bucket is set to **Public** in Supabase Storage.

### Auth redirect not working after deploy
→ Update Site URL and Redirect URLs in Supabase → Authentication → URL Configuration.

### "new row violates RLS policy"
→ Ensure you're signed in. The RLS policies require `auth.uid()` to match.

### Cart is empty after page refresh
→ Expected behavior. Cart state is in-memory (React context). For persistent cart, extend `CartContext.tsx` to use `localStorage`.

---

## Optional Enhancements

- **Persistent cart** — Save cart to `localStorage` or a `cart_items` Supabase table
- **Email confirmation** — Enable in Supabase Auth settings
- **Product search** — Add a search bar + Supabase full-text search
- **Stripe payments** — Integrate Stripe Checkout before creating orders
- **Product categories** — Add a `category` column and filter UI
- **Pagination** — Use Supabase range queries for large catalogs
# ecommerce-app
