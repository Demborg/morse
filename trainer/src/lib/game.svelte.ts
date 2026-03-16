import { MORSE_ALPHABET, CURRICULUM, morseToTimeline, END_TIMEOUT_MS, INTRA_GAP_MS } from './morse';
import { resume as resumeAudio, playTone } from './audio';
import { classifyPress } from './classifier';

export type GameState = 'idle' | 'demo' | 'listening' | 'success' | 'retry';

let state = $state<GameState>('idle');
let curriculumIndex = $state(0);
let currentChar = $state(CURRICULUM[0]);
let expectedPattern = $state(MORSE_ALPHABET[CURRICULUM[0]]);
let userInput = $state<string[]>([]);
let toneActive = $state(false);
let demoElementIndex = $state(-1);

let pressStart: number | null = null;
let endTimer: ReturnType<typeof setTimeout> | null = null;

export function getState() { return state; }
export function getChar() { return currentChar; }
export function getPattern() { return expectedPattern; }
export function getUserInput() { return userInput; }
export function isToneActive() { return toneActive; }
export function getDemoElementIndex() { return demoElementIndex; }

function clearEndTimer() {
	if (endTimer) {
		clearTimeout(endTimer);
		endTimer = null;
	}
}

async function playDemo() {
	state = 'demo';
	demoElementIndex = -1;
	const timeline = morseToTimeline(expectedPattern);

	for (let i = 0; i < timeline.length; i++) {
		const event = timeline[i];
		if (event.type === 'tone') {
			demoElementIndex = Math.floor(i / 2);
			toneActive = true;
			await playTone(event.duration);
			toneActive = false;
		} else {
			await new Promise((r) => setTimeout(r, event.duration));
		}
	}

	demoElementIndex = -1;
	await new Promise((r) => setTimeout(r, 400));
	state = 'listening';
	userInput = [];
}

function evaluate() {
	const input = userInput.join('');
	if (input === expectedPattern) {
		state = 'success';
		setTimeout(() => {
			curriculumIndex = Math.min(curriculumIndex + 1, CURRICULUM.length - 1);
			currentChar = CURRICULUM[curriculumIndex];
			expectedPattern = MORSE_ALPHABET[currentChar];
			playDemo();
		}, 800);
	} else {
		state = 'retry';
		setTimeout(() => playDemo(), 800);
	}
}

export async function start() {
	await resumeAudio();
	curriculumIndex = 0;
	currentChar = CURRICULUM[0];
	expectedPattern = MORSE_ALPHABET[currentChar];
	playDemo();
}

export function handlePressStart() {
	if (state !== 'listening') return;
	clearEndTimer();
	pressStart = performance.now();
	toneActive = true;
}

export function handlePressEnd() {
	if (state !== 'listening' || pressStart === null) return;
	const duration = performance.now() - pressStart;
	pressStart = null;
	toneActive = false;

	const symbol = classifyPress(duration);
	userInput = [...userInput, symbol];

	clearEndTimer();
	endTimer = setTimeout(evaluate, END_TIMEOUT_MS);
}
