-- ==============================================================================
-- Supabase Database Schema for Apple Glass Portfolio
-- ==============================================================================
-- This script creates the necessary tables to store portfolio data that 
-- can be edited via Discord bot commands and displayed on the website.
--
-- Run this SQL in your Supabase project: Dashboard → SQL Editor → New Query
-- ==============================================================================

-- Create the main portfolio card state table
-- This table stores all the dynamic data that can be edited via bot commands
CREATE TABLE portfolio_card_state (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a comment describing what goes in this table
COMMENT ON TABLE portfolio_card_state IS 'Stores portfolio configuration state including hero info, social stats, and announcements';
COMMENT ON COLUMN portfolio_card_state.id IS 'Unique identifier - typically "main" for the primary state';
COMMENT ON COLUMN portfolio_card_state.value IS 'JSON object containing CardState data';

-- Enable Row Level Security for security
ALTER TABLE portfolio_card_state ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to read the portfolio state (needed for website)
DROP POLICY IF EXISTS "Enable read access for all users" ON portfolio_card_state;
CREATE POLICY "Enable read access for all users" ON portfolio_card_state
  FOR SELECT
  USING (true);

-- Policy 2: Allow updates (auth handled via service role key in bot)
DROP POLICY IF EXISTS "Enable updates for authenticated users" ON portfolio_card_state;
CREATE POLICY "Enable updates for authenticated users" ON portfolio_card_state
  FOR UPDATE
  USING (true);

-- Policy 3: Allow inserts (for initial state)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON portfolio_card_state;
CREATE POLICY "Enable insert for authenticated users" ON portfolio_card_state
  FOR INSERT
  WITH CHECK (true);

-- Create an index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_card_state_id ON portfolio_card_state(id);

-- Insert the initial portfolio state if it doesn't exist
-- This JSON structure matches your CardState type
INSERT INTO portfolio_card_state (id, value) 
VALUES (
  'main',
  '{
    "editableWebhookUrl": "",
    "botLogsEnabled": true,
    "discordInviteUrl": "https://discord.gg",
    "discordSyncEnabled": true,
    "discordManualActivity": "",
    "twitterFollowers": "0",
    "twitterFollowing": "0",
    "twitterTweets": "0",
    "facebookAnnouncementText": "Welcome to our latest community update. Join us for new tutorials and design conversations!",
    "facebookAnnouncementDate": "July 22, 2026",
    "linkedinConnections": "19",
    "linkedinFollowers": "0",
    "linkedinRecommendations": "0",
    "linkedinHeadline": "Frontend Developer | React & Next.js Developer | Spatial Computing Enthusiast",
    "linkedinHeadlineBio": "Passionate about building modern web applications, interactive 3D experiences, and continuously learning React, Next.js, and modern web technologies.",
    "heroLocation": "KPHB, Hyderabad, Telangana",
    "heroEmail": "shivaa1906@gmail.com",
    "heroStatus": "Available",
    "botLogChannelId": "",
    "adminUserIds": [],
    "viewerCounterEnabled": true
  }'
)
ON CONFLICT (id) DO NOTHING;
-- Create the analytics visitors table used by the portfolio analytics tracker
CREATE TABLE IF NOT EXISTS portfolio_visitors (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL UNIQUE,
  first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  visit_count INTEGER NOT NULL DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE portfolio_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to visitors" ON portfolio_visitors;
CREATE POLICY "Allow public read access to visitors" ON portfolio_visitors
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert access to visitors" ON portfolio_visitors;
CREATE POLICY "Allow public insert access to visitors" ON portfolio_visitors
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to visitors" ON portfolio_visitors;
CREATE POLICY "Allow public update access to visitors" ON portfolio_visitors
  FOR UPDATE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_portfolio_visitors_visitor_id ON portfolio_visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_visitors_last_visit ON portfolio_visitors(last_visit DESC);

-- Optional: keep updated_at in sync
CREATE OR REPLACE FUNCTION set_portfolio_visitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_portfolio_visitors_updated_at ON portfolio_visitors;
CREATE TRIGGER trg_set_portfolio_visitors_updated_at
BEFORE UPDATE ON portfolio_visitors
FOR EACH ROW
EXECUTE FUNCTION set_portfolio_visitors_updated_at();
-- ==============================================================================
-- Optional: Create an audit log table to track changes
-- ==============================================================================
-- Uncomment if you want to track who changed what and when

/*
CREATE TABLE portfolio_state_history (
  id BIGSERIAL PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES portfolio_card_state(id),
  previous_value JSONB,
  new_value JSONB,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_reason TEXT
);

CREATE INDEX idx_portfolio_state_history_record_id ON portfolio_state_history(record_id);
CREATE INDEX idx_portfolio_state_history_changed_at ON portfolio_state_history(changed_at DESC);
*/

-- ==============================================================================
-- Verify the setup
-- ==============================================================================
-- You can run this query to verify everything is working:
-- SELECT * FROM portfolio_card_state WHERE id = 'main';
