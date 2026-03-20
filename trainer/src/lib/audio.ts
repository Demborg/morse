const FREQ = 700;
const RAMP_MS = 5;

let ctx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gain: GainNode | null = null;

function ensureContext(): AudioContext {
	if (!ctx) {
		ctx = new AudioContext();
		
		oscillator = ctx.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = FREQ;
		
		gain = ctx.createGain();
		gain.gain.value = 0;
		
		oscillator.connect(gain);
		gain.connect(ctx.destination);
		
		oscillator.start();
	}
	return ctx;
}

export async function resume(): Promise<void> {
	const c = ensureContext();
	if (c.state === 'suspended') await c.resume();
}

export function vibrate(pattern: number | number[]): void {
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(pattern);
	}
}

export function toneOn(): void {
	const c = ensureContext();
	if (!gain) return;
	const now = c.currentTime + 0.005; // Tiny buffer for scheduling
	
	gain.gain.cancelScheduledValues(now);
	gain.gain.setValueAtTime(gain.gain.value, now);
	gain.gain.linearRampToValueAtTime(1, now + RAMP_MS / 1000);

	vibrate(2000);
}

export function toneOff(): void {
	if (!ctx || !gain) return;
	const now = ctx.currentTime + 0.005;
	
	gain.gain.cancelScheduledValues(now);
	gain.gain.setValueAtTime(gain.gain.value, now);
	gain.gain.linearRampToValueAtTime(0, now + RAMP_MS / 1000);

	vibrate(0);
}

export function playTone(durationMs: number): Promise<void> {
	return new Promise((resolve) => {
		toneOn();
		setTimeout(() => {
			toneOff();
			resolve();
		}, durationMs);
	});
}
