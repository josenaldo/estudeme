import path from 'node:path';
import { existsSync, statSync } from 'node:fs';

export function resolveVaultPath(input?: string): string {
  if (!input) return process.cwd();
  if (path.isAbsolute(input)) return input;
  return path.resolve(process.cwd(), input);
}

export function assertVaultExists(vaultPath: string): void {
  if (!existsSync(vaultPath)) {
    throw new Error(`Vault not found: ${vaultPath}`);
  }
  if (!statSync(vaultPath).isDirectory()) {
    throw new Error(`Vault path must be a directory: ${vaultPath}`);
  }
}
