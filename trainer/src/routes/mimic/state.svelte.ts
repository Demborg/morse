import { MORSE_ALPHABET, morseToTimeline, END_TIMEOUT_MS } from '$lib/morse';
import { resume as resumeAudio, playTone, toneOn, toneOff } from '$lib/audio';
import { classifyPress } from '$lib/classifier';
import * as srs from '$lib/srs.svelte';
import { shell } from '$lib/shell.svelte';
import { onMorsePress, onMorseRelease } from '$lib/input.svelte';

export type State = 'idle' | 'demo' | 'listening' | 'success' | 'retry';

export class MimicGame {
	state = $state<State>('idle');
	char = $state('A');
	pattern = $derived(MORSE_ALPHABET[this.char] || '');
	userInput = $state<string[]>([]);
	demoElementIndex = $state(-1);
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
		this.playDemo();
	}

	async playDemo() {
		this.state = 'demo';
		this.demoElementIndex = -1;
		this.userInput = [];
		this.clearTimers();

		const timeline = morseToTimeline(this.pattern, false);
		let localStateChanged = false;
		
		for (let i = 0; i < timeline.length; i++) {
			if (this.state !== 'demo') {
				localStateChanged = true;
				break;
			}
			const event = timeline[i];
			if (event.type === 'tone') {
				this.demoElementIndex = Math.floor(i / 2);
				shell.flash = true;
				await playTone(event.duration);
				shell.flash = false;
			} else {
				await new Promise(r => setTimeout(r, event.duration));
			}
		}

		if (!localStateChanged && this.state === 'demo') {
			this.demoElementIndex = -1;
			this.stateTimer = setTimeout(() => {
				if (this.state === 'demo') {
					this.state = 'listening';
				}
			}, 400);
		}
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
			this.playDemo();
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
			this.playDemo();
		}, 800);
	}

	get statusText() {
		switch (this.state) {
			case 'idle': return 'Tap to start';
			case 'demo': return 'Listen...';
			case 'listening': return 'Your turn';
			case 'success': return 'Correct';
			case 'retry': return 'Try again';
			default: return '';
		}
	}
}
