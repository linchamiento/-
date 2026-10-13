package com.shengxu.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

public final class SunoDtos {
    private SunoDtos() {}

    public record ExecuteRequest(
            @NotBlank String method,
            @NotBlank @Size(max = 300) String path,
            Map<String, String> query,
            JsonNode body
    ) {}

    public record OperationView(String method, String path, String category, boolean multipart, boolean paid) {}
}
