-- Add missing columns to news table for enhanced content management
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS author_avatar TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS video_duration TEXT,
ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS read_time TEXT,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update existing columns to match new schema
ALTER TABLE public.news 
ALTER COLUMN likes SET DEFAULT 0,
ALTER COLUMN views SET DEFAULT 0;

-- Rename existing columns to match new schema if they exist
DO $$
BEGIN
    -- Check if 'comments' column exists and rename to 'comments_count'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'comments') THEN
        ALTER TABLE public.news RENAME COLUMN comments TO comments_count_old;
    END IF;
    
    -- Check if 'thumbnail' column exists and rename to 'image_url'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'thumbnail') THEN
        ALTER TABLE public.news RENAME COLUMN thumbnail TO image_url_old;
    END IF;
    
    -- Check if 'estimated_read_time' column exists and rename to 'read_time'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'estimated_read_time') THEN
        ALTER TABLE public.news RENAME COLUMN estimated_read_time TO read_time_old;
    END IF;
END $$;

-- Copy data from old columns to new columns if they exist
UPDATE public.news 
SET comments_count = COALESCE(comments_count_old, 0)
WHERE comments_count_old IS NOT NULL;

UPDATE public.news 
SET image_url = image_url_old
WHERE image_url_old IS NOT NULL;

UPDATE public.news 
SET read_time = read_time_old
WHERE read_time_old IS NOT NULL;

-- Set publish_date to created_at for existing records where publish_date is null
UPDATE public.news 
SET publish_date = created_at
WHERE publish_date IS NULL;

-- Set featured flag based on priority for existing records
UPDATE public.news 
SET featured = (priority = 'high')
WHERE featured IS NULL;

-- Set is_published to true for existing records with status 'published'
UPDATE public.news 
SET is_published = (status = 'published')
WHERE is_published IS NULL;

-- Drop old columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'comments_count_old') THEN
        ALTER TABLE public.news DROP COLUMN comments_count_old;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'image_url_old') THEN
        ALTER TABLE public.news DROP COLUMN image_url_old;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'read_time_old') THEN
        ALTER TABLE public.news DROP COLUMN read_time_old;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_featured ON public.news(featured);
CREATE INDEX IF NOT EXISTS idx_news_publish_date ON public.news(publish_date);
CREATE INDEX IF NOT EXISTS idx_news_type ON public.news(type);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON public.news(is_published);