# 上传后翻唱 API

## 接口说明

上传后翻唱用于提交音频文件或音频 URL，并基于该源音频生成新的翻唱版本。

**接口地址**: `POST /api/music/upload-cover`

**计费**: 收费，当前默认 0.6 元/次。该接口是“上传后翻唱”，不是上传图片封面；实际扣费以当前后台价格配置为准。

**Max Mode / Variety**：本接口支持可选参数 `max_mode` 与 `variety`（0-4）。开启 `max_mode`
时本次按 2 倍价格计费（0.6 → 1.2 元/次），`variety` 不额外计费；两者含义与写法见
[新版 API 总览](current-overview.md) 的「高级参数」一节。

> **等待时间与超时（重要）**：本接口是同步接口，**响应返回时才代表订单已被受理并提交生成**。实测多数请求 1–3 秒返回，约 10% 超过 30 秒，最长约 230 秒。**请把客户端超时设置为 300 秒以上；未收到响应不等于没有生成，超时后请勿立即重试（会重复下单、重复扣费）。** 连接中断可稍后用 `GET /api/music/songs` 确认。详见[新版 API 总览](current-overview.md)的「等待时间与超时设置」。

## 请求参数

### Headers

| 参数名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| Authorization | string | 是 | Bearer YOUR_API_KEY |
| Content-Type | string | 是 | application/json |

### Body 参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| model | string | 否 | suno-v6 | 对客模型名：`suno-v6`、`suno-v6-wild` 或 `suno-v6-mini` |
| file_url | string | 否 | - | 源音频 URL |
| file_base64 | string | 否 | - | Base64 音频 |
| file_name | string | 否 | - | 文件名 |
| prompt | string | 否 | - | 新歌词或改编方向 |
| style | string | 否 | - | 风格标签 |
| title | string | 否 | - | 标题 |
| negativeTags | string | 否 | - | 负向风格 |
| instrumental | boolean | 否 | false | 是否纯音乐 |
| waitAudio | boolean | 否 | false | 是否等待音频完成 |
| cover_start_s | number | 否 | - | 翻唱片段开始秒数 |
| cover_end_s | number | 否 | - | 翻唱片段结束秒数 |
| audio_weight | number | 否 | - | 参考音频依赖度，范围 `0.0-1.0`；仅在提供参考音频时可传 |

`cover_start_s` 和 `cover_end_s` 的单位是秒，可以填写小数；开始时间必须小于结束时间，且不能超过源音频时长。两个字段都省略时使用整段音频。`audio_weight` 会映射到 Suno 的 `metadata.control_sliders.audio_weight`，用于控制生成结果对参考音频的依赖程度；取值为 `0.0-1.0`，只有请求中提供有效的 `file_url` 或 `file_base64` 参考音频时才可携带。`0` 是有效值，省略字段表示不指定并沿用 Suno 默认行为。`instrumental`、`waitAudio` 必须传 JSON 布尔值，不要传字符串。

上传接口默认异步返回。响应中的 `clips[].status` 为 `pending` 时，`audio_url` 为空是正常状态，不代表上传或翻唱失败；请保存返回的真实 `song_id`，通过歌曲查询接口轮询到完成后再读取音频地址。

## 请求示例

```bash
curl -X POST https://www.suno-api.io/api/music/upload-cover \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "suno-v6",
    "file_url": "https://example.com/source.mp3",
    "file_name": "source.mp3",
    "prompt": "新的中文歌词或改编方向",
    "style": "Mandopop, acoustic guitar",
    "title": "翻唱版本",
    "negativeTags": "noise, low quality",
    "audio_weight": 0.5,
    "instrumental": false,
    "waitAudio": false,
    "cover_start_s": 0,
    "cover_end_s": 60
  }'
```

## 响应结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "upload": {
      "clip_id": "uploaded_clip_id",
      "status": "complete"
    },
    "clips": [
      {
        "song_id": "new_clip_id",
        "song_title": "翻唱版本",
        "status": "pending"
      }
    ]
  }
}
```
