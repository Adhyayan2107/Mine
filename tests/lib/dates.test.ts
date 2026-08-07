import { describe, it, expect } from 'vitest';
import { todayDateString, addDaysToDateString, dateStringDiffInDays } from '@/lib/dates';

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
