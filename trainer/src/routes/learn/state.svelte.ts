import { MORSE_ALPHABET, CURRICULUM, morseToTimeline, END_TIMEOUT_MS } from '$lib/morse';
import { resume as resumeAudio, playTone, toneOn, toneOff } from '$lib/audio';
import { classifyPress } from '$lib/classifier';
import * as srs from '$lib/srs.svelte';
import { shell } from '$lib/shell.svelte';
import { onMorsePress, onMorseRelease } from '$lib/input.svelte';

export type TaskType = 'mimic' | 'recall' | 'listen';
export type State = 'idle' | 'demo' | 'listening' | 'success' | 'retry';

export class TrainGame {
	state = $state<State>('idle');
	taskType = $state<TaskType>('mimic');
	char = $state('A');
	pattern = $derived(MORSE_ALPHABET[this.char] || '');
	userInput = $state<string[]>([]);
	choices = $state<string[]>([]);
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
		this.startRound();
	}

	startRound() {
		const next = srs.getNextTask();
		this.char = next.char;
		this.taskType = next.task;

		this.userInput = [];
		this.firstAttempt = true;
		this.clearTimers();

		if (this.taskType === 'mimic' || this.taskType === 'listen') {
			this.playDemo();
		} else {
			this.state = 'listening';
		}
	}

	async playDemo() {
		this.state = 'demo';
		this.demoElementIndex = -1;
		this.clearTimers();

		if (this.taskType === 'listen') {
			this.generateChoices();
		}

		const timeline = morseToTimeline(this.pattern);
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
				await new Promise((r) => setTimeout(r, event.duration));
			}
		}

		if (!localStateChanged && this.state === 'demo') {
			this.demoElementIndex = -1;
			this.stateTimer = setTimeout(() => {
				if (this.state === 'demo') {
					this.state = 'listening';
				}
			}, 600);
		}
	}

	replay() {
		if (this.state !== 'listening' || this.taskType === 'recall') return;
		this.playDemo();
	}

	generateChoices() {
		const set = new Set<string>();
		set.add(this.char);
		
		// Try to fill from active set first
		const pool = srs.getPool();
		const shuffledPool = pool.sort(() => Math.random() - 0.5);
		for (const c of shuffledPool) {
			if (set.size < 4) set.add(c);
		}

		// Then fill with random from curriculum
		while (set.size < 4) {
			const randomChar = CURRICULUM[Math.floor(Math.random() * CURRICULUM.length)];
			set.add(randomChar);
		}
		this.choices = Array.from(set).sort(() => Math.random() - 0.5);
	}

	handlePressStart() {
		if (this.state === 'idle') {
			this.start();
			return;
		}
		if (this.state !== 'listening' || this.taskType === 'listen') return;

		if (this.endTimer) clearTimeout(this.endTimer);
		this.pressStart = performance.now();
		shell.flash = true;
		toneOn();
	}

	handlePressEnd() {
		if (this.state !== 'listening' || this.taskType === 'listen' || this.pressStart === null) {
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

	submitChoice(choice: string) {
		if (this.state !== 'listening' || this.taskType !== 'listen') return;

		if (choice === this.char) {
			this.handleSuccess();
		} else {
			this.handleRetry();
		}
	}

	evaluate() {
		if (this.state !== 'listening' || this.taskType === 'listen') return;

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
			srs.recordSuccess(this.char, this.taskType);
		}

		this.stateTimer = setTimeout(() => {
			shell.success = false;
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
			if (this.taskType === 'mimic') {
				// Repeat the same mimic task until success
				this.userInput = [];
				this.state = 'listening';
			} else {
				// For listen/recall, move on (they will be re-presented via repeatPile as mimic later)
				this.startRound();
			}
		}, 800);
	}

	get statusText() {
		switch (this.state) {
			case 'idle':
				return 'Tap or Space to start';
			case 'demo':
				return 'Listen...';
			case 'success':
				return 'Correct';
			case 'retry':
				return 'Try again';
			case 'listening':
				if (this.taskType === 'listen') return 'Pick a letter';
				return 'Your turn';
			default:
				return '';
		}
	}
}
