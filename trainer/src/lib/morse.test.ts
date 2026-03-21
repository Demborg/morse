import { describe, it, expect } from 'vitest';
import { morseToTimeline, DIT_MS, DAH_MS, INTRA_GAP_MS } from './morse';
import { classifyPress } from './classifier';

describe('Morse Logic', () => {
	it('converts "." to a DIT tone', () => {
		const result = morseToTimeline('.');
		expect(result).toEqual([{ type: 'tone', duration: DIT_MS }]);
	});

	it('converts "-" to a DAH tone', () => {
		const result = morseToTimeline('-');
		expect(result).toEqual([{ type: 'tone', duration: DAH_MS }]);
	});

	it('adds intra-character gaps between elements', () => {
		const result = morseToTimeline('.-');
		expect(result).toEqual([
			{ type: 'tone', duration: DIT_MS },
			{ type: 'silence', duration: INTRA_GAP_MS },
			{ type: 'tone', duration: DAH_MS }
		]);
	});

	it('handles longer sequences correctly', () => {
		const result = morseToTimeline('...');
		expect(result).toHaveLength(5); // 3 tones, 2 silences
		expect(result.filter((e) => e.type === 'tone')).toHaveLength(3);
		expect(result.filter((e) => e.type === 'silence')).toHaveLength(2);
	});
});

describe('Signal Classification', () => {
	it('classifies short durations as DIT', () => {
		expect(classifyPress(DIT_MS)).toBe('.');
		expect(classifyPress(DIT_MS + 20)).toBe('.');
	});

	it('classifies long durations as DAH', () => {
		expect(classifyPress(DAH_MS)).toBe('-');
		expect(classifyPress(DAH_MS - 20)).toBe('-');
	});

	it('handles the threshold correctly', () => {
		// Threshold is 160ms (DIT_DAH_THRESHOLD_MS = 2 * UNIT_MS)
		expect(classifyPress(159)).toBe('.');
		expect(classifyPress(161)).toBe('-');
	});
});
