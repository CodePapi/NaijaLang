import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const file = path.resolve(__dirname, '../lang.json');
  const data = fs.readFileSync(file, 'utf-8');
  const json = JSON.parse(data);
  const languages = json.languages || [];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { name: lang.name },
      update: {},
      create: {
        name: lang.name,
        type: lang.type || null,
        info: lang.info || null,
      },
    });
  }
  console.log(`Seeded ${languages.length} languages`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
