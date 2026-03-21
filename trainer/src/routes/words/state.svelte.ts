import { MORSE_ALPHABET, END_TIMEOUT_MS } from '$lib/morse';
import { resume as resumeAudio, toneOn, toneOff, vibrate } from '$lib/audio';
import { classifyPress } from '$lib/classifier';
import * as srs from '$lib/srs.svelte';
import { shell } from '$lib/shell.svelte';
import { onMorsePress, onMorseRelease } from '$lib/input.svelte';
import { getRandomWord } from '$lib/words';

export type State = 'idle' | 'listening' | 'success' | 'retry';

export class WordsGame {
	state = $state<State>('idle');
	currentWord = $state('');
	wordProgress = $state(0);
	userInput = $state<string[]>([]);

	pressStart: number | null = null;
	endTimer: ReturnType<typeof setTimeout> | null = null;
	stateTimer: ReturnType<typeof setTimeout> | null = null;

	cleanup: (() => void)[] = [];

	get currentLetter() {
		return this.currentWord[this.wordProgress];
	}

	get expectedPattern() {
		if (!this.currentLetter) return '';
		return MORSE_ALPHABET[this.currentLetter] || '';
	}

	mount() {
		this.cleanup.push(onMorsePress(() => this.handlePressStart()));
		this.cleanup.push(onMorseRelease(() => this.handlePressEnd()));
	}

	unmount() {
		this.cleanup.forEach((cb) => cb());
		this.clearTimers();
		toneOff();
		shell.flash = false;
		shell.success = false;
		shell.retry = false;
	}

	clearTimers() {
		if (this.endTimer) clearTimeout(this.endTimer);
		if (this.stateTimer) clearTimeout(this.stateTimer);
	}

	async start() {
		if (this.state !== 'idle') return;
		await resumeAudio();
		srs.load();
		this.currentWord = getRandomWord(srs.getPool());
		this.wordProgress = 0;
		this.startRound();
	}

	startRound() {
		this.state = 'listening';
		this.userInput = [];
		this.clearTimers();
	}

	handlePressStart() {
		if (this.state === 'idle') {
			this.start();
			return;
		}
		if (this.state !== 'listening') return;

		if (this.endTimer) clearTimeout(this.endTimer);
		this.pressStart = performance.now();
		shell.flash = true;
		toneOn();
	}

	handlePressEnd() {
		if (this.state !== 'listening' || this.pressStart === null) {
			shell.flash = false;
			toneOff();
			return;
		}

		const duration = performance.now() - this.pressStart;
		this.pressStart = null;
		shell.flash = false;
		toneOff();

		const symbol = classifyPress(duration);
		this.userInput = [...this.userInput, symbol];

		if (this.endTimer) clearTimeout(this.endTimer);
		this.endTimer = setTimeout(() => this.evaluate(), END_TIMEOUT_MS);
	}

	evaluate() {
		if (this.state !== 'listening') return;

		const input = this.userInput.join('');
		if (input === this.expectedPattern) {
			this.handleLetterSuccess();
		} else {
			this.handleRetry();
		}
	}

	handleLetterSuccess() {
		this.wordProgress++;
		this.userInput = [];
		if (this.wordProgress >= this.currentWord.length) {
			this.handleWordSuccess();
		} else {
			// Ready for next letter
		}
	}

	handleWordSuccess() {
		this.state = 'success';
		shell.success = true;
		vibrate([40, 40, 40]);

		this.stateTimer = setTimeout(() => {
			shell.success = false;
			this.currentWord = getRandomWord(srs.getPool());
			this.wordProgress = 0;
			this.startRound();
		}, 800);
	}

	handleRetry() {
		this.state = 'retry';
		shell.retry = true;
		vibrate(200);

		this.stateTimer = setTimeout(() => {
			shell.retry = false;
			this.wordProgress = 0; // Strict retry policy
			this.userInput = [];
			this.startRound();
		}, 800);
	}

	get statusText() {
		switch (this.state) {
			case 'idle':
				return 'Tap or Space to start';
			case 'listening':
				return 'Type the word';
			case 'success':
				return 'Correct';
			case 'retry':
				return 'Try again';
			default:
				return '';
		}
	}
}
