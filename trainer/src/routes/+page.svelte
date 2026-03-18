<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getState,
		getMode,
		setMode,
		getChar,
		getPattern,
		getUserInput,
		getChoices,
		submitChoice,
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
		if (getState() === 'idle') {
			start();
		} else {
			handlePressStart();
			if (getState() === 'listening') toneOn();
		}
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
			case 'listening': return getMode() === 'recognize' ? 'Pick a letter' : 'Your turn';
			case 'success': return 'Correct';
			case 'retry': return 'Try again';
			default: return '';
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} />

<div class="app" class:flash={isToneActive()} class:success={getState() === 'success'} class:retry={getState() === 'retry'}>
	<div class="main-content" class:centered={getMode() !== 'recognize' || getState() !== 'listening'}>
		<div class="display">
			<div class="char">
				{#if getState() === 'idle'}
					·−
				{:else if getMode() === 'recognize' && getState() === 'listening'}
					?
				{:else}
					{getChar()}
				{/if}
			</div>

			<div class="pattern">
				{#if getState() !== 'idle' && getMode() !== 'recognize'}
					{#each getPattern().split('') as symbol, i}
						<span
							class="symbol"
							class:hidden={getMode() === 'recall' && getState() === 'listening'}
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

		{#if getMode() === 'recognize' && getState() === 'listening'}
			<div class="choices">
				{#each getChoices() as choice}
					<button class="choice-btn" onclick={() => submitChoice(choice)}>{choice}</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="touch-target"
		bind:this={touchTarget}
		onmousedown={onPress}
		onmouseup={onRelease}
		class:disabled={getMode() === 'recognize' && getState() === 'listening'}
	>
		{#if getState() === 'idle'}
			<span class="hint">Tap anywhere or press Space</span>
		{/if}
	</div>

	<div class="footer">
		<div class="modes">
			<button class:active={getMode() === 'mimic'} onclick={() => setMode('mimic')}>Mimic</button>
			<button class:active={getMode() === 'recall'} onclick={() => setMode('recall')}>Recall</button>
			<button class:active={getMode() === 'recognize'} onclick={() => setMode('recognize')}>Listen</button>
		</div>
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

	.main-content {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		z-index: 10;
		pointer-events: none;
	}

	.main-content.centered {
		flex: 1;
		justify-content: center;
	}

	.display {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 1rem 2rem;
		gap: 0.5rem;
	}

	.char {
		font-size: 5rem;
		font-weight: 700;
		line-height: 1;
		min-height: 5rem;
		font-variant-numeric: tabular-nums;
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

	.symbol.hidden {
		opacity: 0.1;
		color: transparent;
		background: #444;
		height: 4px;
		width: 1.5rem;
		align-self: center;
		border-radius: 2px;
	}

	.symbol.active {
		opacity: 1;
		color: #fff;
	}

	.symbol.entered.correct {
		opacity: 1;
		color: #6f6;
		background: transparent;
	}

	.symbol.entered.wrong {
		opacity: 1;
		color: #f66;
		background: transparent;
	}

	.status {
		font-size: 1rem;
		opacity: 0.4;
		margin-top: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.choices {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 1rem 2rem 4rem;
		pointer-events: auto;
	}

	.choice-btn {
		background: transparent;
		border: 1px solid #333;
		color: #eee;
		font-family: inherit;
		font-size: 2.5rem;
		font-weight: 700;
		padding: 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 100ms;
	}

	.choice-btn:active {
		background: #333;
		border-color: #555;
	}

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

	.footer {
		padding: 2rem;
		display: flex;
		justify-content: center;
		z-index: 20;
	}

	.modes {
		display: flex;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
		padding: 2px;
	}

	.modes button {
		background: transparent;
		border: none;
		color: #555;
		font-family: inherit;
		padding: 0.4rem 0.8rem;
		border-radius: 2px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 100ms;
	}

	.modes button.active {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}
</style>
