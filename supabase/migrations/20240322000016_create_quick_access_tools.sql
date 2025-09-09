CREATE TABLE IF NOT EXISTS quick_access_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  icon_type TEXT CHECK (icon_type IN ('icon', 'image')) DEFAULT 'icon',
  image_url TEXT,
  background_color TEXT DEFAULT '#032F60',
  is_global BOOLEAN DEFAULT false,
  is_editable BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quick_access_tools_global ON quick_access_tools(is_global);
CREATE INDEX IF NOT EXISTS idx_quick_access_tools_user ON quick_access_tools(created_by);

alter publication supabase_realtime add table quick_access_tools;