import { describe, it, expect } from 'vitest';
import { ChordProParser } from 'chordsheetjs';
import { toPdfDocDefinition } from './toPdfDocDefinition';

const FIXTURE = `{title: Test Song}
{artist: Test Artist}
{comment: Verse 1}
La [Am]la [C]la
`;

describe('toPdfDocDefinition', () => {
	it('places the chord line above the lyric line at matching character offsets', () => {
		const song = new ChordProParser().parse(FIXTURE);
		const doc = toPdfDocDefinition(song);
		const stackNode = (doc.content as unknown as Array<Record<string, unknown>>).find(
			(node) => 'stack' in node
		) as { stack: Array<{ text: string }> };
		const [chordNode, lyricNode] = stackNode.stack;

		expect(chordNode.text.indexOf('Am')).toBe(3); // 'La ' is 3 chars
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
