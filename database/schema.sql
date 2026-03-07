-- DreamPath Database Schema
-- MySQL 8.0+ / InnoDB

CREATE DATABASE IF NOT EXISTS dreampath
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE dreampath;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)     NOT NULL,
  email         VARCHAR(255)     NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  role          ENUM('student','superadmin') NOT NULL DEFAULT 'student',
  grade         TINYINT UNSIGNED DEFAULT NULL,
  stream        ENUM('science','commerce','arts','undecided') DEFAULT 'undecided',
  goal_intensity ENUM('casual','serious','highly-focused') DEFAULT 'serious',
  streak        INT UNSIGNED     NOT NULL DEFAULT 0,
  total_points  INT UNSIGNED     NOT NULL DEFAULT 0,
  is_active     TINYINT(1)       NOT NULL DEFAULT 1,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- USER  INTERESTS / HOBBIES / SKILLS  (M:N via pivot tables)
-- ============================================================
CREATE TABLE user_interests (
  id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name    VARCHAR(100)    NOT NULL,
  UNIQUE KEY uk_user_interest (user_id, name),
  CONSTRAINT fk_ui_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE user_hobbies (
  id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name    VARCHAR(100)    NOT NULL,
  UNIQUE KEY uk_user_hobby (user_id, name),
  CONSTRAINT fk_uh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE user_skills (
  id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name    VARCHAR(100)    NOT NULL,
  UNIQUE KEY uk_user_skill (user_id, name),
  CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- CAREERS
-- ============================================================
CREATE TABLE careers (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug             VARCHAR(100)   NOT NULL,
  title            VARCHAR(200)   NOT NULL,
  category         VARCHAR(100)   NOT NULL,
  description      TEXT           NOT NULL,
  daily_life       TEXT           NOT NULL,
  academic_path    JSON           NOT NULL,
  entrance_exams   JSON           NOT NULL,
  college_types    JSON           NOT NULL,
  competition      ENUM('low','medium','high','very-high') NOT NULL DEFAULT 'medium',
  difficulty       ENUM('low','medium','high','very-high') NOT NULL DEFAULT 'medium',
  backup_options   JSON           NOT NULL,
  study_duration   VARCHAR(200)   NOT NULL,
  growth_potential ENUM('low','medium','high','very-high') NOT NULL DEFAULT 'medium',
  risk_level       ENUM('low','medium','high')             NOT NULL DEFAULT 'medium',
  average_salary   VARCHAR(100)   NOT NULL,
  lifestyle        TEXT           NOT NULL,
  image            VARCHAR(500)   DEFAULT NULL,
  created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE career_skills (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  career_id BIGINT UNSIGNED NOT NULL,
  name      VARCHAR(100)    NOT NULL,
  UNIQUE KEY uk_career_skill (career_id, name),
  CONSTRAINT fk_cs_career FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- ROADMAPS  &  MILESTONES
-- ============================================================
CREATE TABLE roadmaps (
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
  CONSTRAINT fk_rm_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  CONSTRAINT fk_rm_career FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
  KEY idx_rm_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE milestones (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  roadmap_id  BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(200)    NOT NULL,
  description TEXT            DEFAULT NULL,
  due_date    DATE            NOT NULL,
  completed   TINYINT(1)      NOT NULL DEFAULT 0,
  sort_order  INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ms_roadmap FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
  KEY idx_ms_roadmap (roadmap_id)
) ENGINE=InnoDB;

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE tasks (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  milestone_id  BIGINT UNSIGNED DEFAULT NULL,
  title         VARCHAR(300)    NOT NULL,
  description   TEXT            DEFAULT NULL,
  category      ENUM('study','skill','research','self-improvement') NOT NULL DEFAULT 'study',
  priority      ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  due_date      DATE            DEFAULT NULL,
  completed     TINYINT(1)      NOT NULL DEFAULT 0,
  completed_at  DATETIME        DEFAULT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_t_user      FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_t_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL,
  KEY idx_t_user      (user_id),
  KEY idx_t_due       (due_date),
  KEY idx_t_user_comp (user_id, completed)
) ENGINE=InnoDB;

-- ============================================================
-- RESOURCES
-- ============================================================
CREATE TABLE resources (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(300)   NOT NULL,
  type        ENUM('article','video','exam-guide','skill-link') NOT NULL,
  url         VARCHAR(500)   NOT NULL,
  description TEXT           DEFAULT NULL,
  career_id   BIGINT UNSIGNED DEFAULT NULL,
  thumbnail   VARCHAR(500)   DEFAULT NULL,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_r_career FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL,
  KEY idx_r_career (career_id)
) ENGINE=InnoDB;

-- ============================================================
-- COMMUNITY  (Posts, Comments, Likes)
-- ============================================================
CREATE TABLE posts (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  content    TEXT            NOT NULL,
  tags       JSON            DEFAULT NULL,
  likes      INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_p_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_p_user (user_id),
  KEY idx_p_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE post_likes (
  id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_like (post_id, user_id),
  CONSTRAINT fk_pl_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_pl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comments (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id    BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  content    TEXT            NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_c_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_c_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_c_post (post_id)
) ENGINE=InnoDB;

-- ============================================================
-- BADGES  &  USER BADGES
-- ============================================================
CREATE TABLE badges (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)   NOT NULL,
  description VARCHAR(300)   NOT NULL,
  icon        VARCHAR(50)    NOT NULL,
  UNIQUE KEY uk_badge_name (name)
) ENGINE=InnoDB;

CREATE TABLE user_badges (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id   BIGINT UNSIGNED NOT NULL,
  badge_id  BIGINT UNSIGNED NOT NULL,
  unlocked_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_badge (user_id, badge_id),
  CONSTRAINT fk_ub_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- CHAT MESSAGES (AI conversation history)
-- ============================================================
CREATE TABLE chat_messages (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  role       ENUM('user','assistant') NOT NULL,
  content    TEXT            NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_cm_user (user_id),
  KEY idx_cm_user_time (user_id, created_at)
) ENGINE=InnoDB;

-- ============================================================
-- NOTIFICATIONS & FCM TOKENS
-- ============================================================
CREATE TABLE notifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sent_by    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(200)    NOT NULL,
  body       TEXT            NOT NULL,
  target     ENUM('all','selected') NOT NULL DEFAULT 'all',
  target_ids JSON            DEFAULT NULL,
  sent_count INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_n_user FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE fcm_tokens (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  token      VARCHAR(500)    NOT NULL,
  device     VARCHAR(100)    DEFAULT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_token (token),
  CONSTRAINT fk_ft_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_ft_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- USER NOTIFICATION PREFERENCES
-- ============================================================
CREATE TABLE user_notification_prefs (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  daily_reminders     TINYINT(1) NOT NULL DEFAULT 1,
  missed_task_alerts  TINYINT(1) NOT NULL DEFAULT 1,
  motivation_nudges   TINYINT(1) NOT NULL DEFAULT 1,
  exam_countdown      TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_user_notif (user_id),
  CONSTRAINT fk_unp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- STREAKS (daily tracking)
-- ============================================================
CREATE TABLE streaks (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  date       DATE            NOT NULL,
  completed  TINYINT(1)      NOT NULL DEFAULT 0,
  UNIQUE KEY uk_streak (user_id, date),
  CONSTRAINT fk_s_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
