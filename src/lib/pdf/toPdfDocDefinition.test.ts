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
});
