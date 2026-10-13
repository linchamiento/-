ALTER TABLE music_task
  ADD COLUMN source_audio_url VARCHAR(1000),
  ADD COLUMN source_title VARCHAR(160),
  ADD COLUMN audio_weight DECIMAL(5,4);
