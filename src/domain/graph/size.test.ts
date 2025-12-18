import { Size } from './size';

describe('Size', () => {
  describe('constructor', () => {
    it('should use medium size when no name is provided', () => {
      const size = new Size();

      expect(size.width).toBe(800);
      expect(size.height).toBe(400);
    });

    it('should use medium size when name is "medium"', () => {
      const size = new Size('medium');

      expect(size.width).toBe(800);
      expect(size.height).toBe(400);
    });

    it('should use small size', () => {
      const size = new Size('small');

      expect(size.width).toBe(700);
      expect(size.height).toBe(350);
    });

    it('should use large size', () => {
      const size = new Size('large');

      expect(size.width).toBe(1000);
      expect(size.height).toBe(500);
    });

    it('should fallback to medium size for invalid size name', () => {
      const size = new Size('invalid-size');

      expect(size.width).toBe(800);
      expect(size.height).toBe(400);
    });

    it('should fallback to medium size for empty string', () => {
      const size = new Size('');

      expect(size.width).toBe(800);
      expect(size.height).toBe(400);
    });
  });
});
