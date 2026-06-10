-- Add phone columns to auxiliary tables
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE current_stakes ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE game_history ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update the new phone columns from profiles table
UPDATE transactions t
SET phone = p.phone
FROM profiles p
WHERE t.user_id = p.telegram_id;

UPDATE current_stakes cs
SET phone = p.phone
FROM profiles p
WHERE cs.user_id = p.telegram_id;

UPDATE game_history gh
SET phone = p.phone
FROM profiles p
WHERE gh.winner_id = p.telegram_id;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_phone ON transactions(phone);
CREATE INDEX IF NOT EXISTS idx_current_stakes_phone ON current_stakes(phone);
CREATE INDEX IF NOT EXISTS idx_game_history_phone ON game_history(phone);
