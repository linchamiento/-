package com.shengxu.entity;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
public class MusicLibrary {
 private Long id; private Long taskId; private Long userId; private String providerSongId; private String status; private String title;
 private String audioUrl; private String coverUrl; private String lyrics; private String styleTags; private BigDecimal duration;
 private String modelVersion; private String sourceType; private String errorMessage; @TableLogic private Integer deleted; private Integer favorite; private LocalDateTime createdAt; private LocalDateTime updatedAt;
}
