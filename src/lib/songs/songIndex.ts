import { parseSongFile } from './parseSong';

export interface SongMeta {
  slug: string;
  title: string;
  artist: string;
  imageFilename: string | null;
}

export function buildIndex(files: Record<string, string>): SongMeta[] {
  return Object.entries(files)
    .map(([path, raw]) => {
      const slug = path.split('/').pop()!.replace(/\.cho$/, '');
      const { song, imageFilename } = parseSongFile(raw);
      return {
        slug,
        title: song.title || slug,
        artist: Array.isArray(song.artist) ? song.artist.join(', ') : song.artist || '',
        imageFilename
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
