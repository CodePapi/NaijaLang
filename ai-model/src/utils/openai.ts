import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// build a prompt for translation with examples and ask the model
export async function translateWithOpenAI(
  text: string,
  sourceLang: string,
  targetLang: string,
  examples: Array<{ source: string; target: string }>,
): Promise<string | null> {
  if (!client) return null;

  // assemble few-shot examples (if any)
  const snippet = examples && examples.length
    ? examples.slice(0, 5).map((e) => `${e.source} -> ${e.target}`).join('\n')
    : '';

  // build an instruction emphasizing brevity and translation only
  let prompt = `You are a translation assistant. Convert text from ${sourceLang} to ${targetLang} and respond with the translated text only, no explanation.`;

  if (snippet) {
    prompt += `\n\nExamples:\n${snippet}`;
  }

  prompt += `\n\nTranslate the following sentence:\n${text}`;

  try {
    const resp = await client.responses.create({
      model: 'gpt-3.5-turbo',
      input: prompt,
    });
    // newer SDK places output text in resp.output_text or resp.output[0].content
    if (typeof resp.output_text === 'string') {
      return resp.output_text.trim();
    }
    if (Array.isArray(resp.output) && resp.output.length > 0) {
      // look for text content; some SDK versions use `content` or nested objects
      const item = resp.output.find((o: any) => o.type === 'output_text');
      if (item) {
        if ((item as any).text) {
          return (item as any).text.trim();
        }
        if ((item as any).content) {
          const c = (item as any).content;
          if (typeof c === 'string') return c.trim();
          if (Array.isArray(c)) {
            const inner = c.find((x: any) => x.type === 'output_text' && typeof x.text === 'string');
            if (inner) return inner.text.trim();
          }
        }
      }
    }
    return null;
  } catch (err) {
    console.error('OpenAI translate error', err);
    return null;
  }
}
