import { Contribution } from './contribution';

describe('Contribution', () => {
  describe('constructor', () => {
    it('should create a contribution with date, count, and type', () => {
      const date = new Date('2025-01-01');
      const count = 10;
      const type = 'commit';

      const contribution = new Contribution(date, count, type);

      expect(contribution).toBeInstanceOf(Contribution);
      expect(contribution.date).toEqual(date);
      expect(contribution.count).toBe(count);
      expect(contribution.type).toBe(type);
    });

    it('should create a contribution with zero count', () => {
      const date = new Date('2025-01-01');
      const count = 0;
      const type = 'commit';

      const contribution = new Contribution(date, count, type);

      expect(contribution).toBeInstanceOf(Contribution);
      expect(contribution.date).toEqual(date);
      expect(contribution.count).toBe(count);
      expect(contribution.type).toBe(type);
    });

    it('should handle large contribution counts', () => {
      const date = new Date('2025-12-31');
      const count = 1000;
      const type = 'commit';

      const contribution = new Contribution(date, count, type);

      expect(contribution).toBeInstanceOf(Contribution);
      expect(contribution.date).toEqual(date);
      expect(contribution.count).toBe(count);
      expect(contribution.type).toBe(type);
    });
  });
});
