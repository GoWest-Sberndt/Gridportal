-- Add internal_role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS internal_role TEXT DEFAULT 'user' CHECK (internal_role IN ('user', 'manager', 'admin'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_internal_role ON public.users(internal_role);

-- Update existing users with appropriate internal roles
UPDATE public.users SET internal_role = 'admin' WHERE role = 'Administrator';
UPDATE public.users SET internal_role = 'manager' WHERE role IN ('Branch Manager', 'Regional Director');
UPDATE public.users SET internal_role = 'user' WHERE internal_role IS NULL OR internal_role = 'user';

-- Enable realtime for the updated table (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    END IF;
END $$;