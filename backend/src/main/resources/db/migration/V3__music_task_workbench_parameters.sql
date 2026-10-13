ALTER TABLE music_task
  ADD COLUMN negative_tags VARCHAR(1000),
  ADD COLUMN model_version VARCHAR(40),
  ADD COLUMN max_mode TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN weirdness INT NOT NULL DEFAULT 50,
  ADD COLUMN style_weight INT NOT NULL DEFAULT 70,
  ADD COLUMN source_clip_id VARCHAR(150),
  ADD COLUMN source_type VARCHAR(20) NOT NULL DEFAULT 'GENERATED';

CREATE INDEX idx_task_source_type ON music_task (user_id, source_type, created_at DESC);
