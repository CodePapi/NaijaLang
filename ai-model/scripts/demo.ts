import 'dotenv/config';
import { ModelService } from '../src/model/model.service';
import { TrainingExample } from '../src/training/training.service';

// fake training service that returns some examples
const fakeTraining = {
  findFor: async (src: string, tgt: string) => {
    if (src === 'en' && tgt === 'es') {
      return [
        { source: 'hello', target: 'hola', embedding: [0, 1, 0] },
        { source: 'how are you', target: 'como estas', embedding: [0, 0, 1] },
      ];
    }
    return [];
  },
} as any;

async function run() {
  const model = new ModelService(fakeTraining);
  console.log('== simple exact match ==');
  console.log(await model.translate('hello', 'en', 'es'));

  console.log('== fuzzy match ==');
  console.log(await model.translate('hell', 'en', 'es'));

  console.log('== vector/embedding lookup (same code but simulated) ==');
  console.log(await model.translate('how are you', 'en', 'es'));

  console.log('== unknown pair fallback ==');
  console.log(await model.translate('bonjour', 'fr', 'en'));
}

run().catch(console.error);
