import { describe, it, expect } from 'vitest';
import { formatCategoryName } from '../utils/formatters';

describe('formatCategoryName', () => {
  it('should convert a slug to a formatted category name', () => {
    expect(formatCategoryName('bed-linen')).toBe('Bed Linen');
  });

  it('should handle single word slugs', () => {
    expect(formatCategoryName('curtains')).toBe('Curtains');
  });

  it('should handle multiple words', () => {
    expect(formatCategoryName('bath-towels-and-robes')).toBe('Bath Towels And Robes');
  });

  it('should handle empty string', () => {
    expect(formatCategoryName('')).toBe('');
  });

  it('should handle single character words', () => {
    expect(formatCategoryName('a-b-c')).toBe('A B C');
  });
});