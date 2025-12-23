-- drizzle/0002_normalize_coming_soon.sql
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'book' AND column_name = 'coming_soon'
  ) THEN
    ALTER TABLE public.book
      ADD COLUMN coming_soon boolean DEFAULT false NOT NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'book' AND column_name = 'is_coming_soon'
  ) THEN
    UPDATE public.book
    SET coming_soon = COALESCE(is_coming_soon, false)
    WHERE coming_soon IS DISTINCT FROM COALESCE(is_coming_soon, false);

    ALTER TABLE public.book DROP COLUMN is_coming_soon;
  END IF;
END
$$;

COMMIT;
