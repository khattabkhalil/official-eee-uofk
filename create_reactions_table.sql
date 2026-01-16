-- Create a table for announcement reactions
CREATE TABLE IF NOT EXISTS announcement_reactions (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL, -- 'like', 'love', 'wow', 'sad'
    count INTEGER DEFAULT 1,
    UNIQUE(announcement_id, reaction_type)
);

-- Alternatively, for per-user tracking (though we don't have user IDs for everyone, we can use local UUIDs or just simple counts)
-- For now, let's stick to simple incrementing counts to keep it easy as requested.
