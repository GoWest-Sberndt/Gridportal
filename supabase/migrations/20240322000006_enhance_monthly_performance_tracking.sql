-- Enhance user_performance table for better monthly tracking
-- Add additional fields for FIRE fund tracking and improve constraints

-- Add FIRE fund contribution and receipt tracking
ALTER TABLE public.user_performance 
ADD COLUMN IF NOT EXISTS fire_fund_contribution BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS fire_fund_receipt BIGINT DEFAULT 0;

-- Handle fire_fund_balance column creation and migration
DO $$
BEGIN
    -- Check if fire_fund column exists and rename it to fire_fund_balance
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_performance' AND column_name = 'fire_fund') THEN
        -- Only rename if fire_fund_balance doesn't already exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_performance' AND column_name = 'fire_fund_balance') THEN
            ALTER TABLE public.user_performance RENAME COLUMN fire_fund TO fire_fund_balance;
        ELSE
            -- If both exist, copy data from fire_fund to fire_fund_balance and drop fire_fund
            UPDATE public.user_performance SET fire_fund_balance = COALESCE(fire_fund, 0) WHERE fire_fund_balance = 0 OR fire_fund_balance IS NULL;
            ALTER TABLE public.user_performance DROP COLUMN IF EXISTS fire_fund;
        END IF;
    ELSE
        -- Add fire_fund_balance column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_performance' AND column_name = 'fire_fund_balance') THEN
            ALTER TABLE public.user_performance ADD COLUMN fire_fund_balance BIGINT DEFAULT 0;
        END IF;
    END IF;
END $$;

-- Add helpful indexes for monthly queries
CREATE INDEX IF NOT EXISTS idx_user_performance_monthly_volume ON public.user_performance(monthly_volume DESC);
CREATE INDEX IF NOT EXISTS idx_user_performance_monthly_loans ON public.user_performance(monthly_loans DESC);
CREATE INDEX IF NOT EXISTS idx_user_performance_compensation ON public.user_performance(compensation DESC);
CREATE INDEX IF NOT EXISTS idx_user_performance_date_range ON public.user_performance(year DESC, month DESC);

-- Create a view for easy monthly performance analysis
CREATE OR REPLACE VIEW monthly_performance_summary AS
SELECT 
    up.user_id,
    u.name,
    u.email,
    u.role,
    u.avatar,
    up.month,
    up.year,
    up.monthly_volume,
    up.monthly_loans,
    up.ytd_volume,
    up.ytd_loans,
    up.compensation,
    up.fire_fund_balance,
    up.fire_fund_contribution,
    up.fire_fund_receipt,
    up.recruitment_tier,
    up.active_recruits,
    up.rank,
    up.created_at,
    up.updated_at,
    -- Calculate average loan size
    CASE 
        WHEN up.monthly_loans > 0 THEN up.monthly_volume / up.monthly_loans 
        ELSE 0 
    END as avg_loan_size,
    -- Calculate month-over-month growth (will be NULL for first month)
    LAG(up.monthly_volume) OVER (PARTITION BY up.user_id ORDER BY up.year, up.month) as prev_month_volume,
    -- Calculate percentage change
    CASE 
        WHEN LAG(up.monthly_volume) OVER (PARTITION BY up.user_id ORDER BY up.year, up.month) > 0 THEN
            ROUND(((up.monthly_volume - LAG(up.monthly_volume) OVER (PARTITION BY up.user_id ORDER BY up.year, up.month)) * 100.0 / 
                   LAG(up.monthly_volume) OVER (PARTITION BY up.user_id ORDER BY up.year, up.month)), 2)
        ELSE NULL
    END as volume_growth_percentage
FROM public.user_performance up
JOIN public.users u ON u.id = up.user_id
ORDER BY up.year DESC, up.month DESC, up.monthly_volume DESC;

-- Create a function to easily insert/update monthly performance
CREATE OR REPLACE FUNCTION upsert_monthly_performance(
    p_user_id UUID,
    p_month INTEGER,
    p_year INTEGER,
    p_monthly_volume BIGINT DEFAULT NULL,
    p_monthly_loans INTEGER DEFAULT NULL,
    p_ytd_volume BIGINT DEFAULT NULL,
    p_ytd_loans INTEGER DEFAULT NULL,
    p_compensation BIGINT DEFAULT NULL,
    p_fire_fund_balance BIGINT DEFAULT NULL,
    p_fire_fund_contribution BIGINT DEFAULT NULL,
    p_fire_fund_receipt BIGINT DEFAULT NULL,
    p_recruitment_tier INTEGER DEFAULT NULL,
    p_active_recruits INTEGER DEFAULT NULL,
    p_rank INTEGER DEFAULT NULL
) RETURNS public.user_performance AS $$
DECLARE
    result public.user_performance;
BEGIN
    INSERT INTO public.user_performance (
        user_id, month, year, monthly_volume, monthly_loans, ytd_volume, ytd_loans,
        compensation, fire_fund_balance, fire_fund_contribution, fire_fund_receipt,
        recruitment_tier, active_recruits, rank, updated_at
    ) VALUES (
        p_user_id, p_month, p_year, 
        COALESCE(p_monthly_volume, 0),
        COALESCE(p_monthly_loans, 0),
        COALESCE(p_ytd_volume, 0),
        COALESCE(p_ytd_loans, 0),
        COALESCE(p_compensation, 0),
        COALESCE(p_fire_fund_balance, 0),
        COALESCE(p_fire_fund_contribution, 0),
        COALESCE(p_fire_fund_receipt, 0),
        COALESCE(p_recruitment_tier, 0),
        COALESCE(p_active_recruits, 0),
        COALESCE(p_rank, 999),
        NOW()
    )
    ON CONFLICT (user_id, month, year) 
    DO UPDATE SET
        monthly_volume = CASE WHEN p_monthly_volume IS NOT NULL THEN p_monthly_volume ELSE user_performance.monthly_volume END,
        monthly_loans = CASE WHEN p_monthly_loans IS NOT NULL THEN p_monthly_loans ELSE user_performance.monthly_loans END,
        ytd_volume = CASE WHEN p_ytd_volume IS NOT NULL THEN p_ytd_volume ELSE user_performance.ytd_volume END,
        ytd_loans = CASE WHEN p_ytd_loans IS NOT NULL THEN p_ytd_loans ELSE user_performance.ytd_loans END,
        compensation = CASE WHEN p_compensation IS NOT NULL THEN p_compensation ELSE user_performance.compensation END,
        fire_fund_balance = CASE WHEN p_fire_fund_balance IS NOT NULL THEN p_fire_fund_balance ELSE user_performance.fire_fund_balance END,
        fire_fund_contribution = CASE WHEN p_fire_fund_contribution IS NOT NULL THEN p_fire_fund_contribution ELSE user_performance.fire_fund_contribution END,
        fire_fund_receipt = CASE WHEN p_fire_fund_receipt IS NOT NULL THEN p_fire_fund_receipt ELSE user_performance.fire_fund_receipt END,
        recruitment_tier = CASE WHEN p_recruitment_tier IS NOT NULL THEN p_recruitment_tier ELSE user_performance.recruitment_tier END,
        active_recruits = CASE WHEN p_active_recruits IS NOT NULL THEN p_active_recruits ELSE user_performance.active_recruits END,
        rank = CASE WHEN p_rank IS NOT NULL THEN p_rank ELSE user_performance.rank END,
        updated_at = NOW()
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get performance data for graphing
CREATE OR REPLACE FUNCTION get_user_performance_for_graphs(
    p_user_id UUID,
    p_start_year INTEGER DEFAULT NULL,
    p_start_month INTEGER DEFAULT NULL,
    p_end_year INTEGER DEFAULT NULL,
    p_end_month INTEGER DEFAULT NULL
) RETURNS TABLE (
    month INTEGER,
    year INTEGER,
    monthly_volume BIGINT,
    monthly_loans INTEGER,
    compensation BIGINT,
    fire_fund_contribution BIGINT,
    fire_fund_receipt BIGINT,
    fire_fund_balance BIGINT,
    avg_loan_size NUMERIC,
    volume_growth_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mps.month,
        mps.year,
        mps.monthly_volume,
        mps.monthly_loans,
        mps.compensation,
        mps.fire_fund_contribution,
        mps.fire_fund_receipt,
        mps.fire_fund_balance,
        mps.avg_loan_size,
        mps.volume_growth_percentage
    FROM monthly_performance_summary mps
    WHERE mps.user_id = p_user_id
        AND (p_start_year IS NULL OR mps.year >= p_start_year)
        AND (p_start_month IS NULL OR (mps.year > p_start_year OR mps.month >= p_start_month))
        AND (p_end_year IS NULL OR mps.year <= p_end_year)
        AND (p_end_month IS NULL OR (mps.year < p_end_year OR mps.month <= p_end_month))
    ORDER BY mps.year ASC, mps.month ASC;
END;
$$ LANGUAGE plpgsql;

-- Update existing data to use the new fire_fund_contribution field
-- Assume current fire_fund values are contributions for now
UPDATE public.user_performance 
SET fire_fund_contribution = fire_fund_balance
WHERE fire_fund_contribution = 0 AND fire_fund_balance > 0;

-- Add some sample data for different months to demonstrate the system
-- Only insert if users exist to avoid foreign key constraint violations
DO $$
BEGIN
    -- Check if the users exist before inserting performance data
    IF EXISTS (SELECT 1 FROM public.users WHERE id IN (
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444', 
        '22222222-2222-2222-2222-222222222222'
    )) THEN
        INSERT INTO public.user_performance (user_id, monthly_volume, monthly_loans, ytd_volume, ytd_loans, compensation, fire_fund_balance, fire_fund_contribution, fire_fund_receipt, recruitment_tier, active_recruits, rank, month, year)
        VALUES 
        -- December 2023 data
        ('33333333-3333-3333-3333-333333333333', 1800000, 18, 15600000, 156, 38000, 8500, 3500, 0, 2, 5, 5, 12, 2023),
        ('44444444-4444-4444-4444-444444444444', 2800000, 25, 21200000, 212, 58000, 12800, 4200, 0, 3, 10, 2, 12, 2023),
        ('22222222-2222-2222-2222-222222222222', 2200000, 22, 18400000, 184, 48000, 11200, 3800, 0, 2, 6, 4, 12, 2023),
        
        -- February 2024 data (future projections)
        ('33333333-3333-3333-3333-333333333333', 2600000, 26, 21300000, 213, 52000, 15800, 4200, 500, 2, 8, 2, 2, 2024),
        ('44444444-4444-4444-4444-444444444444', 3400000, 30, 27900000, 279, 72000, 21400, 5500, 800, 3, 14, 1, 2, 2024),
        ('22222222-2222-2222-2222-222222222222', 2900000, 29, 24200000, 242, 62000, 19000, 4800, 600, 2, 9, 3, 2, 2024)
        
        ON CONFLICT (user_id, month, year) DO UPDATE SET
            monthly_volume = EXCLUDED.monthly_volume,
            monthly_loans = EXCLUDED.monthly_loans,
            ytd_volume = EXCLUDED.ytd_volume,
            ytd_loans = EXCLUDED.ytd_loans,
            compensation = EXCLUDED.compensation,
            fire_fund_balance = EXCLUDED.fire_fund_balance,
            fire_fund_contribution = EXCLUDED.fire_fund_contribution,
            fire_fund_receipt = EXCLUDED.fire_fund_receipt,
            recruitment_tier = EXCLUDED.recruitment_tier,
            active_recruits = EXCLUDED.active_recruits,
            rank = EXCLUDED.rank,
            updated_at = NOW();
    END IF;
END $$;

-- Create system settings table if it doesn't exist (for configuration)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type TEXT DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add default settings for performance tracking
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description)
VALUES 
('performance_tracking_enabled', 'true', 'boolean', 'Enable monthly performance tracking'),
('auto_calculate_ytd', 'true', 'boolean', 'Automatically calculate YTD values when updating monthly data'),
('fire_fund_calculation_method', 'percentage', 'string', 'Method for calculating FIRE fund contributions (percentage or fixed)'),
('fire_fund_percentage', '5.0', 'number', 'Percentage of compensation contributed to FIRE fund')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable realtime for system_settings if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'system_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
    END IF;
END $$;