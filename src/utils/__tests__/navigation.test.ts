import { describe, it, expect } from 'vitest';
import { clampQuestionIndex } from '../navigation';

describe('clampQuestionIndex', () => {
  const productQuestionCount = 13;

  it('clamps negative values to zero', () => {
    expect(clampQuestionIndex(-1, productQuestionCount)).toBe(0);
    expect(clampQuestionIndex(-99, productQuestionCount)).toBe(0);
  });

  it('preserves zero', () => {
    expect(clampQuestionIndex(0, productQuestionCount)).toBe(0);
  });

  it('preserves the final question index', () => {
    expect(clampQuestionIndex(12, productQuestionCount)).toBe(12);
  });

  it('clamps oversized values to the final question index', () => {
    expect(clampQuestionIndex(13, productQuestionCount)).toBe(12);
    expect(clampQuestionIndex(20, productQuestionCount)).toBe(12);
    expect(clampQuestionIndex(99, productQuestionCount)).toBe(12);
  });

  it('derives bounds from a shorter mocked question dataset', () => {
    const shortCount = 5;

    expect(clampQuestionIndex(-1, shortCount)).toBe(0);
    expect(clampQuestionIndex(0, shortCount)).toBe(0);
    expect(clampQuestionIndex(4, shortCount)).toBe(4);
    expect(clampQuestionIndex(10, shortCount)).toBe(4);
  });
});
