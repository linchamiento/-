package com.shengxu.dto;
import jakarta.validation.constraints.*;
public final class AuthDtos {
 private AuthDtos() {}
 public record Register(@NotBlank @Size(min=2,max=40) String username,@Email @NotBlank String email,@Size(min=8,max=72) String password) {}
 public record Login(@Email @NotBlank String email,@NotBlank String password) {}
 public record UserView(Long id,String username,String email,String avatarUrl,Integer creditBalance) {}
}

