const { query, insert } = require('./src/lib/db');

(async () => {
  try {
    // 1. Create career_roadmap_items (unified tasks + milestones)
    await query(`CREATE TABLE IF NOT EXISTS career_roadmap_items (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      career_id BIGINT UNSIGNED NOT NULL,
      type ENUM('task','milestone') NOT NULL DEFAULT 'task',
      title VARCHAR(300) NOT NULL,
      description TEXT DEFAULT NULL,
      category VARCHAR(30) NOT NULL DEFAULT 'study',
      priority VARCHAR(10) NOT NULL DEFAULT 'medium',
      passing_score TINYINT UNSIGNED NOT NULL DEFAULT 50,
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
      KEY idx_cri_career (career_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    console.log('career_roadmap_items table created');

    // 2. Create quiz_questions (MCQ per milestone)
    await query(`CREATE TABLE IF NOT EXISTS quiz_questions (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      item_id BIGINT UNSIGNED NOT NULL,
      question TEXT NOT NULL,
      options LONGTEXT NOT NULL,
      correct_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES career_roadmap_items(id) ON DELETE CASCADE,
      KEY idx_qq_item (item_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    console.log('quiz_questions table created');

    // 3. Create quiz_attempts (user quiz results)
    await query(`CREATE TABLE IF NOT EXISTS quiz_attempts (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      roadmap_id BIGINT UNSIGNED NOT NULL,
      item_id BIGINT UNSIGNED NOT NULL,
      score TINYINT UNSIGNED NOT NULL DEFAULT 0,
      total_questions INT UNSIGNED NOT NULL DEFAULT 0,
      passed TINYINT(1) NOT NULL DEFAULT 0,
      answers LONGTEXT DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES career_roadmap_items(id) ON DELETE CASCADE,
      KEY idx_qa_user (user_id),
      KEY idx_qa_roadmap (roadmap_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    console.log('quiz_attempts table created');

    // 4. Add item_id column to milestones table (links user milestone → career_roadmap_items)
    try {
      await query(`ALTER TABLE milestones ADD COLUMN item_id BIGINT UNSIGNED DEFAULT NULL`);
      console.log('Added item_id column to milestones table');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('(item_id column already exists on milestones, skipping)');
      } else {
        throw e;
      }
    }

    // 5. Migrate existing career_default_tasks -> career_roadmap_items
    try {
      const existing = await query('SELECT * FROM career_default_tasks ORDER BY career_id, sort_order');
      if (existing.length > 0) {
        for (const t of existing) {
          await insert(
            `INSERT INTO career_roadmap_items (career_id, type, title, description, category, priority, sort_order)
             VALUES (?, 'task', ?, ?, ?, ?, ?)`,
            [t.career_id, t.title, t.description, t.category, t.priority, t.sort_order]
          );
        }
        console.log(`Migrated ${existing.length} tasks from career_default_tasks`);
      } else {
        console.log('(no existing career_default_tasks to migrate)');
      }
    } catch (e) {
      console.log('(career_default_tasks table not found, skipping migration)');
    }

    console.log('All migrations complete!');
  } catch (err) {
    console.error('Migration error:', err);
  }
  process.exit(0);
})();
