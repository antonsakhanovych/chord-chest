import { describe, it, expect } from 'vitest';
import { buildIndex } from './songIndex';

const FILES: Record<string, string> = {
	'/songs/zzz-song.cho': '{title: Zebra Song}\n{artist: Z Artist}\n\nla [C]la\n',
	'/songs/aaa-song.cho': '{title: Apple Song}\n{artist: A Artist}\n\nla [G]la\n',
	'/songs/no-title.cho': 'la [Am]la\n'
};

describe('buildIndex', () => {
	it('derives slug from the filename, sorted by title', () => {
		const index = buildIndex(FILES);
		expect(index.map((s) => s.slug)).toEqual(['aaa-song', 'no-title', 'zzz-song']);
	});

	it('falls back to the slug as the title when no {title:} directive is present', () => {
		const index = buildIndex(FILES);
		const noTitle = index.find((s) => s.slug === 'no-title');
		expect(noTitle?.title).toBe('no-title');
	});

	it('carries the imageFilename through from parseSongFile', () => {
		const withImage = { '/songs/img.cho': '{title: T}\n{x_image: cover.jpg}\n\nla [C]la\n' };
		const index = buildIndex(withImage);
		expect(index[0].imageFilename).toBe('cover.jpg');
	});
});
