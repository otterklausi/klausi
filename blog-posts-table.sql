-- Blog Posts Table
-- Stores blog posts with SEO metadata and WordPress integration

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  excerpt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published')),
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT,
  featured_image TEXT,
  wordpress_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;

-- Index for faster queries
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- RLS (optional - je nach Security-Anforderungen)
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
