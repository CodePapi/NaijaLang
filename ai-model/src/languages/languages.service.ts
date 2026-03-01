import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.language.findMany();
  }

  async findOne(identifier: string) {
    // allow lookup by either name or code
    return this.prisma.language.findFirst({
      where: {
        OR: [
          { name: identifier },
          { code: identifier },
        ],
      },
    });
  }

  /**
   * read languages from lang.json in root and upsert into database
   */
  async seedFromFile() {
    // lang.json lives at workspace root (one level above ai-model folder).
    // process.cwd() points to ai-model when running the server, so
    // '../lang.json' resolves to workspace root.
    const file = path.resolve(process.cwd(), '../lang.json');
    let langs: any[] = [];
    try {
      const data = fs.readFileSync(file, 'utf-8');
      const json = JSON.parse(data);
      langs = json.languages || [];
    } catch (err) {
      throw new Error('unable to read lang.json: ' + err.message);
    }

    for (const l of langs) {
      await this.prisma.language.upsert({
        where: { name: l.name },
        update: { type: l.type || null, info: l.info || null, code: l.code || null },
        create: { name: l.name, type: l.type || null, info: l.info || null, code: l.code || null },
      });
    }
    return { inserted: langs.length };
  }
}
