-- Users table for core authentication and telegram mapping
CREATE TABLE users (
  telegram_id BIGINT PRIMARY KEY,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table to store user balances and Telegram details
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE REFERENCES users(telegram_id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  profile_picture_url TEXT,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT, -- Synced registration password
  balance DECIMAL(12, 2) DEFAULT 0.00,
  bonus_balance DECIMAL(12, 2) DEFAULT 0.00,
  games_played INT DEFAULT 0,
  games_won INT DEFAULT 0,
  games_won_after_deposit INT DEFAULT 0,
  has_deposited BOOLEAN DEFAULT FALSE,
  referrer_id BIGINT REFERENCES profiles(telegram_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact sharing verification
CREATE TABLE user_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction history for deposits, withdrawals, and transfers
-- ... (existing content) ...

CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  identifier TEXT NOT NULL, -- email or phone
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '5 minutes',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT REFERENCES profiles(telegram_id) ON DELETE RESTRICT,
  amount DECIMAL(12, 2),
  type TEXT CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'game_reward', 'referral_bonus')),
  status TEXT DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions for detailed history
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  winner_id BIGINT REFERENCES profiles(telegram_id),
  prize_amount DECIMAL(12, 2),
  card_id INT,
  mode TEXT,
  called_numbers INT[],
  win_numbers INT[],
  player_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Logs table
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Current Round Stakes
CREATE TABLE current_stakes (
  card_id INT PRIMARY KEY,
  user_id BIGINT REFERENCES profiles(telegram_id),
  staked_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC for incrementing balance directly
CREATE OR REPLACE FUNCTION add_balance(t_id BIGINT, amt DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET balance = balance + amt
  WHERE telegram_id = t_id;
END;
$$ LANGUAGE plpgsql;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE current_stakes;

CREATE OR REPLACE FUNCTION clear_stakes()
RETURNS void AS $$
BEGIN
  DELETE FROM current_stakes;
END;
$$ LANGUAGE plpgsql;

-- RPC for incrementing bonus
CREATE OR REPLACE FUNCTION add_bonus_to_referrer(r_id BIGINT, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET bonus_balance = bonus_balance + amount
  WHERE telegram_id = r_id;

  INSERT INTO transactions (user_id, amount, type, status)
  VALUES (r_id, amount, 'referral_bonus', 'completed');
END;
$$ LANGUAGE plpgsql;

-- DATA INTEGRITY MIGRATION (May 21, 2026) --
-- Run this block in Supabase SQL Editor if you see Foreign Key errors
/*
BEGIN;
  -- 1. Insert missing parent records into 'users' from 'profiles'
  INSERT INTO public.users (telegram_id, username, created_at)
  SELECT p.telegram_id, COALESCE(p.username, 'migrated_user_' || p.telegram_id), NOW()
  FROM public.profiles p
  LEFT JOIN public.users u ON p.telegram_id = u.telegram_id
  WHERE u.telegram_id IS NULL
  ON CONFLICT (telegram_id) DO NOTHING;

  -- 2. Clean up any orphan rows pointing to non-existent profiles
  DELETE FROM public.transactions WHERE user_id NOT IN (SELECT telegram_id FROM public.profiles);
  DELETE FROM public.current_stakes WHERE user_id NOT IN (SELECT telegram_id FROM public.profiles);
  DELETE FROM public.user_contacts WHERE user_id NOT IN (SELECT telegram_id FROM public.users);
COMMIT;
*/
