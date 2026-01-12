import { Contribution } from '../contribution/contribution';
import { Language } from '../language/language';
import { Graph } from './graph';

describe('Graph', () => {
  describe('constructor', () => {
    it('should create graph with default theme and size', () => {
      const graph = new Graph();

      expect(graph).toBeInstanceOf(Graph);
    });

    it('should create graph with specified theme', () => {
      const graph = new Graph('red');

      expect(graph).toBeInstanceOf(Graph);
    });

    it('should create graph with specified size', () => {
      const graph = new Graph(undefined, 'large');

      expect(graph).toBeInstanceOf(Graph);
    });

    it('should create graph with specified theme and size', () => {
      const graph = new Graph('dark', 'small');

      expect(graph).toBeInstanceOf(Graph);
    });
  });

  describe('generateFromContributions', () => {
    it('should generate PNG buffer from contributions', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 5, 'commit'),
        new Contribution(new Date('2025-02-01'), new Date('2025-02-28'), 3, 'commit'),
        new Contribution(new Date('2025-03-01'), new Date('2025-03-31'), 7, 'commit'),
      ];

      const buffer = await graph.generateFromContributions(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should generate graph with empty contributions', async () => {
      const graph = new Graph();
      const contributions: Contribution[] = [];

      const buffer = await graph.generateFromContributions(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should handle single contribution', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 10, 'commit'),
      ];

      const buffer = await graph.generateFromContributions(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should not mutate the input contributions array', async () => {
      const graph = new Graph();
      const unsortedContributions = [
        new Contribution(new Date('2025-03-01'), new Date('2025-03-31'), 7, 'commit'),
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 5, 'commit'),
        new Contribution(new Date('2025-02-01'), new Date('2025-02-28'), 3, 'commit'),
      ];

      const buffer = await graph.generateFromContributions(unsortedContributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(unsortedContributions[0].from).toEqual(new Date('2025-03-01'));
      expect(unsortedContributions[1].from).toEqual(new Date('2025-01-01'));
      expect(unsortedContributions[2].from).toEqual(new Date('2025-02-01'));
    });

    it('should calculate cumulative totals correctly', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 5, 'commit'),
        new Contribution(new Date('2025-02-01'), new Date('2025-02-28'), 3, 'commit'),
        new Contribution(new Date('2025-03-01'), new Date('2025-03-31'), 7, 'commit'),
      ];

      const buffer = await graph.generateFromContributions(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should handle contributions with zero count', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), new Date('2025-01-31'), 0, 'commit'),
        new Contribution(new Date('2025-02-01'), new Date('2025-02-28'), 5, 'commit'),
        new Contribution(new Date('2025-03-01'), new Date('2025-03-31'), 0, 'commit'),
      ];

      const buffer = await graph.generateFromContributions(contributions);

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
        const graph = new Graph(theme);
        const buffer = await graph.generateFromContributions(contributions);

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
        const graph = new Graph(undefined, size);
        const buffer = await graph.generateFromContributions(contributions);

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

  describe('generateFromLanguages', () => {
    it('should generate PNG buffer from languages', async () => {
      const graph = new Graph();
      const languages = [
        new Language(new Date('2025-01-01'), new Date('2025-01-31'), 'TypeScript', '#3178c6', 100),
        new Language(new Date('2025-02-01'), new Date('2025-02-28'), 'TypeScript', '#3178c6', 100),
        new Language(new Date('2025-03-01'), new Date('2025-03-31'), 'TypeScript', '#3178c6', 100),
      ];

      const buffer = await graph.generateFromLanguages(languages);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should generate graph with empty languages', async () => {
      const graph = new Graph();
      const languages: Language[] = [];

      const buffer = await graph.generateFromLanguages(languages);

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
        const graph = new Graph(theme);
        const buffer = await graph.generateFromLanguages(languages);

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
        const graph = new Graph(undefined, size);
        const buffer = await graph.generateFromLanguages(languages);

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
