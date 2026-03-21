<script lang="ts">
	import { triggerPress, triggerRelease } from '$lib/input.svelte';

	interface Props {
		disabled?: boolean;
		hint?: string | null;
	}

	let { disabled = false, hint = 'Tap anywhere or press Space' }: Props = $props();

	let touchTarget: HTMLDivElement;

	$effect(() => {
		if (touchTarget) {
			const tp = (e: Event) => triggerPress(e);
			const tr = (e: Event) => triggerRelease(e);
			touchTarget.addEventListener('touchstart', tp, { passive: false });
			touchTarget.addEventListener('touchend', tr, { passive: false });
			return () => {
				touchTarget.removeEventListener('touchstart', tp);
				touchTarget.removeEventListener('touchend', tr);
			};
		}
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="touch-target"
	bind:this={touchTarget}
	class:disabled
	onmousedown={triggerPress}
	onmouseup={triggerRelease}
>
	{#if hint}
		<span class="hint">{hint}</span>
	{/if}
</div>

<style>
	.touch-target {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		touch-action: none;
		cursor: pointer;
		z-index: 5;
	}

	.touch-target.disabled {
		pointer-events: none;
	}

	.hint {
		opacity: 0.2;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 15rem;
	}
</style>
