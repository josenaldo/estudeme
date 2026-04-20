import { parseVault, computeAllTrailsProgress, computeTrailProgress } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c, table, progressBar } from '../lib/format.js';

export interface TrailListOptions {
  vault?: string;
}

export interface TrailStatusOptions {
  vault?: string;
  trail: string;
}

export interface CommandResult {
  exitCode: number;
  output: string;
}

export async function runTrailList(opts: TrailListOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  const all = computeAllTrailsProgress(idx);

  if (all.length === 0) {
    return { exitCode: 0, output: c.dim('No trails found.') };
  }

  const rows = all.map((p) => [
    p.title,
    `${progressBar(p.percentComplete, 15)} ${p.percentComplete}%`,
    `${p.completedModules}/${p.totalModules}`,
    String(p.notes),
    String(p.cards),
  ]);

  return { exitCode: 0, output: table(['Trail', 'Progress', 'Modules', 'Notes', 'Cards'], rows) };
}

export async function runTrailStatus(opts: TrailStatusOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  const trail = idx.byTitle.get(opts.trail);

  if (!trail || trail.frontmatter.type !== 'trail') {
    return { exitCode: 1, output: c.err(`Trail not found: ${opts.trail}`) };
  }

  const p = computeTrailProgress(trail, idx);
  const lines = [
    c.bold(`📋 ${p.title}`),
    '',
    `Progress: ${progressBar(p.percentComplete, 30)} ${p.percentComplete}%`,
    '',
    `${c.dim('Modules:')}     ${p.completedModules} completed | ${p.inProgressModules} in progress | ${p.notStartedModules} not started`,
    `${c.dim('Notes:')}       ${p.notes}`,
    `${c.dim('Cards:')}       ${p.cards}`,
    `${c.dim('Quizzes:')}     ${p.quizzes}`,
  ];

  return { exitCode: 0, output: lines.join('\n') };
}
