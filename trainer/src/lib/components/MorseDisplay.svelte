<script lang="ts">
	let {
		char = null,
		word = null,
		wordProgress = 0,
		pattern = '', // the expected pattern for char, or for the CURRENT letter in word mode
		userInput = [],
		showPattern = true,
		hideUnenteredPattern = false,
		demoElementIndex = -1,
		statusText = ''
	} = $props();
</script>

<div class="display">
	<div class="char">
		{#if word}
			<div class="word-display">
				{#each word.split('') as letter, i}
					<span
						class="word-letter"
						class:correct={i < wordProgress}
						class:active={i === wordProgress}
						class:pending={i > wordProgress}
					>{letter}</span>
				{/each}
			</div>
		{:else if char}
			{char}
		{:else}
			<div class="logo-title">MORSE</div>
			.—
		{/if}
	</div>
	<div class="pattern" style:visibility={showPattern ? 'visible' : 'hidden'}>
		{#each pattern.split('') as symbol, i}
			<span
				class="symbol"
				class:hidden={hideUnenteredPattern}
				class:active={demoElementIndex === i}
				class:entered={i < userInput.length}
				class:correct={i < userInput.length && userInput[i] === symbol}
				class:wrong={i < userInput.length && userInput[i] !== symbol}
			>{symbol === '.' ? '.' : '—'}</span>
		{/each}
	</div>
	<div class="status">{statusText}</div>
</div>

<style>
	.display {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		gap: 0.5rem;
	}

	.char {
		font-size: 5rem;
		font-weight: 700;
		line-height: 1;
		min-height: 5rem;
		font-variant-numeric: tabular-nums;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.logo-title {
		font-size: 0.8rem;
		opacity: 0.2;
		letter-spacing: 0.8em;
		margin-bottom: 2rem;
		margin-right: -0.8em;
	}

	.pattern {
		display: flex;
		gap: 0.75rem;
		font-size: 2.5rem;
		min-height: 3rem;
		font-weight: 700;
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

	.word-display {
		display: flex;
		gap: 0.2rem;
	}

	.word-letter {
		color: #eee;
		transition: color 100ms;
	}

	.word-letter.correct {
		color: #6f6;
	}

	.word-letter.active {
		color: #fff;
		text-decoration: underline;
		text-decoration-thickness: 4px;
		text-underline-offset: 8px;
	}

	.word-letter.pending {
		color: #555;
	}
</style>
