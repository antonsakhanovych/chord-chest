import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseSongFile } from './parseSong';
import { extractChords } from './extractChords';

describe('songs/lift.cho', () => {
	it('parses without throwing and has the expected title and at least one chord', () => {
		const raw = readFileSync('songs/lift.cho', 'utf-8');
		const { song } = parseSongFile(raw);
		expect(song.title).toBe('Лифт');
		expect(extractChords(song).length).toBeGreaterThan(0);
	});
});
