import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as srs from './srs.svelte';
import { CURRICULUM } from './morse';
import { settings } from './shell.svelte';

describe('SRS Logic', () => {
	beforeEach(() => {
		// Ensure settings are standard for tests
		settings.trainLetters = true;
		settings.trainNumbers = true; // Include both to match CURRICULUM in tests

		// Mock random to be deterministic where needed
		// For curriculum shuffle, let's keep it stable
		vi.spyOn(Math, 'random').mockReturnValue(0.1);
		srs.load();
		vi.restoreAllMocks();
	});

	it('initializes with the first letter in the repeat pile', () => {
		// With 0.1, shuffle might change things, but load() also pulls the first element
		const task = srs.getNextTask();
		expect(task.task).toBe('mimic');
		// We can't easily predict the exact char due to shuffle, but it should be one from CURRICULUM
		expect(CURRICULUM).toContain(task.char);
	});

	it('moves a character to the active set after a successful mimic', () => {
		const { char } = srs.getNextTask();
		srs.recordSuccess(char, 'mimic');

		const pool = srs.getPool();
		expect(pool).toContain(char);
	});

	it('adds a character back to the repeat pile after a failure', () => {
		const { char } = srs.getNextTask();
		srs.recordSuccess(char, 'mimic');

		// Now it's in the active set. Let's fail a test for it.
		srs.recordFailure(char);

		// Next task should be a mimic for that same char
		const next = srs.getNextTask();
		expect(next).toEqual({ char, task: 'mimic' });
	});

	it('eventually introduces new letters', () => {
		const first = srs.getNextTask();
		srs.recordSuccess(first.char, 'mimic');

		// Force a new letter introduction by mocking random in recordSuccess
		vi.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.3 threshold
		srs.recordSuccess(first.char, 'listen');
		vi.restoreAllMocks();

		const next = srs.getNextTask();
		expect(next.task).toBe('mimic');
		expect(next.char).not.toBe(first.char);
	});

	it('increments score on successful test', () => {
		const { char } = srs.getNextTask();
		srs.recordSuccess(char, 'mimic');

		const initial = srs.getItem(char);
		expect(initial?.score).toBe(0);

		srs.recordSuccess(char, 'listen');
		const updated = srs.getItem(char);
		expect(updated?.score).toBe(1);
	});
});
