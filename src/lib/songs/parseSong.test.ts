import { describe, it, expect } from 'vitest';
import { parseSongFile } from './parseSong';
import type { ChordLyricsPair } from 'chordsheetjs';

const BASIC_SONG = `{title: Test Song}
{artist: Test Artist}

La [Am]la [C]la, la [D]la [F]la
`;

describe('parseSongFile', () => {
  it('extracts title and artist from directives', () => {
    const { song } = parseSongFile(BASIC_SONG);
    expect(song.title).toBe('Test Song');
    expect(song.artist).toBe('Test Artist');
  });

  it('returns null imageFilename when no x_image directive is present', () => {
    const { imageFilename } = parseSongFile(BASIC_SONG);
    expect(imageFilename).toBeNull();
  });

  it('extracts imageFilename from an x_image directive', () => {
    const withImage = `{title: Test Song}\n{x_image: cover.jpg}\n\nLa [Am]la [C]la\n`;
    const { imageFilename } = parseSongFile(withImage);
    expect(imageFilename).toBe('cover.jpg');
  });

  it('transposes chords by semitones', () => {
    const { song } = parseSongFile(BASIC_SONG);
    const transposed = song.transpose(2);
    const chordNames = transposed.lines
      .flatMap((l) => l.items)
      .filter((item): item is ChordLyricsPair => 'chords' in item && typeof item.chords === 'string')
      .map((item) => item.chords);
    expect(chordNames).toContain('Bm'); // Am + 2 semitones
  });

  it('parses a song with no chords at all without throwing', () => {
    const noChords = `{title: Instrumental Break}\n\nla la la la\n`;
    expect(() => parseSongFile(noChords)).not.toThrow();
  });
});
