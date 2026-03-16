import { DIT_DAH_THRESHOLD_MS } from './morse';

export function classifyPress(durationMs: number): '.' | '-' {
	return durationMs < DIT_DAH_THRESHOLD_MS ? '.' : '-';
}
