<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getState,
		getChar,
		getPattern,
		getUserInput,
		isToneActive,
		getDemoElementIndex,
		start,
		handlePressStart,
		handlePressEnd
	} from '$lib/game.svelte';
	import { toneOn, toneOff } from '$lib/audio';

	let touchTarget: HTMLDivElement;

	function onPress(e: Event) {
		e.preventDefault();
		handlePressStart();
		if (getState() === 'listening') toneOn();
	}

	function onRelease(e: Event) {
		e.preventDefault();
		handlePressEnd();
		toneOff();
	}

	onMount(() => {
		touchTarget.addEventListener('touchstart', onPress, { passive: false });
		touchTarget.addEventListener('touchend', onRelease, { passive: false });
		return () => {
			touchTarget.removeEventListener('touchstart', onPress);
			touchTarget.removeEventListener('touchend', onRelease);
		};
	});

	function onKeyDown(e: KeyboardEvent) {
		if (e.repeat) return;
		if (e.code === 'Space') {
			e.preventDefault();
			if (getState() === 'idle') {
				start();
			} else {
				handlePressStart();
				if (getState() === 'listening') toneOn();
			}
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		if (e.code === 'Space') {
			e.preventDefault();
			handlePressEnd();
			toneOff();
		}
	}

	function statusText(state: string): string {
		switch (state) {
			case 'idle': return 'Tap to start';
			case 'demo': return 'Listen...';
			case 'listening': return 'Your turn!';
			case 'success': return 'Correct!';
			case 'retry': return 'Try again';
			default: return '';
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} />

<div class="app" class:flash={isToneActive()} class:success={getState() === 'success'} class:retry={getState() === 'retry'}>
	<div class="display">
		<div class="char">{getState() === 'idle' ? '·−' : getChar()}</div>
		<div class="pattern">
			{#if getState() !== 'idle'}
				{#each getPattern().split('') as symbol, i}
					<span
						class="symbol"
						class:dit={symbol === '.'}
						class:dah={symbol === '-'}
						class:active={getState() === 'demo' && getDemoElementIndex() === i}
						class:entered={getState() === 'listening' && i < getUserInput().length}
						class:correct={getState() === 'listening' && i < getUserInput().length && getUserInput()[i] === symbol}
						class:wrong={getState() === 'listening' && i < getUserInput().length && getUserInput()[i] !== symbol}
					>{symbol === '.' ? '·' : '−'}</span>
				{/each}
			{/if}
		</div>
		<div class="status">{statusText(getState())}</div>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="touch-target"
		bind:this={touchTarget}
		onmousedown={onPress}
		onmouseup={onRelease}
		onclick={getState() === 'idle' ? start : undefined}
	>
		{#if getState() === 'idle'}
			<span class="hint">Tap here or press Space</span>
		{/if}
	</div>
</div>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden;
		background: #111;
		color: #eee;
		font-family: 'SF Mono', 'Fira Code', monospace;
		-webkit-user-select: none;
		user-select: none;
	}

	.app {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: #111;
		transition: background-color 60ms;
	}

	.app.flash {
		background: #333;
	}

	.app.success {
		background: #1a3a1a;
	}

	.app.retry {
		background: #3a1a1a;
	}

	.display {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem 1rem;
		gap: 0.5rem;
	}

	.char {
		font-size: 5rem;
		font-weight: 700;
		line-height: 1;
	}

	.pattern {
		display: flex;
		gap: 0.75rem;
		font-size: 2.5rem;
		min-height: 3rem;
	}

	.symbol {
		opacity: 0.3;
		transition: opacity 100ms, color 100ms;
	}

	.symbol.active {
		opacity: 1;
		color: #fff;
	}

	.symbol.entered.correct {
		opacity: 1;
		color: #6f6;
	}

	.symbol.entered.wrong {
		opacity: 1;
		color: #f66;
	}

	.status {
		font-size: 1.2rem;
		opacity: 0.6;
		margin-top: 0.25rem;
	}

	.touch-target {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		touch-action: none;
		cursor: pointer;
	}

	.hint {
		opacity: 0.4;
		font-size: 1.1rem;
	}
</style>
