import { describe, it, expect } from 'vitest';
import { formatDate, getTodayString, toDateInputString, toISOString } from '../src/utils/date';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format date as "Month Day, Year"', () => {
      const date = new Date('2025-01-07T12:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 7, 2025/);
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2025-12-25');
      expect(formatted).toMatch(/Dec 2[45], 2025/); // Account for timezone
    });

    it('should return empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('getTodayString', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const today = getTodayString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return current date', () => {
      const today = getTodayString();
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(today).toBe(expected);
    });
  });

  describe('toDateInputString', () => {
    it('should convert Date to YYYY-MM-DD', () => {
      const date = new Date('2025-01-07T15:30:00Z');
      const result = toDateInputString(date);
      expect(result).toBe('2025-01-07');
    });

    it('should handle string input', () => {
      const result = toDateInputString('2025-12-25T00:00:00Z');
      expect(result).toBe('2025-12-25');
    });

    it('should return empty string for null/undefined', () => {
      expect(toDateInputString(null)).toBe('');
      expect(toDateInputString(undefined)).toBe('');
    });
  });

  describe('toISOString', () => {
    it('should convert YYYY-MM-DD to ISO string', () => {
      const result = toISOString('2025-01-07');
      expect(result).toContain('2025-01-07');
      expect(result).toContain('T');
      expect(result).toMatch(/\.000Z$/);
    });

    it('should return empty string for empty input', () => {
      expect(toISOString('')).toBe('');
      expect(toISOString(null)).toBe('');
      expect(toISOString(undefined)).toBe('');
    });
  });
});
