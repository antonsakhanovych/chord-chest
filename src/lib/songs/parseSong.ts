import { ChordProParser, type Song } from 'chordsheetjs';

export interface ParsedSong {
	song: Song;
	imageFilename: string | null;
}

const IMAGE_DIRECTIVE = /^\{x_image:\s*(.+?)\s*\}$/m;

export function parseSongFile(raw: string): ParsedSong {
	const parser = new ChordProParser();
	const song = parser.parse(raw);
	const match = raw.match(IMAGE_DIRECTIVE);
	return { song, imageFilename: match ? match[1] : null };
}
