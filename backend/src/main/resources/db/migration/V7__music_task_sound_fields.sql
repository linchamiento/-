ALTER TABLE music_task ADD COLUMN sound_type VARCHAR(30) NULL AFTER voice_id;
ALTER TABLE music_task ADD COLUMN sound_bpm INT NULL AFTER sound_type;
ALTER TABLE music_task ADD COLUMN sound_key VARCHAR(30) NULL AFTER sound_bpm;
ALTER TABLE music_task ADD COLUMN sound_loop TINYINT NOT NULL DEFAULT 0 AFTER sound_key;
