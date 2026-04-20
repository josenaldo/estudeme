import { parseVault, computeAllTrailsProgress } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c, progressBar } from '../lib/format.js';

export interface MetricsShowOptions {
  vault?: string;
}

export interface CommandResult {
  exitCode: number;
  output: string;
}

export async function runMetricsShow(opts: MetricsShowOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  const all = computeAllTrailsProgress(idx);

  const totals = {
    trails: idx.byType.trail?.length ?? 0,
    modules: idx.byType.module?.length ?? 0,
    notes: idx.byType.note?.length ?? 0,
    cards: idx.byType.card?.length ?? 0,
    quizzes: idx.byType.quiz?.length ?? 0,
    exams: idx.byType.exam?.length ?? 0,
    resources: idx.byType.resource?.length ?? 0,
  };

  const lines: string[] = [];
  lines.push(c.bold('📊 EstudeMe Dashboard'));
  lines.push(c.dim(`Vault: ${vaultPath}`));
  lines.push('');
  lines.push(c.bold('Totals'));
  lines.push(`  ${c.dim('Trails:')}    ${totals.trails}`);
  lines.push(`  ${c.dim('Modules:')}   ${totals.modules}`);
  lines.push(`  ${c.dim('Notes:')}     ${totals.notes}`);
  lines.push(`  ${c.dim('Cards:')}     ${totals.cards}`);
  lines.push(`  ${c.dim('Quizzes:')}   ${totals.quizzes}`);
  lines.push(`  ${c.dim('Exams:')}     ${totals.exams}`);
  lines.push(`  ${c.dim('Resources:')} ${totals.resources}`);
  lines.push('');

  if (all.length > 0) {
    lines.push(c.bold('Trails'));
    for (const p of all) {
      lines.push(
        `  ${p.title.padEnd(30)} ${progressBar(p.percentComplete, 20)} ${String(p.percentComplete).padStart(3)}%`,
      );
    }
  }

  return { exitCode: 0, output: lines.join('\n') };
}
