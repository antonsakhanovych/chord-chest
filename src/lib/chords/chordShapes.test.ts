import { describe, it, expect } from 'vitest';
import { getChordShape } from './chordShapes';

describe('getChordShape', () => {
	it('returns a 6-string shape for a common open chord', () => {
		const shape = getChordShape('Am');
		expect(shape?.fingers).toHaveLength(6);
	});

	it('returns undefined for an unrecognized chord name', () => {
		expect(getChordShape('Xyz123')).toBeUndefined();
	});

	it('maps a dominant 7th suffix correctly', () => {
		const shape = getChordShape('E7');
		expect(shape).toBeDefined();
	});

	it('returns undefined for a slash chord (not supported)', () => {
		expect(getChordShape('Dm/B')).toBeUndefined();
	});

	it('maps a half-diminished 7th suffix correctly', () => {
		const shape = getChordShape('Bm7b5');
		expect(shape?.fingers).toHaveLength(6);
	});

	it('maps a diminished 7th suffix correctly', () => {
		const shape = getChordShape('Cdim7');
		expect(shape).toBeDefined();
	});

	it('maps extended/altered suffixes added alongside m7b5', () => {
		const suffixes = ['C9', 'Am6', 'Dmaj9', 'Eadd9', 'F13', 'G7alt', 'Amaj7b5'];
		for (const name of suffixes) {
			expect(getChordShape(name), name).toBeDefined();
		}
	});

	it('keeps a barre span narrow when an unrelated note shares its fret (regression for the finger-based barre heuristic)', () => {
		// C#9: frets [4,4,3,4,4,4], fingers [2,2,1,3,3,4] - five strings share fret 4, but only
		// strings 5-6 (finger 2) and 2-3 (finger 3) are true barres; string 1 (finger 4) is separate.
		// A fret-value-only heuristic would wrongly span all five strings (6 down to 1).
		const shape = getChordShape('C#9');
		expect(shape?.barres.every((barre) => barre.fromString - barre.toString <= 1)).toBe(true);
	});
});
