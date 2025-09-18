CREATE TABLE IF NOT EXISTS badge_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  color VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS badge_collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES badge_collections(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, badge_id)
);

ALTER TABLE badges ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES badge_collections(id);

ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS reason TEXT;

alter publication supabase_realtime add table badge_collections;
alter publication supabase_realtime add table badge_collection_items;