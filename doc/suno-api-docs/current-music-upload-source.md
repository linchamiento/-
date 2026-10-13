# 上传源音频 API

## 接口说明

上传源音频用于把本地音频或远程音频上传为后续翻唱、续写、替换、分轨等能力可使用的源 clip。

**接口地址**: `POST /api/music/upload-source`

**计费**: 免费。该接口只上传源音频，不开始生成任务。

## 请求参数

### Headers

JSON 请求：

| 参数名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| Authorization | string | 是 | Bearer YOUR_API_KEY |
| Content-Type | string | 是 | application/json |

multipart 请求不要手动指定 `Content-Type`，由客户端自动生成。

### Body 参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| model | string | 否 | suno-v6 | 对客模型名：`suno-v6`、`suno-v6-wild` 或 `suno-v6-mini` |
| file_url | string | 否 | - | 远程音频 URL |
| file_base64 | string | 否 | - | Base64 音频 |
| file_name | string | 否 | - | 文件名 |
| upload_type | string | 否 | file_upload | 上传类型 |

## JSON 请求示例

```bash
curl -X POST https://www.suno-api.io/api/music/upload-source \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "suno-v6",
    "file_url": "https://example.com/source.mp3",
    "file_name": "source.mp3",
    "upload_type": "file_upload"
  }'
```

## multipart 请求示例

```bash
curl -X POST https://www.suno-api.io/api/music/upload-source \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@source.mp3" \
  -F "file_name=source.mp3" \
  -F "upload_type=file_upload" \
  -F "model=suno-v6"
```

## 响应结果

```json
{
  "clip_id": "uploaded_clip_id",
  "status": "complete",
  "title": "source.mp3",
  "image_url": "https://...",
  "audio_url": "https://...",
  "display_tags": "pop, vocal",
  "inferred_description": "uploaded source audio",
  "clip_metadata": {}
}
```
