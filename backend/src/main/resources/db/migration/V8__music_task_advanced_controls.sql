ALTER TABLE music_task
  ADD COLUMN duration INT NULL AFTER style_weight,
  ADD COLUMN variety INT NULL AFTER duration;
