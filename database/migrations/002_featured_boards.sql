-- Create featured_boards table
CREATE TABLE IF NOT EXISTS featured_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL CHECK (display_order BETWEEN 1 AND 4),
  cover_image_url TEXT,
  custom_title TEXT,
  custom_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on display_order to ensure no duplicates
CREATE UNIQUE INDEX idx_featured_boards_display_order ON featured_boards(display_order);

-- Add index on board_id for faster lookups
CREATE INDEX idx_featured_boards_board_id ON featured_boards(board_id);

-- Add trigger for updated_at
CREATE TRIGGER update_featured_boards_updated_at 
  BEFORE UPDATE ON featured_boards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure boards are public when featured
CREATE OR REPLACE FUNCTION ensure_featured_board_is_public()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the board to be public if it's not already
  UPDATE boards 
  SET is_shared = true
  WHERE id = NEW.board_id AND is_shared = false;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_featured_board_public
  BEFORE INSERT OR UPDATE OF board_id ON featured_boards
  FOR EACH ROW
  EXECUTE FUNCTION ensure_featured_board_is_public(); 