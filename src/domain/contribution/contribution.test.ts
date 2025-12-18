import { Contribution } from './contribution';

describe('Contribution', () => {
  describe('constructor', () => {
    it('should create a contribution with from, to, totalCount, and type', () => {
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');
      const totalCount = 10;
      const type = 'commit';

      const contribution = new Contribution(from, to, totalCount, type);

      expect(contribution).toBeInstanceOf(Contribution);
      expect(contribution.from).toEqual(from);
      expect(contribution.to).toEqual(to);
      expect(contribution.totalCount).toBe(totalCount);
      expect(contribution.type).toBe(type);
    });

    it('should create a contribution with zero count', () => {
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');
      const totalCount = 0;
      const type = 'commit';

      const contribution = new Contribution(from, to, totalCount, type);

      expect(contribution).toBeInstanceOf(Contribution);
      expect(contribution.from).toEqual(from);
      expect(contribution.to).toEqual(to);
      expect(contribution.totalCount).toBe(totalCount);
      expect(contribution.type).toBe(type);
    });

    it('should handle large contribution counts', () => {
      const from = new Date('2025-12-01');
      const to = new Date('2025-12-31');
      const totalCount = 1000;
      const type = 'commit';

      const contribution = new Contribution(from, to, totalCount, type);

      expect(contribution).toBeInstanceOf(Contribution);
      expect(contribution.from).toEqual(from);
      expect(contribution.to).toEqual(to);
      expect(contribution.totalCount).toBe(totalCount);
      expect(contribution.type).toBe(type);
    });
  });
});
