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
		<!-- Reserved space for symmetry with learn page -->
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
</style>
