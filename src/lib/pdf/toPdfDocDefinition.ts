import { ChordLyricsPair, Tag, type Line, type Song } from 'chordsheetjs';
import type { Column, Content, ContextPageSize, TDocumentDefinitions } from 'pdfmake/interfaces';
import { normalizeArtist } from '../songs/normalizeArtist';
import { groupTabLines } from '../songs/groupTabLines';

// The chord/lyric alignment technique relies on both lines sharing the exact same monospace
// character pitch — a monospace font's advance width scales with font size, so rendering the
// two lines at different sizes silently breaks column alignment (confirmed empirically: a
// 10pt/11pt split produced 6.0pt vs 6.6pt character advances, drifting further apart every
// character). Both lines must use this one shared size; visual distinction between them comes
// from weight/color, not size.
const GRID_FONT_SIZE = 11;

// Roboto Mono's advance width is a fixed 600/1000 em, confirmed by direct measurement of real
// generated PDF output (6.601pt character width at 11pt font size = 0.6001 ratio).
const MONO_CHAR_WIDTH_RATIO = 0.6;

const COLOR_PAPER = '#e6dcc3';
const COLOR_INK = '#2a2420';
const COLOR_MARK = '#9c3123';
const COLOR_WHITE = '#ffffff';
const COLOR_BLACK = '#000000';
const COLOR_BORDER_STYLED = '#5c5242';
const COLOR_BORDER_PRINT = '#999999';

export type PdfTheme = 'styled' | 'print';

function sectionHeadingText(line: Line): string | null {
	if (line.items.length === 1 && line.items[0] instanceof Tag && line.items[0].name === 'comment') {
		return line.items[0].value ?? null;
	}
	return null;
}

function buildLyricLine(line: Line): string {
	const pairs = line.items.filter(
		(item): item is ChordLyricsPair => item instanceof ChordLyricsPair
	);
	return pairs.map((pair) => pair.lyrics ?? '').join('');
}

// Builds the chord row as explicit numeric-width spacer columns instead of space-padded text.
// pdfmake trims leading/trailing whitespace from a text node before layout — confirmed
// empirically that this collapses ANY whitespace character, including non-breaking spaces
// (ECMAScript's \s, which pdfmake's trimming appears to rely on, includes U+00A0). Column
// widths are pure layout arithmetic, not text content, so they aren't subject to that trimming
// at all — the same technique already used for the chord-diagram row layout below.
function buildChordRowColumns(line: Line, colorChord: string): Column[] | null {
	const pairs = line.items.filter(
		(item): item is ChordLyricsPair => item instanceof ChordLyricsPair
	);
	const charWidth = GRID_FONT_SIZE * MONO_CHAR_WIDTH_RATIO;

	const columns: Column[] = [];
	let lyricCharsSoFar = 0;
	let columnCursorChars = 0;

	for (const pair of pairs) {
		const anchor = lyricCharsSoFar;
		lyricCharsSoFar += (pair.lyrics ?? '').length;
		if (!pair.chords) continue;

		const gapChars = anchor - columnCursorChars;
		if (gapChars > 0) {
			columns.push({ text: '', width: gapChars * charWidth });
			columnCursorChars += gapChars;
		}
		columns.push({
			text: pair.chords,
			width: 'auto',
			font: 'Mono',
			fontSize: GRID_FONT_SIZE,
			bold: true,
			color: colorChord
		});
		columnCursorChars += pair.chords.length;
	}

	return columns.length > 0 ? columns : null;
}

function buildTabBlock(text: string, colorText: string, colorBorder: string): Content {
	return {
		margin: [0, 10, 0, 10],
		table: {
			widths: ['*'],
			body: [
				[
					{
						text,
						font: 'Mono',
						fontSize: GRID_FONT_SIZE,
						color: colorText,
						border: [true, true, true, true]
					}
				]
			]
		},
		layout: {
			hLineColor: () => colorBorder,
			vLineColor: () => colorBorder,
			hLineWidth: () => 0.75,
			vLineWidth: () => 0.75,
			paddingLeft: () => 8,
			paddingRight: () => 8,
			paddingTop: () => 6,
			paddingBottom: () => 6
		}
	};
}

export function toPdfDocDefinition(song: Song, theme: PdfTheme = 'styled'): TDocumentDefinitions {
	const isPrint = theme === 'print';
	const colorBackground = isPrint ? COLOR_WHITE : COLOR_PAPER;
	const colorText = isPrint ? COLOR_BLACK : COLOR_INK;
	const colorChord = isPrint ? COLOR_BLACK : COLOR_MARK;
	const colorBorder = isPrint ? COLOR_BORDER_PRINT : COLOR_BORDER_STYLED;

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
		for (const run of groupTabLines(paragraph.lines)) {
			if (run.kind === 'tab') {
				content.push(buildTabBlock(run.text, colorText, colorBorder));
				continue;
			}

			const line = run.line;
			const heading = sectionHeadingText(line);
			if (heading !== null) {
				content.push({
					text: heading,
					bold: true,
					font: 'Mono',
					fontSize: GRID_FONT_SIZE + 2,
					color: colorText,
					margin: [0, 14, 0, 6]
				});
				continue;
			}

			const pairs = line.items.filter(
				(item): item is ChordLyricsPair => item instanceof ChordLyricsPair
			);
			if (pairs.length === 0) continue;

			const chordColumns = buildChordRowColumns(line, colorChord);
			const lyricLine = buildLyricLine(line);

			content.push({
				stack: [
					chordColumns
						? { columns: chordColumns, columnGap: 0 }
						: { text: ' ', font: 'Mono', fontSize: GRID_FONT_SIZE },
					{
						text: lyricLine,
						font: 'Mono',
						fontSize: GRID_FONT_SIZE,
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
