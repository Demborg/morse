import { describe, it, expect } from 'vitest';
import { getRandomWord } from './words';

describe('Word Generation', () => {
	it('returns a random word from the default list when no chars are restricted', () => {
		const word = getRandomWord();
		expect(word).toBeDefined();
		expect(word.length).toBeGreaterThan(0);
	});

	it('returns a word only containing allowed characters', () => {
		const allowed = ['E', 'T', 'A', 'N'];
		const word = getRandomWord(allowed);
		const chars = word.split('');
		chars.forEach((c) => {
			expect(allowed).toContain(c);
		});
	});

	it('handles lower case input for allowed chars', () => {
		const allowed = ['e', 't'];
		const word = getRandomWord(allowed);
		expect(word).toMatch(/^[ET]+$/);
	});

	it('generates a random string when no words match the filter', () => {
		// Only 'X' is allowed, no words in the list have only 'X'
		const allowed = ['X'];
		const word = getRandomWord(allowed);
		expect(word).toMatch(/^X+$/);
		expect(word.length).toBeGreaterThanOrEqual(3);
		expect(word.length).toBeLessThanOrEqual(5);
	});

	it('is somewhat random', () => {
		const results = new Set();
		for (let i = 0; i < 10; i++) {
			results.add(getRandomWord());
		}
		// Probability of 10 identical random picks from 39 words is negligible
		expect(results.size).toBeGreaterThan(1);
	});
});
