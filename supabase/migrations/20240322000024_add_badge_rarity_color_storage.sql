-- Add new columns to badges table
ALTER TABLE badges 
ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common',
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';

-- Update existing badges to have default values
UPDATE badges 
SET rarity = 'common' 
WHERE rarity IS NULL;

UPDATE badges 
SET color = '#3b82f6' 
WHERE color IS NULL;

-- Create storage bucket for badge images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('badge-images', 'badge-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for badge images (drop if exists first)
DROP POLICY IF EXISTS "Public Access for badge images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload badge images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploaded badge images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploaded badge images" ON storage.objects;

CREATE POLICY "Public Access for badge images" ON storage.objects FOR SELECT USING (bucket_id = 'badge-images');
CREATE POLICY "Authenticated users can upload badge images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'badge-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their uploaded badge images" ON storage.objects FOR UPDATE USING (bucket_id = 'badge-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their uploaded badge images" ON storage.objects FOR DELETE USING (bucket_id = 'badge-images' AND auth.role() = 'authenticated');