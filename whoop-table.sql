-- Whoop Data Table
-- Stores synced Whoop recovery metrics

CREATE TABLE IF NOT EXISTS whoop_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recovery INTEGER,
  strain NUMERIC,
  hrv INTEGER,
  resting_hr INTEGER,
  sleep_hours NUMERIC,
  sleep_score INTEGER,
  calories INTEGER,
  recommendation TEXT,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE whoop_data;

-- Index for faster queries
CREATE INDEX idx_whoop_data_created_at ON whoop_data(created_at DESC);

-- RLS (optional)
-- ALTER TABLE whoop_data ENABLE ROW LEVEL SECURITY;
