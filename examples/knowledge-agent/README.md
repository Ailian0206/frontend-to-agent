# Knowledge Agent

Node.js/TypeScript personal knowledge-base Agent used by the companion tutorial.

```bash
cp .env.example .env
npm install
docker compose up -d
npm run ingest
npm run dev
```

`npm run ingest` 首次创建索引；集合已存在时会拒绝覆盖。确认需要重建全部向量后使用：

```bash
npm run ingest -- --reset
```

此示例默认用于本地教学。生产部署必须在可信 API 网关补充身份认证、按用户/租户限流，并把检索过滤条件绑定到服务端认证上下文。`/api/chat` 已包含 45 秒总超时和 AbortSignal 传播。

Open `http://localhost:3000`, or verify the API with:

```bash
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"threadId":"demo","message":"严重事故多久内要建群？"}'
```
