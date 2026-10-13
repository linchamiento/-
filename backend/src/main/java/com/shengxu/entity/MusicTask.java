package com.shengxu.entity;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class MusicTask {
 private Long id; private Long userId; private String idempotencyKey; private String prompt; private String style; private String mood;
 private String vocalType; private String language; private String lyricsMode; private String inputLyrics; private String songTitle; private String negativeTags; private String modelVersion; private Integer maxMode; private Integer weirdness; private Integer styleWeight; private Integer duration; private Integer variety; private String sourceClipId; private String sourceType; private String sourceAudioUrl; private String sourceTitle; private java.math.BigDecimal audioWeight; private String voiceId; private String soundType; private Integer soundBpm; private String soundKey; private Integer soundLoop;
 private String status; private String submitStage; private Integer cost; private String providerSongIds; private String errorMessage;
 private LocalDateTime nextPollAt; private Integer pollCount; private String firstAudioUrl; private LocalDateTime createdAt; private LocalDateTime updatedAt;
}
