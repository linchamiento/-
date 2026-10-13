ALTER TABLE music_library
  ADD COLUMN favorite TINYINT(1) NOT NULL DEFAULT 0 AFTER deleted,
  ADD COLUMN source_type VARCHAR(20) NOT NULL DEFAULT 'GENERATED' AFTER model_version;

CREATE INDEX idx_library_user_filter
  ON music_library (user_id, deleted, favorite, source_type, created_at DESC);
