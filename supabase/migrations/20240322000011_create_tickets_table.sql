-- Create tickets table for Performance & Issues Ticketing (PIT) system
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  department VARCHAR(100),
  loan_number VARCHAR(100),
  client_name VARCHAR(255),
  attachments JSONB DEFAULT '[]'::jsonb,
  internal_notes TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

-- Create ticket comments table for communication
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ticket comments
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON ticket_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON ticket_comments(created_at);

-- Enable realtime for tickets and comments
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_comments;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at BEFORE UPDATE ON ticket_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default ticket categories and routing rules
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('pit_categories', '[
  {
    "id": "loan_processing",
    "name": "Loan Processing",
    "description": "Issues related to loan processing, underwriting, and documentation",
    "department": "Operations",
    "routing_rules": {
      "default_assignee": null,
      "escalation_hours": 24,
      "auto_assign_by_workload": true
    }
  },
  {
    "id": "technical_support",
    "name": "Technical Support",
    "description": "IT issues, software problems, system access, and technical difficulties",
    "department": "IT",
    "routing_rules": {
      "default_assignee": null,
      "escalation_hours": 4,
      "auto_assign_by_workload": true
    }
  },
  {
    "id": "compliance",
    "name": "Compliance",
    "description": "Regulatory compliance questions, audit requirements, and policy clarifications",
    "department": "Compliance",
    "routing_rules": {
      "default_assignee": null,
      "escalation_hours": 8,
      "auto_assign_by_workload": false
    }
  },
  {
    "id": "marketing",
    "name": "Marketing & Sales",
    "description": "Marketing materials, lead generation, sales support, and promotional questions",
    "department": "Marketing",
    "routing_rules": {
      "default_assignee": null,
      "escalation_hours": 48,
      "auto_assign_by_workload": true
    }
  },
  {
    "id": "hr_payroll",
    "name": "HR & Payroll",
    "description": "Human resources, payroll, benefits, and employee-related questions",
    "department": "HR",
    "routing_rules": {
      "default_assignee": null,
      "escalation_hours": 24,
      "auto_assign_by_workload": true
    }
  },
  {
    "id": "training",
    "name": "Training & Development",
    "description": "Training requests, educational resources, and professional development",
    "department": "Training",
    "routing_rules": {
      "default_assignee": null,
      "escalation_hours": 72,
      "auto_assign_by_workload": true
    }
  },
  {
    "id": "general_inquiry",
    "name": "General Inquiry",
    "description": "General questions and requests that don\'t fit other categories",
    "department": "General",
    "routing_rules": {
      "default_assignee": null,
      "escalation_hours": 48,
      "auto_assign_by_workload": true
    }
  }
]', 'json', 'PIT system ticket categories and routing configuration')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();
