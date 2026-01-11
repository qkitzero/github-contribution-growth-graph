import { Period } from './period';

describe('Period', () => {
  describe('constructor', () => {
    it('should create a Period instance with valid year and month', () => {
      const period = new Period(2023, 10);
      expect(period.year).toBe(2023);
      expect(period.month).toBe(10);
    });

    it('should throw an error for a month less than 1', () => {
      expect(() => new Period(2023, 0)).toThrow(
        'Invalid month: 0. Month must be between 1 and 12.',
      );
    });

    it('should throw an error for a month greater than 12', () => {
      expect(() => new Period(2023, 13)).toThrow(
        'Invalid month: 13. Month must be between 1 and 12.',
      );
    });
  });

  describe('fromDate', () => {
    it('should create a Period from a Date object', () => {
      const date = new Date('2023-10-20T00:00:00Z');
      const period = Period.fromDate(date);
      expect(period.year).toBe(2023);
      expect(period.month).toBe(10);
    });
  });

  describe('toString', () => {
    it('should format the period as YYYY/MM', () => {
      const period = new Period(2023, 10);
      expect(period.toString()).toBe('2023/10');
    });

    it('should pad the month with a leading zero if it is a single digit', () => {
      const period = new Period(2023, 9);
      expect(period.toString()).toBe('2023/09');
    });
  });
});
