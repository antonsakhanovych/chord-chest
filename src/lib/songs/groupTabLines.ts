import { Literal, type Line } from 'chordsheetjs';

export type LineRun = { kind: 'tab'; text: string } | { kind: 'line'; line: Line };

function tabLineText(line: Line): string {
	return line.items
		.filter((item): item is Literal => item instanceof Literal)
		.map((item) => item.string)
		.join('');
}

export function groupTabLines(lines: Line[]): LineRun[] {
	const runs: LineRun[] = [];
	let tabBuffer: string[] = [];

	const flushTabBuffer = () => {
		if (tabBuffer.length === 0) return;
		const text = tabBuffer.join('\n');
		tabBuffer = [];
		if (text.trim() === '') return;
		runs.push({ kind: 'tab', text });
	};

	for (const line of lines) {
		if (line.isTab()) {
			tabBuffer.push(tabLineText(line));
		} else {
			flushTabBuffer();
			runs.push({ kind: 'line', line });
		}
	}
	flushTabBuffer();

	return runs;
}
