CREATE TABLE `user` (
  id BIGINT PRIMARY KEY,
  username VARCHAR(40) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uk_user_username (username),
  UNIQUE KEY uk_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_credit (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  balance INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 0,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uk_user_credit_user (user_id),
  CONSTRAINT fk_credit_user FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE music_task (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  idempotency_key VARCHAR(64) NOT NULL,
  prompt VARCHAR(2000) NOT NULL,
  style VARCHAR(80) NOT NULL,
  mood VARCHAR(40) NOT NULL,
  vocal_type VARCHAR(30) NOT NULL,
  language VARCHAR(20),
  lyrics_mode VARCHAR(20) NOT NULL,
  input_lyrics TEXT,
  song_title VARCHAR(120),
  status VARCHAR(30) NOT NULL,
  submit_stage VARCHAR(30) NOT NULL,
  cost INT NOT NULL,
  provider_song_ids VARCHAR(1000),
  error_message VARCHAR(1000),
  next_poll_at DATETIME(3),
  poll_count INT NOT NULL DEFAULT 0,
  first_audio_url VARCHAR(1000),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uk_task_idempotency (user_id, idempotency_key),
  KEY idx_task_user_created (user_id, created_at DESC),
  KEY idx_task_schedule (status, next_poll_at),
  CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE credit_record (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  task_id BIGINT,
  record_type VARCHAR(20) NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  business_no VARCHAR(100) NOT NULL,
  remark VARCHAR(200),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uk_credit_business_no (business_no),
  KEY idx_credit_user_created (user_id, created_at DESC),
  CONSTRAINT fk_record_user FOREIGN KEY (user_id) REFERENCES `user`(id),
  CONSTRAINT fk_record_task FOREIGN KEY (task_id) REFERENCES music_task(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE music_library (
  id BIGINT PRIMARY KEY,
  task_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  provider_song_id VARCHAR(150) NOT NULL,
  status VARCHAR(30) NOT NULL,
  title VARCHAR(160),
  audio_url VARCHAR(1000),
  cover_url VARCHAR(1000),
  lyrics MEDIUMTEXT,
  style_tags VARCHAR(1000),
  duration DECIMAL(10,3),
  model_version VARCHAR(40),
  error_message VARCHAR(1000),
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uk_library_provider_song (provider_song_id),
  KEY idx_library_user_created (user_id, deleted, created_at DESC),
  CONSTRAINT fk_library_task FOREIGN KEY (task_id) REFERENCES music_task(id),
  CONSTRAINT fk_library_user FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
