-- Enhance ads table with comprehensive ad management fields
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS company_logo TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS background_image TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS subheading TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Learn More';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2);
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS cost_per_click DECIMAL(10,2);
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id);

-- Rename columns if they don't already have the new names
DO $$
BEGIN
    -- Check if url column exists and image_url doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'url') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'image_url') THEN
        ALTER TABLE public.ads RENAME COLUMN url TO image_url;
    END IF;
    
    -- Check if upload_date column exists and we need to rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'upload_date') THEN
        -- Add image_url column if url was renamed to something else or doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'image_url') THEN
            ALTER TABLE public.ads ADD COLUMN image_url TEXT;
        END IF;
    END IF;
END $$;

-- Update existing columns to allow more status options
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_status_check;
ALTER TABLE public.ads ADD CONSTRAINT ads_status_check CHECK (status IN ('active', 'inactive', 'scheduled', 'expired', 'draft'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON public.ads(priority);
CREATE INDEX IF NOT EXISTS idx_ads_start_date ON public.ads(start_date);
CREATE INDEX IF NOT EXISTS idx_ads_end_date ON public.ads(end_date);
CREATE INDEX IF NOT EXISTS idx_ads_created_by ON public.ads(created_by);

-- Insert sample ad data to demonstrate the new structure
INSERT INTO public.ads (
  name,
  description,
  company_name,
  company_logo,
  image_url,
  background_image,
  headline,
  subheading,
  cta_text,
  target_url,
  category,
  status,
  priority,
  start_date,
  end_date,
  budget,
  cost_per_click,
  tags,
  notes
) VALUES (
  'Mortgage Solutions Partnership',
  'Premium mortgage solutions for your clients',
  'Premier Lending Group',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
  'Competitive Rates Available',
  'Get the best mortgage rates for your clients with our streamlined process',
  'Get Started',
  'https://premierlending.com/partner',
  'Financial Services',
  'active',
  1,
  NOW(),
  NOW() + INTERVAL '30 days',
  5000.00,
  2.50,
  ARRAY['mortgage', 'lending', 'partnership'],
  'High-performing ad for mortgage partnerships'
) ON CONFLICT DO NOTHING;

INSERT INTO public.ads (
  name,
  description,
  company_name,
  company_logo,
  image_url,
  background_image,
  headline,
  subheading,
  cta_text,
  target_url,
  category,
  status,
  priority,
  start_date,
  end_date,
  budget,
  cost_per_click,
  tags,
  notes
) VALUES (
  'Real Estate Technology Platform',
  'Advanced CRM and lead management tools',
  'PropTech Solutions',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
  'Boost Your Sales Pipeline',
  'Manage leads and close more deals with our all-in-one platform',
  'Try Free',
  'https://proptech.com/trial',
  'Technology',
  'active',
  2,
  NOW(),
  NOW() + INTERVAL '45 days',
  3000.00,
  1.75,
  ARRAY['crm', 'leads', 'technology'],
  'Technology platform advertisement'
) ON CONFLICT DO NOTHING;