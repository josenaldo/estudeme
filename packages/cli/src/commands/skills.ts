import { Command } from 'commander';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installSkills } from '../lib/skills-installer.js';

export type SkillsSourceResolver = () => string;

const defaultSourceResolver: SkillsSourceResolver = () => {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, '..', 'skills');
};

export function registerSkillsCommand(
  program: Command,
  sourceResolver: SkillsSourceResolver = defaultSourceResolver
): void {
  const skills = program.command('skills').description('Manage EstudeMe skills for AI agents.');

  skills
    .command('install <vault>')
    .description('Install the EstudeMe skills into a vault directory (copies + creates symlinks).')
    .option('-f, --force', 'overwrite existing skill files in the vault', false)
    .action((vault: string, options: { force?: boolean }) => {
      try {
        installSkills({
          source: sourceResolver(),
          vault,
          force: options.force ?? false,
        });
        console.log(`Skills installed into ${vault}/.agents/skills (with .claude and .github symlinks).`);
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
