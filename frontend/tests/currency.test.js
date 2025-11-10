import { describe, it, expect } from 'vitest';
import { dollarsToCents, centsToDollars, formatCurrency } from '../src/utils/currency';

describe('Currency Utilities', () => {
  describe('dollarsToCents', () => {
    it('should convert dollars to cents', () => {
      expect(dollarsToCents(12.99)).toBe(1299);
      expect(dollarsToCents(100)).toBe(10000);
      expect(dollarsToCents(0.01)).toBe(1);
    });

    it('should handle string input', () => {
      expect(dollarsToCents('12.99')).toBe(1299);
      expect(dollarsToCents('0.50')).toBe(50);
    });

    it('should round to nearest cent', () => {
      expect(dollarsToCents(12.999)).toBe(1300);
      expect(dollarsToCents(12.994)).toBe(1299);
    });

    it('should handle invalid input', () => {
      expect(dollarsToCents('invalid')).toBe(0);
      expect(dollarsToCents(NaN)).toBe(0);
    });

    it('should handle zero', () => {
      expect(dollarsToCents(0)).toBe(0);
      expect(dollarsToCents('0')).toBe(0);
    });
  });

  describe('centsToDollars', () => {
    it('should convert cents to dollars', () => {
      expect(centsToDollars(1299)).toBe(12.99);
      expect(centsToDollars(10000)).toBe(100);
      expect(centsToDollars(1)).toBe(0.01);
    });

    it('should handle zero', () => {
      expect(centsToDollars(0)).toBe(0);
    });

    it('should handle large amounts', () => {
      expect(centsToDollars(999999)).toBe(9999.99);
    });
  });

  describe('formatCurrency', () => {
    it('should format cents as currency', () => {
      expect(formatCurrency(1299)).toBe('$12.99');
      expect(formatCurrency(10000)).toBe('$100.00');
      expect(formatCurrency(1)).toBe('$0.01');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-1299)).toBe('-$12.99');
    });

    it('should include thousands separator', () => {
      expect(formatCurrency(123456789)).toBe('$1,234,567.89');
    });
  });
});
