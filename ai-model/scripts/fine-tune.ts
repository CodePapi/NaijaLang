import 'dotenv/config';
import { ModelService } from '../src/model/model.service';
import { TrainingService } from '../src/training/training.service';
import { PrismaService } from '../src/prisma/prisma.service';

async function run() {
  const prisma = new PrismaService();
  const training = new TrainingService(prisma);
  const model = new ModelService(training as any);
  const result = await model.fineTune();
  console.log(result);
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
});
