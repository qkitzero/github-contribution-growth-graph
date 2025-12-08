import { Contribution } from './contribution';

describe('Contribution', () => {
  describe('constructor', () => {
    it('should create a contribution with date and count', () => {
      const date = new Date('2025-01-01');
      const count = 10;

      const contribution = new Contribution(date, count);

      expect(contribution.date).toBe(date);
      expect(contribution.count).toBe(count);
    });

    it('should create a contribution with zero count', () => {
      const date = new Date('2025-01-01');
      const count = 0;

      const contribution = new Contribution(date, count);

      expect(contribution.date).toBe(date);
      expect(contribution.count).toBe(count);
    });

    it('should handle large contribution counts', () => {
      const date = new Date('2025-12-31');
      const count = 1000;

      const contribution = new Contribution(date, count);

      expect(contribution.date).toBe(date);
      expect(contribution.count).toBe(count);
    });
  });
});
