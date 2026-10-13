export type SunoApiCostType = 'free' | 'quota' | 'charged' | 'unknown'
export type SunoApiCatalogItem = {
  method: string
  path: string
  title: string
  description: string
  fee: string
  costType: SunoApiCostType
  category: string
  sourceFile: string
}

export const sunoApiCatalog: SunoApiCatalogItem[] = [
  {
    "method": "GET",
    "path": "/api/user/balance",
    "title": "账户余额查询 API",
    "description": "查询账户余额，不扣费",
    "fee": "免费",
    "sourceFile": "current-user-balance.md",
    "costType": "free",
    "category": "账户与工作台"
  },
  {
    "method": "GET",
    "path": "/v1/models",
    "title": "支持的模型列表",
    "description": "读取当前可用的模型名称、能力和模型状态，用于客户端选择模型。",
    "fee": "免费",
    "sourceFile": "models.md",
    "costType": "free",
    "category": "模型"
  },
  {
    "method": "POST",
    "path": "/api/lyrics/generate",
    "title": "歌词生成 API",
    "description": "AI 生成歌词",
    "fee": "免费额度内免费（每分钟10次、每天300次），超出后 0.1 元/次",
    "sourceFile": "current-lyrics-generate.md",
    "costType": "quota",
    "category": "歌词"
  },
  {
    "method": "POST",
    "path": "/api/lyrics/timeline",
    "title": "时间轴歌词 API",
    "description": "获取歌词时间轴",
    "fee": "免费",
    "sourceFile": "current-lyrics-timeline.md",
    "costType": "free",
    "category": "歌词"
  },
  {
    "method": "POST",
    "path": "/api/prompts/library",
    "title": "Prompt/Style 资源列表 API",
    "description": "读取已保存的 Prompt 和 Style 资源",
    "fee": "免费额度内免费（每分钟10次、每天300次），超出后 0.1 元/次",
    "sourceFile": "current-prompts-library.md",
    "costType": "quota",
    "category": "提示词与风格"
  },
  {
    "method": "POST",
    "path": "/api/prompts/suggestions",
    "title": "灵感提示词 API",
    "description": "获取随机灵感",
    "fee": "免费额度内免费（每分钟10次、每天300次），超出后 0.1 元/次",
    "sourceFile": "current-prompts-suggestions.md",
    "costType": "quota",
    "category": "提示词与风格"
  },
  {
    "method": "GET",
    "path": "/api/voice/clone/tasks/:voice_task_id",
    "title": "查询人声克隆任务",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "人声与音色"
  },
  {
    "method": "POST",
    "path": "/api/voice/clone/tasks/:voice_task_id/check",
    "title": "检查克隆人声可用状态",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "人声与音色"
  },
  {
    "method": "POST",
    "path": "/api/voice/clone/tasks/:voice_task_id/generate",
    "title": "提交验证音频并创建人声",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "按人声克隆规则计费",
    "sourceFile": "current-voice-clone.md",
    "costType": "charged",
    "category": "人声与音色"
  },
  {
    "method": "POST",
    "path": "/api/voice/clone/tasks/:voice_task_id/regenerate",
    "title": "重新生成人声验证文本",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "人声与音色"
  },
  {
    "method": "GET",
    "path": "/api/voice/clone/tasks/{voice_task_id}",
    "title": "人声克隆与指定人声生成 API（不推荐）",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "人声与音色"
  },
  {
    "method": "POST",
    "path": "/api/voice/clone/tasks/{voice_task_id}/check",
    "title": "人声克隆与指定人声生成 API（不推荐）",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "人声与音色"
  },
  {
    "method": "POST",
    "path": "/api/voice/clone/tasks/{voice_task_id}/generate",
    "title": "人声克隆与指定人声生成 API（不推荐）",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "按人声克隆规则计费",
    "sourceFile": "current-voice-clone.md",
    "costType": "charged",
    "category": "人声与音色"
  },
  {
    "method": "POST",
    "path": "/api/voice/clone/tasks/{voice_task_id}/regenerate",
    "title": "人声克隆与指定人声生成 API（不推荐）",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "人声与音色"
  },
  {
    "method": "POST",
    "path": "/api/voice/clone/validate",
    "title": "人声克隆与指定人声生成 API（不推荐）",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "人声与音色"
  },
  {
    "method": "DELETE",
    "path": "/api/voice/clone/voices/:voice_task_id",
    "title": "删除克隆人声",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "人声与音色"
  },
  {
    "method": "DELETE",
    "path": "/api/voice/clone/voices/{voice_task_id}",
    "title": "人声克隆与指定人声生成 API（不推荐）",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "人声与音色"
  },
  {
    "method": "POST",
    "path": "/api/music/add-instrumental",
    "title": "增加伴奏 API",
    "description": "为已有歌曲重新编曲或增加伴奏",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-add-instrumental.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/add-stem",
    "title": "加轨 API",
    "description": "为已有歌曲增加指定乐器或音轨",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-add-stem.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/add-vocal",
    "title": "增加人声 API",
    "description": "为已有歌曲增加或重写人声",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-add-vocal.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/boost-style",
    "title": "风格增强 API",
    "description": "扩写风格标签",
    "fee": "免费额度内免费（每分钟10次、每天300次），超出后 0.1 元/次",
    "sourceFile": "current-music-boost-style.md",
    "costType": "quota",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/create",
    "title": "灵感模式生成 API",
    "description": "AI 自动创作音乐",
    "fee": "收费，当前默认 0.6 元/次",
    "sourceFile": "current-music-create.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/create/custom",
    "title": "专业模式生成 API",
    "description": "指定歌词和风格创作",
    "fee": "收费，支持声音性别、风格参考度和随机度",
    "sourceFile": "current-music-create-custom.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/crop",
    "title": "裁剪 API",
    "description": "保留已有歌曲的指定时间段",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-crop.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/download",
    "title": "稳定下载地址",
    "description": "媒体地址、单文件/打包下载、生成中试听",
    "fee": "免费",
    "sourceFile": "current-music-media-download.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/download-all",
    "title": "人声克隆与指定人声生成 API（不推荐）",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/download-file",
    "title": "人声/伴奏分离 API",
    "description": "分离人声和伴奏",
    "fee": "免费",
    "sourceFile": "current-music-separate.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/download-url",
    "title": "媒体地址 / 试听流",
    "description": "媒体地址、单文件/打包下载、生成中试听",
    "fee": "免费",
    "sourceFile": "current-music-media-download.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/enhanced-upload",
    "title": "查询强化上传任务列表",
    "description": "上传音频并生成增强结果",
    "fee": "免费",
    "sourceFile": "current-music-enhanced-upload.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/enhanced-upload",
    "title": "强化上传 API",
    "description": "上传音频并生成增强结果",
    "fee": "收费，10 元/次",
    "sourceFile": "current-music-enhanced-upload.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/enhanced-upload/:id",
    "title": "查询单个强化上传任务",
    "description": "上传音频并生成增强结果",
    "fee": "免费",
    "sourceFile": "current-music-enhanced-upload.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/enhanced-upload/:id/cancel",
    "title": "取消强化上传任务",
    "description": "上传音频并生成增强结果",
    "fee": "免费；仅允许阶段可取消并退款",
    "sourceFile": "current-music-enhanced-upload.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/extend",
    "title": "续写 API",
    "description": "延长现有音乐",
    "fee": "收费，当前默认 0.6 元/次",
    "sourceFile": "current-music-extend.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/fade",
    "title": "淡入 / 淡出 API",
    "description": "为已有歌曲增加渐强或渐弱效果",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-fade.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/free2",
    "title": "Free2 下载",
    "description": "按首计费的下载通道，支持 suno.com 链接",
    "fee": "收费，0.2 元/首（按成功首数）",
    "sourceFile": "current-music-free2.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/generate-from-source",
    "title": "基于源 clip 翻唱 API",
    "description": "复用已有源 clip 翻唱",
    "fee": "收费，当前默认 0.6 元/次",
    "sourceFile": "current-music-generate-from-source.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/generate-with-voice",
    "title": "人声克隆与指定人声生成 API（不推荐）",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "收费，1.2 元/次；Max Mode 2.4 元/次",
    "sourceFile": "current-voice-clone.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/generate-with-voice/results",
    "title": "人声克隆与指定人声生成 API（不推荐）",
    "description": "旧链路；新接入请用【推荐】克隆音色 API",
    "fee": "免费",
    "sourceFile": "current-voice-clone.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/generation-stream-url",
    "title": "媒体地址 / 试听流",
    "description": "媒体地址、单文件/打包下载、生成中试听",
    "fee": "免费",
    "sourceFile": "current-music-media-download.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/inspo",
    "title": "灵感 API",
    "description": "用一首或多首歌曲作为灵感来源",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-inspo.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/mashup",
    "title": "融合 API",
    "description": "融合两首来源歌曲",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-mashup.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/query",
    "title": "歌曲查询与历史 API",
    "description": "查询生成状态、账号歌曲历史和生成参数",
    "fee": "免费",
    "sourceFile": "current-music-query.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/remove-section",
    "title": "删减 API",
    "description": "删除已有歌曲中的指定时间段",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-remove-section.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/replace-section",
    "title": "替换段落 API",
    "description": "局部替换歌曲片段",
    "fee": "收费，当前默认 0.6 元/次",
    "sourceFile": "current-music-replace-section.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/requests/{request_id}",
    "title": "灵感模式生成 API",
    "description": "AI 自动创作音乐",
    "fee": "免费；配合 accept_mode=async 使用",
    "sourceFile": "current-music-create.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/reverse",
    "title": "倒放 API",
    "description": "将已有歌曲倒放",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-reverse.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/sample",
    "title": "采样 API",
    "description": "从已有歌曲截取采样并生成新歌",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-sample.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/separate",
    "title": "人声/伴奏分离 API",
    "description": "分离人声和伴奏",
    "fee": "收费，two 默认 0.6 元/次；twelve 默认 3.0 元/次",
    "sourceFile": "current-music-separate.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/songs",
    "title": "歌曲查询与历史 API",
    "description": "查询生成状态、账号歌曲历史和生成参数",
    "fee": "免费",
    "sourceFile": "current-music-query.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/songs/:song_id",
    "title": "歌曲查询与历史 API",
    "description": "查询生成状态、账号歌曲历史和生成参数",
    "fee": "免费",
    "sourceFile": "current-music-query.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/sounds",
    "title": "音色/声音生成 API",
    "description": "创建短采样、循环和单次音效",
    "fee": "收费，当前默认 0.6 元/次",
    "sourceFile": "current-music-sounds.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/speed",
    "title": "变速 API",
    "description": "调整已有歌曲速度并可选保持音高",
    "fee": "收费，按请求模型计费",
    "sourceFile": "current-music-speed.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/stem-delete",
    "title": "分轨删除",
    "description": "隐藏不再需要的分轨（软删除，免费）",
    "fee": "免费",
    "sourceFile": "current-music-stem-delete.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/upload-cover",
    "title": "上传后翻唱 API",
    "description": "上传音频并翻唱",
    "fee": "收费，当前默认 0.6 元/次",
    "sourceFile": "current-music-upload-cover.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/upload-source",
    "title": "上传源音频 API",
    "description": "上传后续创作素材",
    "fee": "免费",
    "sourceFile": "current-music-upload-source.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/vocal-removal",
    "title": "人声去除",
    "description": "一键拆出人声与伴奏（两轨，免费）",
    "fee": "免费",
    "sourceFile": "current-music-vocal-removal.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/voice-profile/cover",
    "title": "音色翻唱（推荐）",
    "description": "用一段人声样本创建音色，再用它翻唱指定歌曲或演唱新歌",
    "fee": "1.2 元/次；Max Mode 2.4 元/次",
    "sourceFile": "current-clone-voice.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/voice-profile/create",
    "title": "克隆音色（推荐）",
    "description": "用一段人声样本创建音色，再用它翻唱指定歌曲或演唱新歌",
    "fee": "免费（enhanced=true 按强化克隆价计费）",
    "sourceFile": "current-clone-voice.md",
    "costType": "charged",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/voice-profile/delete",
    "title": "音色列表 / 详情 / 删除（推荐）",
    "description": "用一段人声样本创建音色，再用它翻唱指定歌曲或演唱新歌",
    "fee": "免费",
    "sourceFile": "current-clone-voice.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/voice-profile/list",
    "title": "音色列表 / 详情 / 删除（推荐）",
    "description": "用一段人声样本创建音色，再用它翻唱指定歌曲或演唱新歌",
    "fee": "免费",
    "sourceFile": "current-clone-voice.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/voice-profile/{voice_id}",
    "title": "音色列表 / 详情 / 删除（推荐）",
    "description": "用一段人声样本创建音色，再用它翻唱指定歌曲或演唱新歌",
    "fee": "免费",
    "sourceFile": "current-clone-voice.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "POST",
    "path": "/api/music/wav",
    "title": "WAV 生成/获取 API",
    "description": "获取 WAV 音频",
    "fee": "免费",
    "sourceFile": "current-music-wav.md",
    "costType": "free",
    "category": "音乐与媒体"
  },
  {
    "method": "GET",
    "path": "/api/music/authorization/certificates",
    "title": "音乐商用授权书 API",
    "description": "查询可授权歌曲、生成和下载 PDF 授权书",
    "fee": "免费",
    "sourceFile": "current-music-authorization.md",
    "costType": "free",
    "category": "商用授权"
  },
  {
    "method": "POST",
    "path": "/api/music/authorization/certificates",
    "title": "音乐商用授权书 API",
    "description": "查询可授权歌曲、生成和下载 PDF 授权书",
    "fee": "免费；需满足授权资格",
    "sourceFile": "current-music-authorization.md",
    "costType": "free",
    "category": "商用授权"
  },
  {
    "method": "GET",
    "path": "/api/music/authorization/certificates/:id",
    "title": "音乐商用授权书 API",
    "description": "查询可授权歌曲、生成和下载 PDF 授权书",
    "fee": "免费",
    "sourceFile": "current-music-authorization.md",
    "costType": "free",
    "category": "商用授权"
  },
  {
    "method": "GET",
    "path": "/api/music/authorization/certificates/:id/download",
    "title": "音乐商用授权书 API",
    "description": "查询可授权歌曲、生成和下载 PDF 授权书",
    "fee": "免费",
    "sourceFile": "current-music-authorization.md",
    "costType": "free",
    "category": "商用授权"
  },
  {
    "method": "GET",
    "path": "/api/music/authorization/context",
    "title": "音乐商用授权书 API",
    "description": "查询可授权歌曲、生成和下载 PDF 授权书",
    "fee": "免费",
    "sourceFile": "current-music-authorization.md",
    "costType": "free",
    "category": "商用授权"
  },
  {
    "method": "POST",
    "path": "/api/music/authorization/identity",
    "title": "音乐商用授权书 API",
    "description": "查询可授权歌曲、生成和下载 PDF 授权书",
    "fee": "免费；身份确认后不可修改",
    "sourceFile": "current-music-authorization.md",
    "costType": "free",
    "category": "商用授权"
  },
  {
    "method": "GET",
    "path": "/api/music/authorization/songs",
    "title": "音乐商用授权书 API",
    "description": "查询可授权歌曲、生成和下载 PDF 授权书",
    "fee": "免费；需完成授权身份绑定",
    "sourceFile": "current-music-authorization.md",
    "costType": "free",
    "category": "商用授权"
  },
  {
    "method": "POST",
    "path": "kind=midi",
    "title": "MIDI 获取",
    "description": "获取分轨轨道的 MIDI 文件",
    "fee": "免费",
    "sourceFile": "current-music-midi.md",
    "costType": "free",
    "category": "其他"
  }
]
