CREATE TABLE music_comment (
  id BIGINT PRIMARY KEY,
  music_library_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content VARCHAR(1000) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_comment_library FOREIGN KEY (music_library_id) REFERENCES music_library(id),
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES `user`(id),
  KEY idx_comment_library_created (music_library_id, created_at DESC),
  KEY idx_comment_user_created (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE music_share (
  id BIGINT PRIMARY KEY,
  music_library_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  token VARCHAR(80) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  access_count INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_accessed_at DATETIME(3),
  CONSTRAINT fk_share_library FOREIGN KEY (music_library_id) REFERENCES music_library(id),
  CONSTRAINT fk_share_user FOREIGN KEY (user_id) REFERENCES `user`(id),
  UNIQUE KEY uk_share_token (token),
  KEY idx_share_library_created (music_library_id, created_at DESC),
  KEY idx_share_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
