import { describe, it, expect } from 'vitest';
import { todayDateString, addDaysToDateString, dateStringDiffInDays, isValidDateString } from '@/lib/dates';

describe('isValidDateString', () => {
  it('accepts real calendar dates', () => {
    expect(isValidDateString('2026-08-10')).toBe(true);
    expect(isValidDateString('2024-02-29')).toBe(true); // leap day
  });

  it('rejects malformed and impossible dates', () => {
    expect(isValidDateString('2026-8-1')).toBe(false);
    expect(isValidDateString('2026-13-01')).toBe(false);
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(isValidDateString('2025-02-29')).toBe(false); // not a leap year
    expect(isValidDateString('not-a-date')).toBe(false);
  });
});

describe('todayDateString', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('addDaysToDateString', () => {
  it('adds positive days, rolling over month boundaries', () => {
    expect(addDaysToDateString('2026-08-31', 1)).toBe('2026-09-01');
  });

  it('subtracts with negative days, rolling backward over year boundaries', () => {
    expect(addDaysToDateString('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('dateStringDiffInDays', () => {
  it('returns the number of days between two dates, a minus b', () => {
    expect(dateStringDiffInDays('2026-08-07', '2026-08-05')).toBe(2);
    expect(dateStringDiffInDays('2026-08-05', '2026-08-07')).toBe(-2);
  });
});
