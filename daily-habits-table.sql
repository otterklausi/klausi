-- Daily Habits Table
-- Stores daily habit completion tracking

CREATE TABLE IF NOT EXISTS daily_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  completed JSONB DEFAULT '{}',
  streak INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE daily_habits;

-- Index for faster queries
CREATE INDEX idx_daily_habits_date ON daily_habits(date DESC);

-- RLS (optional)
-- ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;
