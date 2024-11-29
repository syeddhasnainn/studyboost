-- Drop existing tables if they exist
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chats;

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  chat_id TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL,
  resource_link TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  message_id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);

-- Optional: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_resource_id ON chats(resource_id);

-- Optional: Insert sample data
INSERT INTO chats (chat_id, resource_id, resource_link) 
VALUES 
  ('1', '1', 'https://pub-edfa8c3b293847d6ac8759c6e413b591.r2.dev/Muhammad%20Wajih''s%20Resume.pdf'),
  ('2', '2', 'https://pub-edfa8c3b293847d6ac8759c6e413b591.r2.dev/Muhammad%20Wajih''s%20Resume.pdf'),
  ('3', '3', 'https://pub-edfa8c3b293847d6ac8759c6e413b591.r2.dev/Muhammad%20Wajih''s%20Resume.pdf');

-- Optional: Insert sample chat messages
INSERT INTO chat_messages (chat_id, role, content)
VALUES
  ('1', 'user', 'What are some fun things to do in New York?'),
  ('1', 'assistant', 'You could go to the Empire State Building!'),
  ('1', 'user', 'That sounds fun! Where is it?');