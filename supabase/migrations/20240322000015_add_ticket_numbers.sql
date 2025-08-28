-- Add ticket_number column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);

-- Create a function to generate unique ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
    year_suffix TEXT;
BEGIN
    -- Get current year suffix (last 2 digits)
    year_suffix := EXTRACT(year FROM NOW())::TEXT;
    year_suffix := RIGHT(year_suffix, 2);
    
    LOOP
        -- Generate ticket number in format: TKT-YY-NNNNNN (e.g., TKT-24-000001)
        new_number := 'TKT-' || year_suffix || '-' || LPAD(counter::TEXT, 6, '0');
        
        -- Check if this number already exists
        IF NOT EXISTS (SELECT 1 FROM tickets WHERE ticket_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 999999 THEN
            RAISE EXCEPTION 'Unable to generate unique ticket number';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing tickets to have ticket numbers
UPDATE tickets 
SET ticket_number = generate_ticket_number() 
WHERE ticket_number IS NULL;

-- Make ticket_number NOT NULL after updating existing records
ALTER TABLE tickets ALTER COLUMN ticket_number SET NOT NULL;

-- Create a trigger to automatically generate ticket numbers for new tickets
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();
