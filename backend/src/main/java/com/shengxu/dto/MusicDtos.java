package com.shengxu.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal; import java.time.LocalDateTime; import java.util.List;
public final class MusicDtos {
 private MusicDtos() {}
 public record CreateTask(@NotBlank @Size(max=2000) String prompt,@NotBlank @Size(max=1000) String style,String mood,@NotBlank String vocalType,String language,@NotBlank String lyricsMode,@Size(max=10000) String lyrics,@Size(max=120) String songTitle,@Size(max=1000) String negativeTags,@Size(max=40) String model,@Min(0) @Max(100) Integer weirdness,@Min(0) @Max(100) Integer styleWeight,@Min(1) @Max(480) Integer duration,@Min(0) @Max(4) Integer variety,@Size(max=150) String sourceClipId,@Size(max=20) String sourceType,Boolean maxMode,@Size(max=1000) String sourceAudioUrl,@Size(max=160) String sourceTitle,@DecimalMin("0.0") @DecimalMax("1.0") BigDecimal audioWeight,@Size(max=120) String voiceId,@Size(max=30) String soundType,@Min(1) @Max(240) Integer soundBpm,@Size(max=30) String soundKey,Boolean soundLoop) {}
 public record TaskView(Long id,String prompt,String style,String mood,String vocalType,String language,String lyricsMode,String songTitle,String status,String submitStage,String errorMessage,String negativeTags,String modelVersion,Boolean maxMode,Integer weirdness,Integer styleWeight,Integer duration,Integer variety,String sourceClipId,String sourceType,String sourceAudioUrl,String sourceTitle,BigDecimal audioWeight,String voiceId,String soundType,Integer soundBpm,String soundKey,Boolean soundLoop,LocalDateTime createdAt,List<TrackView> tracks) {}
 public record TrackView(Long id,Long taskId,String providerSongId,String title,String status,String audioUrl,String coverUrl,String lyrics,String styleTags,BigDecimal duration,String modelVersion,String sourceType,Boolean favorite,LocalDateTime createdAt) {}
 public record FavoriteRequest(@NotNull Boolean favorite) {}
 public record CommentRequest(@NotBlank @Size(max=1000) String content) {}
 public record CommentView(Long id,Long trackId,Long userId,String username,String content,LocalDateTime createdAt,Boolean canDelete) {}
 public record ShareView(String token,LocalDateTime expiresAt) {}
 public record SharedTrackView(Long id,String title,String username,String audioUrl,String coverUrl,String styleTags,BigDecimal duration,String modelVersion,LocalDateTime createdAt) {}
 public record PageView<T>(List<T> items,long total,long page,long pageSize) {}
 public record CreditView(Integer balance) {}
 public record CreditRecordView(Long id,String recordType,Integer amount,Integer balanceAfter,String remark,LocalDateTime createdAt) {}
}
