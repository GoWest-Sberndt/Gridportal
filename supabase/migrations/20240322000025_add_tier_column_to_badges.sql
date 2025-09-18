-- Add tier column to badges table
ALTER TABLE badges ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'qualifying';

-- Add check constraint for tier values
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_tier_check;
ALTER TABLE badges ADD CONSTRAINT badges_tier_check 
  CHECK (tier IN ('qualifying', 'basic', 'bronze', 'silver', 'gold'));

-- Update existing badges with tier values based on their names
UPDATE badges SET 
  tier = CASE 
    WHEN name ILIKE '%gold%' THEN 'gold'
    WHEN name ILIKE '%silver%' THEN 'silver'
    WHEN name ILIKE '%bronze%' THEN 'bronze'
    WHEN name ILIKE '%basic%' THEN 'basic'
    ELSE 'qualifying'
  END
WHERE tier IS NULL OR tier = 'qualifying';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_badges_tier ON badges(tier);