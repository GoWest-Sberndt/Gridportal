-- Add missing columns to learning_content table
ALTER TABLE public.learning_content 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Add missing columns to news table
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS main_image_url TEXT,
ADD COLUMN IF NOT EXISTS cta_text TEXT,
ADD COLUMN IF NOT EXISTS cta_url TEXT;

-- Create system_settings table for storing featured video URL and other settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default featured video setting
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) 
VALUES ('featured_video_url', '', 'string', 'YouTube URL for the featured video displayed on dashboard')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable realtime for system_settings (only if not already added)
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'system_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
    END IF;
END $;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_learning_content_status ON public.learning_content(status);
CREATE INDEX IF NOT EXISTS idx_learning_content_type ON public.learning_content(type);

-- Insert sample learning content
INSERT INTO public.learning_content (title, type, category, status, views, duration, description, url, thumbnail) VALUES
('Advanced Loan Processing Techniques', 'video', 'Training', 'published', 1250, '22:15', 'Learn advanced techniques for processing complex loan applications efficiently.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80'),
('FHA Guidelines 2024 Update', 'document', 'Guidelines', 'published', 890, null, 'Complete guide to the latest FHA lending guidelines and requirements.', 'https://example.com/fha-guidelines-2024.pdf', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80'),
('Customer Service Excellence', 'video', 'Training', 'published', 2100, '18:30', 'Master the art of exceptional customer service in mortgage lending.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&q=80')
ON CONFLICT DO NOTHING;

-- Insert additional sample news content
INSERT INTO public.news (title, content, category, type, status, priority, author, tags, views, likes, comments, is_featured, thumbnail, estimated_read_time, duration) VALUES
('Mortgage Market Outlook 2024', 'Industry experts share their predictions for the mortgage market in 2024, including interest rate forecasts and lending trends that will shape the industry.', 'Market Updates', 'article', 'published', 'high', 'Market Research Team', '{"Market Outlook", "2024", "Predictions"}', 1850, 124, 45, true, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', '8 min read', null),
('How to Excel in Mortgage Sales', 'Join our top-performing loan officer as she shares proven strategies for building a successful mortgage sales career.', 'Training', 'video', 'published', 'medium', 'Sales Training Team', '{"Sales", "Training", "Career Development"}', 3200, 245, 67, false, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80', null, '25:40'),
('New Compliance Requirements Effective March 2024', 'Important updates to compliance requirements that all loan officers must be aware of, including new documentation standards and reporting procedures.', 'Compliance', 'article', 'published', 'high', 'Compliance Team', '{"Compliance", "Requirements", "March 2024"}', 2750, 189, 34, false, 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80', '6 min read', null)
ON CONFLICT DO NOTHING;
