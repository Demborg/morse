export const WORDS = [
	'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'ANY', 'CAN', 
	'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 
	'HIS', 'HOW', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 
	'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'DAD', 
	'MOM', 'CAT', 'DOG', 'BIRD', 'FISH', 'GOOD', 'TIME', 'WORK', 'PLAY',
	'LIKE', 'JUST', 'KNOW', 'TAKE', 'YOUR', 'SOME', 'COULD', 'THEM', 'OTHER',
	'THAN', 'THEN', 'LOOK', 'ONLY', 'COME', 'OVER', 'THINK', 'ALSO', 'BACK',
	'AFTER', 'USE', 'HOW', 'OUR', 'WORK', 'FIRST', 'WELL', 'WAY', 'EVEN',
	'NEW', 'WANT', 'BECAUSE', 'ANY', 'THESE', 'GIVE', 'DAY', 'MOST', 'US'
];

export function getRandomWord(): string {
	return WORDS[Math.floor(Math.random() * WORDS.length)];
}
