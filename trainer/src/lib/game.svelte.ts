import { MORSE_ALPHABET, CURRICULUM, morseToTimeline, END_TIMEOUT_MS, FARNSWORTH_GAP_MS } from './morse';
import { resume as resumeAudio, playTone } from './audio';
import { classifyPress } from './classifier';
import { getRandomWord } from './words';
import * as srs from './srs.svelte';

export type GameState = 'idle' | 'demo' | 'listening' | 'success' | 'retry';
export type GameMode = 'mimic' | 'recall' | 'recognize' | 'words';

let state = $state<GameState>('idle');
let mode = $state<GameMode>('mimic');
let currentChar = $state(CURRICULUM[0]);
let expectedPattern = $state(MORSE_ALPHABET[CURRICULUM[0]]);
let userInput = $state<string[]>([]);
let choices = $state<string[]>([]);
let toneActive = $state(false);
let demoElementIndex = $state(-1);
let currentWord = $state('');
let wordProgress = $state(0);
let firstAttempt = $state(true);

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
export function getCurrentWord() { return currentWord; }
export function getWordProgress() { return wordProgress; }

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

	// In recall and words mode, we don't play the demo sound/pattern before
	if (mode === 'recall' || mode === 'words') {
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
	if (mode === 'words') {
		if (input === MORSE_ALPHABET[currentWord[wordProgress]]) {
			wordProgress++;
			userInput = [];
			if (wordProgress >= currentWord.length) {
				handleSuccess();
			}
		} else {
			handleRetry();
		}
	} else {
		if (input === expectedPattern) {
			handleSuccess();
		} else {
			handleRetry();
		}
	}
}

function handleSuccess() {
	state = 'success';
	if (mode !== 'words') {
		if (firstAttempt) {
			srs.recordSuccess(currentChar);
		}
	}
	setTimeout(() => {
		if (mode === 'words') {
			currentWord = getRandomWord();
			wordProgress = 0;
			playDemo();
		} else {
			currentChar = srs.getNextChar();
			expectedPattern = MORSE_ALPHABET[currentChar];
			firstAttempt = true;
			playDemo();
		}
	}, 800);
}

function handleRetry() {
	state = 'retry';
	if (mode !== 'words') {
		firstAttempt = false;
		srs.recordFailure(currentChar);
	}
	setTimeout(() => {
		if (mode === 'words') {
			wordProgress = 0;
			userInput = [];
		}
		playDemo();
	}, 800);
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
	if (mode === 'words') {
		currentWord = getRandomWord();
		wordProgress = 0;
	} else {
		firstAttempt = true;
	}
	playDemo();
}

export async function start() {
	if (state !== 'idle') return;
	await resumeAudio();
	srs.load();
	if (mode === 'words') {
		currentWord = getRandomWord();
		wordProgress = 0;
	} else {
		currentChar = srs.getNextChar();
		expectedPattern = MORSE_ALPHABET[currentChar];
		firstAttempt = true;
	}
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
