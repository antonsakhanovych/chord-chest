import { error } from '@sveltejs/kit';
import { getSongFiles, slugFromPath } from '$lib/songs/loadAll';
import { parseSongFile } from '$lib/songs/parseSong';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ params }) => {
  const files = getSongFiles();
  const entry = Object.entries(files).find(([path]) => slugFromPath(path) === params.slug);

  if (!entry) {
    error(404, 'Song not found');
  }

  const [, raw] = entry;
  const { song, imageFilename } = parseSongFile(raw);
  return { slug: params.slug, song, imageFilename };
};

export const entries: EntryGenerator = () => {
  const files = getSongFiles();
  return Object.keys(files).map((path) => ({ slug: slugFromPath(path) }));
};
