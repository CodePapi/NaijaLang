# Backend Proxy App

This Next.js application provides a frontend consumable API layer that proxies requests to the `ai-model` NestJS service. It avoids cross-origin issues and centralizes configuration.

## Setup

```bash
cd backend
npm install
```

## Development

```bash
AI_MODEL_URL="http://localhost:3000" npm run dev
```

The routes under `/api` simply forward to the model service; e.g. `/api/languages` proxies to `http://localhost:3000/languages`.

Environment variables:
- `AI_MODEL_URL` – location of the running ai-model server.
