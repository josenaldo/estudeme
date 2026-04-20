import { parseVault, validateVault } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c } from '../lib/format.js';

export interface ValidateOptions {
  vault?: string;
}

export interface ValidateResult {
  exitCode: number;
  output: string;
}

export async function runValidate(opts: ValidateOptions): Promise<ValidateResult> {
  const lines: string[] = [];
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  lines.push(c.dim(`Vault: ${vaultPath}`));
  lines.push('');

  const idx = await parseVault(vaultPath);
  const result = validateVault(idx);

  let hasError = false;

  if (result.parseErrors.length > 0) {
    lines.push(c.bold('Parse errors:'));
    for (const e of result.parseErrors) {
      lines.push(`  ${c.err('✗')} ${e.path}: ${e.error}`);
      hasError = true;
    }
    lines.push('');
  }

  const errors = result.documentIssues.filter((i) => i.severity === 'error');
  const warnings = result.documentIssues.filter((i) => i.severity === 'warning');

  if (errors.length > 0) {
    lines.push(c.bold(`Validation errors (${errors.length}):`));
    for (const i of errors) {
      lines.push(`  ${c.err('✗')} ${i.path} [${i.field}]: ${i.message}`);
      hasError = true;
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(c.bold(`Warnings (${warnings.length}):`));
    for (const i of warnings) {
      lines.push(`  ${c.warn('⚠')} ${i.path} [${i.field}]: ${i.message}`);
    }
    lines.push('');
  }

  if (result.brokenLinks.length > 0) {
    lines.push(c.bold(`Broken wikilinks (${result.brokenLinks.length}):`));
    for (const b of result.brokenLinks) {
      lines.push(`  ${c.err('✗')} ${b.path}: [[${b.link}]]`);
      hasError = true;
    }
    lines.push('');
  }

  lines.push(
    `${c.dim('Summary:')} ${idx.documents.length} documents, ${errors.length} errors, ${warnings.length} warnings, ${result.brokenLinks.length} broken links`,
  );

  return { exitCode: hasError ? 1 : 0, output: lines.join('\n') };
}
