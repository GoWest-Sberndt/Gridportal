-- Enhance badges table with new fields for dynamic progress tracking
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rarity VARCHAR(20) DEFAULT 'common';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'performance';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE badges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add check constraint for rarity values
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_rarity_check;
ALTER TABLE badges ADD CONSTRAINT badges_rarity_check 
  CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'));

-- Add check constraint for category values
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_category_check;
ALTER TABLE badges ADD CONSTRAINT badges_category_check 
  CHECK (category IN ('performance', 'recruitment', 'milestone', 'special', 'achievement'));

-- Enhance user_badges table
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS max_progress INTEGER;
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS awarded_by UUID REFERENCES users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);
CREATE INDEX IF NOT EXISTS idx_user_badges_progress ON user_badges(progress, max_progress);

-- Update existing badges with new fields
UPDATE badges SET 
  rarity = CASE 
    WHEN name ILIKE '%gold%' OR name ILIKE '%legendary%' THEN 'legendary'
    WHEN name ILIKE '%silver%' OR name ILIKE '%epic%' THEN 'epic'
    WHEN name ILIKE '%bronze%' OR name ILIKE '%rare%' THEN 'rare'
    ELSE 'common'
  END,
  category = CASE
    WHEN name ILIKE '%recruit%' OR name ILIKE '%team%' THEN 'recruitment'
    WHEN name ILIKE '%milestone%' OR name ILIKE '%anniversary%' THEN 'milestone'
    WHEN name ILIKE '%volume%' OR name ILIKE '%loan%' THEN 'performance'
    ELSE 'achievement'
  END,
  requirements = CASE
    WHEN name = 'Bronze Tier' THEN 'Close 5 loans in a month'
    WHEN name = 'Silver Tier' THEN 'Close 10 loans in a month'
    WHEN name = 'Gold Tier' THEN 'Close 15 loans in a month'
    WHEN name = 'Qualifying Tier' THEN 'Close 20 loans in a month'
    WHEN name = 'Basic Tier' THEN 'Complete onboarding process'
    ELSE 'Complete specific performance goals'
  END
WHERE requirements IS NULL;