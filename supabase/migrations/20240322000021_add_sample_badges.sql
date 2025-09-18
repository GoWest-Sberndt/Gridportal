DO $$ 
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'category') THEN
        ALTER TABLE badges ADD COLUMN category TEXT DEFAULT 'performance';
    END IF;
    
    -- Add rarity column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rarity') THEN
        ALTER TABLE badges ADD COLUMN rarity TEXT DEFAULT 'common';
    END IF;
    
    -- Add requirements column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'requirements') THEN
        ALTER TABLE badges ADD COLUMN requirements TEXT;
    END IF;
    
    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'image_url') THEN
        ALTER TABLE badges ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Update existing badges with categories and rarity
UPDATE badges SET 
  category = CASE 
    WHEN name LIKE '%Volume%' OR name LIKE '%Performance%' OR name LIKE '%Top%' THEN 'performance'
    WHEN name LIKE '%Team%' OR name LIKE '%Recruit%' OR name LIKE '%Mentor%' THEN 'recruitment'
    WHEN name LIKE '%First%' OR name LIKE '%Anniversary%' OR name LIKE '%Consistency%' THEN 'milestone'
    ELSE 'special'
  END,
  rarity = CASE 
    WHEN name LIKE '%Master%' OR name LIKE '%Champion%' OR name LIKE '%Legendary%' THEN 'legendary'
    WHEN name LIKE '%Top%' OR name LIKE '%Epic%' OR name LIKE '%King%' THEN 'epic'
    WHEN name LIKE '%Volume%' OR name LIKE '%Team%' OR name LIKE '%Speed%' THEN 'rare'
    ELSE 'common'
  END,
  image_url = CASE 
    WHEN rarity = 'legendary' THEN '/tier-badges/tier-gold.png'
    WHEN rarity = 'epic' THEN '/tier-badges/tier-silver.png'
    WHEN rarity = 'rare' THEN '/tier-badges/tier-bronze.png'
    ELSE '/tier-badges/tier-basic.png'
  END
WHERE category IS NULL OR rarity IS NULL OR image_url IS NULL;

-- Add some earned badges for users
INSERT INTO user_badges (user_id, badge_id, date_obtained) 
SELECT 
  u.id,
  b.id,
  NOW() - INTERVAL '30 days'
FROM users u 
CROSS JOIN badges b
WHERE u.role = 'Loan Officer' 
  AND b.name IN ('First Steps', 'Spark Collector', 'Anniversary')
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    WHERE ub.user_id = u.id AND ub.badge_id = b.id
  )
LIMIT 3;