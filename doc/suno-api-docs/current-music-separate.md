# 人声/伴奏分离 API

## 接口说明

人声/伴奏分离用于把已有歌曲拆分为人声、伴奏或多轨结果。推荐按以下流程接入：

1. 如果源音频不是本平台生成的歌曲，可先调用 [上传源音频 API](current-music-upload-source.md)。
2. 调用 `POST /api/music/separate` 提交分轨任务。
3. 使用 [歌曲查询 API](current-music-query.md) 轮询分轨结果。
4. 使用下载接口下载每条分轨结果的音频文件。

**接口地址**: `POST /api/music/separate`

**计费**: 收费。`stem_mode=two` 当前默认 0.6 元/次；`stem_mode=twelve` 为多轨拆分，当前默认 3.0 元/次。实际扣费以后台价格配置为准。

> **等待时间与超时（重要）**：本接口是同步接口，**响应返回时才代表订单已被受理并提交生成**。实测多数请求 1–3 秒返回，约 10% 超过 30 秒，最长约 230 秒。**请把客户端超时设置为 300 秒以上；未收到响应不等于没有生成，超时后请勿立即重试（会重复下单、重复扣费）。** 连接中断可稍后用 `GET /api/music/songs` 确认。详见[新版 API 总览](current-overview.md)的「等待时间与超时设置」。

## 认证

| 参数名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| Authorization | string | 是 | `Bearer YOUR_API_KEY` |
| Content-Type | string | 是 | `application/json` |

## 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| song_id | string | 是 | - | 要分轨的源歌曲 ID |
| stem_mode | string | 是 | - | 分轨模式：`two` 或 `twelve` |
| source_audio_url | string | 否 | - | 源音频 URL |
| source_file_name | string | 否 | - | 源音频文件名 |
| source_title | string | 否 | - | 源歌曲标题 |

### stem_mode 说明

| 值 | 说明 |
|---|---|
| `two` | 人声 / 伴奏分离，通常返回 2 条结果 |
| `twelve` | 多轨拆分，返回多条分轨结果，数量以实际响应为准 |

### 分轨说明

分轨是独立的固定能力，不需要填写或选择歌曲生成模型。客户只需提交源歌曲和 `stem_mode`；服务端会按分轨模式处理，返回数量以实际响应为准。

## 请求示例

### 人声/伴奏分离

```bash
curl -X POST https://www.suno-api.io/api/music/separate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "song_id": "source_clip_id",
    "stem_mode": "two",
    "source_audio_url": "https://example.com/source.mp3",
    "source_file_name": "source.mp3",
    "source_title": "Source Song"
  }'
```

### 多轨拆分

```bash
curl -X POST https://www.suno-api.io/api/music/separate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "song_id": "source_clip_id",
    "stem_mode": "twelve",
    "source_audio_url": "https://example.com/source.mp3"
  }'
```

## 响应结果

成功后通常会返回分轨结果数组。每个分轨结果都是一个独立歌曲 clip，需要继续查询直到 `status` 变为完成状态。

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "clips": [
      {
        "song_id": "stem_clip_id_1",
        "song_title": "Source Song - 人声",
        "status": "pending",
        "generation_type": "separate",
        "created_at": "2026-06-06T10:00:00Z"
      },
      {
        "song_id": "stem_clip_id_2",
        "song_title": "Source Song - 伴奏",
        "status": "pending",
        "generation_type": "separate",
        "created_at": "2026-06-06T10:00:00Z"
      }
    ]
  }
}
```

客户一般只需要保存 `clips[].song_id`，后续查询和下载都围绕这些 ID 进行。

## 查询分轨结果

提交成功后，使用 `clips[].song_id` 调用 `POST /api/music/query` 查询结果。

```bash
curl -X POST https://www.suno-api.io/api/music/query \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "song_ids": "stem_clip_id_1,stem_clip_id_2"
  }'
```

查询完成示例：

```json
[
  {
    "song_id": "stem_clip_id_1",
    "song_title": "Source Song - 人声",
    "status": "complete",
    "audio_url": "https://...",
    "cover_url": "https://...",
    "duration": 180.5,
    "generation_type": "separate",
    "stem_from_id": "source_clip_id"
  }
]
```

## 下载分轨文件

分轨结果完成后，可用下载接口下载单个分轨文件。

**接口地址**: `POST /api/music/download-file`

```bash
curl -X POST https://www.suno-api.io/api/music/download-file \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "song_id": "stem_clip_id_1",
    "kind": "audio"
  }' \
  --output stem.mp3
```

`kind` 支持：

| kind | 说明 |
|---|---|
| `audio` / `song` / `music` | 下载 MP3 音频 |
| `cover` / `image` | 下载封面 |
| `wav` | 下载 WAV 音频 |
| `video` / `mp4` | 下载视频 |

如需打包下载某条分轨结果的相关资源，可调用：

```bash
curl -X POST https://www.suno-api.io/api/music/download-all \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "song_id": "stem_clip_id_1"
  }' \
  --output stem-resources.zip
```

## 状态说明

| 状态 | 说明 |
|---|---|
| `pending` | 已提交，等待处理 |
| `queued` | 排队中 |
| `generating` / `processing` | 处理中 |
| `complete` / `completed` | 已完成 |
| `error` / `failed` | 失败，请查看 `error_message` |

## 常见错误

| HTTP 状态 | 说明 | 处理建议 |
|---|---|---|
| 400 | 参数错误，例如缺少 `song_id` 或 `stem_mode` | 检查请求参数 |
| 401 | API Key 无效或未传 | 检查 `Authorization` |
| 402 | 余额不足 | 充值后重试 |
| 409 | 源歌曲暂时无法处理 | 检查 `song_id` 或稍后重试 |
| 500/503 | 服务或上游临时异常 | 稍后重试或联系技术支持 |

## 兼容说明

旧版文档中曾使用 `success/task_id/vocals_url/instrumental_url` 这类单对象示例。当前新版分轨以 `clips[]` 歌曲数组为准，每条分轨结果都拥有独立 `song_id`，后续查询和下载都围绕这些 `song_id` 进行。

## 相关接口

- 只想把人声和伴奏分开、不需要选择模式时，可用[人声去除 API](current-music-vocal-removal.md)，
  它是本接口的两轨快捷形式且当前免费。
- 不再需要的分轨轨道用[分轨删除 API](current-music-stem-delete.md) 隐藏（软删除，不扣费）。
- 取分轨的 MIDI 见[MIDI 获取 API](current-music-midi.md)，取音频/封面等媒体见
  [歌曲媒体下载与试听 API](current-music-media-download.md)。
