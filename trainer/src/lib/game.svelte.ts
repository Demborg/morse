import { MORSE_ALPHABET, CURRICULUM, morseToTimeline, END_TIMEOUT_MS, FARNSWORTH_GAP_MS } from './morse';
import { resume as resumeAudio, playTone } from './audio';
import { classifyPress } from './classifier';

export type GameState = 'idle' | 'demo' | 'listening' | 'success' | 'retry';
export type GameMode = 'mimic' | 'recall' | 'recognize';

let state = $state<GameState>('idle');
let mode = $state<GameMode>('mimic');
let curriculumIndex = $state(0);
let currentChar = $state(CURRICULUM[0]);
let expectedPattern = $state(MORSE_ALPHABET[CURRICULUM[0]]);
let userInput = $state<string[]>([]);
let choices = $state<string[]>([]);
let toneActive = $state(false);
let demoElementIndex = $state(-1);

let pressStart: number | null = null;
let endTimer: ReturnType<typeof setTimeout> | null = null;

export function getState() { return state; }
export function getMode() { return mode; }
export function getChar() { return currentChar; }
export function getPattern() { return expectedPattern; }
export function getUserInput() { return userInput; }
export function getChoices() { return choices; }
export function isToneActive() { return toneActive; }
export function getDemoElementIndex() { return demoElementIndex; }

export function setMode(newMode: GameMode) {
	mode = newMode;
	if (state !== 'idle') {
		resetRound();
	}
}

function clearEndTimer() {
	if (endTimer) {
		clearTimeout(endTimer);
		endTimer = null;
	}
}

function generateChoices() {
	const set = new Set<string>();
	set.add(currentChar);
	while (set.size < 4) {
		const randomChar = CURRICULUM[Math.floor(Math.random() * CURRICULUM.length)];
		set.add(randomChar);
	}
	choices = Array.from(set).sort(() => Math.random() - 0.5);
}

async function playDemo() {
	state = 'demo';
	demoElementIndex = -1;
	userInput = [];

	if (mode === 'recognize') {
		generateChoices();
	}

	// In recall mode, we don't play the demo sound/pattern before
	if (mode === 'recall') {
		state = 'listening';
		return;
	}

	const timeline = morseToTimeline(expectedPattern, mode === 'recognize');

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
	const postDemoDelay = mode === 'recognize' ? FARNSWORTH_GAP_MS : 400;
	await new Promise((r) => setTimeout(r, postDemoDelay));
	state = 'listening';
}

function evaluate() {
	const input = userInput.join('');
	if (input === expectedPattern) {
		handleSuccess();
	} else {
		handleRetry();
	}
}

function handleSuccess() {
	state = 'success';
	setTimeout(() => {
		curriculumIndex = Math.min(curriculumIndex + 1, CURRICULUM.length - 1);
		currentChar = CURRICULUM[curriculumIndex];
		expectedPattern = MORSE_ALPHABET[currentChar];
		playDemo();
	}, 800);
}

function handleRetry() {
	state = 'retry';
	setTimeout(() => playDemo(), 800);
}

export function submitChoice(choice: string) {
	if (state !== 'listening' || mode !== 'recognize') return;
	if (choice === currentChar) {
		handleSuccess();
	} else {
		handleRetry();
	}
}

function resetRound() {
	userInput = [];
	clearEndTimer();
	playDemo();
}

export async function start() {
	if (state !== 'idle') return;
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
