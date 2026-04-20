import { Command } from 'commander';

const program = new Command();

program
  .name('estudeme')
  .description('EstudeMe — self-directed learning vault CLI')
  .version('0.0.0');

program.parse(process.argv);
