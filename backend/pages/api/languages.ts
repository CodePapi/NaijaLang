import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const API_BASE = process.env.AI_MODEL_URL || 'http://localhost:3000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const path = req.url?.replace('/api', '') || '';
  const target = `${API_BASE}${path}`;
  const response = await fetch(target);
  const data = await response.text();
  res.status(response.status).send(data);
}
