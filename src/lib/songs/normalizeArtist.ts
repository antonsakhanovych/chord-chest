export function normalizeArtist(artist: string | string[] | null | undefined): string {
  return Array.isArray(artist) ? artist.join(', ') : artist || '';
}
