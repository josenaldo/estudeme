import kleur from 'kleur';
import Table from 'cli-table3';

export const c = {
  ok: (s: string) => kleur.green(s),
  err: (s: string) => kleur.red(s),
  warn: (s: string) => kleur.yellow(s),
  info: (s: string) => kleur.cyan(s),
  dim: (s: string) => kleur.gray(s),
  bold: (s: string) => kleur.bold(s),
};

export function progressBar(percent: number, width = 20): string {
  const filled = Math.round((percent / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function table(head: string[], rows: string[][]): string {
  const t = new Table({
    head: head.map((h) => kleur.bold(h)),
    style: { head: [], border: [] },
  });
  rows.forEach((r) => t.push(r));
  return t.toString();
}
