import { CURRICULUM } from './morse';

const STORAGE_KEY = 'morse_srs_session';
const TARGET_SCORE = 3;
const INITIAL_POOL_SIZE = 3;

export type Stage = 'learning' | 'testing';

interface SRSItem {
	char: string;
	stage: Stage;
	score: number;
}

interface SRSState {
	unlearned: string[];
	pool: SRSItem[];
}

let unlearned = $state<string[]>([]);
let pool = $state<SRSItem[]>([]);
let lastChar = $state<string | null>(null);

export function load() {
	if (typeof sessionStorage === 'undefined') return;

	const stored = sessionStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			const parsed = JSON.parse(stored) as SRSState;
			unlearned = parsed.unlearned || [];
			pool = parsed.pool || [];
			
			if (pool.length > 0 || unlearned.length > 0) {
				return;
			}
		} catch (e) {
			console.error('Failed to parse SRS state', e);
		}
	}

	// Initialize new state: Copy CURRICULUM (already ordered by difficulty)
	unlearned = [...CURRICULUM].reverse(); // Reverse so we can pop from the end
	pool = [];

	for (let i = 0; i < INITIAL_POOL_SIZE && unlearned.length > 0; i++) {
		const char = unlearned.pop()!;
		pool.push({ char, stage: 'learning', score: 0 });
	}
	
	save();
}

function save() {
	if (typeof sessionStorage === 'undefined') return;
	const state: SRSState = {
		unlearned: $state.snapshot(unlearned),
		pool: $state.snapshot(pool)
	};
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordSuccess(char: string) {
	const item = pool.find(i => i.char === char);
	if (!item) return;

	if (item.stage === 'learning') {
		item.stage = 'testing';
	} else {
		item.score++;
	}

	if (item.score >= TARGET_SCORE) {
		pool = pool.filter((i) => i.char !== char);
		
		if (unlearned.length > 0) {
			const newChar = unlearned.pop()!;
			pool.push({ char: newChar, stage: 'learning', score: 0 });
		} else if (pool.length === 0) {
			// Restart curriculum if everything is learned in this session
			unlearned = [...CURRICULUM].reverse();
			for (let i = 0; i < INITIAL_POOL_SIZE && unlearned.length > 0; i++) {
				const c = unlearned.pop()!;
				pool.push({ char: c, stage: 'learning', score: 0 });
			}
		}
	}

	save();
}

export function recordFailure(char: string) {
	const item = pool.find(i => i.char === char);
	if (!item) return;
	
	item.stage = 'learning';
	item.score = 0;
	save();
}

export function getNextChar(): string {
	if (pool.length === 0) return CURRICULUM[0];

	if (pool.length > 1 && lastChar) {
		const available = pool.filter(i => i.char !== lastChar);
		if (available.length > 0) {
			const idx = Math.floor(Math.random() * available.length);
			lastChar = available[idx].char;
			return lastChar;
		}
	}

	const idx = Math.floor(Math.random() * pool.length);
	lastChar = pool[idx].char;
	return lastChar;
}

export function getPool() { return pool.map(i => i.char); }
export function getItem(char: string) { return pool.find(i => i.char === char); }
export function getScores() { 
	const scores: Record<string, number> = {};
	pool.forEach(i => scores[i.char] = i.score);
	return scores;
}
