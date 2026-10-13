package com.shengxu.entity;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class CreditRecord { private Long id; private Long userId; private Long taskId; private String recordType; private Integer amount; private Integer balanceAfter; private String businessNo; private String remark; private LocalDateTime createdAt; }

