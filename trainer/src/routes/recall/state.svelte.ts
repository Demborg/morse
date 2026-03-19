import { MORSE_ALPHABET, END_TIMEOUT_MS } from '$lib/morse';
import { resume as resumeAudio, toneOn, toneOff } from '$lib/audio';
import { classifyPress } from '$lib/classifier';
import * as srs from '$lib/srs.svelte';
import { shell } from '$lib/shell.svelte';
import { onMorsePress, onMorseRelease } from '$lib/input.svelte';

export type State = 'idle' | 'listening' | 'success' | 'retry';

export class RecallGame {
	state = $state<State>('idle');
	char = $state('A');
	pattern = $derived(MORSE_ALPHABET[this.char] || '');
	userInput = $state<string[]>([]);
	firstAttempt = $state(true);

	pressStart: number | null = null;
	endTimer: ReturnType<typeof setTimeout> | null = null;
	stateTimer: ReturnType<typeof setTimeout> | null = null;

	cleanup: (() => void)[] = [];

	mount() {
		this.cleanup.push(onMorsePress(() => this.handlePressStart()));
		this.cleanup.push(onMorseRelease(() => this.handlePressEnd()));
	}

	unmount() {
		this.cleanup.forEach(cb => cb());
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
		this.char = srs.getNextChar();
		this.firstAttempt = true;
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
		if (input === this.pattern) {
			this.handleSuccess();
		} else {
			this.handleRetry();
		}
	}

	handleSuccess() {
		this.state = 'success';
		shell.success = true;
		
		if (this.firstAttempt) {
			srs.recordSuccess(this.char);
		}

		this.stateTimer = setTimeout(() => {
			shell.success = false;
			this.char = srs.getNextChar();
			this.firstAttempt = true;
			this.startRound();
		}, 800);
	}

	handleRetry() {
		this.state = 'retry';
		shell.retry = true;
		
		this.firstAttempt = false;
		srs.recordFailure(this.char);

		this.stateTimer = setTimeout(() => {
			shell.retry = false;
			this.userInput = [];
			this.startRound();
		}, 800);
	}

	get statusText() {
		switch (this.state) {
			case 'idle': return 'Tap to start';
			case 'listening': return 'Your turn';
			case 'success': return 'Correct';
			case 'retry': return 'Try again';
			default: return '';
		}
	}
}
