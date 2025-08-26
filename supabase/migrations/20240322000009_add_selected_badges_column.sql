-- Add selected_badges column to users table to store up to 3 badge IDs for profile display
ALTER TABLE users ADD COLUMN selected_badges text[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN users.selected_badges IS 'Array of badge IDs (max 3) selected by user to display on their profile';
