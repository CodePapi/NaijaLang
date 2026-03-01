import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const API_BASE = process.env.AI_MODEL_URL || 'http://localhost:3000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const target = `${API_BASE}/training${req.url?.replace('/api/train','')}`;
  const response = await fetch(target, {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    body: req.method === 'GET' ? undefined : req.body,
  });
  const data = await response.text();
  res.status(response.status).send(data);
}
