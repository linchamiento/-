# Suno API 实现对照

本项目已按 `doc/suno-api-docs` 建立统一 Suno API 网关。网关只在后端读取 `SUNO_API_KEY`，前端不会接触密钥。

## 网站接口

| 用途 | 方法 | 地址 |
| --- | --- | --- |
| 获取已收录接口目录 | GET | `/api/v1/suno/operations` |
| 转发 JSON / 查询参数接口 | POST | `/api/v1/suno/execute` |
| 转发文件上传接口 | POST multipart | `/api/v1/suno/execute-multipart` |

`/execute` 请求示例：

```json
{
  "method": "POST",
  "path": "/api/music/mashup",
  "query": {},
  "body": { "clip_ids": ["song-id-1", "song-id-2"] }
}
```

`/execute-multipart` 使用 `method`、`path`、`file` 和其余表单字段；上传类接口的字段会原样转发给 Suno。所有路径先经过服务端白名单校验，不能代理任意外部 URL。

## 覆盖范围

接口目录覆盖本地文档中的账户余额、创作与请求状态、声音/音色、歌词、Prompt、上传、来源生成、延长、片段编辑、Mashup、Sample、Inspo、裁剪、淡入淡出、倒放、变速、分离、伴奏/人声/Stem、WAV、下载、查询、授权、提示词库和建议等接口；同时收录文档说明中出现的旧版音色路径。

接口是否计费、是否支持 multipart 会在 `/operations` 的 `paid`、`multipart` 字段中返回，供网站后续按能力生成操作面板。

## 创作工作台映射

当前前端创作页已拆成四种工作模式：灵感创作、自定义歌词、续写作品、音色创作；并提供“帮我想一句”“增强风格”、高级模型/权重控制、来源作品入口、任务结果与持续播放器。辅助动作使用同一网关调用 `/api/studio/song-idea`、`/api/music/boost-style`、`/api/create-ui/lyrics/adjust` 等接口，真正生成仍进入平台自己的 `music-task` 流程，确保积分扣减和作品归属一致。

## 与平台业务的边界

现有 `/api/v1/music-tasks` 是“声序”核心创作流程：负责平台积分扣减、任务调度、作品入库和用户隔离。通用 `/api/v1/suno/*` 是面向工作台扩展能力的原始 Suno API 封装，转发前不执行平台积分扣减；上游 Suno 的计费仍由其账号承担。后续接入编辑工作台时，应为具体操作增加平台积分策略和审计记录。

未配置 `SUNO_API_KEY` 时，接口目录仍可浏览，实际转发会返回服务未配置，不会伪造成功结果。当前未调用收费接口进行验证。

## 对照结论

- 已实现：文档中列出的可执行接口均有后端白名单路由和统一转发入口。
- 已实现：JSON、查询参数、multipart 文件上传、二进制下载响应的封装入口。
- 保留边界：上游接口的业务字段校验和具体响应结构由 Suno 文档/服务端决定；平台网关不会篡改响应。
- 未实测：真实生成、编辑、下载等收费或需要有效密钥的请求。
