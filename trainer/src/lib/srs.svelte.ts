import { CURRICULUM } from './morse';

export type TaskType = 'mimic' | 'recall' | 'listen';

interface SRSItem {
	char: string;
	score: number;
}

let unlearned = $state<string[]>([]);
let activeSet = $state<SRSItem[]>([]);
let repeatPile = $state<string[]>([]);
let lastChar = $state<string | null>(null);
let pendingNewLetter = $state(false);

export function load() {
	// Reset state for new session (no persistence)
	// Randomize the order of the curriculum
	unlearned = [...CURRICULUM].sort(() => Math.random() - 0.5);
	activeSet = [];
	repeatPile = [];
	lastChar = null;

	// Start by introducing the first letter
	if (unlearned.length > 0) {
		repeatPile.push(unlearned.shift()!);
	}
	pendingNewLetter = false;
}

export function recordSuccess(char: string, task: TaskType) {
	if (task === 'mimic') {
		// After mimic (intro or repeat), it enters/stays in active set
		if (!activeSet.find((i) => i.char === char)) {
			activeSet.push({ char, score: 0 });
		}
		// Remove from repeat pile if it was there
		const repeatIdx = repeatPile.indexOf(char);
		if (repeatIdx !== -1) {
			repeatPile.splice(repeatIdx, 1);
		}
	} else {
		// Passed a test (listen or recall)
		const item = activeSet.find((i) => i.char === char);
		if (item) {
			item.score++;
		}

		// Probability to introduce a new letter (30% chance if we have unlearned letters)
		if (unlearned.length > 0 && Math.random() < 0.3) {
			pendingNewLetter = true;
		}
	}
}

export function recordFailure(char: string) {
	// Failed a test or mimic.
	// Move to repeat pile for re-presentation soon.
	if (!repeatPile.includes(char)) {
		repeatPile.push(char);
	}
	// No new letter can be added after a failure
	pendingNewLetter = false;
}

export function getNextTask(): { char: string; task: TaskType } {
	// 1. If we need to introduce a new letter
	if (pendingNewLetter && unlearned.length > 0) {
		pendingNewLetter = false;
		const char = unlearned.shift()!;
		lastChar = char;
		return { char, task: 'mimic' };
	}

	// 2. If there are letters in the repeat pile
	if (repeatPile.length > 0) {
		const char = repeatPile.shift()!;
		lastChar = char;
		return { char, task: 'mimic' };
	}

	// 3. If active set is empty but we have unlearned (shouldn't happen often due to pendingNewLetter=true at start)
	if (activeSet.length === 0) {
		const char = unlearned.shift()!;
		lastChar = char;
		return { char, task: 'mimic' };
	}

	// 4. Test a random letter from the active set
	let eligible = activeSet;
	if (activeSet.length > 1 && lastChar) {
		eligible = activeSet.filter((i) => i.char !== lastChar);
	}
	const item = eligible[Math.floor(Math.random() * eligible.length)];
	lastChar = item.char;

	// Randomly choose between listen and recall
	const task: TaskType = Math.random() < 0.5 ? 'listen' : 'recall';
	return { char: item.char, task };
}

// Helper to check if a char is in "learning" mode (mimic)
export function getItem(char: string) {
	return activeSet.find((i) => i.char === char);
}

export function getPool() {
	return activeSet.map((i) => i.char);
}
