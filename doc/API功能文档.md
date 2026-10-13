# 声序 AI 音乐工作台 V1 API 功能文档

> 文档版本：V1.0  
> 更新日期：2026-09-16  
> 接口前缀：`/api/v1`

## 1. 基本信息

| 项目 | 值 |
|---|---|
| 本地网关 | `http://localhost:8098` |
| 本地 API Base URL | `http://localhost:8098/api/v1` |
| 数据格式 | `application/json; charset=UTF-8` |
| 头像上传 | `multipart/form-data` |
| 音频下载 | `audio/mpeg` |
| Swagger UI | `http://localhost:8098/swagger-ui/index.html` |
| OpenAPI JSON | `http://localhost:8098/v3/api-docs` |

## 2. 认证、Cookie 与 CSRF

### 2.1 登录认证

注册或登录成功后，服务器通过响应头写入：

```http
Set-Cookie: SHENGXU_TOKEN=<jwt>; Path=/; HttpOnly; SameSite=Lax
```

- JWT Cookie 默认有效期为 7 天。
- 浏览器请求需要携带 Cookie。
- Axios 应设置 `withCredentials: true`。
- 退出登录会删除 Redis 会话并清空 JWT Cookie。

### 2.2 CSRF

登录和注册接口不要求 CSRF Token。其余状态修改接口需要：

1. 先访问任意页面或 GET 接口，服务器下发 `XSRF-TOKEN` Cookie。
2. 将 Cookie 值放入 `X-XSRF-TOKEN` 请求头。

项目 Axios 配置：

```ts
axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
})
```

## 3. 通用响应

### 3.1 成功响应

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### 3.2 业务错误响应

```json
{
  "success": false,
  "data": null,
  "message": "具体错误信息"
}
```

### 3.3 常见状态码

| 状态码 | 含义 |
|---|---|
| 200 | 请求成功 |
| 202 | 音乐任务已创建并进入异步处理 |
| 400 | 参数错误或缺少有效幂等键 |
| 401 | 未登录、Cookie 失效或账号密码错误 |
| 402 | 积分不足 |
| 403 | CSRF 校验失败 |
| 404 | 当前用户无权访问或资源不存在 |
| 409 | 邮箱/用户名冲突，或作品尚未生成完成 |
| 503 | Suno 服务未配置 |
| 502 | 上游音频地址非法或下载失败 |
| 500 | 未处理的服务端异常 |

鉴权入口产生的 401 响应不保证包含统一业务响应体，客户端应以 HTTP 状态码为准。

## 4. 数据模型

### 4.1 UserView

```json
{
  "id": 2099898443116019713,
  "username": "声序体验",
  "email": "demo@shengxu.test",
  "avatarUrl": null,
  "creditBalance": 100
}
```

### 4.2 PageView

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

### 4.3 TaskView

```json
{
  "id": 2100000000000000001,
  "prompt": "生成一首夏日青春女团风格歌曲",
  "style": "Pop",
  "mood": "快乐",
  "vocalType": "FEMALE",
  "language": "中文",
  "lyricsMode": "AI",
  "songTitle": null,
  "status": "WAITING",
  "submitStage": "CREATED",
  "errorMessage": null,
  "createdAt": "2026-09-16T14:30:00",
  "tracks": []
}
```

### 4.4 TrackView

```json
{
  "id": 2100000000000000101,
  "taskId": 2100000000000000001,
  "title": "夏日晴空",
  "status": "SUCCESS",
  "audioUrl": "https://example.suno-domain/audio.mp3",
  "coverUrl": "https://example.suno-domain/cover.jpg",
  "lyrics": "……",
  "styleTags": "Pop, 快乐, 中文",
  "duration": 182.451,
  "modelVersion": "suno-v6",
  "createdAt": "2026-09-16T14:31:30"
}
```

说明：当前接口中的 ID 是 JSON 数字形式的 64 位整数。第三方 JavaScript 客户端不要对 ID 做数学运算，后续版本计划统一改为字符串序列化。

## 5. 认证接口

### 5.1 注册

`POST /api/v1/auth/register`

无需登录，无需 CSRF。注册成功后自动登录，并赠送 100 积分。

请求体：

```json
{
  "username": "声序体验",
  "email": "demo@shengxu.test",
  "password": "ShengxuDemo123!"
}
```

| 字段 | 必填 | 规则 |
|---|---|---|
| username | 是 | 去除首尾空格后 2–40 个字符，唯一 |
| email | 是 | 合法邮箱格式，转为小写，唯一 |
| password | 是 | 8–72 个字符 |

成功：`200 OK`，`data` 为 `UserView`。

可能错误：

- `400`：参数校验失败。
- `409`：邮箱已注册或用户名已存在。

### 5.2 登录

`POST /api/v1/auth/login`

无需登录，无需 CSRF。

请求体：

```json
{
  "email": "demo@shengxu.test",
  "password": "ShengxuDemo123!"
}
```

成功：`200 OK`，`data` 为 `UserView`，并写入 JWT Cookie。

可能错误：

- `400`：邮箱格式错误或字段为空。
- `401`：邮箱或密码错误。

### 5.3 退出登录

`POST /api/v1/auth/logout`

需要 CSRF Token。服务端删除 Redis 会话并清空 JWT Cookie。

成功响应：

```json
{
  "success": true,
  "data": null,
  "message": ""
}
```

## 6. 用户接口

### 6.1 获取当前用户

`GET /api/v1/users/me`

需要登录。

成功：`200 OK`，`data` 为 `UserView`。

### 6.2 修改用户名

`PATCH /api/v1/users/me`

需要登录和 CSRF Token。

请求体：

```json
{
  "username": "新的用户名"
}
```

规则：去除首尾空格后 2–40 个字符，且不能与其他用户重复。

成功：`200 OK`，返回更新后的 `UserView`。

可能错误：

- `400`：用户名长度不合法。
- `409`：用户名已存在。

### 6.3 上传头像

`POST /api/v1/users/me/avatar`

需要登录和 CSRF Token，请求类型为 `multipart/form-data`。

| 字段 | 类型 | 规则 |
|---|---|---|
| file | File | JPG、PNG 或 WebP，最大 3 MB |

成功响应：

```json
{
  "success": true,
  "data": {
    "avatarUrl": "/uploads/用户ID-随机值.webp"
  },
  "message": ""
}
```

## 7. 积分接口

### 7.1 查询积分余额

`GET /api/v1/credits/balance`

需要登录。

成功响应：

```json
{
  "success": true,
  "data": {
    "balance": 100
  },
  "message": ""
}
```

### 7.2 查询积分流水

`GET /api/v1/credits/records?page=1&pageSize=20`

需要登录。

| 参数 | 默认值 | 说明 |
|---|---|---|
| page | 1 | 页码 |
| pageSize | 20 | 每页数量，服务端最大取 50 |

响应项：

```json
{
  "id": 2100000000000000201,
  "recordType": "CONSUME",
  "amount": -10,
  "balanceAfter": 90,
  "remark": "生成音乐",
  "createdAt": "2026-09-16T14:30:00"
}
```

`recordType` 可选值：

- `GRANT`：注册赠送。
- `CONSUME`：生成任务消费。
- `REFUND`：全部生成结果失败后的退款。

## 8. 模板接口

### 8.1 获取创作模板

`GET /api/v1/templates`

公开接口，无需登录。

成功响应示例：

```json
{
  "success": true,
  "data": [
    {
      "title": "海岸公路",
      "prompt": "夏日海边、公路旅行与明亮合成器",
      "style": "Pop",
      "mood": "快乐"
    }
  ],
  "message": ""
}
```

当前内置模板：海岸公路、深夜霓虹、破晓之前、月下长安、低频宣言、失重舞池。

## 9. 音乐任务接口

### 9.1 创建音乐任务

`POST /api/v1/music-tasks`

需要登录、CSRF Token，以及请求头：

```http
Idempotency-Key: 2d7fb04b-45f8-4d86-bf55-a9c3b7663516
```

幂等键不能为空，最大 64 个字符。同一用户使用相同幂等键重复请求时返回原任务，不重复扣积分。

#### AI 自动歌词请求

```json
{
  "prompt": "生成一首夏日青春女团风格歌曲",
  "style": "Pop",
  "mood": "快乐",
  "vocalType": "FEMALE",
  "language": "中文",
  "lyricsMode": "AI",
  "lyrics": null,
  "songTitle": null
}
```

#### 用户输入歌词请求

```json
{
  "prompt": "节奏轻快，副歌具有记忆点",
  "style": "Pop",
  "mood": "治愈",
  "vocalType": "MALE",
  "language": "中文",
  "lyricsMode": "USER",
  "lyrics": "第一缕晨光穿过窗……",
  "songTitle": "晨光"
}
```

#### 纯音乐请求

```json
{
  "prompt": "适合深夜专注的柔和节拍",
  "style": "Lo-fi",
  "mood": "治愈",
  "vocalType": "INSTRUMENTAL",
  "language": null,
  "lyricsMode": "AI",
  "lyrics": null,
  "songTitle": null
}
```

字段规则：

| 字段 | 必填 | 规则 |
|---|---|---|
| prompt | 是 | 非空，最大 2000 字符 |
| style | 是 | `Pop`、`Rock`、`HipHop`、`EDM`、`Lo-fi`、`古风` |
| mood | 是 | `快乐`、`悲伤`、`治愈`、`热血` |
| vocalType | 是 | `MALE`、`FEMALE`、`INSTRUMENTAL` |
| language | 否 | 中文或英文；纯音乐可为空 |
| lyricsMode | 是 | `AI` 或 `USER` |
| lyrics | 条件必填 | `USER` 且非纯音乐时必填，最大 10000 字符 |
| songTitle | 否 | 最大 120 字符 |

成功：`202 Accepted`，返回 `TaskView`。任务初始状态通常为 `WAITING / CREATED`。

业务规则：

- 创建成功扣除 10 积分。
- 未配置 `SUNO_API_KEY` 时返回 503，且不创建任务、不扣积分。
- 积分不足时返回 402。
- 请求只写入本地待处理任务，上游调用由后台调度器执行。

### 9.2 查询任务列表

`GET /api/v1/music-tasks?page=1&pageSize=20`

需要登录。

| 参数 | 默认值 | 说明 |
|---|---|---|
| page | 1 | 页码 |
| pageSize | 20 | 每页数量，最大取 50 |

按创建时间倒序返回当前用户任务。列表中的 `tracks` 为空数组；需要作品详情时调用任务详情接口。

### 9.3 查询任务详情

`GET /api/v1/music-tasks/{id}`

需要登录。返回当前用户任务及该任务产生的作品列表。

可能错误：

- `404`：任务不存在或不属于当前用户。

### 9.4 任务状态

| status | 说明 |
|---|---|
| WAITING | 已入库，等待后台提交 |
| PROCESSING | 提交中、生成中、查询中或提交结果待核实 |
| SUCCESS | 至少一首歌曲生成成功，结果已收敛 |
| FAILED | 全部结果明确失败，积分已幂等退款 |

| submitStage | 说明 |
|---|---|
| CREATED | 等待调度器认领 |
| SUBMITTING | 已认领，正在请求 Suno |
| SUBMITTED | 已获得真实歌曲 ID，正在查询结果 |
| UNCERTAIN | 提交结果无法确认，停止自动重发，需人工核实 |

建议前端轮询策略：

- `WAITING` 或 `PROCESSING`：每 3–5 秒查询任务详情。
- `SUCCESS` 或 `FAILED`：停止轮询。
- `submitStage = UNCERTAIN`：停止高频轮询并向用户展示人工核实提示。

## 10. 音乐库接口

### 10.1 查询音乐库

`GET /api/v1/music-library?q=&page=1&pageSize=12`

需要登录。

| 参数 | 默认值 | 说明 |
|---|---|---|
| q | 空 | 按歌曲标题模糊搜索 |
| page | 1 | 页码 |
| pageSize | 12 | 每页数量，最大取 50 |

只返回当前用户且 `deleted = 0` 的作品，按创建时间倒序排列。

### 10.2 查询作品详情

`GET /api/v1/music-library/{id}`

需要登录。

成功：`200 OK`，`data` 为 `TrackView`。

可能错误：

- `404`：作品不存在、已删除或不属于当前用户。

### 10.3 删除作品

`DELETE /api/v1/music-library/{id}`

需要登录和 CSRF Token。

该接口执行软删除，不删除任务、积分流水或数据库物理记录。

成功响应：

```json
{
  "success": true,
  "data": null,
  "message": ""
}
```

### 10.4 下载作品

`GET /api/v1/music-library/{id}/download`

需要登录。服务器校验作品归属后，从允许的 Suno HTTPS 地址流式转发音频。

成功响应头示例：

```http
Content-Type: audio/mpeg
Content-Disposition: attachment; filename="shengxu-<作品ID>.mp3"
```

可能错误：

- `404`：作品不存在、已删除或不属于当前用户。
- `409`：作品尚未生成完成，没有音频地址。
- `502`：远程地址不在白名单或上游下载失败。

## 11. 健康与文档接口

### 11.1 健康检查

`GET /actuator/health`

公开接口。

```json
{
  "status": "UP"
}
```

### 11.2 OpenAPI

- Swagger UI：`GET /swagger-ui/index.html`
- OpenAPI JSON：`GET /v3/api-docs`

## 12. cURL 联调示例

以下示例使用 Cookie 文件保存登录状态。PowerShell 中可使用 `curl.exe` 避免命令别名差异。

### 12.1 登录

```powershell
curl.exe -i -c cookies.txt `
  -H "Content-Type: application/json" `
  -d '{"email":"demo@shengxu.test","password":"ShengxuDemo123!"}' `
  http://localhost:8098/api/v1/auth/login
```

### 12.2 获取当前用户

```powershell
curl.exe -b cookies.txt http://localhost:8098/api/v1/users/me
```

对于需要 CSRF 的写接口，建议直接使用项目浏览器前端联调；如使用脚本，应先获取 `XSRF-TOKEN` Cookie，再将其原值放入 `X-XSRF-TOKEN` 请求头。

## 13. 上游 Suno 映射

| 本平台场景 | 上游接口 | 主要映射 |
|---|---|---|
| AI 自动歌词 | `POST /api/music/create` | `description`、`instrumental`、`model`、`wait_completion` |
| 用户输入歌词 | `POST /api/music/create/custom` | `lyrics`、`style_tags`、`song_title`、`vocal_gender` |
| 查询生成结果 | `POST /api/music/query` | `song_ids`、`model` |

上游请求使用服务端环境变量中的 API Key：

```http
Authorization: Bearer <SUNO_API_KEY>
```

前端和本平台 API 响应均不会暴露该密钥。

## 14. 联调注意事项

- 当前运行环境的演示账号为 `demo@shengxu.test`，密码为 `ShengxuDemo123!`；该账号属于本地运行数据，不会由 Flyway 在新环境自动创建。
- 未配置 `SUNO_API_KEY` 时，可验证全部非收费功能；创建音乐会返回 503 且不扣积分。
- 配置 Key 后只建议提交一次人工任务，以控制调用成本。
- 不要在客户端直接调用 Suno API，也不要将 Suno Key 写入前端环境变量。
- 不要将 `pending:` 占位 ID 传给上游查询接口。
- 生产部署必须启用 HTTPS、设置 `COOKIE_SECURE=true`，并替换默认数据库密码和 JWT 密钥。

