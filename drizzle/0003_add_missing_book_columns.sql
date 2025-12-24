ALTER TABLE public.book
  ADD COLUMN IF NOT EXISTS sales_metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;
