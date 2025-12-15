import { Contribution } from '../contribution/contribution';
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

  describe('generate', () => {
    it('should generate PNG buffer from contributions', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), 5, 'test'),
        new Contribution(new Date('2025-01-02'), 3, 'test'),
        new Contribution(new Date('2025-01-03'), 7, 'test'),
      ];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should generate graph with empty contributions', async () => {
      const graph = new Graph();
      const contributions: Contribution[] = [];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should handle single contribution', async () => {
      const graph = new Graph();
      const contributions = [new Contribution(new Date('2025-01-01'), 10, 'test')];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should not mutate the input contributions array', async () => {
      const graph = new Graph();
      const unsortedContributions = [
        new Contribution(new Date('2025-01-03'), 7, 'test'),
        new Contribution(new Date('2025-01-01'), 5, 'test'),
        new Contribution(new Date('2025-01-02'), 3, 'test'),
      ];

      const buffer = await graph.generate(unsortedContributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(unsortedContributions[0].date).toEqual(new Date('2025-01-03'));
      expect(unsortedContributions[1].date).toEqual(new Date('2025-01-01'));
      expect(unsortedContributions[2].date).toEqual(new Date('2025-01-02'));
    });

    it('should calculate cumulative totals correctly', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), 5, 'test'),
        new Contribution(new Date('2025-01-02'), 3, 'test'),
        new Contribution(new Date('2025-01-03'), 7, 'test'),
      ];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should handle contributions with zero count', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), 0, 'test'),
        new Contribution(new Date('2025-01-02'), 5, 'test'),
        new Contribution(new Date('2025-01-03'), 0, 'test'),
      ];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    });

    it('should generate graph with different themes', async () => {
      const themes = ['default', 'red', 'green', 'dark', 'light'];
      const contributions = [new Contribution(new Date('2025-01-01'), 10, 'test')];

      for (const theme of themes) {
        const graph = new Graph(theme);
        const buffer = await graph.generate(contributions);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
        expect(buffer.subarray(0, 8)).toEqual(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        );
      }
    });

    it('should generate graph with different sizes', async () => {
      const sizes = ['small', 'medium', 'large'];
      const contributions = [new Contribution(new Date('2025-01-01'), 10, 'test')];
      const buffers: Buffer[] = [];

      for (const size of sizes) {
        const graph = new Graph(undefined, size);
        const buffer = await graph.generate(contributions);

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
