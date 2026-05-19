import { describe, it, expect } from 'vitest';
import { resolveVaultPath } from '../../src/lib/vault-loader.js';
import path from 'node:path';

describe('resolveVaultPath', () => {
  it('accepts an absolute path', () => {
    expect(resolveVaultPath('/tmp/vault')).toBe('/tmp/vault');
  });

  it('resolves a relative path against cwd', () => {
    expect(path.isAbsolute(resolveVaultPath('./my-vault'))).toBe(true);
  });

  it('returns cwd when no vault path is given', () => {
    expect(resolveVaultPath()).toBe(process.cwd());
  });
});
