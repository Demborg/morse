import { MORSE_ALPHABET, CURRICULUM, morseToTimeline, FARNSWORTH_GAP_MS } from '$lib/morse';
import { resume as resumeAudio, playTone } from '$lib/audio';
import * as srs from '$lib/srs.svelte';
import { shell } from '$lib/shell.svelte';
import { onMorsePress } from '$lib/input.svelte';

export type State = 'idle' | 'demo' | 'listening' | 'success' | 'retry';

export class RecognizeGame {
	state = $state<State>('idle');
	char = $state('A');
	pattern = $derived(MORSE_ALPHABET[this.char] || '');
	choices = $state<string[]>([]);
	demoElementIndex = $state(-1);
	firstAttempt = $state(true);

	stateTimer: ReturnType<typeof setTimeout> | null = null;
	cleanup: (() => void)[] = [];

	mount() {
		this.cleanup.push(onMorsePress(() => {
			if (this.state === 'idle') this.start();
		}));
	}

	unmount() {
		this.cleanup.forEach(cb => cb());
		this.clearTimers();
		shell.flash = false;
		shell.success = false;
		shell.retry = false;
	}

	clearTimers() {
		if (this.stateTimer) clearTimeout(this.stateTimer);
	}

	generateChoices() {
		const set = new Set<string>();
		set.add(this.char);
		while (set.size < 4) {
			const randomChar = CURRICULUM[Math.floor(Math.random() * CURRICULUM.length)];
			set.add(randomChar);
		}
		this.choices = Array.from(set).sort(() => Math.random() - 0.5);
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
		this.clearTimers();
		this.generateChoices();

		const timeline = morseToTimeline(this.pattern, true);
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
			}, FARNSWORTH_GAP_MS);
		}
	}

	submitChoice(choice: string) {
		if (this.state !== 'listening') return;
		
		if (choice === this.char) {
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
			this.playDemo();
		}, 800);
	}

	get statusText() {
		switch (this.state) {
			case 'idle': return 'Tap to start';
			case 'demo': return 'Listen...';
			case 'listening': return 'Pick a letter';
			case 'success': return 'Correct';
			case 'retry': return 'Try again';
			default: return '';
		}
	}
}
