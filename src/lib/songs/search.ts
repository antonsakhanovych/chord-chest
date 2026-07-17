import Fuse from 'fuse.js';
import type { SongMeta } from './songIndex';

export function createSongSearch(songs: SongMeta[]): Fuse<SongMeta> {
  return new Fuse(songs, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'artist', weight: 1 }
    ],
    threshold: 0.5
  });
}
