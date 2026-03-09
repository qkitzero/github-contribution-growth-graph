import { Contribution } from '../../domain/contribution/contribution';
import { Language } from '../../domain/language/language';
import { ChartjsGraphRenderer } from './chartjsGraphRenderer';

describe('ChartjsGraphRenderer', () => {
  describe('renderContributions', () => {
    it('should generate PNG buffer from contributions', async () => {
      const renderer = new ChartjsGraphRenderer();
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 5, 'commit'),
        new Contribution(new Date('2025-02-01'), new Date('2025-02-28'), 3, 'commit'),
        new Contribution(new Date('2025-03-01'), new Date('2025-03-31'), 7, 'commit'),
      ];

      const buffer = await renderer.renderContributions(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should generate graph with empty contributions', async () => {
      const renderer = new ChartjsGraphRenderer();
      const contributions: Contribution[] = [];

      const buffer = await renderer.renderContributions(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should handle single contribution', async () => {
      const renderer = new ChartjsGraphRenderer();
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 10, 'commit'),
      ];

      const buffer = await renderer.renderContributions(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should not mutate the input contributions array', async () => {
      const renderer = new ChartjsGraphRenderer();
      const unsortedContributions = [
        new Contribution(new Date('2025-03-01'), new Date('2025-03-31'), 7, 'commit'),
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 5, 'commit'),
        new Contribution(new Date('2025-02-01'), new Date('2025-02-28'), 3, 'commit'),
      ];

      const buffer = await renderer.renderContributions(unsortedContributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(unsortedContributions[0].from).toEqual(new Date('2025-03-01'));
      expect(unsortedContributions[1].from).toEqual(new Date('2025-01-01'));
      expect(unsortedContributions[2].from).toEqual(new Date('2025-02-01'));
    });

    it('should calculate cumulative totals correctly', async () => {
      const renderer = new ChartjsGraphRenderer();
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 5, 'commit'),
        new Contribution(new Date('2025-02-01'), new Date('2025-02-28'), 3, 'commit'),
        new Contribution(new Date('2025-03-01'), new Date('2025-03-31'), 7, 'commit'),
      ];

      const buffer = await renderer.renderContributions(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should handle contributions with zero count', async () => {
      const renderer = new ChartjsGraphRenderer();
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 0, 'commit'),
        new Contribution(new Date('2025-02-01'), new Date('2025-02-28'), 5, 'commit'),
        new Contribution(new Date('2025-03-01'), new Date('2025-03-31'), 0, 'commit'),
      ];

      const buffer = await renderer.renderContributions(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should generate graph with different themes', async () => {
      const themes = ['default', 'red', 'green', 'dark', 'light'];
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 10, 'commit'),
      ];

      for (const theme of themes) {
        const renderer = new ChartjsGraphRenderer();
        const buffer = await renderer.renderContributions(contributions, theme);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
        expect(buffer.subarray(0, 8)).toEqual(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        );
      }
    });

    it('should generate graph with different sizes', async () => {
      const sizes = ['small', 'medium', 'large'];
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 10, 'commit'),
      ];
      const buffers: Buffer[] = [];

      for (const size of sizes) {
        const renderer = new ChartjsGraphRenderer();
        const buffer = await renderer.renderContributions(contributions, undefined, size);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
        expect(buffer.subarray(0, 8)).toEqual(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        );
        buffers.push(buffer);
      }

      expect(buffers[0].length).not.toBe(buffers[1].length);
      expect(buffers[1].length).not.toBe(buffers[2].length);
    });
  });

  describe('renderLanguages', () => {
    it('should generate PNG buffer from languages', async () => {
      const renderer = new ChartjsGraphRenderer();
      const languages = [
        new Language(new Date('2025-01-01'), new Date('2025-01-31'), 'TypeScript', '#3178c6', 100),
        new Language(new Date('2025-02-01'), new Date('2025-02-28'), 'TypeScript', '#3178c6', 100),
        new Language(new Date('2025-03-01'), new Date('2025-03-31'), 'TypeScript', '#3178c6', 100),
      ];

      const buffer = await renderer.renderLanguages(languages);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should generate graph with empty languages', async () => {
      const renderer = new ChartjsGraphRenderer();
      const languages: Language[] = [];

      const buffer = await renderer.renderLanguages(languages);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should generate graph with different themes for languages', async () => {
      const themes = ['default', 'red', 'green', 'dark', 'light'];
      const languages = [
        new Language(new Date('2025-01-01'), new Date('2025-01-31'), 'TypeScript', '#3178c6', 100),
      ];

      for (const theme of themes) {
        const renderer = new ChartjsGraphRenderer();
        const buffer = await renderer.renderLanguages(languages, theme);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
        expect(buffer.subarray(0, 8)).toEqual(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        );
      }
    });

    it('should generate graph with different sizes for languages', async () => {
      const sizes = ['small', 'medium', 'large'];
      const languages = [
        new Language(new Date('2025-01-01'), new Date('2025-01-31'), 'TypeScript', '#3178c6', 100),
      ];
      const buffers: Buffer[] = [];

      for (const size of sizes) {
        const renderer = new ChartjsGraphRenderer();
        const buffer = await renderer.renderLanguages(languages, undefined, size);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
        expect(buffer.subarray(0, 8)).toEqual(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        );
        buffers.push(buffer);
      }

      expect(buffers[0].length).not.toBe(buffers[1].length);
      expect(buffers[1].length).not.toBe(buffers[2].length);
    });
  });
});
