-- Fix tickets table to ensure proper references and constraints

-- Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS tickets DROP CONSTRAINT IF EXISTS tickets_user_id_fkey;
ALTER TABLE IF EXISTS tickets DROP CONSTRAINT IF EXISTS tickets_assigned_to_fkey;
ALTER TABLE IF EXISTS tickets DROP CONSTRAINT IF EXISTS tickets_resolved_by_fkey;
ALTER TABLE IF EXISTS ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_user_id_fkey;

-- Recreate the tickets table with proper references
DROP TABLE IF EXISTS ticket_comments;
DROP TABLE IF EXISTS tickets;

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  loan_number TEXT,
  client_name TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  department TEXT,
  internal_notes TEXT,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);

-- Enable realtime
alter publication supabase_realtime add table tickets;
alter publication supabase_realtime add table ticket_comments;

-- Insert some sample data for testing
INSERT INTO tickets (title, description, category, priority, status, user_id, assigned_to)
SELECT 
  'Sample Ticket - Loan Processing Issue',
  'This is a sample ticket to test the ticketing system. The loan processing workflow seems to have an issue with document verification.',
  'loan_processing',
  'medium',
  'open',
  u1.id,
  u2.id
FROM 
  (SELECT id FROM users LIMIT 1) u1,
  (SELECT id FROM users OFFSET 1 LIMIT 1) u2
WHERE EXISTS (SELECT 1 FROM users)
ON CONFLICT DO NOTHING;

INSERT INTO tickets (title, description, category, priority, status, user_id)
SELECT 
  'Sample Ticket - Technical Support',
  'Unable to access the dashboard. Getting authentication errors when trying to log in.',
  'technical_support',
  'high',
  'open',
  u.id
FROM 
  (SELECT id FROM users LIMIT 1) u
WHERE EXISTS (SELECT 1 FROM users)
ON CONFLICT DO NOTHING;