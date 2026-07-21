# Knowledge Agent

Node.js/TypeScript personal knowledge-base Agent used by the companion tutorial.

```bash
cp .env.example .env
npm install
docker compose up -d
npm run ingest
npm run dev
```

Open `http://localhost:3000`, or verify the API with:

```bash
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"threadId":"demo","message":"严重事故多久内要建群？"}'
```
