-- Add image_url column to badges table
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS image_url text;

-- Add comment to explain the column
COMMENT ON COLUMN public.badges.image_url IS 'URL of the uploaded badge image';

-- Update the Supabase types to reflect the schema changes
-- This ensures the schema cache is updated
NOTIFY pgrst, 'reload schema';
