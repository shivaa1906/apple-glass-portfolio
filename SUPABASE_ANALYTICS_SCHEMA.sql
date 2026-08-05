-- ==============================================================================
-- Supabase Analytics Schema for Apple Glass Portfolio
-- ==============================================================================
-- Run this in Supabase SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS portfolio_visitors (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL UNIQUE,
  first_visit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visit_count INTEGER NOT NULL DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portfolio_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to visitors" ON portfolio_visitors
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to visitors" ON portfolio_visitors
  FOR INSERT
  WITH CHECK (true);

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

-- Verification
-- SELECT visitor_id, visit_count, data FROM portfolio_visitors ORDER BY last_visit DESC LIMIT 10;
