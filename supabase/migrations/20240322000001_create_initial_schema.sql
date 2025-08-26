-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Loan Officer',
  avatar TEXT,
  nmls_number TEXT,
  client_facing_title TEXT,
  recruiter_id UUID REFERENCES public.users(id),
  recruiter_type TEXT CHECK (recruiter_type IN ('user', 'company')) DEFAULT 'company',
  recruiter_name TEXT,
  monthly_loan_volume BIGINT DEFAULT 0,
  is_producing BOOLEAN DEFAULT false,
  phone TEXT,
  department TEXT,
  status TEXT DEFAULT 'active',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT CHECK (type IN ('article', 'video')) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published', 'scheduled')) DEFAULT 'draft',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  author TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  thumbnail TEXT,
  estimated_read_time TEXT,
  duration TEXT,
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT,
  criteria TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  requirements TEXT,
  reward TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 1,
  date_obtained TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create ads table
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  target_url TEXT,
  category TEXT,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'inactive',
  clicks INTEGER DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_content table
CREATE TABLE IF NOT EXISTS public.learning_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('video', 'document')) NOT NULL,
  category TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  duration TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  day TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market_data table
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  umbs_30yr_5 DECIMAL(10,2),
  umbs_30yr_5_change DECIMAL(10,3),
  umbs_30yr_5_positive BOOLEAN,
  umbs_30yr_55 DECIMAL(10,2),
  umbs_30yr_55_change DECIMAL(10,3),
  umbs_30yr_55_positive BOOLEAN,
  umbs_30yr_6 DECIMAL(10,2),
  umbs_30yr_6_change DECIMAL(10,3),
  umbs_30yr_6_positive BOOLEAN,
  treasury_10yr DECIMAL(10,3),
  treasury_10yr_change DECIMAL(10,3),
  treasury_10yr_positive BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_performance table
CREATE TABLE IF NOT EXISTS public.user_performance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  monthly_volume BIGINT DEFAULT 0,
  monthly_loans INTEGER DEFAULT 0,
  ytd_volume BIGINT DEFAULT 0,
  ytd_loans INTEGER DEFAULT 0,
  compensation BIGINT DEFAULT 0,
  fire_fund BIGINT DEFAULT 0,
  recruitment_tier INTEGER DEFAULT 0,
  active_recruits INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.news;
ALTER PUBLICATION supabase_realtime ADD TABLE public.badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_content;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_performance;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_recruiter_id ON public.users(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_featured ON public.news(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_performance_user_id ON public.user_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_performance_month_year ON public.user_performance(month, year);

-- Insert sample data

-- Insert sample users
INSERT INTO public.users (id, name, email, role, avatar, nmls_number, client_facing_title, recruiter_type, recruiter_name, monthly_loan_volume, is_producing, phone, department, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Emily Rodriguez', 'emily@safire.com', 'Regional Director', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', '456789', 'Regional Director', 'company', 'Safire Direct', 2800000, true, '+1 (555) 456-7890', 'Management', 'active'),
('22222222-2222-2222-2222-222222222222', 'Michael Chen', 'michael@safire.com', 'Branch Manager', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', '345678', 'Branch Manager - West', 'user', 'Emily Rodriguez', 1800000, true, '+1 (555) 345-6789', 'Management', 'active'),
('33333333-3333-3333-3333-333333333333', 'Jimmy Hendrix', 'jimmy@safire.com', 'Senior Loan Officer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', '123456', 'Senior Mortgage Advisor', 'user', 'Michael Chen', 2100000, true, '+1 (555) 123-4567', 'Lending', 'active'),
('44444444-4444-4444-4444-444444444444', 'Sarah Johnson', 'sarah@safire.com', 'Senior Loan Officer', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face', '234567', 'Senior Mortgage Consultant', 'user', 'Michael Chen', 1200000, true, '+1 (555) 234-5678', 'Lending', 'active'),
('55555555-5555-5555-5555-555555555555', 'Admin User', 'admin@safire.com', 'Administrator', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', '999999', 'System Administrator', 'company', 'Safire Direct', 0, false, '+1 (555) 999-9999', 'IT', 'active');

-- Update recruiter_id references
UPDATE public.users SET recruiter_id = '11111111-1111-1111-1111-111111111111' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.users SET recruiter_id = '22222222-2222-2222-2222-222222222222' WHERE id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

-- Insert sample news
INSERT INTO public.news (title, content, category, type, status, priority, author, tags, views, likes, comments, is_featured, thumbnail, estimated_read_time, duration) VALUES
('Federal Reserve Announces New Interest Rate Policy Changes', 'The Federal Reserve has announced significant changes to interest rate policies that will impact mortgage lending across the nation. These changes are expected to...', 'Market Updates', 'article', 'published', 'high', 'Sarah Johnson', '{"Federal Reserve", "Interest Rates", "Policy"}', 1250, 89, 23, true, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', '5 min read', null),
('Weekly Market Analysis: What Loan Officers Need to Know', 'Join our senior analyst as he breaks down this week''s market trends and what they mean for your lending business.', 'Educational', 'video', 'published', 'medium', 'Michael Chen', '{"Market Analysis", "Education", "Weekly Update"}', 2100, 156, 34, false, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80', null, '12:45'),
('New FHA Guidelines: What Changed and How It Affects You', 'The FHA has updated their lending guidelines with several key changes that will impact how you process loans. Here''s everything you need to know...', 'Industry News', 'article', 'published', 'high', 'Jennifer Martinez', '{"FHA", "Guidelines", "Lending"}', 890, 67, 18, false, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80', '7 min read', null);

-- Insert sample badges
INSERT INTO public.badges (name, description, icon, criteria, color, rarity, requirements, reward) VALUES
('Top Performer', 'Awarded to top 10% performers monthly', '🏆', 'Top 10% monthly volume', 'gold', 'legendary', 'Finish in top 3 for monthly volume', 'Special recognition and bonus points'),
('Volume Champion', 'Exceeded $5M in monthly volume', '💰', 'Generate over $5M in loan volume', 'blue', 'epic', 'Generate over $5M in loan volume in a single month', 'Volume bonus and recognition'),
('Team Leader', 'Led a team to quarterly success', '👥', 'Lead successful team', 'purple', 'rare', 'Lead a team that exceeds quarterly targets', 'Leadership recognition and team bonus'),
('Rookie of the Year', 'Outstanding performance in first year', '⭐', 'Exceptional first year performance', 'green', 'epic', 'Exceptional performance within first 12 months', 'Special recognition and career advancement opportunities');

-- Insert sample user badges
INSERT INTO public.user_badges (user_id, badge_id, count, date_obtained) VALUES
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.badges WHERE name = 'Top Performer'), 3, '2024-01-15'),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.badges WHERE name = 'Volume Champion'), 1, '2024-01-10'),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM public.badges WHERE name = 'Team Leader'), 1, '2024-01-08');

-- Insert sample ads
INSERT INTO public.ads (name, description, url, target_url, category, status, clicks) VALUES
('UWM Rate & Term 90 Out Now!', 'Promotional banner for UWM Rate & Term 90 program', 'https://storage.googleapis.com/tempo-image-previews/github%7C198421472-1755233157082-Screenshot%202025-08-14%20at%2010.45.53%E2%80%AFPM.png', '/uwm-rate-term-90', 'Product Launch', 'active', 2150),
('Q1 Promotion Banner', 'General Q1 promotional content', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80', '/q1-promotion', 'Seasonal', 'inactive', 1250),
('Spring Campaign', 'Spring marketing campaign banner', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80', '/spring-campaign', 'Seasonal', 'inactive', 890);

-- Insert sample learning content
INSERT INTO public.learning_content (title, type, category, status, views, duration) VALUES
('Mortgage Basics 101', 'video', 'Training', 'published', 245, '15:30'),
('FHA Loan Guidelines', 'document', 'Guidelines', 'published', 189, null),
('Advanced Underwriting Techniques', 'video', 'Training', 'published', 2100, '18:45');

-- Insert sample tasks
INSERT INTO public.tasks (user_id, title, description, day, date, time) VALUES
('33333333-3333-3333-3333-333333333333', 'Client Meeting', 'Meeting with potential borrower', 'TUE', '28', '10:00 AM'),
('33333333-3333-3333-3333-333333333333', 'Rate Review', 'Weekly rate analysis meeting', 'WED', '29', '2:00 PM'),
('33333333-3333-3333-3333-333333333333', 'Document Review', 'Review loan documentation', 'THU', '30', '11:00 AM');

-- Insert sample market data
INSERT INTO public.market_data (umbs_30yr_5, umbs_30yr_5_change, umbs_30yr_5_positive, umbs_30yr_55, umbs_30yr_55_change, umbs_30yr_55_positive, umbs_30yr_6, umbs_30yr_6_change, umbs_30yr_6_positive, treasury_10yr, treasury_10yr_change, treasury_10yr_positive) VALUES
(99.85, -0.02, false, 100.01, 0.03, true, 100.25, 0.05, true, 4.236, -0.003, false);

-- Insert sample user performance data
INSERT INTO public.user_performance (user_id, monthly_volume, monthly_loans, ytd_volume, ytd_loans, compensation, fire_fund, recruitment_tier, active_recruits, rank, month, year) VALUES
('33333333-3333-3333-3333-333333333333', 2400000, 24, 18700000, 187, 45000, 12500, 2, 7, 3, 1, 2024),
('44444444-4444-4444-4444-444444444444', 3200000, 28, 24500000, 245, 62000, 18200, 3, 12, 1, 1, 2024),
('22222222-2222-2222-2222-222222222222', 2700000, 27, 21300000, 213, 54000, 15800, 2, 8, 2, 1, 2024);