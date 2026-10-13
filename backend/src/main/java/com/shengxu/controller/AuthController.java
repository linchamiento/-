package com.shengxu.controller;
import com.shengxu.dto.*; import com.shengxu.dto.AuthDtos.*; import com.shengxu.service.AuthService; import jakarta.servlet.http.*; import jakarta.validation.Valid; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/auth")
public class AuthController {private final AuthService service;public AuthController(AuthService s){service=s;}@PostMapping("/register") public ApiResponse<UserView> register(@Valid @RequestBody Register in,HttpServletResponse res){return ApiResponse.ok(service.register(in,res));}@PostMapping("/login") public ApiResponse<UserView> login(@Valid @RequestBody Login in,HttpServletResponse res){return ApiResponse.ok(service.login(in,res));}@PostMapping("/logout") public ApiResponse<Void> logout(HttpServletRequest req,HttpServletResponse res){service.logout(req,res);return ApiResponse.ok(null);}}

