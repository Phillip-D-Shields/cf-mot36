-- 4. Links Directory Table
-- Stores categorized URLs for brigade resources.
DROP TABLE IF EXISTS links;
CREATE TABLE links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('request', 'training', 'feedback', 'defect', 'welfare')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster filtering by category on the frontend
CREATE INDEX idx_links_category ON links(category);