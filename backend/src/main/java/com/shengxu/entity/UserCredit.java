package com.shengxu.entity;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class UserCredit { private Long id; private Long userId; private Integer balance; private Integer version; private LocalDateTime updatedAt; }

