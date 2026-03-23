<script lang="ts">
	import { WordsGame } from './state.svelte';
	import MorseDisplay from '$lib/components/MorseDisplay.svelte';
	import InputArea from '$lib/components/InputArea.svelte';
	import { onMount } from 'svelte';

	let game = new WordsGame();

	onMount(() => {
		game.mount();
		return () => game.unmount();
	});
</script>

<div class="words-container">
	<MorseDisplay
		word={game.state === 'idle' ? null : game.currentWord}
		wordProgress={game.wordProgress}
		pattern={game.state === 'idle' ? '' : game.expectedPattern}
		userInput={game.userInput}
		showPattern={game.state !== 'idle' && game.state !== 'success'}
		hideUnenteredPattern={game.state === 'listening'}
		statusText={game.statusText}
	/>

	<div class="game-ui">
		{#if game.state === 'listening'}
			<div class="actions">
				<button class="secondary-btn" onclick={() => game.dontKnow()}> Don't Know </button>
			</div>
		{/if}
	</div>
</div>

<InputArea hint={null} />

<style>
	.words-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		pointer-events: none;
	}

	.game-ui {
		min-height: 280px; /* Match learn page reserved space */
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		padding: 1rem;
		pointer-events: auto;
		position: relative;
		z-index: 10;
	}

	.secondary-btn {
		background: transparent;
		border: 1px solid #333;
		color: #888;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.secondary-btn:active {
		background: #222;
	}
</style>
