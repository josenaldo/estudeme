import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Command } from 'commander';
import { registerSkillsCommand } from '../../src/commands/skills.js';

let tempDir: string;
let sourceDir: string;
let vaultDir: string;
let program: Command;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'estudeme-skills-cmd-test-'));
  sourceDir = join(tempDir, 'bundled-skills');
  vaultDir = join(tempDir, 'vault');

  mkdirSync(sourceDir, { recursive: true });
  mkdirSync(join(sourceDir, 'list-trails'), { recursive: true });
  writeFileSync(
    join(sourceDir, 'list-trails', 'SKILL.md'),
    '---\nname: list-trails\ndescription: x\n---\n# Skill: List Trails\n'
  );

  mkdirSync(vaultDir, { recursive: true });

  program = new Command();
  registerSkillsCommand(program, () => sourceDir);
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('estudeme skills install', () => {
  it('installs skills into <vault>/.agents/skills', async () => {
    await program.parseAsync(['node', 'estudeme', 'skills', 'install', vaultDir]);
    expect(existsSync(join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md'))).toBe(true);
  });

  it('creates the .claude/skills and .github/skills symlinks', async () => {
    await program.parseAsync(['node', 'estudeme', 'skills', 'install', vaultDir]);
    expect(existsSync(join(vaultDir, '.claude', 'skills'))).toBe(true);
    expect(existsSync(join(vaultDir, '.github', 'skills'))).toBe(true);
  });

  it('accepts --force', async () => {
    await program.parseAsync(['node', 'estudeme', 'skills', 'install', vaultDir, '--force']);
    expect(existsSync(join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md'))).toBe(true);
  });

  it('fails clearly when the vault does not exist', async () => {
    const missing = join(tempDir, 'does-not-exist');
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`);
    }) as never);

    await expect(
      program.parseAsync(['node', 'estudeme', 'skills', 'install', missing])
    ).rejects.toThrow(/exit 1/);

    exitSpy.mockRestore();
  });
});
