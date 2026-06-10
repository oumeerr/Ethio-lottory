-- Alter users table to support phone-based authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
ALTER TABLE users ALTER COLUMN telegram_id DROP NOT NULL;

-- Ensure profiles references users in a way that supports phone-based users
-- Currently profiles references users(telegram_id). 
-- This might need to change to reference public id (UUID) eventually.

-- For now, let's add index on phone
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Function to register or login user by phone
CREATE OR REPLACE FUNCTION register_or_get_user_by_phone(p_phone TEXT, p_username TEXT)
RETURNS BIGINT AS $$
DECLARE
    u_id BIGINT;
BEGIN
    SELECT telegram_id INTO u_id FROM users WHERE phone = p_phone;
    IF u_id IS NULL THEN
        -- Create user
        INSERT INTO users (phone, username) VALUES (p_phone, p_username)
        RETURNING telegram_id INTO u_id;
        
        -- Create profile
        INSERT INTO profiles (telegram_id, username, phone) VALUES (u_id, p_username, p_phone);
    END IF;
    RETURN u_id;
END;
$$ LANGUAGE plpgsql;
