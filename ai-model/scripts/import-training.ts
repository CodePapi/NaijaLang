import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { TrainingService } from '../src/training/training.service';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: ts-node import-training.ts <path-to-json>');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error('file not found:', filePath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!Array.isArray(data)) {
    console.error('expected an array of training examples');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const svc = app.get(TrainingService);
  console.log('inserting', data.length, 'examples');
  await svc.addBatch(data);
  await app.close();
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
