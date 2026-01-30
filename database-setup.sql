-- Datenbank-Setup für das erweiterte Dashboard
-- Führe diese SQL-Befehle in der Supabase-SQL-Konsole aus

-- Tabelle: ai_status (für Status-Panel)
CREATE TABLE IF NOT EXISTS ai_status (
  id TEXT PRIMARY KEY DEFAULT 'klausi',
  state TEXT NOT NULL DEFAULT 'idle' CHECK (state IN ('idle', 'working', 'offline')),
  current_task TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialer Eintrag
INSERT INTO ai_status (id, state, current_task) 
VALUES ('klausi', 'idle', null)
ON CONFLICT (id) DO NOTHING;

-- Tabelle: activity_logs (für Aktivitäts-Log)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle: notes (für Notizen-Panel)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle: deliverables (für Deliverables-Tab)
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('report', 'document', 'spreadsheet', 'presentation', 'link')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime für alle Tabellen
ALTER PUBLICATION supabase_realtime ADD TABLE ai_status;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE deliverables;

-- RLS Policies (optional - je nach Security-Anforderungen)
-- ALTER TABLE ai_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
