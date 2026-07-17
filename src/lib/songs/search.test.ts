import { describe, it, expect } from 'vitest';
import { createSongSearch } from './search';
import type { SongMeta } from './songIndex';

const SONGS: SongMeta[] = [
  { slug: 'a', title: 'Лифт', artist: 'Варя Пипко', imageFilename: null },
  { slug: 'b', title: 'Some Other Song', artist: 'Another Artist', imageFilename: null }
];

describe('createSongSearch', () => {
  it('matches on a typo in the title', () => {
    const fuse = createSongSearch(SONGS);
    const results = fuse.search('Лфит'); // transposed letters
    expect(results[0]?.item.slug).toBe('a');
  });

  it('matches on artist name', () => {
    const fuse = createSongSearch(SONGS);
    const results = fuse.search('Пипко');
    expect(results[0]?.item.slug).toBe('a');
  });
});
