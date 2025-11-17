-- Add new columns for bid increment, reserve price, and squad rules

-- Add reserve_price to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS reserve_price DECIMAL(15, 2);

-- Add bid_increment to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS bid_increment DECIMAL(15, 2) DEFAULT 10000;

-- Add squad_rules to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS squad_rules JSONB;

-- Update existing tournament with sample squad rules
UPDATE tournaments 
SET squad_rules = '{"Batsman": {"min": 3, "max": 6}, "Bowler": {"min": 3, "max": 6}, "All-rounder": {"min": 2, "max": 4}, "Wicket-keeper": {"min": 1, "max": 2}}'::jsonb
WHERE id = 1 AND squad_rules IS NULL;

-- Update existing players with reserve prices
UPDATE players SET reserve_price = base_price * 1.25 WHERE reserve_price IS NULL;
