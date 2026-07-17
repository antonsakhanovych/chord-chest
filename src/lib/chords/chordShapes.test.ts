import { describe, it, expect } from 'vitest';
import { getChordShape } from './chordShapes';

describe('getChordShape', () => {
  it('returns a 6-string shape for a common open chord', () => {
    const shape = getChordShape('Am');
    expect(shape?.fingers).toHaveLength(6);
  });

  it('returns undefined for an unrecognized chord name', () => {
    expect(getChordShape('Xyz123')).toBeUndefined();
  });

  it('maps a dominant 7th suffix correctly', () => {
    const shape = getChordShape('E7');
    expect(shape).toBeDefined();
  });
});
