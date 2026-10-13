# 声序 · AI 音乐工作台

声序是基于 Vue 3 与 Spring Boot 3 的 AI 音乐生产平台 V1。系统包含用户、积分、异步生成任务、多版本作品库和全局播放器，Suno 接口依据 `suno-api.io` 新版 API 封装。

## 项目文档

- [项目开发文档](doc/项目开发文档.md)：产品范围、系统架构、页面、数据库、任务状态、Suno 集成与部署说明。
- [API 功能文档](doc/API功能文档.md)：认证规则、请求响应、全部业务接口、字段约束和联调示例。

## 一键启动

1. 复制 `.env.example` 为 `.env`，填写 `MYSQL_PASSWORD`、`MYSQL_ROOT_PASSWORD` 与至少 32 字符的随机 `JWT_SECRET`；这些值不提供源码默认值。
2. 在 `.env` 填写 `SUNO_API_KEY` 与 `SUNO_BASE_URL`。当前 Suno 凭据已按本地运行环境写入 `.env`；该文件被 `.gitignore` 排除，禁止复制到 Vue、提交到仓库或写入日志。
3. 执行：

   ```powershell
   docker compose up --build -d
   ```

4. 打开 <http://localhost:8098>。健康检查：<http://localhost:8098/actuator/health>，API 文档：<http://localhost:8098/swagger-ui/index.html>。

停止服务使用 `docker compose down`。数据保存在命名卷中；如需连数据一起删除，需明确执行 `docker compose down -v`。

## 本地开发

先启动 MySQL 8 与 Redis 7，并创建 `shengxu` 数据库。直接运行后端时还需设置 `SPRING_DATASOURCE_USERNAME`、`SPRING_DATASOURCE_PASSWORD` 与 `JWT_SECRET` 环境变量，然后分别运行：

```powershell
cd backend
mvn spring-boot:run
```

```powershell
cd frontend
npm install
npm run dev
```

前端开发地址为 <http://localhost:5180>，Vite 会代理 `/api` 与 `/uploads` 到后端 `8090`。

## Suno 集成

- 自动歌词：`POST /api/music/create`
- 自填歌词：`POST /api/music/create/custom`
- 异步查询：`POST /api/music/query`
- 默认模型：`suno-v6`

浏览器只访问项目自己的 `/api/v1/suno/*` 接口。后端通过 `SUNO_API_KEY` 读取密钥，并在服务端向 `SUNO_BASE_URL` 发起请求；前端源码和构建产物不会包含真实 Key。

后台每两秒扫描待提交和待查询任务，并以 Redis 锁避免多个实例重复处理。收费请求发生网络超时时会进入“提交结果待核实”，不会自动重发。

## 人工验收建议

先在不配置 Key 的环境确认注册、登录、退出、100 初始积分、个人资料以及“未配置服务且不扣积分”。配置 Key 后只提交一次低成本任务，记录提交前后积分、任务 ID、两个生成版本和下载结果。真实音乐生成与下载在本项目交付时未调用，以免产生费用。

## 目录

- `backend/src/main/resources/db/migration/V1__init.sql`：唯一数据库结构来源。
- `backend/src/main/java/com/shengxu/service/SunoApiService.java`：上游适配层。
- `frontend/src/views`：登录、首页、创作、音乐库和个人中心。
