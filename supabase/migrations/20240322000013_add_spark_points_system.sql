-- Create spark_points table to track user spark points
CREATE TABLE IF NOT EXISTS public.spark_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  reference_id TEXT, -- Can reference loan ID, badge ID, etc.
  awarded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spark_point_balances table to track current user balances
CREATE TABLE IF NOT EXISTS public.spark_point_balances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  redeemed_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spark_point_rewards table for redemption options
CREATE TABLE IF NOT EXISTS public.spark_point_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT -1, -- -1 means unlimited
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spark_point_redemptions table to track redemptions
CREATE TABLE IF NOT EXISTS public.spark_point_redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES public.spark_point_rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'fulfilled', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spark_point_rules table for automatic point awarding
CREATE TABLE IF NOT EXISTS public.spark_point_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  trigger_event TEXT NOT NULL, -- 'loan_closed', 'badge_earned', 'monthly_volume', etc.
  points_awarded INTEGER NOT NULL,
  conditions JSONB, -- Flexible conditions for the rule
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spark_points_user_id ON public.spark_points(user_id);
CREATE INDEX IF NOT EXISTS idx_spark_points_category ON public.spark_points(category);
CREATE INDEX IF NOT EXISTS idx_spark_points_created_at ON public.spark_points(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spark_point_balances_user_id ON public.spark_point_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_spark_point_redemptions_user_id ON public.spark_point_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_spark_point_redemptions_status ON public.spark_point_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_spark_point_rewards_active ON public.spark_point_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_spark_point_rules_active ON public.spark_point_rules(is_active);

-- Function to update user spark point balance when points are awarded
CREATE OR REPLACE FUNCTION update_spark_point_balance()
RETURNS TRIGGER AS $
BEGIN
  -- Only process positive point awards (not deductions)
  IF NEW.points > 0 THEN
    -- Insert or update balance record
    INSERT INTO public.spark_point_balances (user_id, total_points, available_points)
    VALUES (
      NEW.user_id,
      NEW.points,
      NEW.points
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      total_points = spark_point_balances.total_points + NEW.points,
      available_points = spark_point_balances.available_points + NEW.points,
      updated_at = NOW();
  ELSE
    -- Handle point deductions (negative points)
    UPDATE public.spark_point_balances 
    SET 
      available_points = GREATEST(0, available_points + NEW.points),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Function to handle spark point redemptions
CREATE OR REPLACE FUNCTION process_spark_point_redemption()
RETURNS TRIGGER AS $
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Check if user has enough points
    IF (SELECT available_points FROM public.spark_point_balances WHERE user_id = NEW.user_id) >= NEW.points_spent THEN
      -- Update user balance
      UPDATE public.spark_point_balances 
      SET 
        available_points = available_points - NEW.points_spent,
        redeemed_points = redeemed_points + NEW.points_spent,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
      
      -- Log the redemption as a negative point entry
      INSERT INTO public.spark_points (user_id, points, reason, category, reference_id)
      VALUES (
        NEW.user_id,
        -NEW.points_spent,
        'Reward redemption: ' || (SELECT name FROM public.spark_point_rewards WHERE id = NEW.reward_id),
        'redemption',
        NEW.id::text
      );
      
      -- Update reward stock if applicable
      UPDATE public.spark_point_rewards 
      SET stock_quantity = stock_quantity - 1
      WHERE id = NEW.reward_id AND stock_quantity > 0;
    ELSE
      -- Insufficient points, cancel the redemption
      NEW.status = 'cancelled';
      NEW.notes = COALESCE(NEW.notes, '') || ' [Auto-cancelled: Insufficient points]';
    END IF;
  ELSIF NEW.status = 'cancelled' AND OLD.status = 'approved' THEN
    -- Refund points if redemption is cancelled after approval
    UPDATE public.spark_point_balances 
    SET 
      available_points = available_points + NEW.points_spent,
      redeemed_points = redeemed_points - NEW.points_spent,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Log the refund as a positive point entry
    INSERT INTO public.spark_points (user_id, points, reason, category, reference_id)
    VALUES (
      NEW.user_id,
      NEW.points_spent,
      'Redemption refund: ' || (SELECT name FROM public.spark_point_rewards WHERE id = NEW.reward_id),
      'refund',
      NEW.id::text
    );
    
    -- Restore reward stock if applicable
    UPDATE public.spark_point_rewards 
    SET stock_quantity = stock_quantity + 1
    WHERE id = NEW.reward_id AND stock_quantity >= 0;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_spark_point_balance ON public.spark_points;
CREATE TRIGGER trigger_update_spark_point_balance
  AFTER INSERT ON public.spark_points
  FOR EACH ROW
  EXECUTE FUNCTION update_spark_point_balance();

DROP TRIGGER IF EXISTS trigger_process_spark_point_redemption ON public.spark_point_redemptions;
CREATE TRIGGER trigger_process_spark_point_redemption
  AFTER INSERT OR UPDATE ON public.spark_point_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION process_spark_point_redemption();

-- Enable realtime for spark points tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.spark_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spark_point_balances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spark_point_rewards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spark_point_redemptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spark_point_rules;

-- Insert sample spark point rules
INSERT INTO public.spark_point_rules (name, description, trigger_event, points_awarded, conditions, is_active) VALUES
('Loan Closing Bonus', 'Points awarded for each loan closed', 'loan_closed', 100, '{"min_loan_amount": 100000}', true),
('Monthly Volume Milestone', 'Bonus points for reaching monthly volume targets', 'monthly_volume', 500, '{"volume_tiers": [{"threshold": 1000000, "points": 500}, {"threshold": 2000000, "points": 1000}, {"threshold": 5000000, "points": 2500}]}', true),
('Badge Achievement', 'Points for earning badges', 'badge_earned', 250, '{"badge_rarity_multiplier": {"common": 1, "rare": 2, "epic": 3, "legendary": 5}}', true),
('Referral Bonus', 'Points for successful referrals', 'referral_success', 200, '{"min_loan_amount": 150000}', true),
('Training Completion', 'Points for completing training modules', 'training_completed', 50, '{}', true),
('Perfect Month', 'Bonus for meeting all monthly targets', 'perfect_month', 1000, '{"targets": ["volume", "loans", "quality"]}', true);

-- Insert sample spark point rewards
INSERT INTO public.spark_point_rewards (name, description, cost, category, image_url, is_active, stock_quantity) VALUES
('Coffee Shop Gift Card', '$25 gift card to local coffee shop', 500, 'gift_cards', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', true, -1),
('Amazon Gift Card - $50', '$50 Amazon gift card', 1000, 'gift_cards', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80', true, -1),
('Premium Parking Spot', 'Reserved parking spot for one month', 750, 'perks', 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=80', true, 5),
('Extra PTO Day', 'One additional paid time off day', 2000, 'time_off', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', true, -1),
('Team Lunch Sponsorship', 'Sponsor lunch for your team', 1500, 'team_events', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', true, -1),
('Tech Gadget Bundle', 'Wireless charger, bluetooth speaker, and more', 3000, 'electronics', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80', true, 10),
('Professional Development Course', 'Access to premium online course of your choice', 2500, 'education', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80', true, -1),
('Wellness Package', 'Gym membership or wellness app subscription', 1800, 'wellness', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', true, -1);

-- Function to safely insert sample data only if users exist
CREATE OR REPLACE FUNCTION insert_sample_spark_points()
RETURNS VOID AS $
DECLARE
  sample_user_id UUID;
BEGIN
  -- Get any existing user ID for sample data
  SELECT id INTO sample_user_id FROM public.users LIMIT 1;
  
  -- Only insert sample data if we have at least one user
  IF sample_user_id IS NOT NULL THEN
    -- Insert sample spark points for the first user found
    INSERT INTO public.spark_points (user_id, points, reason, category, reference_id) VALUES
    (sample_user_id, 1500, 'Monthly volume milestone achieved', 'performance', 'volume_2024_01'),
    (sample_user_id, 250, 'Top Performer badge earned', 'achievement', 'badge_top_performer'),
    (sample_user_id, 800, 'Loan closing bonus (8 loans)', 'performance', 'loans_2024_01'),
    (sample_user_id, 200, 'Training completion bonus', 'learning', 'training_2024_01'),
    (sample_user_id, 150, 'Social media engagement', 'content', 'social_2024_01'),
    (sample_user_id, -500, 'Redeemed: Coffee gift card', 'redemption', 'redemption_001'),
    (sample_user_id, 300, 'Client referral bonus', 'referral', 'referral_2024_01'),
    (sample_user_id, 100, 'Weekly activity completion', 'activity', 'weekly_2024_01');
  END IF;
END;
$ LANGUAGE plpgsql;

-- Execute the sample data insertion
SELECT insert_sample_spark_points();

-- Drop the temporary function
DROP FUNCTION insert_sample_spark_points();

-- Create view for spark point leaderboard
CREATE OR REPLACE VIEW spark_point_leaderboard AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.avatar,
  u.role,
  COALESCE(spb.total_points, 0) as total_points,
  COALESCE(spb.available_points, 0) as available_points,
  COALESCE(spb.redeemed_points, 0) as redeemed_points,
  ROW_NUMBER() OVER (ORDER BY COALESCE(spb.total_points, 0) DESC) as rank
FROM public.users u
LEFT JOIN public.spark_point_balances spb ON u.id = spb.user_id
WHERE u.status = 'active'
ORDER BY total_points DESC;

-- Create function to award spark points with validation
CREATE OR REPLACE FUNCTION award_spark_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT,
  p_category TEXT DEFAULT 'general',
  p_reference_id TEXT DEFAULT NULL,
  p_awarded_by UUID DEFAULT NULL
) RETURNS public.spark_points AS $
DECLARE
  result public.spark_points;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User with ID % does not exist', p_user_id;
  END IF;
  
  -- Validate points amount
  IF p_points = 0 THEN
    RAISE EXCEPTION 'Points amount cannot be zero';
  END IF;
  
  -- Insert the spark points record (trigger will handle balance update)
  INSERT INTO public.spark_points (
    user_id, points, reason, category, reference_id, awarded_by
  ) VALUES (
    p_user_id, p_points, p_reason, p_category, p_reference_id, p_awarded_by
  ) RETURNING * INTO result;
  
  RETURN result;
END;
$ LANGUAGE plpgsql;

-- Create function to get user spark point summary with detailed logging
CREATE OR REPLACE FUNCTION get_user_spark_point_summary(p_user_id UUID)
RETURNS TABLE (
  total_points INTEGER,
  available_points INTEGER,
  redeemed_points INTEGER,
  rank INTEGER,
  recent_points JSON,
  points_this_month INTEGER,
  points_this_week INTEGER
) AS $
BEGIN
  -- Ensure user has a balance record
  INSERT INTO public.spark_point_balances (user_id, total_points, available_points, redeemed_points)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN QUERY
  SELECT 
    COALESCE(spb.total_points, 0) as total_points,
    COALESCE(spb.available_points, 0) as available_points,
    COALESCE(spb.redeemed_points, 0) as redeemed_points,
    COALESCE(spl.rank::INTEGER, 0) as rank,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', sp.id,
          'points', sp.points,
          'reason', sp.reason,
          'category', sp.category,
          'reference_id', sp.reference_id,
          'awarded_by', sp.awarded_by,
          'created_at', sp.created_at
        ) ORDER BY sp.created_at DESC
      )
      FROM public.spark_points sp 
      WHERE sp.user_id = p_user_id 
      LIMIT 20), 
      '[]'::json
    ) as recent_points,
    COALESCE(
      (SELECT SUM(sp.points)
       FROM public.spark_points sp
       WHERE sp.user_id = p_user_id 
       AND sp.points > 0
       AND sp.created_at >= date_trunc('month', CURRENT_DATE)), 
      0
    )::INTEGER as points_this_month,
    COALESCE(
      (SELECT SUM(sp.points)
       FROM public.spark_points sp
       WHERE sp.user_id = p_user_id 
       AND sp.points > 0
       AND sp.created_at >= date_trunc('week', CURRENT_DATE)), 
      0
    )::INTEGER as points_this_week
  FROM public.spark_point_balances spb
  LEFT JOIN spark_point_leaderboard spl ON spb.user_id = spl.id
  WHERE spb.user_id = p_user_id;
END;
$ LANGUAGE plpgsql;