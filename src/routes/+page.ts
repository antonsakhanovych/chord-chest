import { getSongFiles } from '$lib/songs/loadAll';
import { buildIndex } from '$lib/songs/songIndex';

export function load() {
	return { songs: buildIndex(getSongFiles()) };
}
