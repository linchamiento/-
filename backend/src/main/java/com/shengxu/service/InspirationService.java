package com.shengxu.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.shengxu.utils.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.io.IOException;

@Service
public class InspirationService {
    private static final Logger log = LoggerFactory.getLogger(InspirationService.class);
    private static final String DEFAULT_MODEL = "suno-v6";
    private final SunoGatewayService gateway;
    private final ObjectMapper mapper;

    public InspirationService(SunoGatewayService gateway, ObjectMapper mapper) {
        this.gateway = gateway;
        this.mapper = mapper;
    }

    public Result generate(String requestedModel, boolean instrumental) {
        String model = normalizeModel(requestedModel);
        long startedAt = System.nanoTime();
        JsonNode suggestions = request("/api/prompts/suggestions", suggestionBody(model));
        long suggestionsMs = elapsedMillis(startedAt);
        JsonNode suggestionData = dataNode(suggestions);
        String sourcePrompt = firstText(suggestionData.path("prompts"));
        if (sourcePrompt == null) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "灵感接口没有返回歌曲主题");
        }

        List<String> tags = textValues(suggestionData.path("tags"));
        String originalTags = tags.isEmpty() ? sourcePrompt : sourcePrompt + ", " + String.join(", ", tags);
        ObjectNode boostBody = mapper.createObjectNode()
                .put("model", model)
                .put("originalTags", originalTags)
                .put("instrumental", instrumental)
                .put("user_guidance", guidance(instrumental));

        long boostStartedAt = System.nanoTime();
        JsonNode boosted = dataNode(request("/api/music/boost-style", boostBody));
        log.info("Suno inspiration timings suggestionsMs={} boostStyleMs={} totalMs={} model={} instrumental={}",
                suggestionsMs, elapsedMillis(boostStartedAt), elapsedMillis(startedAt), model, instrumental);
        String prompt = textValue(boosted, "upsampledStyle");
        if (prompt == null) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "风格增强接口没有返回完整歌曲描述");
        }
        return new Result(prompt, sourcePrompt, tags);
    }

    private long elapsedMillis(long startedAt) {
        return (System.nanoTime() - startedAt) / 1_000_000L;
    }

    private JsonNode request(String path, ObjectNode body) {
        try {
            ResponseEntity<byte[]> response = gateway.execute("POST", path, null, body);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new BusinessException(HttpStatus.BAD_GATEWAY, "Suno 灵感接口请求失败");
            }
            return mapper.readTree(response.getBody());
        } catch (IOException e) {
            log.warn("Suno inspiration response was not valid JSON path={} type={}", path, e.getClass().getSimpleName());
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "Suno 灵感接口返回格式异常");
        }
    }

    private ObjectNode suggestionBody(String model) {
        return mapper.createObjectNode().put("model", model);
    }

    private JsonNode dataNode(JsonNode response) {
        JsonNode data = response == null ? null : response.path("data");
        return data != null && !data.isMissingNode() && !data.isNull() ? data : response;
    }

    private String firstText(JsonNode values) {
        if (values == null || !values.isArray()) return null;
        for (JsonNode value : values) {
            if (value.isTextual() && !value.asText().isBlank()) return value.asText().trim();
        }
        return null;
    }

    private List<String> textValues(JsonNode values) {
        List<String> result = new ArrayList<>();
        if (values != null && values.isArray()) {
            for (JsonNode value : values) {
                if (value.isTextual() && !value.asText().isBlank()) result.add(value.asText().trim());
            }
        }
        return result;
    }

    private String textValue(JsonNode object, String field) {
        JsonNode value = object == null ? null : object.path(field);
        if (value == null || !value.isTextual() || value.asText().isBlank()) return null;
        return value.asText().trim();
    }

    private String guidance(boolean instrumental) {
        if (instrumental) {
            return "请用简体中文扩写为完整纯音乐歌曲描述，必须包含BPM、调性、主要乐器、主歌或主题段、高潮、层次变化和结尾处理，控制在150到300字。不要输出标题，不要解释，只输出歌曲描述。";
        }
        return "请用简体中文扩写为完整歌曲描述，必须包含BPM、调性、主要乐器、主歌、副歌、桥段或间奏、结尾编排、演唱方式和情绪变化，控制在150到300字。不要输出标题，不要解释，只输出歌曲描述。";
    }

    private String normalizeModel(String requestedModel) {
        if (requestedModel == null || requestedModel.isBlank()) return DEFAULT_MODEL;
        String model = requestedModel.trim();
        if (!List.of("suno-v6", "suno-v6-wild", "suno-v6-mini").contains(model)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "不支持的灵感模型");
        }
        return model;
    }

    public record Result(String prompt, String sourcePrompt, List<String> tags) {}
}
