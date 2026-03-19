const FREQ = 700;
const RAMP_MS = 5;

let ctx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let harmonic: OscillatorNode | null = null;
let gain: GainNode | null = null;
let harmonicGain: GainNode | null = null;

function ensureContext(): AudioContext {
	if (!ctx) {
		ctx = new AudioContext();
		
		oscillator = ctx.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = FREQ;
		
		harmonic = ctx.createOscillator();
		harmonic.type = 'sine';
		harmonic.frequency.value = FREQ * 2;
		
		gain = ctx.createGain();
		gain.gain.value = 0;
		
		harmonicGain = ctx.createGain();
		harmonicGain.gain.value = 0;
		
		oscillator.connect(gain);
		harmonic.connect(harmonicGain);
		
		gain.connect(ctx.destination);
		harmonicGain.connect(ctx.destination);
		
		oscillator.start();
		harmonic.start();
	}
	return ctx;
}

export async function resume(): Promise<void> {
	const c = ensureContext();
	if (c.state === 'suspended') await c.resume();
}

export function toneOn(rich = false): void {
	const c = ensureContext();
	if (!gain || !harmonicGain) return;
	const now = c.currentTime + 0.005; // Tiny buffer for scheduling
	
	gain.gain.cancelScheduledValues(now);
	gain.gain.setValueAtTime(gain.gain.value, now);
	gain.gain.linearRampToValueAtTime(1, now + RAMP_MS / 1000);
	
	if (rich) {
		harmonicGain.gain.cancelScheduledValues(now);
		harmonicGain.gain.setValueAtTime(harmonicGain.gain.value, now);
		harmonicGain.gain.linearRampToValueAtTime(0.2, now + RAMP_MS / 1000);
	}
}

export function toneOff(): void {
	if (!ctx || !gain || !harmonicGain) return;
	const now = ctx.currentTime + 0.005;
	
	gain.gain.cancelScheduledValues(now);
	gain.gain.setValueAtTime(gain.gain.value, now);
	gain.gain.linearRampToValueAtTime(0, now + RAMP_MS / 1000);
	
	harmonicGain.gain.cancelScheduledValues(now);
	harmonicGain.gain.setValueAtTime(harmonicGain.gain.value, now);
	harmonicGain.gain.linearRampToValueAtTime(0, now + RAMP_MS / 1000);
}

export function playTone(durationMs: number, rich = false): Promise<void> {
	return new Promise((resolve) => {
		toneOn(rich);
		setTimeout(() => {
			toneOff();
			resolve();
		}, durationMs);
	});
}
