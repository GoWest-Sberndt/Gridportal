-- Simplify ads table for internal use - remove budget/financial fields
ALTER TABLE public.ads DROP COLUMN IF EXISTS budget;
ALTER TABLE public.ads DROP COLUMN IF EXISTS cost_per_click;
ALTER TABLE public.ads DROP COLUMN IF EXISTS impressions;

-- Add file upload tracking columns
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS company_logo_file_name TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS background_image_file_name TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS image_url_file_name TEXT;

-- Create storage bucket for ad images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for ad images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Authenticated users can upload ad images" ON storage.objects;
CREATE POLICY "Authenticated users can upload ad images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update ad images" ON storage.objects;
CREATE POLICY "Authenticated users can update ad images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ad-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete ad images" ON storage.objects;
CREATE POLICY "Authenticated users can delete ad images"
ON storage.objects FOR DELETE
USING (bucket_id = 'ad-images' AND auth.role() = 'authenticated');