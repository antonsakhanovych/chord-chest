import { ChordLyricsPair, Tag, type Line, type Song } from 'chordsheetjs';
import type { Content, ContextPageSize, TDocumentDefinitions } from 'pdfmake/interfaces';
import { normalizeArtist } from '../songs/normalizeArtist';

const CHORD_FONT_SIZE = 10;
const LYRIC_FONT_SIZE = 11;

const COLOR_PAPER = '#e6dcc3';
const COLOR_INK = '#2a2420';
const COLOR_MARK = '#9c3123';
const COLOR_WHITE = '#ffffff';
const COLOR_BLACK = '#000000';

export type PdfTheme = 'styled' | 'print';

function sectionHeadingText(line: Line): string | null {
	if (line.items.length === 1 && line.items[0] instanceof Tag && line.items[0].name === 'comment') {
		return line.items[0].value ?? null;
	}
	return null;
}

function buildChordLyricLines(line: Line): { chordLine: string; lyricLine: string } | null {
	const pairs = line.items.filter(
		(item): item is ChordLyricsPair => item instanceof ChordLyricsPair
	);
	if (pairs.length === 0) return null;

	let lyricLine = '';
	let chordLine = '';

	for (const pair of pairs) {
		const anchor = lyricLine.length;
		lyricLine += pair.lyrics ?? '';

		if (pair.chords) {
			chordLine =
				chordLine.length > anchor
					? chordLine + pair.chords
					: chordLine.padEnd(anchor, ' ') + pair.chords;
		}
	}

	return { chordLine, lyricLine };
}

export function toPdfDocDefinition(song: Song, theme: PdfTheme = 'styled'): TDocumentDefinitions {
	const isPrint = theme === 'print';
	const colorBackground = isPrint ? COLOR_WHITE : COLOR_PAPER;
	const colorText = isPrint ? COLOR_BLACK : COLOR_INK;
	const colorChord = isPrint ? COLOR_BLACK : COLOR_MARK;

	const content: Content[] = [
		{
			text: song.title ?? '',
			font: 'Body',
			fontSize: 20,
			bold: true,
			color: colorText,
			margin: [0, 0, 0, 2]
		},
		{
			text: normalizeArtist(song.artist),
			font: 'Body',
			fontSize: 12,
			italics: true,
			color: colorText,
			margin: [0, 0, 0, 12]
		}
	];

	for (const paragraph of song.paragraphs) {
		for (const line of paragraph.lines) {
			const heading = sectionHeadingText(line);
			if (heading !== null) {
				content.push({
					text: heading,
					bold: true,
					font: 'Mono',
					color: colorText,
					margin: [0, 10, 0, 4]
				});
				continue;
			}

			const rendered = buildChordLyricLines(line);
			if (!rendered) continue;

			content.push({
				stack: [
					{
						text: rendered.chordLine || ' ',
						font: 'Mono',
						fontSize: CHORD_FONT_SIZE,
						color: colorChord
					},
					{
						text: rendered.lyricLine,
						font: 'Mono',
						fontSize: LYRIC_FONT_SIZE,
						color: colorText,
						margin: [0, 0, 0, 2]
					}
				]
			});
		}
	}

	return {
		content,
		background: (_currentPage: number, pageSize: ContextPageSize) => ({
			canvas: [
				{ type: 'rect', x: 0, y: 0, w: pageSize.width, h: pageSize.height, color: colorBackground }
			]
		}),
		defaultStyle: { font: 'Mono', color: colorText },
		pageMargins: [40, 40, 40, 40]
	};
}
