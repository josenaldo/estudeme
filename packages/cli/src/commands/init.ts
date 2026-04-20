import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveVaultPath } from '../lib/vault-loader.js';
import { c } from '../lib/format.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const TEMPLATE_NAMES = ['trail', 'module', 'note', 'card', 'quiz'];

export interface InitOptions {
  vault?: string;
  force?: boolean;
}

export interface CommandResult {
  exitCode: number;
  output: string;
}

const README = `# EstudeMe Vault

This vault was initialized by \`estudeme init\`.

## Structure

- \`_templates/\` — templates for trail, module, note, card, quiz
- Other files are free — EstudeMe finds content by frontmatter, not folder

## Frontmatter

Every content \`.md\` file needs:

\`\`\`yaml
---
type: trail | module | note | card | quiz | exam | resource
title: "Title"
---
\`\`\`

See \`_templates/\` for examples of each type.

## Useful commands

- \`estudeme validate\` — validate frontmatter and wikilinks
- \`estudeme trail list\` — list trails with progress
- \`estudeme metrics show\` — study dashboard
`;

export async function runInit(opts: InitOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  await mkdir(vaultPath, { recursive: true });

  const lines: string[] = [];
  lines.push(c.dim(`Initializing vault at: ${vaultPath}`));

  const templatesDir = path.join(vaultPath, '_templates');
  await mkdir(templatesDir, { recursive: true });

  for (const name of TEMPLATE_NAMES) {
    const target = path.join(templatesDir, `${name}.md`);
    if ((await fileExists(target)) && !opts.force) {
      lines.push(c.dim(`  - _templates/${name}.md (already exists, skipped)`));
      continue;
    }
    const src = path.join(TEMPLATES_DIR, `${name}.md`);
    const content = await readFile(src, 'utf-8');
    await writeFile(target, content, 'utf-8');
    lines.push(c.ok(`  ✓ _templates/${name}.md`));
  }

  const readmePath = path.join(vaultPath, 'README.md');
  if ((await fileExists(readmePath)) && !opts.force) {
    lines.push(c.dim(`  - README.md (already exists, skipped)`));
  } else {
    await writeFile(readmePath, README, 'utf-8');
    lines.push(c.ok(`  ✓ README.md`));
  }

  lines.push('');
  lines.push(c.ok('Vault initialized.'));
  return { exitCode: 0, output: lines.join('\n') };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
