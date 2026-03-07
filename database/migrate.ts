// Database migration script for DreamPath
// Run with: npx tsx database/migrate.ts
import mysql from 'mysql2/promise';

async function migrate() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    multipleStatements: true,
  });

  console.log('Connected to MySQL. Creating database and tables...');

  // Create database
  await conn.query('CREATE DATABASE IF NOT EXISTS dreampath CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
  await conn.query('USE dreampath');

  // Drop all tables first (clean slate)
  await conn.query('SET FOREIGN_KEY_CHECKS=0');
  const allTables = ['streaks','user_notification_prefs','fcm_tokens','notifications','chat_messages','user_badges','badges','comments','post_likes','posts','resources','tasks','milestones','roadmaps','career_skills','careers','user_skills','user_hobbies','user_interests','users'];
  for (const t of allTables) {
    await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS=1');
  console.log('Dropped existing tables.');

  // Create tables one by one
  const tableStatements = [
    `CREATE TABLE users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'student',
      grade TINYINT UNSIGNED DEFAULT NULL,
      stream VARCHAR(20) DEFAULT 'undecided',
      goal_intensity VARCHAR(20) DEFAULT 'serious',
      streak INT UNSIGNED NOT NULL DEFAULT 0,
      total_points INT UNSIGNED NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE user_interests (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      name VARCHAR(100) NOT NULL,
      UNIQUE KEY uk_user_interest (user_id, name),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE user_hobbies (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      name VARCHAR(100) NOT NULL,
      UNIQUE KEY uk_user_hobby (user_id, name),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE user_skills (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      name VARCHAR(100) NOT NULL,
      UNIQUE KEY uk_user_skill (user_id, name),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE careers (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) NOT NULL,
      title VARCHAR(200) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      daily_life TEXT NOT NULL,
      academic_path LONGTEXT NOT NULL,
      entrance_exams LONGTEXT NOT NULL,
      college_types LONGTEXT NOT NULL,
      competition VARCHAR(20) NOT NULL DEFAULT 'medium',
      difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
      backup_options LONGTEXT NOT NULL,
      study_duration VARCHAR(200) NOT NULL,
      growth_potential VARCHAR(20) NOT NULL DEFAULT 'medium',
      risk_level VARCHAR(20) NOT NULL DEFAULT 'medium',
      average_salary VARCHAR(100) NOT NULL,
      lifestyle TEXT NOT NULL,
      image VARCHAR(500) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE career_skills (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      career_id BIGINT UNSIGNED NOT NULL,
      name VARCHAR(100) NOT NULL,
      UNIQUE KEY uk_career_skill (career_id, name),
      FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE roadmaps (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      career_id BIGINT UNSIGNED NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT DEFAULT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
      KEY idx_rm_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE milestones (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      roadmap_id BIGINT UNSIGNED NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT DEFAULT NULL,
      due_date DATE NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
      KEY idx_ms_roadmap (roadmap_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE tasks (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      milestone_id BIGINT UNSIGNED DEFAULT NULL,
      title VARCHAR(300) NOT NULL,
      description TEXT DEFAULT NULL,
      category VARCHAR(30) NOT NULL DEFAULT 'study',
      priority VARCHAR(10) NOT NULL DEFAULT 'medium',
      due_date DATE DEFAULT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      completed_at DATETIME DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL,
      KEY idx_t_user (user_id),
      KEY idx_t_due (due_date),
      KEY idx_t_user_comp (user_id, completed)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE resources (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(300) NOT NULL,
      type VARCHAR(20) NOT NULL,
      url VARCHAR(500) NOT NULL,
      description TEXT DEFAULT NULL,
      career_id BIGINT UNSIGNED DEFAULT NULL,
      thumbnail VARCHAR(500) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL,
      KEY idx_r_career (career_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE posts (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      tags LONGTEXT DEFAULT NULL,
      likes INT UNSIGNED NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      KEY idx_p_user (user_id),
      KEY idx_p_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE post_likes (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      post_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_like (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE comments (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      post_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      KEY idx_c_post (post_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE badges (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description VARCHAR(300) NOT NULL,
      icon VARCHAR(50) NOT NULL,
      UNIQUE KEY uk_badge_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE user_badges (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      badge_id BIGINT UNSIGNED NOT NULL,
      unlocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_user_badge (user_id, badge_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE chat_messages (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      role VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      KEY idx_cm_user (user_id),
      KEY idx_cm_user_time (user_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE notifications (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      sent_by BIGINT UNSIGNED NOT NULL,
      title VARCHAR(200) NOT NULL,
      body TEXT NOT NULL,
      target VARCHAR(20) NOT NULL DEFAULT 'all',
      target_ids LONGTEXT DEFAULT NULL,
      sent_count INT UNSIGNED NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE fcm_tokens (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      token VARCHAR(500) NOT NULL,
      device VARCHAR(100) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_token (token),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      KEY idx_ft_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE user_notification_prefs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      daily_reminders TINYINT(1) NOT NULL DEFAULT 1,
      missed_task_alerts TINYINT(1) NOT NULL DEFAULT 1,
      motivation_nudges TINYINT(1) NOT NULL DEFAULT 1,
      exam_countdown TINYINT(1) NOT NULL DEFAULT 1,
      UNIQUE KEY uk_user_notif (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE streaks (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      date DATE NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      UNIQUE KEY uk_streak (user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const stmt of tableStatements) {
    const tableName = stmt.match(/CREATE TABLE (\w+)/)?.[1];
    try {
      await conn.query(stmt);
      console.log(`  ✓ Created table: ${tableName}`);
    } catch (err: any) {
      console.error(`  ✗ Failed to create table: ${tableName}`, err.message);
    }
  }

  // Seed data
  console.log('\nSeeding data...');

  // SuperAdmin (password: Admin@123)
  const bcrypt = await import('bcryptjs');
  const adminHash = await bcrypt.hash('Admin@123', 10);
  await conn.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'superadmin')`,
    ['Super Admin', 'admin@dreampath.com', adminHash]
  );
  console.log('  ✓ SuperAdmin created (admin@dreampath.com / Admin@123)');

  // Badges
  await conn.query(`INSERT INTO badges (name, description, icon) VALUES
    ('First Step', 'Completed your first task', '🎯'),
    ('Week Warrior', '7 day streak achieved', '🔥'),
    ('Skill Builder', 'Completed 10 skill tasks', '💪'),
    ('Month Master', '30 day streak achieved', '🏆'),
    ('Roadmap Champion', 'Completed a full roadmap', '🗺️'),
    ('Research Pro', 'Completed 20 research tasks', '🔍'),
    ('Community Star', 'Received 50 likes on posts', '⭐'),
    ('Knowledge Seeker', 'Accessed 50 resources', '📚')`);
  console.log('  ✓ 8 badges seeded');

  // Careers
  const careers = [
    { slug: 'software-engineer', title: 'Software Engineer', category: 'Technology', description: 'Design, develop, and maintain software applications and systems.', daily_life: 'Writing code, team meetings, reviewing PRs, debugging.', academic_path: '["Class 10 with Science & Math","Class 12 with PCM","B.Tech/B.E. in CS","Optional: M.Tech/MS"]', entrance_exams: '["JEE Main","JEE Advanced","BITSAT","State CETs"]', college_types: '["IITs","NITs","IIITs","Private Engg Colleges","State Universities"]', competition: 'very-high', difficulty: 'high', backup_options: '["Data Analyst","IT Support","Technical Writer","QA Engineer"]', study_duration: '4 years (B.Tech) + Optional 2 years (M.Tech)', growth_potential: 'very-high', risk_level: 'low', average_salary: '₹6-25 LPA', lifestyle: 'Desk job, flexible hours, remote work options', image: '/careers/software-engineer.jpg', skills: ['Programming','Problem Solving','Logical Thinking','Mathematics','Communication','Teamwork'] },
    { slug: 'doctor', title: 'Doctor (MBBS)', category: 'Healthcare', description: 'Diagnose and treat illnesses, injuries, and other health conditions.', daily_life: 'Long hours in hospitals, patient consultations, surgeries.', academic_path: '["Class 10 with Science","Class 12 with PCB","MBBS (5.5 years)","MD/MS (3 years)"]', entrance_exams: '["NEET-UG","AIIMS","JIPMER"]', college_types: '["AIIMS","Govt Medical Colleges","Private Medical Colleges"]', competition: 'very-high', difficulty: 'very-high', backup_options: '["Pharmacist","Medical Lab Technician","Healthcare Admin","Medical Writer"]', study_duration: '5.5 years (MBBS) + 3 years (Specialization)', growth_potential: 'high', risk_level: 'medium', average_salary: '₹8-50 LPA', lifestyle: 'Demanding schedule, high responsibility, rewarding', image: '/careers/doctor.jpg', skills: ['Biology','Chemistry','Empathy','Communication','Decision Making','Patience'] },
    { slug: 'chartered-accountant', title: 'Chartered Accountant', category: 'Finance', description: 'Handle financial accounts, auditing, taxation, and advisory.', daily_life: 'Financial data analysis, client meetings, tax planning, auditing.', academic_path: '["Class 12 (Any)","CA Foundation","CA Intermediate","CA Final","Articleship"]', entrance_exams: '["CA Foundation","CA Intermediate","CA Final"]', college_types: '["ICAI Coaching Centers","Self Study","Online"]', competition: 'very-high', difficulty: 'very-high', backup_options: '["Company Secretary","Cost Accountant","Financial Analyst","Tax Consultant"]', study_duration: '4-5 years', growth_potential: 'high', risk_level: 'low', average_salary: '₹7-30 LPA', lifestyle: 'Busy during audit/tax seasons, good WLB otherwise', image: '/careers/ca.jpg', skills: ['Mathematics','Analytical Thinking','Attention to Detail','Communication','Ethics','Time Management'] },
    { slug: 'lawyer', title: 'Lawyer/Advocate', category: 'Law', description: 'Represent clients in legal matters and argue cases in court.', daily_life: 'Court appearances, client meetings, legal research, drafting.', academic_path: '["Class 12 (Any)","5-year Integrated LLB or 3-year LLB","Optional: LLM"]', entrance_exams: '["CLAT","AILET","LSAT India","State Law Exams"]', college_types: '["NLUs","Govt Law Colleges","Private Law Schools"]', competition: 'high', difficulty: 'high', backup_options: '["Legal Advisor","Paralegal","Legal Writer","Compliance Officer"]', study_duration: '5 years (Integrated LLB) or 3 years', growth_potential: 'high', risk_level: 'medium', average_salary: '₹5-50 LPA', lifestyle: 'Irregular hours, court visits, intellectually stimulating', image: '/careers/lawyer.jpg', skills: ['Critical Thinking','Communication','Research','Writing','Analytical Skills','Persuasion'] },
    { slug: 'architect', title: 'Architect', category: 'Design & Construction', description: 'Design buildings and structures that are functional and aesthetic.', daily_life: 'Creating designs, site visits, coordinating with engineers.', academic_path: '["Class 10 with Math","Class 12 with PCM","B.Arch (5 years)","Optional: M.Arch"]', entrance_exams: '["NATA","JEE Main Paper 2","State Architecture Exams"]', college_types: '["IITs","NITs","SPA","Private Architecture Colleges"]', competition: 'high', difficulty: 'high', backup_options: '["Interior Designer","Urban Planner","3D Visualizer","Construction Manager"]', study_duration: '5 years (B.Arch) + Optional 2 years', growth_potential: 'medium', risk_level: 'medium', average_salary: '₹4-20 LPA', lifestyle: 'Creative work, site visits, deadline pressure', image: '/careers/architect.jpg', skills: ['Creativity','Mathematics','Physics','Drawing','Spatial Visualization','Communication'] },
    { slug: 'data-scientist', title: 'Data Scientist', category: 'Technology', description: 'Analyze complex data sets to help organizations make decisions.', daily_life: 'Analyzing datasets, building ML models, presenting insights.', academic_path: '["Class 12 with PCM","B.Tech/B.Sc in CS/Stats","M.Tech/MS in Data Science"]', entrance_exams: '["JEE Main","University Exams","GATE"]', college_types: '["IITs","IISc","ISI","NITs","Online Programs"]', competition: 'high', difficulty: 'high', backup_options: '["Data Analyst","Business Analyst","ML Engineer","Statistician"]', study_duration: '4 years + Optional 2 years', growth_potential: 'very-high', risk_level: 'low', average_salary: '₹8-40 LPA', lifestyle: 'Desk job, analytical, continuous learning', image: '/careers/data-scientist.jpg', skills: ['Statistics','Programming (Python/R)','Machine Learning','Mathematics','Communication','Critical Thinking'] },
    { slug: 'civil-services', title: 'Civil Services (IAS/IPS/IFS)', category: 'Government', description: 'Serve the nation in administrative, police, or foreign service roles.', daily_life: 'Administrative work, field visits, policy implementation.', academic_path: '["Class 12 (Any)","Graduation (any)","UPSC Prep (1-3 years)"]', entrance_exams: '["UPSC Civil Services (Prelims, Mains, Interview)"]', college_types: '["Any recognized university","UPSC Coaching (Optional)"]', competition: 'very-high', difficulty: 'very-high', backup_options: '["State Civil Services","Public Sector","Banking","Teaching"]', study_duration: '3-4 years grad + 1-3 years prep', growth_potential: 'very-high', risk_level: 'high', average_salary: '₹10-25 LPA + Perks', lifestyle: 'Transfers, high responsibility, prestigious', image: '/careers/civil-services.jpg', skills: ['General Knowledge','Analytical Skills','Leadership','Communication','Decision Making','Ethics'] },
    { slug: 'graphic-designer', title: 'Graphic Designer', category: 'Creative Arts', description: 'Create visual content for brands, websites, and media.', daily_life: 'Creating designs, client meetings, staying updated with trends.', academic_path: '["Class 12 (Any)","Bachelor in Design/Fine Arts","Certifications","Portfolio"]', entrance_exams: '["NID","NIFT","UCEED","College-specific tests"]', college_types: '["NID","NIFT","Private Design Institutes","Online"]', competition: 'medium', difficulty: 'medium', backup_options: '["UI/UX Designer","Illustrator","Art Director","Brand Designer"]', study_duration: '3-4 years', growth_potential: 'medium', risk_level: 'medium', average_salary: '₹3-15 LPA', lifestyle: 'Creative work, deadlines, freelance options', image: '/careers/graphic-designer.jpg', skills: ['Creativity','Design Software','Color Theory','Typography','Communication','Time Management'] },
  ];

  for (const c of careers) {
    const [result] = await conn.query<mysql.ResultSetHeader>(
      `INSERT INTO careers (slug,title,category,description,daily_life,academic_path,entrance_exams,college_types,competition,difficulty,backup_options,study_duration,growth_potential,risk_level,average_salary,lifestyle,image) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [c.slug, c.title, c.category, c.description, c.daily_life, c.academic_path, c.entrance_exams, c.college_types, c.competition, c.difficulty, c.backup_options, c.study_duration, c.growth_potential, c.risk_level, c.average_salary, c.lifestyle, c.image]
    );
    const careerId = result.insertId;
    for (const skill of c.skills) {
      await conn.query(`INSERT INTO career_skills (career_id, name) VALUES (?, ?)`, [careerId, skill]);
    }
  }
  console.log('  ✓ 8 careers + skills seeded');

  // Resources
  await conn.query(`INSERT INTO resources (title, type, url, description, career_id, thumbnail) VALUES
    ('Introduction to Python Programming', 'video', 'https://example.com/python-intro', 'Comprehensive Python intro for beginners', 1, '/resources/python.jpg'),
    ('JEE Main Preparation Guide', 'exam-guide', 'https://example.com/jee-guide', 'Complete guide for JEE Main preparation', NULL, '/resources/jee.jpg'),
    ('Data Structures and Algorithms', 'article', 'https://example.com/dsa', 'Learn DSA concepts with examples', 1, '/resources/dsa.jpg'),
    ('Mathematics for Computer Science', 'skill-link', 'https://example.com/math-cs', 'Essential math concepts for CS students', 1, '/resources/math.jpg')`);
  console.log('  ✓ 4 resources seeded');

  // Verify
  const [tableCount] = await conn.query<mysql.RowDataPacket[]>("SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema='dreampath'");
  console.log(`\n✅ Migration complete! ${tableCount[0].cnt} tables created.`);

  await conn.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
