-- Add upline/downline tracking table for better relationship management
CREATE TABLE IF NOT EXISTS public.user_relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  upline_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  relationship_level INTEGER NOT NULL DEFAULT 1, -- 1 = direct, 2 = second level, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, upline_user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_relationships_user_id ON public.user_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_upline_user_id ON public.user_relationships(upline_user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_level ON public.user_relationships(relationship_level);

-- Function to automatically maintain upline/downline relationships
CREATE OR REPLACE FUNCTION update_user_relationships()
RETURNS TRIGGER AS $$
BEGIN
  -- Clear existing relationships for this user
  DELETE FROM public.user_relationships WHERE user_id = NEW.id;
  
  -- If user has a recruiter, build the upline chain
  IF NEW.recruiter_id IS NOT NULL THEN
    -- Insert direct relationship (level 1)
    INSERT INTO public.user_relationships (user_id, upline_user_id, relationship_level)
    VALUES (NEW.id, NEW.recruiter_id, 1);
    
    -- Insert indirect relationships (levels 2 and 3)
    WITH RECURSIVE upline_chain AS (
      -- Base case: direct recruiter
      SELECT NEW.recruiter_id as user_id, 1 as level
      UNION ALL
      -- Recursive case: go up the chain
      SELECT u.recruiter_id, uc.level + 1
      FROM public.users u
      JOIN upline_chain uc ON u.id = uc.user_id
      WHERE u.recruiter_id IS NOT NULL AND uc.level < 3
    )
    INSERT INTO public.user_relationships (user_id, upline_user_id, relationship_level)
    SELECT NEW.id, uc.user_id, uc.level + 1
    FROM upline_chain uc
    WHERE uc.level < 3
    ON CONFLICT (user_id, upline_user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update relationships
DROP TRIGGER IF EXISTS trigger_update_user_relationships ON public.users;
CREATE TRIGGER trigger_update_user_relationships
  AFTER INSERT OR UPDATE OF recruiter_id ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_relationships();

-- Populate existing relationships
INSERT INTO public.user_relationships (user_id, upline_user_id, relationship_level)
SELECT 
  u.id as user_id,
  u.recruiter_id as upline_user_id,
  1 as relationship_level
FROM public.users u
WHERE u.recruiter_id IS NOT NULL
ON CONFLICT (user_id, upline_user_id) DO NOTHING;

-- Build multi-level relationships for existing data
WITH RECURSIVE upline_chains AS (
  -- Level 1: Direct relationships
  SELECT 
    ur.user_id,
    ur.upline_user_id,
    1 as level
  FROM public.user_relationships ur
  WHERE ur.relationship_level = 1
  
  UNION ALL
  
  -- Level 2+: Indirect relationships
  SELECT 
    uc.user_id,
    u.recruiter_id as upline_user_id,
    uc.level + 1
  FROM upline_chains uc
  JOIN public.users u ON u.id = uc.upline_user_id
  WHERE u.recruiter_id IS NOT NULL AND uc.level < 3
)
INSERT INTO public.user_relationships (user_id, upline_user_id, relationship_level)
SELECT 
  uc.user_id,
  uc.upline_user_id,
  uc.level
FROM upline_chains uc
WHERE uc.level > 1
ON CONFLICT (user_id, upline_user_id) DO NOTHING;

-- Enable realtime for the new table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_relationships;

-- Add some sample performance data for existing users only
INSERT INTO public.user_performance (user_id, monthly_volume, monthly_loans, ytd_volume, ytd_loans, compensation, fire_fund, recruitment_tier, active_recruits, rank, month, year)
SELECT 
  u.id,
  CASE 
    WHEN u.id = '11111111-1111-1111-1111-111111111111' THEN 2800000
    WHEN u.id = '22222222-2222-2222-2222-222222222222' THEN 1800000
    ELSE 0
  END as monthly_volume,
  CASE 
    WHEN u.id = '11111111-1111-1111-1111-111111111111' THEN 28
    WHEN u.id = '22222222-2222-2222-2222-222222222222' THEN 18
    ELSE 0
  END as monthly_loans,
  CASE 
    WHEN u.id = '11111111-1111-1111-1111-111111111111' THEN 22400000
    WHEN u.id = '22222222-2222-2222-2222-222222222222' THEN 14400000
    ELSE 0
  END as ytd_volume,
  CASE 
    WHEN u.id = '11111111-1111-1111-1111-111111111111' THEN 224
    WHEN u.id = '22222222-2222-2222-2222-222222222222' THEN 144
    ELSE 0
  END as ytd_loans,
  CASE 
    WHEN u.id = '11111111-1111-1111-1111-111111111111' THEN 68000
    WHEN u.id = '22222222-2222-2222-2222-222222222222' THEN 42000
    ELSE 0
  END as compensation,
  CASE 
    WHEN u.id = '11111111-1111-1111-1111-111111111111' THEN 22500
    WHEN u.id = '22222222-2222-2222-2222-222222222222' THEN 15200
    ELSE 0
  END as fire_fund,
  CASE 
    WHEN u.id = '11111111-1111-1111-1111-111111111111' THEN 3
    WHEN u.id = '22222222-2222-2222-2222-222222222222' THEN 2
    ELSE 0
  END as recruitment_tier,
  CASE 
    WHEN u.id = '11111111-1111-1111-1111-111111111111' THEN 15
    WHEN u.id = '22222222-2222-2222-2222-222222222222' THEN 8
    ELSE 0
  END as active_recruits,
  CASE 
    WHEN u.id = '11111111-1111-1111-1111-111111111111' THEN 1
    WHEN u.id = '22222222-2222-2222-2222-222222222222' THEN 4
    ELSE 999
  END as rank,
  1 as month,
  2024 as year
FROM public.users u
WHERE u.id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (user_id, month, year) DO UPDATE SET
  monthly_volume = EXCLUDED.monthly_volume,
  monthly_loans = EXCLUDED.monthly_loans,
  ytd_volume = EXCLUDED.ytd_volume,
  ytd_loans = EXCLUDED.ytd_loans,
  compensation = EXCLUDED.compensation,
  fire_fund = EXCLUDED.fire_fund,
  recruitment_tier = EXCLUDED.recruitment_tier,
  active_recruits = EXCLUDED.active_recruits,
  rank = EXCLUDED.rank;

-- Add more sample badges for a richer experience
INSERT INTO public.badges (name, description, icon, criteria, color, rarity, requirements, reward) VALUES
('Consistency King', 'Hit targets for 6 consecutive months', '👑', 'Consistent performance', 'purple', 'rare', 'Meet or exceed targets for 6 consecutive months', 'Consistency bonus and stability recognition'),
('Speed Demon', 'Fastest loan processing time', '⚡', 'Processing speed excellence', 'yellow', 'rare', 'Achieve fastest average loan processing time in a month', 'Efficiency bonus and process improvement recognition'),
('Customer Champion', 'Highest customer satisfaction rating', '❤️', 'Customer satisfaction excellence', 'red', 'epic', 'Achieve highest customer satisfaction rating for a quarter', 'Customer service excellence bonus'),
('First Deal', 'Closed your very first loan', '🎯', 'First loan closing', 'green', 'common', 'Close your first loan successfully', 'Celebration and mentorship recognition'),
('Century Club', '100 successful loan closings', '💯', '100 loan closings', 'gold', 'epic', 'Close 100 loans successfully', 'Major milestone bonus and elite status'),
('Double Century', '200 successful loan closings', '🏆', '200 loan closings', 'gold', 'legendary', 'Close 200 loans successfully', 'Elite performer bonus and leadership track invitation'),
('Referral Master', 'Generated 25+ client referrals', '🤝', 'Referral generation', 'blue', 'epic', 'Generate 25 or more client referrals in a year', 'Referral bonus and networking recognition'),
('Problem Solver', 'Resolved 10+ complex loan issues', '🔧', 'Problem resolution', 'orange', 'epic', 'Successfully resolve 10 complex loan issues in a quarter', 'Problem-solving bonus and expert consultant status')
ON CONFLICT (name) DO NOTHING;

-- Add more user badges for existing users only
INSERT INTO public.user_badges (user_id, badge_id, count, date_obtained)
SELECT 
  u.id,
  b.id,
  1 as count,
  CASE 
    WHEN b.name = 'Consistency King' THEN '2024-01-05'::timestamp
    WHEN b.name = 'Speed Demon' THEN '2024-01-08'::timestamp
    WHEN b.name = 'First Deal' THEN '2022-07-20'::timestamp
    WHEN b.name = 'Century Club' THEN '2023-08-22'::timestamp
    WHEN b.name = 'Double Century' THEN '2024-01-12'::timestamp
    WHEN b.name = 'Referral Master' THEN '2023-11-30'::timestamp
    WHEN b.name = 'Problem Solver' THEN '2023-09-08'::timestamp
    ELSE NOW()
  END as date_obtained
FROM public.users u
CROSS JOIN public.badges b
WHERE u.id = '33333333-3333-3333-3333-333333333333'
  AND b.name IN ('Consistency King', 'Speed Demon', 'First Deal', 'Century Club', 'Double Century', 'Referral Master', 'Problem Solver')
  AND EXISTS (SELECT 1 FROM public.users WHERE id = '33333333-3333-3333-3333-333333333333')
ON CONFLICT (user_id, badge_id) DO UPDATE SET
  count = CASE WHEN EXCLUDED.badge_id = (SELECT id FROM public.badges WHERE name = 'Consistency King') THEN 2 ELSE EXCLUDED.count END,
  date_obtained = EXCLUDED.date_obtained;
