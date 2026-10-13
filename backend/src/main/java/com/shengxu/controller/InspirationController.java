package com.shengxu.controller;

import com.shengxu.dto.ApiResponse;
import com.shengxu.service.InspirationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inspiration")
public class InspirationController {
    private final InspirationService inspirationService;

    public InspirationController(InspirationService inspirationService) {
        this.inspirationService = inspirationService;
    }

    @PostMapping("/generate")
    public ApiResponse<InspirationService.Result> generate(@Valid @RequestBody(required = false) Request request) {
        Request safeRequest = request == null ? new Request(null, false) : request;
        return ApiResponse.ok(inspirationService.generate(safeRequest.model(), Boolean.TRUE.equals(safeRequest.instrumental())));
    }

    public record Request(String model, Boolean instrumental) {}
}
