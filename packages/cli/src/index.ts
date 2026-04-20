import { Command } from 'commander';
import { runValidate } from './commands/validate.js';

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

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
