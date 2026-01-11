import { Language } from './language';

describe('Language', () => {
  describe('constructor', () => {
    it('should create a language with from, to, name, color, and size', () => {
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');
      const name = 'TypeScript';
      const color = '#3178c6';
      const size = 1024;

      const language = new Language(from, to, name, color, size);

      expect(language).toBeInstanceOf(Language);
      expect(language.from).toEqual(from);
      expect(language.to).toEqual(to);
      expect(language.name).toBe(name);
      expect(language.color).toBe(color);
      expect(language.size).toBe(size);
    });

    it('should create a language with zero size', () => {
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');
      const name = 'TypeScript';
      const color = '#3178c6';
      const size = 0;

      const language = new Language(from, to, name, color, size);

      expect(language).toBeInstanceOf(Language);
      expect(language.from).toEqual(from);
      expect(language.to).toEqual(to);
      expect(language.name).toBe(name);
      expect(language.color).toBe(color);
      expect(language.size).toBe(size);
    });

    it('should handle large language sizes', () => {
      const from = new Date('2025-12-01');
      const to = new Date('2025-12-31');
      const name = 'Go';
      const color = '#00ADD8';
      const size = 1000000;

      const language = new Language(from, to, name, color, size);

      expect(language).toBeInstanceOf(Language);
      expect(language.from).toEqual(from);
      expect(language.to).toEqual(to);
      expect(language.name).toBe(name);
      expect(language.color).toBe(color);
      expect(language.size).toBe(size);
    });
  });
});
