#!/usr/bin/env node
import { rmSync, cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = join(__dirname, '../../../.agents/skills');
const destination = join(__dirname, '../skills');

if (!existsSync(source)) {
  console.error(`copy-skills: source not found at ${source}`);
  process.exit(1);
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true, filter: (src) => !src.endsWith('.gitkeep') });
console.log(`copy-skills: copied ${source} -> ${destination}`);
