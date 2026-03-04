import OpenAI from 'openai';

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// simple privacy-preserving embedding based on word hashing and normalization
// when an OpenAI key is configured we fall back to the provider's embeddings
export async function embed(text: string, dim = 128): Promise<number[]> {
  if (openaiClient) {
    // use OpenAI embedding endpoint; callers must await the promise
    const resp = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    // the new client returns data array
    return resp.data[0].embedding;
  }

  // local fallback hashing embedder
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  for (const w of words) {
    let h = 0;
    for (let i = 0; i < w.length; i++) {
      h = (h << 5) - h + w.charCodeAt(i);
      h |= 0;
    }
    const idx = Math.abs(h) % dim;
    vec[idx] += 1;
  }
  const len = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => v / len);
}

export function distance(a: number[], b: number[]): number {
  // cosine distance = 1 - cosine similarity; since vectors are normalized,
  // we can just compute dot product and subtract from 1.
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
  }
  return 1 - dot;
}
