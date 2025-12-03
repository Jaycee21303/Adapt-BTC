INSERT INTO courses (title, description, level) VALUES
  ('Bitcoin Fundamentals', 'Understand the basics of Bitcoin, wallets, and network security.', 'beginner'),
  ('Lightning Network Essentials', 'Dive into fast Bitcoin payments and channel management.', 'intermediate')
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, content, sequence) VALUES
  (1, 'What is Bitcoin?', 'Bitcoin is a decentralized digital currency enabling peer-to-peer transfers.', 1),
  (1, 'Securing Your Wallet', 'Learn how to secure seed phrases, hardware wallets, and backups.', 2),
  (2, 'Lightning Channels', 'Open and manage channels to route payments efficiently.', 1),
  (2, 'Operating a Node', 'Best practices for running a Lightning node in production.', 2)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (lesson_id, question_text, options, correct_answer) VALUES
  (1, 'Who controls Bitcoin transactions?', '["Banks", "A central company", "The decentralized network", "Governments"]', 'The decentralized network'),
  (1, 'What fixed supply cap does Bitcoin have?', '["10 million", "21 million", "50 million", "No cap"]', '21 million'),
  (2, 'Why are hardware wallets recommended?', '["They are cheaper", "They keep private keys offline", "They mine Bitcoin", "They increase interest"]', 'They keep private keys offline'),
  (3, 'What is a Lightning channel?', '["A blockchain", "A messaging app", "A two-party payment channel", "A Bitcoin mining pool"]', 'A two-party payment channel'),
  (4, 'Why monitor channel liquidity?', '["To lower taxes", "To ensure payments route reliably", "To earn staking rewards", "To validate blocks"]', 'To ensure payments route reliably')
ON CONFLICT DO NOTHING;
