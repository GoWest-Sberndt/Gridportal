-- Update types to reflect the current schema after budget column removal
-- This migration ensures the schema cache is updated properly

-- Refresh the schema cache by touching the ads table
COMMENT ON TABLE public.ads IS 'Internal advertisements - updated schema without budget fields';

-- Ensure all expected columns exist and have proper types
ALTER TABLE public.ads ALTER COLUMN clicks SET DEFAULT 0;
ALTER TABLE public.ads ALTER COLUMN priority SET DEFAULT 1;
ALTER TABLE public.ads ALTER COLUMN cta_text SET DEFAULT 'Learn More';
ALTER TABLE public.ads ALTER COLUMN tags SET DEFAULT '{}';

-- Update any existing records to have proper defaults
UPDATE public.ads SET clicks = 0 WHERE clicks IS NULL;
UPDATE public.ads SET priority = 1 WHERE priority IS NULL;
UPDATE public.ads SET cta_text = 'Learn More' WHERE cta_text IS NULL;
UPDATE public.ads SET tags = '{}' WHERE tags IS NULL;