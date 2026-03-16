export const UNIT_MS = 120;
export const DIT_MS = UNIT_MS;
export const DAH_MS = UNIT_MS * 3;
export const INTRA_GAP_MS = UNIT_MS;
export const INTER_GAP_MS = UNIT_MS * 3;
export const DIT_DAH_THRESHOLD_MS = UNIT_MS * 2;
export const END_TIMEOUT_MS = INTER_GAP_MS * 2;

export const MORSE_ALPHABET: Record<string, string> = {
	A: '.-',
	B: '-...',
	C: '-.-.',
	D: '-..',
	E: '.',
	F: '..-.',
	G: '--.',
	H: '....',
	I: '..',
	J: '.---',
	K: '-.-',
	L: '.-..',
	M: '--',
	N: '-.',
	O: '---',
	P: '.--.',
	Q: '--.-',
	R: '.-.',
	S: '...',
	T: '-',
	U: '..-',
	V: '...-',
	W: '.--',
	X: '-..-',
	Y: '-.--',
	Z: '--..',
	'1': '.----',
	'2': '..---',
	'3': '...--',
	'4': '....-',
	'5': '.....',
	'6': '-....',
	'7': '--...',
	'8': '---..',
	'9': '----.',
	'0': '-----'
};

// Ordered by difficulty: simple patterns first
export const CURRICULUM = [
	'E', 'T', 'A', 'N', 'I', 'M',
	'S', 'O', 'R', 'U', 'D', 'K',
	'H', 'W', 'G', 'B', 'L', 'F',
	'C', 'P', 'J', 'Q', 'V', 'X',
	'Y', 'Z',
	'1', '2', '3', '4', '5',
	'6', '7', '8', '9', '0'
];

export type TimelineEvent = { type: 'tone' | 'silence'; duration: number };

export function morseToTimeline(pattern: string): TimelineEvent[] {
	const events: TimelineEvent[] = [];
	for (let i = 0; i < pattern.length; i++) {
		events.push({
			type: 'tone',
			duration: pattern[i] === '.' ? DIT_MS : DAH_MS
		});
		if (i < pattern.length - 1) {
			events.push({ type: 'silence', duration: INTRA_GAP_MS });
		}
	}
	return events;
}
