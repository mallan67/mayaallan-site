-- drizzle/migrations/0002_normalize_slug_and_coming_soon.sql
BEGIN;

-- 1) Add slug column if missing (nullable)
ALTER TABLE IF EXISTS public.book
  ADD COLUMN IF NOT EXISTS slug varchar(320);

-- 2) Backfill slug for rows where slug is null or empty
UPDATE public.book
SET slug = lower(trim(both '-' FROM regexp_replace(coalesce(title, ''), '[^A-Za-z0-9]+', '-', 'g')))
WHERE coalesce(slug, '') = '';

COMMIT;

-- 3) Create unique index only if there are no duplicate slugs
DO $$
DECLARE
  dup_count int;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT slug FROM public.book GROUP BY slug HAVING COUNT(*) > 1
  ) d;
  IF dup_count = 0 THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS book_slug_idx ON public.book (slug)';
  ELSE
    RAISE NOTICE 'Skipping unique index creation for book.slug - % duplicate slugs found.', dup_count;
  END IF;
END
$$;

BEGIN;
-- 4) Set slug NOT NULL only if no null/empty slugs exist
DO $$
DECLARE cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.book WHERE slug IS NULL OR slug = '';
  IF cnt = 0 THEN
    ALTER TABLE public.book ALTER COLUMN slug SET NOT NULL;
  ELSE
    RAISE NOTICE 'slug column still has % rows NULL or empty; not making NOT NULL yet.', cnt;
  END IF;
END
$$;

-- 5) Normalize coming_soon: set to false when book is published OR direct_sale enabled OR has an active retailer link
UPDATE public.book
SET coming_soon = false
WHERE coming_soon = true
  AND (
    is_published = true
    OR direct_sale_enabled = true
    OR EXISTS (
      SELECT 1 FROM public.book_retailer_link br
      WHERE br.book_id = public.book.id
        AND br.is_active = true
    )
  );

COMMIT;
