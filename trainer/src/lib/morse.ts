export const UNIT_MS = 80;
export const DIT_MS = UNIT_MS;
export const DAH_MS = UNIT_MS * 3;
export const INTRA_GAP_MS = UNIT_MS;
export const INTER_GAP_MS = UNIT_MS * 3;
export const DIT_DAH_THRESHOLD_MS = UNIT_MS * 2;
export const END_TIMEOUT_MS = INTER_GAP_MS * 2;

const CURRICULUM_DATA: { char: string; pattern: string; type: 'letter' | 'number' }[] = [
	{ char: 'E', pattern: '.', type: 'letter' },
	{ char: 'T', pattern: '-', type: 'letter' },
	{ char: 'A', pattern: '.-', type: 'letter' },
	{ char: 'N', pattern: '-.', type: 'letter' },
	{ char: 'I', pattern: '..', type: 'letter' },
	{ char: 'M', pattern: '--', type: 'letter' },
	{ char: 'S', pattern: '...', type: 'letter' },
	{ char: 'O', pattern: '---', type: 'letter' },
	{ char: 'R', pattern: '.-.', type: 'letter' },
	{ char: 'U', pattern: '..-', type: 'letter' },
	{ char: 'D', pattern: '-..', type: 'letter' },
	{ char: 'K', pattern: '-.-', type: 'letter' },
	{ char: 'H', pattern: '....', type: 'letter' },
	{ char: 'W', pattern: '.--', type: 'letter' },
	{ char: 'G', pattern: '--.', type: 'letter' },
	{ char: 'B', pattern: '-...', type: 'letter' },
	{ char: 'L', pattern: '.-..', type: 'letter' },
	{ char: 'F', pattern: '..-.', type: 'letter' },
	{ char: 'C', pattern: '-.-.', type: 'letter' },
	{ char: 'P', pattern: '.--.', type: 'letter' },
	{ char: 'J', pattern: '.---', type: 'letter' },
	{ char: 'Q', pattern: '--.-', type: 'letter' },
	{ char: 'V', pattern: '...-', type: 'letter' },
	{ char: 'X', pattern: '-..-', type: 'letter' },
	{ char: 'Y', pattern: '-.--', type: 'letter' },
	{ char: 'Z', pattern: '--..', type: 'letter' },
	{ char: '1', pattern: '.----', type: 'number' },
	{ char: '2', pattern: '..---', type: 'number' },
	{ char: '3', pattern: '...--', type: 'number' },
	{ char: '4', pattern: '....-', type: 'number' },
	{ char: '5', pattern: '.....', type: 'number' },
	{ char: '6', pattern: '-....', type: 'number' },
	{ char: '7', pattern: '--...', type: 'number' },
	{ char: '8', pattern: '---..', type: 'number' },
	{ char: '9', pattern: '----.', type: 'number' },
	{ char: '0', pattern: '-----', type: 'number' }
];

export const MORSE_ALPHABET: Record<string, string> = Object.fromEntries(
	CURRICULUM_DATA.map((d) => [d.char, d.pattern])
);

export const CURRICULUM_LETTERS = CURRICULUM_DATA.filter((d) => d.type === 'letter').map(
	(d) => d.char
);

export const CURRICULUM_NUMBERS = CURRICULUM_DATA.filter((d) => d.type === 'number').map(
	(d) => d.char
);

export const CURRICULUM = CURRICULUM_DATA.map((d) => d.char);

export type TimelineEvent = { type: 'tone' | 'silence'; duration: number };

export function morseToTimeline(pattern: string): TimelineEvent[] {
	const events: TimelineEvent[] = [];
	const dit = DIT_MS;
	const dah = DAH_MS;
	const gap = INTRA_GAP_MS;

	for (let i = 0; i < pattern.length; i++) {
		events.push({
			type: 'tone',
			duration: pattern[i] === '.' ? dit : dah
		});
		if (i < pattern.length - 1) {
			events.push({ type: 'silence', duration: gap });
		}
	}
	return events;
}
