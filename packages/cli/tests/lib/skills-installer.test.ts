import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, readlinkSync, lstatSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installSkills } from '../../src/lib/skills-installer.js';

let tempDir: string;
let sourceDir: string;
let vaultDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'estudeme-skills-test-'));
  sourceDir = join(tempDir, 'source-skills');
  vaultDir = join(tempDir, 'vault');

  mkdirSync(sourceDir, { recursive: true });
  mkdirSync(join(sourceDir, 'list-trails'), { recursive: true });
  writeFileSync(
    join(sourceDir, 'list-trails', 'SKILL.md'),
    '---\nname: list-trails\ndescription: x\n---\n# Skill: List Trails\n'
  );

  mkdirSync(vaultDir, { recursive: true });
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('installSkills', () => {
  it('copies skills from source to <vault>/.agents/skills', () => {
    installSkills({ source: sourceDir, vault: vaultDir });

    const installed = join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md');
    expect(existsSync(installed)).toBe(true);
    expect(readFileSync(installed, 'utf-8')).toContain('name: list-trails');
  });

  it('creates symlinks .claude/skills and .github/skills pointing to .agents/skills', () => {
    installSkills({ source: sourceDir, vault: vaultDir });

    const claudeLink = join(vaultDir, '.claude', 'skills');
    const githubLink = join(vaultDir, '.github', 'skills');

    expect(lstatSync(claudeLink).isSymbolicLink()).toBe(true);
    expect(lstatSync(githubLink).isSymbolicLink()).toBe(true);
    expect(readlinkSync(claudeLink)).toBe('../.agents/skills');
    expect(readlinkSync(githubLink)).toBe('../.agents/skills');
  });

  it('preserves existing files by default (does not overwrite)', () => {
    const target = join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md');
    mkdirSync(join(vaultDir, '.agents', 'skills', 'list-trails'), { recursive: true });
    writeFileSync(target, 'user customization');

    installSkills({ source: sourceDir, vault: vaultDir });

    expect(readFileSync(target, 'utf-8')).toBe('user customization');
  });

  it('overwrites when force is true', () => {
    const target = join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md');
    mkdirSync(join(vaultDir, '.agents', 'skills', 'list-trails'), { recursive: true });
    writeFileSync(target, 'user customization');

    installSkills({ source: sourceDir, vault: vaultDir, force: true });

    expect(readFileSync(target, 'utf-8')).toContain('name: list-trails');
  });
});
