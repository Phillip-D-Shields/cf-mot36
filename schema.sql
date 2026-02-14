-- 1. Quizzes Table
-- Stores the metadata for each certification test.
DROP TABLE IF EXISTS quizzes;
CREATE TABLE quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    reference_url TEXT,
    pass_threshold INTEGER DEFAULT 80, -- Percentage (e.g. 80)
    is_active INTEGER DEFAULT 1,       -- 1 = Active, 0 = Archived
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Questions Table
-- Linked to a quiz. 'options' and 'correct_answer' will store JSON strings.
DROP TABLE IF EXISTS questions;
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK(question_type IN ('true_false', 'single_choice', 'multi_choice')),
    options TEXT NOT NULL,       -- Example JSON: '[{"id":"a", "text":"Yes"}, {"id":"b", "text":"No"}]'
    correct_answer TEXT NOT NULL,-- Example JSON: '["a"]' or just "a"
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 3. Submissions Table
-- Records every attempt a volunteer makes.
DROP TABLE IF EXISTS submissions;
CREATE TABLE submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    volunteer_name TEXT NOT NULL,
    brigade_id TEXT,             -- Optional: Badge number/ID for better tracking
    score INTEGER NOT NULL,      -- The final percentage score
    passed INTEGER NOT NULL,     -- 1 = Pass, 0 = Fail
    answers_log TEXT,            -- Optional: JSON log of what they answered (for audit)
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Indexes for faster searching
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_submissions_volunteer ON submissions(volunteer_name);
CREATE INDEX idx_submissions_quiz ON submissions(quiz_id);