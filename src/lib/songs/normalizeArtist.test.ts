import { describe, it, expect } from 'vitest';
import { normalizeArtist } from './normalizeArtist';

describe('normalizeArtist', () => {
	it('returns a plain string unchanged', () => {
		expect(normalizeArtist('Artist A')).toBe('Artist A');
	});

	it('joins an array of artists with a comma and space', () => {
		expect(normalizeArtist(['Artist A', 'Artist B'])).toBe('Artist A, Artist B');
	});

	it('joins an array of more than two artists with a comma and space', () => {
		expect(normalizeArtist(['Artist A', 'Artist B', 'Artist C'])).toBe(
			'Artist A, Artist B, Artist C'
		);
	});

	it('returns an empty string for null', () => {
		expect(normalizeArtist(null)).toBe('');
	});

	it('returns an empty string for undefined', () => {
		expect(normalizeArtist(undefined)).toBe('');
	});

	it('returns an empty string for an empty string', () => {
		expect(normalizeArtist('')).toBe('');
	});
});
