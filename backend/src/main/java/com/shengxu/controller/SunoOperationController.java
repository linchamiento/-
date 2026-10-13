package com.shengxu.controller;

import com.shengxu.dto.ApiResponse;
import com.shengxu.dto.SunoDtos.ExecuteRequest;
import com.shengxu.dto.SunoDtos.OperationView;
import com.shengxu.service.SunoGatewayService;
import com.shengxu.service.SunoOperationCatalog;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/suno")
public class SunoOperationController {
    private final SunoGatewayService gateway;
    private final SunoOperationCatalog catalog;

    public SunoOperationController(SunoGatewayService gateway, SunoOperationCatalog catalog) {
        this.gateway = gateway;
        this.catalog = catalog;
    }

    @GetMapping("/operations")
    public ApiResponse<List<OperationView>> operations(Authentication authentication) {
        return ApiResponse.ok(catalog.views());
    }

    @PostMapping("/execute")
    public ResponseEntity<byte[]> execute(Authentication authentication, @Valid @RequestBody ExecuteRequest request) {
        return gateway.execute(request.method(), request.path(), request.query(), request.body());
    }

    @PostMapping(value = "/execute-multipart", consumes = "multipart/form-data")
    public ResponseEntity<byte[]> executeMultipart(Authentication authentication,
                                                    @RequestParam String method,
                                                    @RequestParam String path,
                                                    @RequestParam(required = false) MultipartFile file,
                                                    @RequestParam(required = false) Map<String, String> params) {
        return gateway.executeMultipart(method, path, Map.of(), params, file);
    }
}
