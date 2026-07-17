import { describe, it, expect } from 'vitest';
import { ChordProParser } from 'chordsheetjs';
import { extractChords } from './extractChords';

describe('extractChords', () => {
  it('returns unique chords in order of first appearance', () => {
    const song = new ChordProParser().parse('La [Am]la [C]la [Am]la [D]la\n');
    expect(extractChords(song)).toEqual(['Am', 'C', 'D']);
  });

  it('returns an empty array for a song with no chords', () => {
    const song = new ChordProParser().parse('la la la la\n');
    expect(extractChords(song)).toEqual([]);
  });
});
