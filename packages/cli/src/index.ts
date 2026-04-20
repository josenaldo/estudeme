import { Command } from 'commander';
import { runValidate } from './commands/validate.js';
import { runTrailList, runTrailStatus } from './commands/trail.js';
import { runCardsList, runCardsExport } from './commands/cards.js';

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

const cards = program.command('cards').description('Manage flashcards');

cards
  .command('list')
  .description('List cards in the vault with optional filters')
  .option('-v, --vault <path>', 'vault path')
  .option('-t, --trail <name>', 'filter by trail')
  .option('-m, --module <name>', 'filter by module')
  .action(async (opts) => {
    const r = await runCardsList(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });

cards
  .command('export')
  .description('Export cards (json or apkg)')
  .requiredOption('-o, --output <path>', 'output file')
  .option('-f, --format <format>', 'json | apkg', 'json')
  .option('-v, --vault <path>', 'vault path')
  .option('-t, --trail <name>', 'filter by trail')
  .action(async (opts) => {
    const r = await runCardsExport(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
