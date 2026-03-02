import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AI Model API (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaService();

    // wipe and seed languages
    await prisma.trainingExample.deleteMany();
    await prisma.language.deleteMany();
    const fs = require('fs');
    const path = require('path');
    // lang.json lives in workspace root (two levels above test directory)
    const file = path.resolve(__dirname, '../../lang.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    for (const l of data.languages || []) {
      await prisma.language.create({ data: { name: l.name, code: l.code, type: l.type, info: l.info } });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('/ (GET)', () => {
    return supertest(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/languages returns array', async () => {
    const res = await supertest(app.getHttpServer()).get('/languages');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((l: any) => l.code === 'en')).toBe(true);
  });

  it('lookup by code and name', async () => {
    const r1 = await supertest(app.getHttpServer()).get('/languages/en');
    expect(r1.status).toBe(200);
    expect(r1.body.name).toBe('English');
    const r2 = await supertest(app.getHttpServer()).get('/languages/English');
    expect(r2.status).toBe(200);
    expect(r2.body.code).toBe('en');
  });

  it('training & translate', async () => {
    const example = { sourceLang: 'en', targetLang: 'yo', source: 'hello', target: 'bawo' };
    await supertest(app.getHttpServer()).post('/training').send(example).expect(201);
    const tr = await supertest(app.getHttpServer())
      .post('/model/translate')
      .send({ text: 'hello', sourceLang: 'en', targetLang: 'yo' })
      .expect(201);
    expect(tr.body.translation).toBe('bawo');
  });
});
