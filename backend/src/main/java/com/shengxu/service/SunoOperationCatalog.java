package com.shengxu.service;

import com.shengxu.dto.SunoDtos.OperationView;
import com.shengxu.utils.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Component
public class SunoOperationCatalog {
    public record Rule(String methods, Pattern path, String displayPath, String category, boolean multipart, boolean paid) {}

    private final List<Rule> rules = List.of(
            r("GET", "/api/user/balance", "账户", false, false),
            r("POST", "/api/music/create", "创作", false, true),
            r("POST", "/api/music/create/custom", "创作", false, true),
            r("GET", "/api/music/requests/[^/]+", "创作", false, false),
            r("POST", "/api/music/sounds", "声音", false, true),
            r("POST", "/api/lyrics/generate", "歌词", false, false),
            r("POST", "/api/lyrics/timeline", "歌词", false, false),
            r("POST", "/api/music/voice-profile/create", "音色", true, false),
            r("POST", "/api/music/voice-profile/create-from-clip", "音色", false, false),
            r("POST", "/api/music/voice-profile/cover", "音色", false, true),
            r("GET|POST", "/api/music/voice-profile/list", "音色", false, false),
            r("GET", "/api/music/voice-profile/[^/]+", "音色", false, false),
            r("POST", "/api/music/voice-profile/delete", "音色", false, false),
            r("POST", "/api/voice/clone/validate", "旧版音色", false, false),
            r("GET", "/api/voice/clone/tasks/[^/]+", "旧版音色", false, false),
            r("POST", "/api/voice/clone/tasks/[^/]+/(regenerate|generate|check)", "旧版音色", false, true),
            r("DELETE", "/api/voice/clone/voices/[^/]+", "旧版音色", false, false),
            r("POST", "/api/create-ui/voice/clone-long-term", "旧版音色", true, false),
            r("POST", "/api/create-ui/voice/tasks/[^/]+/auto-generate-verify", "旧版音色", false, false),
            r("POST", "/api/create-ui/voice/validate-internal", "旧版音色", false, false),
            r("GET", "/api/create-ui/context", "工作台", false, false),
            r("GET", "/api/create-ui/customer-ledger", "工作台", false, false),
            r("POST", "/api/create-ui/feedback", "工作台", false, false),
            r("POST", "/api/create-ui/payment-diagnostics", "工作台", false, false),
            r("GET", "/api/create-ui/site-context", "工作台", false, false),
            r("POST", "/api/create-ui/music/generate", "工作台", false, true),
            r("POST", "/api/create-ui/music/generate-with-voice", "工作台", false, true),
            r("GET|POST|DELETE", "/api/create-ui/music", "工作台", false, false),
            r("POST", "/api/create-ui/music/delete", "工作台", false, false),
            r("POST", "/api/create-ui/music/download", "工作台", false, false),
            r("POST", "/api/create-ui/music/favorite", "工作台", false, false),
            r("POST", "/api/create-ui/music/rename", "工作台", false, false),
            r("POST", "/api/create-ui/music/upload-source", "工作台", true, false),
            r("POST", "/api/create-ui/lyrics/adjust", "歌词", false, false),
            r("POST", "/api/studio/song-idea", "工作台", false, false),
            r("GET", "/api/create-ui/voices", "音色", false, false),
            r("POST", "/api/create-ui/voices/sync", "音色", false, false),
            r("POST", "/api/create-ui/voice/validate", "音色", false, false),
            r("POST", "/api/create-ui/voice/tasks/[^/]+/repair", "音色", false, false),
            r("POST", "/api/music/generate-with-voice", "音色", false, true),
            r("GET", "/api/music/generate-with-voice/results", "音色", false, false),
            r("POST", "/api/music/boost-style", "Prompt", false, false),
            r("POST", "/api/prompts/suggestions", "Prompt", false, false),
            r("POST", "/api/prompts/library", "Prompt", false, false),
            r("POST", "/api/music/upload-source", "上传", true, false),
            r("POST", "/api/music/enhanced-upload", "上传", true, true),
            r("GET", "/api/music/enhanced-upload", "上传", false, false),
            r("GET", "/api/music/enhanced-upload/[^/]+", "上传", false, false),
            r("POST", "/api/music/enhanced-upload/[^/]+/cancel", "上传", false, false),
            r("POST", "/api/music/upload-cover", "编辑", true, true),
            r("POST", "/api/music/generate-from-source", "编辑", false, true),
            r("POST", "/api/music/extend", "编辑", false, true),
            r("POST", "/api/music/replace-section", "编辑", false, true),
            r("POST", "/api/music/add-instrumental", "编辑", false, true),
            r("POST", "/api/music/add-vocal", "编辑", false, true),
            r("POST", "/api/music/add-stem", "编辑", false, true),
            r("POST", "/api/music/mashup", "编辑", false, true),
            r("POST", "/api/music/sample", "编辑", false, true),
            r("POST", "/api/music/inspo", "编辑", false, true),
            r("POST", "/api/music/crop", "编辑", false, true),
            r("POST", "/api/music/remove-section", "编辑", false, true),
            r("POST", "/api/music/fade", "编辑", false, true),
            r("POST", "/api/music/reverse", "编辑", false, true),
            r("POST", "/api/music/speed", "编辑", false, true),
            r("POST", "/api/music/separate", "导出", false, true),
            r("POST", "/api/music/vocal-removal", "导出", false, false),
            r("POST", "/api/music/stem-delete", "导出", false, false),
            r("POST", "/api/music/wav", "导出", false, false),
            r("POST", "/api/music/midi", "导出", false, false),
            r("POST", "/api/music/download-file", "导出", false, false),
            r("POST", "/api/music/download-url", "导出", false, false),
            r("POST", "/api/music/generation-stream-url", "导出", false, false),
            r("POST", "/api/music/download-all", "导出", false, false),
            r("GET", "/api/music/download", "导出", false, false),
            r("POST", "/api/music/free2", "导出", false, true),
            r("POST", "/api/music/query", "查询", false, false),
            r("GET", "/api/music/songs", "查询", false, false),
            r("GET", "/api/music/songs/[^/]+", "查询", false, false),
            r("POST", "/api/music/authorization/identity", "授权", false, false),
            r("GET", "/api/music/authorization/context", "授权", false, false),
            r("GET", "/api/music/authorization/songs", "授权", false, false),
            r("POST", "/api/music/authorization/certificates", "授权", false, false),
            r("GET", "/api/music/authorization/certificates", "授权", false, false),
            r("GET", "/api/music/authorization/certificates/[^/]+", "授权", false, false),
            r("GET", "/api/music/authorization/certificates/[^/]+/download", "授权", false, false)
    );

    private Rule r(String methods, String path, String category, boolean multipart, boolean paid) {
        return new Rule(methods, Pattern.compile("^" + path + "$"), path, category, multipart, paid);
    }

    public Rule resolve(String method, String path) {
        String normalizedMethod = method.toUpperCase(Locale.ROOT);
        return rules.stream().filter(x -> x.methods.contains(normalizedMethod) && x.path.matcher(path).matches()).findFirst()
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "未收录的 Suno 接口或请求方法"));
    }

    public List<OperationView> views() {
        List<OperationView> result = new ArrayList<>();
        for (Rule rule : rules) {
            for (String method : rule.methods.split("\\|")) {
                result.add(new OperationView(method, rule.displayPath, rule.category, rule.multipart, rule.paid));
            }
        }
        return result;
    }
}
