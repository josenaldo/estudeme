import { cpSync, existsSync, mkdirSync, readdirSync, statSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

export interface InstallSkillsOptions {
  source: string;
  vault: string;
  force?: boolean;
}

export function installSkills(options: InstallSkillsOptions): void {
  const { source, vault, force = false } = options;

  if (!existsSync(source)) {
    throw new Error(`Skill source directory not found: ${source}`);
  }

  if (!existsSync(vault) || !statSync(vault).isDirectory()) {
    throw new Error(`Vault directory not found or not a directory: ${vault}`);
  }

  const targetSkills = join(vault, '.agents', 'skills');
  mkdirSync(targetSkills, { recursive: true });

  copySkillsTree(source, targetSkills, force);
  createSymlink(join(vault, '.claude'), 'skills', '../.agents/skills');
  createSymlink(join(vault, '.github'), 'skills', '../.agents/skills');
}

function copySkillsTree(source: string, target: string, force: boolean): void {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (entry.name === '.gitkeep') continue;

    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(targetPath, { recursive: true });
      copySkillsTree(sourcePath, targetPath, force);
    } else if (entry.isFile()) {
      if (existsSync(targetPath) && !force) continue;
      cpSync(sourcePath, targetPath);
    }
  }
}

function createSymlink(parentDir: string, linkName: string, target: string): void {
  mkdirSync(parentDir, { recursive: true });
  const linkPath = join(parentDir, linkName);
  if (existsSync(linkPath)) return;
  symlinkSync(target, linkPath, 'dir');
}
