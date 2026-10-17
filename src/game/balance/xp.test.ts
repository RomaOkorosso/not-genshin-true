import { describe, expect, it } from 'vitest';
import { xpRequiredForLevel } from './archer';

describe('xpRequiredForLevel', () => {
  it('grows linearly from base', () => {
    expect(xpRequiredForLevel(1)).toBe(5);
    expect(xpRequiredForLevel(2)).toBe(8);
    expect(xpRequiredForLevel(3)).toBe(11);
  });
});
