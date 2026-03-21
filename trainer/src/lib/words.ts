const WORDS = [
	'THE',
	'AND',
	'FOR',
	'ARE',
	'BUT',
	'NOT',
	'YOU',
	'ALL',
	'ANY',
	'CAN',
	'HAD',
	'HER',
	'WAS',
	'ONE',
	'OUR',
	'OUT',
	'DAY',
	'GET',
	'HAS',
	'HIM',
	'HIS',
	'HOW',
	'MAN',
	'NEW',
	'NOW',
	'OLD',
	'SEE',
	'TWO',
	'WAY',
	'WHO',
	'BOY',
	'DID',
	'ITS',
	'LET',
	'PUT',
	'SAY',
	'SHE',
	'TOO',
	'USE'
];

export function getRandomWord(allowedChars: string[] = []): string {
	const allowed = new Set(allowedChars.map((c) => c.toUpperCase()));

	if (allowed.size > 0) {
		const filtered = WORDS.filter((w) => w.split('').every((c) => allowed.has(c)));
		if (filtered.length > 0) {
			return filtered[Math.floor(Math.random() * filtered.length)];
		}

		// Fallback: Generate a random "word" from allowed characters
		const len = Math.floor(Math.random() * 3) + 3; // 3-5 chars
		const chars = Array.from(allowed);
		let word = '';
		for (let i = 0; i < len; i++) {
			word += chars[Math.floor(Math.random() * chars.length)];
		}
		return word;
	}

	return WORDS[Math.floor(Math.random() * WORDS.length)];
}
