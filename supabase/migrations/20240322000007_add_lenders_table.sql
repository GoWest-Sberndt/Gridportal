CREATE TABLE IF NOT EXISTS lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Lender company information
  company_name TEXT NOT NULL,
  company_logo TEXT,
  company_website TEXT,
  company_description TEXT,
  
  -- Company contact information
  company_phone TEXT,
  company_email TEXT,
  company_address TEXT,
  company_city TEXT,
  company_state TEXT,
  company_zip TEXT,
  
  -- Account executive information
  ae_name TEXT,
  ae_photo TEXT,
  ae_phone TEXT,
  ae_extension TEXT,
  ae_email TEXT,
  ae_title TEXT,
  
  -- Lender specialties and offerings
  specialties TEXT[],
  product_offerings TEXT[],
  
  -- Additional fields
  status TEXT DEFAULT 'active',
  priority INTEGER DEFAULT 0,
  notes TEXT
);

-- Enable realtime (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'lenders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE lenders;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lenders_company_name ON lenders(company_name);
CREATE INDEX IF NOT EXISTS idx_lenders_status ON lenders(status);
CREATE INDEX IF NOT EXISTS idx_lenders_priority ON lenders(priority DESC);