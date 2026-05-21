import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const skillsDir = join(__dirname, '../../../../.agents/skills');

const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe('Skill catalog shape', () => {
  it('has at least one skill', () => {
    expect(skillDirs.length).toBeGreaterThan(0);
  });

  describe.each(skillDirs)('skill: %s', (skillName) => {
    const skillPath = join(skillsDir, skillName, 'SKILL.md');

    it('has a SKILL.md file', () => {
      expect(statSync(skillPath).isFile()).toBe(true);
    });

    it('has required frontmatter (name, description)', () => {
      const content = readFileSync(skillPath, 'utf-8');
      const parsed = matter(content);

      expect(parsed.data.name).toBe(skillName);
      expect(parsed.data.description).toBeDefined();
      expect(typeof parsed.data.description).toBe('string');
      expect(parsed.data.description.length).toBeGreaterThan(0);
      expect(parsed.data.description.length).toBeLessThan(1024);
      expect(parsed.data.description).not.toMatch(/[<>]/);
    });

    it('has the required body sections', () => {
      const content = readFileSync(skillPath, 'utf-8');
      const parsed = matter(content);
      const body = parsed.content;

      expect(body).toMatch(/^# Skill:/m);

      const isMeta = skillName === 'review-vault-state';
      if (isMeta) {
        expect(body).toMatch(/^## Quando usar/m);
        expect(body).toMatch(/^## Workflow/m);
      } else {
        expect(body).toMatch(/^## Instructions/m);
        expect(body).toMatch(/^## Critical/m);
        expect(body).toMatch(/^## Examples/m);
        expect(body).toMatch(/^## Troubleshooting/m);
      }
    });
  });
});
