import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Prisma 7 now requires a non-empty options object when a config file
// exists; we don't need to specify anything other than a dummy log level
// since connection URL is read from DATABASE_URL.
// attach pg adapter so the default "client" engine has what it needs
import { PrismaPg } from '@prisma/adapter-pg';

const poolConfig: Record<string, any> = {};
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  poolConfig.connectionString = url;
  try {
    const parsed = new URL(url);
    poolConfig.password = parsed.password || '';
  } catch {
    poolConfig.password = '';
  }
} else {
  poolConfig.password = '';
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(poolConfig),
  log: ['error'],
});

async function main() {
  // lang.json lives one level above ai-model (workspace root)
  const file = path.resolve(__dirname, '../../lang.json');
  const data = fs.readFileSync(file, 'utf-8');
  const json = JSON.parse(data);
  const languages = json.languages || [];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { name: lang.name },
      update: {
        // ensure code stays in sync if changed
        code: lang.code || undefined,
        type: lang.type || null,
        info: lang.info || null,
      },
      create: {
        name: lang.name,
        code: lang.code || null,
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
