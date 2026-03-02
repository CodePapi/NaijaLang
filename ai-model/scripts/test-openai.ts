import 'dotenv/config';
import { translateWithOpenAI } from '../src/utils/openai';

async function run() {
  const out = await translateWithOpenAI('hello', 'English', 'Hausa', []);
  console.log('result', out);
}
run().catch(console.error);
