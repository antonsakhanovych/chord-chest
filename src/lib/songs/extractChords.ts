import { ChordLyricsPair, type Song } from 'chordsheetjs';

export function extractChords(song: Song): string[] {
	const seen = new Set<string>();
	const chords: string[] = [];

	for (const paragraph of song.paragraphs) {
		for (const line of paragraph.lines) {
			for (const item of line.items) {
				if (item instanceof ChordLyricsPair && item.chords && !seen.has(item.chords)) {
					seen.add(item.chords);
					chords.push(item.chords);
				}
			}
		}
	}

	return chords;
}
