import { describe, it, expect } from 'vitest';
import { ChordProParser } from 'chordsheetjs';
import { groupTabLines } from './groupTabLines';

const parser = new ChordProParser();

describe('groupTabLines', () => {
	it('passes through lines with no tab lines unchanged', () => {
		const song = parser.parse('[Am]Hello world');
		const lines = song.paragraphs[0].lines;

		expect(groupTabLines(lines)).toEqual(lines.map((line) => ({ kind: 'line', line })));
	});

	it('groups consecutive tab lines into a single run with newline-joined text', () => {
		const song = parser.parse('{start_of_tab}\ne|--0--|\nB|--1--|\n{end_of_tab}');
		const lines = song.paragraphs[0].lines;

		expect(groupTabLines(lines)).toEqual([{ kind: 'tab', text: 'e|--0--|\nB|--1--|' }]);
	});

	it('closes a tab run when a non-tab line follows it, keeping the line separate', () => {
		const tabSong = parser.parse('{start_of_tab}\ne|--0--|\n{end_of_tab}');
		const lyricSong = parser.parse('[Am]Some lyrics');
		const lines = [...tabSong.paragraphs[0].lines, ...lyricSong.paragraphs[0].lines];

		expect(groupTabLines(lines)).toEqual([
			{ kind: 'tab', text: 'e|--0--|' },
			{ kind: 'line', line: lyricSong.paragraphs[0].lines[0] }
		]);
	});

	it('handles a heading, a tab run, and a lyric line as three separate runs', () => {
		const headingAndTabSong = parser.parse(
			'{comment: Intro}\n{start_of_tab}\ne|--0--|\n{end_of_tab}'
		);
		const lyricSong = parser.parse('[Am]Some lyrics');
		const lines = [...headingAndTabSong.paragraphs[0].lines, ...lyricSong.paragraphs[0].lines];

		expect(groupTabLines(lines)).toEqual([
			{ kind: 'line', line: headingAndTabSong.paragraphs[0].lines[0] },
			{ kind: 'tab', text: 'e|--0--|' },
			{ kind: 'line', line: lyricSong.paragraphs[0].lines[0] }
		]);
	});

	it('groups multiple separate tab runs independently', () => {
		const tab1 = parser.parse('{start_of_tab}\ne|--0--|\n{end_of_tab}');
		const lyric = parser.parse('[Am]lyric line');
		const tab2 = parser.parse('{start_of_tab}\ne|--3--|\n{end_of_tab}');
		const lines = [
			...tab1.paragraphs[0].lines,
			...lyric.paragraphs[0].lines,
			...tab2.paragraphs[0].lines
		];

		expect(groupTabLines(lines)).toEqual([
			{ kind: 'tab', text: 'e|--0--|' },
			{ kind: 'line', line: lyric.paragraphs[0].lines[0] },
			{ kind: 'tab', text: 'e|--3--|' }
		]);
	});

	it('returns an empty array for no lines', () => {
		expect(groupTabLines([])).toEqual([]);
	});

	it('drops a tab run whose lines are all blank', () => {
		const song = parser.parse('{start_of_tab}\n\n{end_of_tab}');
		const lines = song.paragraphs[0].lines;

		expect(groupTabLines(lines)).toEqual([]);
	});
});
