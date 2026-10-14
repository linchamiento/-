package com.shengxu.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.shengxu.utils.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Locale;
import java.util.Set;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SunoGatewayService {
    private static final Logger log = LoggerFactory.getLogger(SunoGatewayService.class);
    private static final Set<String> HOP_BY_HOP_HEADERS = Set.of(
            "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailer", "transfer-encoding", "upgrade", "content-length"
    );
    private final RestClient client;
    private final String apiKey;
    private final SunoOperationCatalog catalog;

    public SunoGatewayService(RestClient.Builder builder,
                              @Value("${app.suno.base-url}") String baseUrl,
                              @Value("${app.suno.api-key}") String apiKey,
                              SunoOperationCatalog catalog) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(90));
        this.client = builder.requestFactory(requestFactory).baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.catalog = catalog;
    }

    public boolean configured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public ResponseEntity<byte[]> execute(String method, String path, Map<String, String> query, JsonNode body) {
        catalog.resolve(method, path);
        return send(method, path, query, body == null ? null : body.toString(), MediaType.APPLICATION_JSON);
    }

    public ResponseEntity<byte[]> executeMultipart(String method, String path, Map<String, String> query,
                                                    Map<String, String> fields, MultipartFile file) {
        SunoOperationCatalog.Rule rule = catalog.resolve(method, path);
        if (!rule.multipart()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "该接口不需要 multipart 请求");
        }
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        if (fields != null) fields.forEach(form::add);
        if (file != null && !file.isEmpty()) {
            try {
                ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                    @Override public String getFilename() { return file.getOriginalFilename(); }
                };
                form.add("file", resource);
            } catch (Exception e) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "上传文件读取失败");
            }
        }
        return send(method, path, query, form, MediaType.MULTIPART_FORM_DATA);
    }

    private ResponseEntity<byte[]> send(String method, String path, Map<String, String> query, Object body, MediaType contentType) {
        if (!configured()) throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE, "Suno API Key 尚未配置");
        URI uri = UriComponentsBuilder.fromPath(path).queryParams(toQuery(query)).build().toUri();
        try {
            RestClient.RequestBodySpec request = client.method(HttpMethod.valueOf(method)).uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
            if (body == null) {
                return sanitizeResponse(request.retrieve().toEntity(byte[].class));
            }
            return sanitizeResponse(request.contentType(contentType).body(body).retrieve().toEntity(byte[].class));
        } catch (RestClientException e) {
            log.warn("Suno request failed method={} path={} type={} message={}",
                    method, path, e.getClass().getSimpleName(), e.getMessage());
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "Suno API 请求失败，请稍后重试");
        }
    }

    private ResponseEntity<byte[]> sanitizeResponse(ResponseEntity<byte[]> upstream) {
        HttpHeaders safeHeaders = new HttpHeaders();
        upstream.getHeaders().forEach((name, values) -> {
            if (isSafeResponseHeader(name)) safeHeaders.put(name, values);
        });
        return new ResponseEntity<>(upstream.getBody(), safeHeaders, upstream.getStatusCode());
    }

    private boolean isSafeResponseHeader(String name) {
        if (name == null || name.isBlank() || name.charAt(0) == ':') return false;
        String lower = name.toLowerCase(Locale.ROOT);
        if (HOP_BY_HOP_HEADERS.contains(lower)) return false;
        return name.chars().allMatch(ch -> ch > 32 && ch < 127 && ch != ':');
    }

    private org.springframework.util.MultiValueMap<String, String> toQuery(Map<String, String> query) {
        org.springframework.util.LinkedMultiValueMap<String, String> result = new org.springframework.util.LinkedMultiValueMap<>();
        if (query != null) query.forEach(result::add);
        return result;
    }
}
