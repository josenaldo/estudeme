import { Command } from 'commander';
import { runValidate } from './commands/validate.js';
import { runTrailList, runTrailStatus } from './commands/trail.js';

const program = new Command();

program
  .name('estudeme')
  .description('EstudeMe — self-directed learning vault CLI')
  .version('0.0.0');

program
  .command('validate')
  .description('Validate frontmatter, schemas, and wikilinks in the vault')
  .option('-v, --vault <path>', 'vault path (default: cwd)')
  .action(async (opts) => {
    const { exitCode, output } = await runValidate(opts);
    console.log(output);
    process.exit(exitCode);
  });

const trail = program.command('trail').description('Manage study trails');

trail
  .command('list')
  .description('List all trails with progress')
  .option('-v, --vault <path>', 'vault path')
  .action(async (opts) => {
    const r = await runTrailList(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });

trail
  .command('status <trail>')
  .description('Show detailed status for a trail')
  .option('-v, --vault <path>', 'vault path')
  .action(async (trailName, opts) => {
    const r = await runTrailStatus({ ...opts, trail: trailName });
    console.log(r.output);
    process.exit(r.exitCode);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
