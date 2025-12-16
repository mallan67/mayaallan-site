# Maya Allan Author Site (Skeleton with Prisma)

This is a Next.js App Router project for the author site "Guide to Psilocybin Integration".
It includes a basic Prisma schema and wiring, but pages are mostly static placeholders for now.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the database:

   - Create a PostgreSQL database (Vercel Postgres, Supabase, Neon, etc.).
   - Set the `DATABASE_URL` in `.env`:

     ```env
     DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
     ```

3. Run Prisma migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Deploying to Vercel

1. Push this project to GitHub/GitLab/Bitbucket.
2. In Vercel, click **New Project** and import the repository.
3. Set the `DATABASE_URL` environment variable in Vercel Project Settings.
4. Vercel will build and deploy automatically.

For now the site uses static data on the Home page; Prisma is wired and ready for when
you want to build out the full admin and dynamic content.
