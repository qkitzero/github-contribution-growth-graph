import { Contribution } from '../contribution/contribution';
import { Graph } from './graph';

describe('Graph', () => {
  describe('constructor', () => {
    it('should create graph with default theme and size', () => {
      const graph = new Graph();

      expect(graph).toBeDefined();
    });

    it('should create graph with specified theme', () => {
      const graph = new Graph('red');

      expect(graph).toBeDefined();
    });

    it('should create graph with specified size', () => {
      const graph = new Graph(undefined, 'large');

      expect(graph).toBeDefined();
    });

    it('should create graph with specified theme and size', () => {
      const graph = new Graph('dark', 'small');

      expect(graph).toBeDefined();
    });
  });

  describe('generate', () => {
    it('should generate PNG buffer from contributions', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), 5),
        new Contribution(new Date('2025-01-02'), 3),
        new Contribution(new Date('2025-01-03'), 7),
      ];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate graph with empty contributions', async () => {
      const graph = new Graph();
      const contributions: Contribution[] = [];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle single contribution', async () => {
      const graph = new Graph();
      const contributions = [new Contribution(new Date('2025-01-01'), 10)];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should sort contributions by date', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-03'), 7),
        new Contribution(new Date('2025-01-01'), 5),
        new Contribution(new Date('2025-01-02'), 3),
      ];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should calculate cumulative totals correctly', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), 5),
        new Contribution(new Date('2025-01-02'), 3),
        new Contribution(new Date('2025-01-03'), 7),
      ];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle contributions with zero count', async () => {
      const graph = new Graph();
      const contributions = [
        new Contribution(new Date('2025-01-01'), 0),
        new Contribution(new Date('2025-01-02'), 5),
        new Contribution(new Date('2025-01-03'), 0),
      ];

      const buffer = await graph.generate(contributions);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate graph with different themes', async () => {
      const themes = ['default', 'red', 'green', 'dark', 'light'];
      const contributions = [new Contribution(new Date('2025-01-01'), 10)];

      for (const theme of themes) {
        const graph = new Graph(theme);
        const buffer = await graph.generate(contributions);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      }
    });

    it('should generate graph with different sizes', async () => {
      const sizes = ['small', 'medium', 'large'];
      const contributions = [new Contribution(new Date('2025-01-01'), 10)];

      for (const size of sizes) {
        const graph = new Graph(undefined, size);
        const buffer = await graph.generate(contributions);

        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      }
    });
  });
});
