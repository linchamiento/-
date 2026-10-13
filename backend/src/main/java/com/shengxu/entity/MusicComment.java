package com.shengxu.entity;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class MusicComment {
 private Long id; private Long musicLibraryId; private Long userId; private String content;
 private LocalDateTime createdAt; private LocalDateTime updatedAt;
}
