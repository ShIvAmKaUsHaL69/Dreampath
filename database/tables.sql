-- DreamPath Tables for MariaDB 10.4
-- Use LONGTEXT instead of JSON for MariaDB 10.4 compatibility

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)     NOT NULL,
  email         VARCHAR(255)     NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  role          ENUM('student','superadmin') NOT NULL DEFAULT 'student',
  grade         TINYINT UNSIGNED DEFAULT NULL,
  stream        VARCHAR(20)      DEFAULT 'undecided',
  goal_intensity VARCHAR(20)     DEFAULT 'serious',
  streak        INT UNSIGNED     NOT NULL DEFAULT 0,
  total_points  INT UNSIGNED     NOT NULL DEFAULT 0,
  is_active     TINYINT(1)       NOT NULL DEFAULT 1,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_interests (
  id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name    VARCHAR(100)    NOT NULL,
  UNIQUE KEY uk_user_interest (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_hobbies (
  id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name    VARCHAR(100)    NOT NULL,
  UNIQUE KEY uk_user_hobby (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_skills (
  id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name    VARCHAR(100)    NOT NULL,
  UNIQUE KEY uk_user_skill (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS careers (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug             VARCHAR(100)   NOT NULL,
  title            VARCHAR(200)   NOT NULL,
  category         VARCHAR(100)   NOT NULL,
  description      TEXT           NOT NULL,
  daily_life       TEXT           NOT NULL,
  academic_path    LONGTEXT       NOT NULL,
  entrance_exams   LONGTEXT       NOT NULL,
  college_types    LONGTEXT       NOT NULL,
  competition      VARCHAR(20)    NOT NULL DEFAULT 'medium',
  difficulty       VARCHAR(20)    NOT NULL DEFAULT 'medium',
  backup_options   LONGTEXT       NOT NULL,
  study_duration   VARCHAR(200)   NOT NULL,
  growth_potential VARCHAR(20)    NOT NULL DEFAULT 'medium',
  risk_level       VARCHAR(20)    NOT NULL DEFAULT 'medium',
  average_salary   VARCHAR(100)   NOT NULL,
  lifestyle        TEXT           NOT NULL,
  image            VARCHAR(500)   DEFAULT NULL,
  created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS career_skills (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  career_id BIGINT UNSIGNED NOT NULL,
  name      VARCHAR(100)    NOT NULL,
  UNIQUE KEY uk_career_skill (career_id, name),
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS roadmaps (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  career_id   BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(200)    NOT NULL,
  description TEXT            DEFAULT NULL,
  start_date  DATE            NOT NULL,
  end_date    DATE            NOT NULL,
  progress    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
  KEY idx_rm_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS milestones (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  roadmap_id  BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(200)    NOT NULL,
  description TEXT            DEFAULT NULL,
  due_date    DATE            NOT NULL,
  completed   TINYINT(1)      NOT NULL DEFAULT 0,
  sort_order  INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
  KEY idx_ms_roadmap (roadmap_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tasks (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  milestone_id  BIGINT UNSIGNED DEFAULT NULL,
  title         VARCHAR(300)    NOT NULL,
  description   TEXT            DEFAULT NULL,
  category      VARCHAR(30)     NOT NULL DEFAULT 'study',
  priority      VARCHAR(10)     NOT NULL DEFAULT 'medium',
  due_date      DATE            DEFAULT NULL,
  completed     TINYINT(1)      NOT NULL DEFAULT 0,
  completed_at  DATETIME        DEFAULT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL,
  KEY idx_t_user      (user_id),
  KEY idx_t_due       (due_date),
  KEY idx_t_user_comp (user_id, completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS resources (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(300)   NOT NULL,
  type        VARCHAR(20)    NOT NULL,
  url         VARCHAR(500)   NOT NULL,
  description TEXT           DEFAULT NULL,
  career_id   BIGINT UNSIGNED DEFAULT NULL,
  thumbnail   VARCHAR(500)   DEFAULT NULL,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL,
  KEY idx_r_career (career_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS posts (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  content    TEXT            NOT NULL,
  tags       LONGTEXT        DEFAULT NULL,
  likes      INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_p_user (user_id),
  KEY idx_p_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS post_likes (
  id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comments (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id    BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  content    TEXT            NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_c_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS badges (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)   NOT NULL,
  description VARCHAR(300)   NOT NULL,
  icon        VARCHAR(50)    NOT NULL,
  UNIQUE KEY uk_badge_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_badges (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id   BIGINT UNSIGNED NOT NULL,
  badge_id  BIGINT UNSIGNED NOT NULL,
  unlocked_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_badge (user_id, badge_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chat_messages (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  role       VARCHAR(20)     NOT NULL,
  content    TEXT            NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_cm_user (user_id),
  KEY idx_cm_user_time (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sent_by    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(200)    NOT NULL,
  body       TEXT            NOT NULL,
  target     VARCHAR(20)     NOT NULL DEFAULT 'all',
  target_ids LONGTEXT        DEFAULT NULL,
  sent_count INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  token      VARCHAR(500)    NOT NULL,
  device     VARCHAR(100)    DEFAULT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_token (token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_ft_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_notification_prefs (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  daily_reminders     TINYINT(1) NOT NULL DEFAULT 1,
  missed_task_alerts  TINYINT(1) NOT NULL DEFAULT 1,
  motivation_nudges   TINYINT(1) NOT NULL DEFAULT 1,
  exam_countdown      TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_user_notif (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS streaks (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  date       DATE            NOT NULL,
  completed  TINYINT(1)      NOT NULL DEFAULT 0,
  UNIQUE KEY uk_streak (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
