export class Period {
  constructor(
    readonly year: number,
    readonly month: number,
  ) {
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month: ${month}. Month must be between 1 and 12.`);
    }
  }

  static fromDate(date: Date): Period {
    return new Period(date.getFullYear(), date.getMonth() + 1);
  }

  toString(): string {
    return `${this.year}/${String(this.month).padStart(2, '0')}`;
  }

  equals(other: Period): boolean {
    return this.year === other.year && this.month === other.month;
  }

  compareTo(other: Period): number {
    if (this.year !== other.year) {
      return this.year - other.year;
    }
    return this.month - other.month;
  }
}
