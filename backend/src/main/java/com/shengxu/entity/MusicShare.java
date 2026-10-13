package com.shengxu.entity;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class MusicShare {
 private Long id; private Long musicLibraryId; private Long userId; private String token;
 private LocalDateTime expiresAt; private Integer accessCount; private LocalDateTime createdAt; private LocalDateTime lastAccessedAt;
}
