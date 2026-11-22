# WADIE INDUSTRIELLE — Corporate Website & Admin Portal

Full-stack bilingual (Arabic RTL / French LTR) corporate application for **WADIE INDUSTRIELLE**, located in Centre-ville de Yellel, Wilaya de Relizane, Algeria.

Architecture:
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend / API**: Vercel Serverless Functions (`/api/*`) + shared Express server (`server.ts`) for local development
- **Database**: Neon PostgreSQL (`@neondatabase/serverless`)
- **Authentication**: Server-side credential verification + HMAC-SHA256 signed `HttpOnly` session cookies

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Configure Neon PostgreSQL

1. Create a free project at [https://neon.tech](https://neon.tech).
2. Open the **Connection Details** panel in your Neon dashboard and copy the PostgreSQL connection string (`postgres://...sslmode=require`).

---

## 3. Create Database Tables

Run the SQL migrations against your Neon database using the Neon SQL Editor or `psql`:

1. Execute `migrations/001_initial_schema.sql` to create the `bookings`, `services`, `equipment`, and `projects` tables and indexes.
2. Optionally execute `migrations/002_seed_catalog.sql` to populate the initial bilingual services, equipment, and capability gallery entries (or use the **"Initialize Default Catalog"** button inside `/admin` after logging in).

Note: The backend also executes `CREATE TABLE IF NOT EXISTS` automatically on the first database request.

---

## 4. Configure Environment Variables

Copy `.env.example` to `.env` for local development (never commit `.env`):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
ADMIN_EMAIL=aouedbensabeur@gmail.com
ADMIN_PASSWORD=YOUR_STRONG_ADMIN_PASSWORD
AUTH_SECRET=YOUR_RANDOM_64_CHAR_HEX_SECRET
```

Generate a strong `AUTH_SECRET` locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 5. Configure the Administrator Account

- Public registration is intentionally disabled.
- The authorized administrator email defaults to `aouedbensabeur@gmail.com` (overrideable via `ADMIN_EMAIL`).
- Set `ADMIN_PASSWORD` in your environment variables (Vercel Dashboard -> Project Settings -> Environment Variables).
- For extra hardening, `ADMIN_PASSWORD` also accepts an `scrypt$<salt>$<hexHash>` formatted string generated with Node.js `crypto.scryptSync`.

---

## 6. Run Locally

```bash
npm run dev
```

The server starts on `http://localhost:3000`, serving both the React frontend and `/api/*` endpoints.

---

## 7. Deploy to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project in **Vercel** (`Framework Preset: Vite`).
3. Add all required environment variables in **Vercel -> Settings -> Environment Variables**:
   - `DATABASE_URL`
   - `ADMIN_EMAIL` (`aouedbensabeur@gmail.com`)
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET`
4. Deploy. `vercel.json` automatically routes `/api/*` to Vercel Serverless Functions and SPA pages (`/booking`, `/admin`, etc.) to `index.html`.

---

## 8. Test Appointment Submissions

1. Navigate to `/booking`.
2. Fill in Full Name, Phone (`0772219377`), Service, Future Date, Preferred Time, and Project Location.
3. Submit the form:
   - `POST /api/bookings` validates all fields, blocks past dates, inserts the row into Neon `bookings`, and returns a unique `WI-YYYYMMDD-XXXXXX` reference.
   - Verify the record appears in Neon (`SELECT * FROM bookings;`).

---

## 9. Test Administrator Login & Session Security

1. Navigate to `/admin`.
2. Verify that unauthenticated requests to `GET /api/admin/bookings` return `401 Unauthorized`.
3. Sign in with `aouedbensabeur@gmail.com` and your configured `ADMIN_PASSWORD`.
4. Confirm that:
   - An `HttpOnly` session cookie (`wadie_admin_session`) is set.
   - Bookings, Overview KPIs, Services, Equipment (including availability toggles), and Gallery items load from Neon PostgreSQL.
   - Confirming, rejecting, or completing a booking persists immediately via `PATCH /api/admin/bookings/:id`.
   - Clicking **Logout** clears the session cookie and revokes access to `/admin`.
