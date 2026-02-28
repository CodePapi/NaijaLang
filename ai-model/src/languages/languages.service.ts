import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LanguagesService {
  private languages: any[] = [];

  constructor() {
    // attempt to load language metadata from workspace root
    try {
      // __dirname is ai-model/src/languages
      const file = path.resolve(__dirname, '../../../lang.json');
      const data = fs.readFileSync(file, 'utf-8');
      const json = JSON.parse(data);
      this.languages = json.languages || [];
    } catch (err) {
      // gracefully degrade when file not found
      console.warn('Could not load lang.json', err);
      this.languages = [];
    }
  }

  findAll() {
    return this.languages;
  }

  findOne(name: string) {
    return this.languages.find(
      (l) => l.name.toLowerCase() === name.toLowerCase(),
    );
  }
}
