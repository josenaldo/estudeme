import { parseVault, extractCardsForExport, cardsToJSON } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c, table } from '../lib/format.js';
import { writeFile } from 'node:fs/promises';

export interface CardsListOptions {
  vault?: string;
  trail?: string;
  module?: string;
}

export interface CardsExportOptions {
  vault?: string;
  output: string;
  format: 'json' | 'apkg';
  trail?: string;
}

export interface CommandResult {
  exitCode: number;
  output: string;
}

export async function runCardsList(opts: CardsListOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  let cards = extractCardsForExport(idx);
  if (opts.trail) cards = cards.filter((card) => card.trail === opts.trail);
  if (opts.module) cards = cards.filter((card) => card.module === opts.module);

  if (cards.length === 0) {
    return { exitCode: 0, output: c.dim('No cards found.') };
  }

  const rows = cards.map((card) => [
    card.id,
    card.cardType,
    card.trail ?? '-',
    card.module ?? '-',
    card.front.slice(0, 50) + (card.front.length > 50 ? '...' : ''),
  ]);

  const t = table(['ID', 'Type', 'Trail', 'Module', 'Front'], rows);
  return { exitCode: 0, output: `${t}\n${c.dim(`${cards.length} card(s)`)}` };
}

export async function runCardsExport(opts: CardsExportOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  let cards = extractCardsForExport(idx);
  if (opts.trail) cards = cards.filter((card) => card.trail === opts.trail);

  if (opts.format === 'json') {
    await writeFile(opts.output, cardsToJSON(cards), 'utf-8');
    return { exitCode: 0, output: c.ok(`✓ ${cards.length} cards exported to ${opts.output}`) };
  }

  if (opts.format === 'apkg') {
    return {
      exitCode: 1,
      output: c.warn(
        'Phase 0 .apkg export: use `arcana` (Python) with the JSON produced by --format json. Native support arrives later.',
      ),
    };
  }

  return { exitCode: 1, output: c.err(`Unknown format: ${opts.format}`) };
}
