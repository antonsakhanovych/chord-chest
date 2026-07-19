import { describe, it, expect } from 'vitest';
import { ChordProParser } from 'chordsheetjs';
import { toPdfDocDefinition } from './toPdfDocDefinition';

const FIXTURE = `{title: Test Song}
{artist: Test Artist}
{comment: Verse 1}
La [Am]la [C]la
`;

describe('toPdfDocDefinition', () => {
	it('positions each chord as a spacer column sized to its character offset', () => {
		const song = new ChordProParser().parse(FIXTURE);
		const doc = toPdfDocDefinition(song);
		const stackNode = (doc.content as unknown as Array<Record<string, unknown>>).find(
			(node) => 'stack' in node
		) as {
			stack: [{ columns: Array<{ text: string; width?: number | string }> }, { text: string }];
		};
		const [chordRow, lyricNode] = stackNode.stack;

		// 'La ' is 3 chars before 'Am', then 'la ' is 3 more chars before 'C' (2 already consumed by 'Am').
		const CHAR_WIDTH = 11 * 0.6;
		expect(chordRow.columns).toEqual([
			{ text: '', width: 3 * CHAR_WIDTH },
			expect.objectContaining({ text: 'Am' }),
			{ text: '', width: 1 * CHAR_WIDTH },
			expect.objectContaining({ text: 'C' })
		]);
		expect(lyricNode.text).toBe('La la la');
	});

	it('renders a {comment: ...} directive as a bold section heading', () => {
		const song = new ChordProParser().parse(FIXTURE);
		const doc = toPdfDocDefinition(song);
		const heading = (doc.content as unknown as Array<Record<string, unknown>>).find(
			(node) => node.text === 'Verse 1'
		);
		expect(heading?.bold).toBe(true);
	});

	it('does not throw when two chords land on the same anchor column', () => {
		const crowded = `{title: T}\n[Am][C]la la\n`;
		const song = new ChordProParser().parse(crowded);
		expect(() => toPdfDocDefinition(song)).not.toThrow();
	});

	it('renders a tab block as a bordered stack of per-line columns', () => {
		const tabFixture = `{title: T}\n{start_of_tab}\ne|--0--|\nB|--1--|\n{end_of_tab}\n`;
		const song = new ChordProParser().parse(tabFixture);
		const doc = toPdfDocDefinition(song);
		const tabNode = (doc.content as unknown as Array<Record<string, unknown>>).find(
			(node) => 'table' in node
		) as {
			table: { body: [[{ stack: Array<{ columns: Array<{ text: string; font?: string }> }> }]] };
		};
		const cell = tabNode.table.body[0][0];

		expect(cell.stack).toHaveLength(2);
		expect(cell.stack[0].columns.map((c) => c.text).join('')).toBe('e|--0--|');
		expect(cell.stack[1].columns.map((c) => c.text).join('')).toBe('B|--1--|');
		expect(cell.stack[0].columns[0].font).toBe('Mono');
	});

	it('preserves leading whitespace on a tab line as a spacer column, not literal text', () => {
		const tabFixture = `{title: T}\n{start_of_tab}\n  e|--0--|\n{end_of_tab}\n`;
		const song = new ChordProParser().parse(tabFixture);
		const doc = toPdfDocDefinition(song);
		const tabNode = (doc.content as unknown as Array<Record<string, unknown>>).find(
			(node) => 'table' in node
		) as {
			table: {
				body: [[{ stack: Array<{ columns: Array<{ text: string; width?: number | string }> }> }]];
			};
		};
		const columns = tabNode.table.body[0][0].stack[0].columns;

		const CHAR_WIDTH = 11 * 0.6;
		expect(columns).toEqual([
			{ text: '', width: 2 * CHAR_WIDTH },
			expect.objectContaining({ text: 'e|--0--|' })
		]);
	});
});
