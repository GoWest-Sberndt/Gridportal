-- Create system_settings table for configurable settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default auto-logout timeout setting (30 minutes)
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('auto_logout_timeout_minutes', '30', 'number', 'Auto-logout timeout in minutes for user inactivity')
ON CONFLICT (setting_key) DO NOTHING;

-- Add session_timeout_minutes column to users table for per-user overrides
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER;

-- Create index for system settings
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);

-- Enable realtime for system_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;

-- Add some additional useful system settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('session_warning_minutes', '5', 'number', 'Minutes before logout to show warning dialog'),
('max_concurrent_sessions', '3', 'number', 'Maximum concurrent sessions per user'),
('password_expiry_days', '90', 'number', 'Days before password expires'),
('login_attempt_limit', '5', 'number', 'Maximum failed login attempts before lockout')
ON CONFLICT (setting_key) DO NOTHING;
