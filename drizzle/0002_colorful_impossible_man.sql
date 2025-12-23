-- drizzle/0002_colorful_impossible_man.sql (idempotent, safe)
BEGIN;

-- 1) Add columns if missing (safe)
ALTER TABLE IF EXISTS public.book ADD COLUMN IF NOT EXISTS slug varchar(320);
ALTER TABLE IF EXISTS public.book ADD COLUMN IF NOT EXISTS subtitle_1 varchar(500);
ALTER TABLE IF EXISTS public.book ADD COLUMN IF NOT EXISTS subtitle_2 varchar(500);
ALTER TABLE IF EXISTS public.book ADD COLUMN IF NOT EXISTS direct_sale_enabled boolean DEFAULT false;
ALTER TABLE IF EXISTS public.book ADD COLUMN IF NOT EXISTS paypal_button_id varchar(255);
ALTER TABLE IF EXISTS public.book ADD COLUMN IF NOT EXISTS coming_soon boolean DEFAULT false;
ALTER TABLE IF EXISTS public.book ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE IF EXISTS public.book ADD COLUMN IF NOT EXISTS seo_description text;

-- 2) Backfill slug for rows where slug is null/empty
UPDATE public.book
SET slug = lower(trim(both '-' FROM regexp_replace(coalesce(title, ''), '[^A-Za-z0-9]+', '-', 'g')) )
WHERE coalesce(slug, '') = '';

-- 3) Create unique index only if there are no duplicate slugs
DO $$
DECLARE
  dup_count int;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT slug FROM public.book GROUP BY slug HAVING COUNT(*) > 1
  ) d;
  IF dup_count = 0 THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS book_slug_unique_idx ON public.book (slug)';
  ELSE
    RAISE NOTICE 'Skipping unique index creation for book.slug - % duplicate slugs found.', dup_count;
  END IF;
END
$$;

-- 4) Set slug NOT NULL only if safe
DO $$
DECLARE cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.book WHERE slug IS NULL OR slug = '';
  IF cnt = 0 THEN
    EXECUTE 'ALTER TABLE public.book ALTER COLUMN slug SET NOT NULL';
  ELSE
    RAISE NOTICE 'slug column still has % rows NULL or empty; not making NOT NULL yet.', cnt;
  END IF;
END
$$;

-- 5) Drop legacy columns safely
ALTER TABLE IF EXISTS public.book DROP COLUMN IF EXISTS subtitle1;
ALTER TABLE IF EXISTS public.book DROP COLUMN IF EXISTS subtitle2;
ALTER TABLE IF EXISTS public.book DROP COLUMN IF EXISTS copyright;
ALTER TABLE IF EXISTS public.book DROP COLUMN IF EXISTS allow_direct_sale;
ALTER TABLE IF EXISTS public.book DROP COLUMN IF EXISTS stripe_enabled;
ALTER TABLE IF EXISTS public.book DROP COLUMN IF EXISTS paypal_enabled;
ALTER TABLE IF EXISTS public.book DROP COLUMN IF EXISTS paypal_product_id;
ALTER TABLE IF EXISTS public.book DROP COLUMN IF EXISTS is_coming_soon;

COMMIT;
