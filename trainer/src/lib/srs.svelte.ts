import { CURRICULUM } from './morse';

const STORAGE_KEY = 'morse_srs_state';
const TARGET_SCORE = 3;
const INITIAL_POOL_SIZE = 3;

interface SRSState {
	unlearned: string[];
	pool: string[];
	scores: Record<string, number>;
}

let unlearned = $state<string[]>([]);
let pool = $state<string[]>([]);
let scores = $state<Record<string, number>>({});
let lastChar = $state<string | null>(null);

function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export function load() {
	if (typeof localStorage === 'undefined') return;

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			const parsed = JSON.parse(stored) as SRSState;
			unlearned = parsed.unlearned || [];
			pool = parsed.pool || [];
			scores = parsed.scores || {};
			
			// Validate state
			if (pool.length > 0 || unlearned.length > 0) {
				return; // Valid state found
			}
		} catch (e) {
			console.error('Failed to parse SRS state', e);
		}
	}

	// Initialize new state
	unlearned = shuffle(CURRICULUM);
	pool = [];
	scores = {};

	for (let i = 0; i < INITIAL_POOL_SIZE && unlearned.length > 0; i++) {
		const char = unlearned.pop()!;
		pool.push(char);
		scores[char] = 0;
	}
	
	save();
}

function save() {
	if (typeof localStorage === 'undefined') return;
	const state: SRSState = {
		unlearned: $state.snapshot(unlearned),
		pool: $state.snapshot(pool),
		scores: $state.snapshot(scores)
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordSuccess(char: string) {
	if (!pool.includes(char)) return;

	scores[char] = (scores[char] || 0) + 1;

	if (scores[char] >= TARGET_SCORE) {
		pool = pool.filter((c) => c !== char);
		
		if (unlearned.length > 0) {
			const newChar = unlearned.pop()!;
			pool.push(newChar);
			scores[newChar] = 0;
		} else if (pool.length === 0) {
			// They have learned everything! For now, just reset or loop.
			// Let's reset with a new shuffled curriculum to keep practicing.
			unlearned = shuffle(CURRICULUM);
			for (let i = 0; i < INITIAL_POOL_SIZE && unlearned.length > 0; i++) {
				const c = unlearned.pop()!;
				pool.push(c);
				scores[c] = 0;
			}
		}
	}

	save();
}

export function recordFailure(char: string) {
	if (!pool.includes(char)) return;
	
	// Reset score on failure
	scores[char] = 0;
	save();
}

export function getNextChar(): string {
	if (pool.length === 0) return CURRICULUM[0]; // Fallback

	// If there's more than one char in the pool, try to avoid picking the same one twice in a row
	if (pool.length > 1 && lastChar) {
		const available = pool.filter(c => c !== lastChar);
		if (available.length > 0) {
			const idx = Math.floor(Math.random() * available.length);
			lastChar = available[idx];
			return lastChar;
		}
	}

	const idx = Math.floor(Math.random() * pool.length);
	lastChar = pool[idx];
	return lastChar;
}

export function getPool() { return pool; }
export function getScores() { return scores; }
