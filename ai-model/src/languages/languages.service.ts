import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // if we don't know where the DB lives, don't even try the query
    if (!process.env.DATABASE_URL) {
      try {
        const pkg = require('nigeria-languages');
        if (Array.isArray(pkg)) return pkg;
      } catch {
        // ignore
      }
      return [];
    }

    try {
      const rows = await this.prisma.language.findMany();
      if (rows.length > 0) {
        return rows;
      }
    } catch (err) {
      // database not available; warn and fall back to package
      console.warn('languages.findAll db error, falling back', err?.message);
    }

    try {
      const pkg = require('nigeria-languages');
      if (Array.isArray(pkg)) return pkg;
    } catch {
      // ignore
    }
    return [];
  }

  async findOne(identifier: string) {
    // when there is no DB configured we can still search the package
    if (!process.env.DATABASE_URL) {
      try {
        const pkg = require('nigeria-languages');
        if (Array.isArray(pkg)) {
          return (
            pkg.find(
              (l: any) => l.name === identifier || l.code === identifier,
            ) || null
          );
        }
      } catch {
        // ignore
      }
      return null;
    }
    // allow lookup by either name or code
    return await this.prisma.language.findFirst({
      where: {
        OR: [{ name: identifier }, { code: identifier }],
      },
    });
  }

  /**
   * read languages from lang.json in root and upsert into database
   */
  async seedFromFile() {
    // try to load from the published package first; if that fails fall back
    // to reading lang.json from the workspace root.
    let langs: any[] = [];
    try {
      const pkg = require('nigeria-languages');
      if (Array.isArray(pkg)) {
        langs = pkg;
      }
    } catch {
      // not installed or not available, fallback to file
      const file = path.resolve(process.cwd(), '../lang.json');
      try {
        const data = fs.readFileSync(file, 'utf-8');
        const json = JSON.parse(data);
        langs = json.languages || [];
      } catch (err) {
        throw new Error('unable to load languages: ' + err.message);
      }
    }

    for (const l of langs) {
      await this.prisma.language.upsert({
        where: { name: l.name },
        update: {
          type: l.type || null,
          info: l.info || null,
          code: l.code || null,
        },
        create: {
          name: l.name,
          type: l.type || null,
          info: l.info || null,
          code: l.code || null,
        },
      });
    }
    return { inserted: langs.length };
  }
}
