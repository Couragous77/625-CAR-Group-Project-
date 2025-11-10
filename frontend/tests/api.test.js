import { describe, it, expect } from 'vitest';
import { buildQueryString, APIError } from '../src/utils/api';

describe('API Utilities', () => {
  describe('buildQueryString', () => {
    it('should build query string from params', () => {
      const params = {
        page: 1,
        limit: 20,
        sort_by: 'date',
      };
      const result = buildQueryString(params);
      expect(result).toBe('?page=1&limit=20&sort_by=date');
    });

    it('should skip null/undefined/empty values', () => {
      const params = {
        page: 1,
        category: null,
        search: undefined,
        status: '',
      };
      const result = buildQueryString(params);
      expect(result).toBe('?page=1');
    });

    it('should return empty string for empty params', () => {
      const result = buildQueryString({});
      expect(result).toBe('');
    });

    it('should handle special characters', () => {
      const params = {
        search: 'coffee & tea',
      };
      const result = buildQueryString(params);
      expect(result).toContain('search=coffee');
    });

    it('should handle arrays', () => {
      const params = {
        ids: ['1', '2', '3'],
      };
      const result = buildQueryString(params);
      expect(result).toContain('ids=1');
    });
  });

  describe('APIError', () => {
    it('should create error with message, status, and data', () => {
      const error = new APIError('Not found', 404, { detail: 'Resource not found' });
      expect(error.message).toBe('Not found');
      expect(error.status).toBe(404);
      expect(error.data).toEqual({ detail: 'Resource not found' });
      expect(error.name).toBe('APIError');
    });

    it('should be instanceof Error', () => {
      const error = new APIError('Error', 500, null);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof APIError).toBe(true);
    });
  });
});
