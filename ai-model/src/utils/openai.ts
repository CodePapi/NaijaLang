import OpenAI from 'openai';

// build a prompt for translation with examples and ask the model
export async function translateWithOpenAI(
  text: string,
  sourceLang: string,
  targetLang: string,
  examples: Array<{ source: string; target: string }>,
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // assemble few-shot examples (if any)
  const snippet = examples && examples.length
    ? examples.slice(0, 5).map((e) => `${e.source} -> ${e.target}`).join('\n')
    : '';

  // build an instruction emphasizing brevity and translation only
  // also insist on Latin‑script output and a polite 'I don't know' if unsure
  // note: in this system language identifiers come from the
  // `nigeria-languages` dataset. codes such as "np" mean Nigerian Pidgin
  // (not Nepali) and codes like "m4" refer to Mandara.  the model should
  // **only** translate between English and one of the Nigerian languages in
  // the list; any other target should be treated as unknown.  if unsure,
  // respond with "I don't know."
  let prompt = `You are a translation assistant. Convert text from ${sourceLang} to ${targetLang} and respond with the translated text only, no explanation. ` +
               `Do not translate into or from any language other than English or one of the Nigerian languages in the provided examples. ` +
               `Use Latin script appropriate for the target language; avoid other writing systems. ` +
               `If you cannot produce a valid translation, say "I don't know."`;

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
