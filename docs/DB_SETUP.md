# DB Setup & Admin Seed

## Prereqs
Install dependencies:


## Migrations
Run all SQL migrations:


## Create Admin
Create (or update) a single admin user:


## Notes
- The scripts read `POSTGRES_URL` first, then `DATABASE_URL`.
- Make sure `ADMIN_JWT_SECRET` is set in Vercel for sessions.
- After migrations and seeding, try logging in at the admin UI (or call `/api/admin/login`).
