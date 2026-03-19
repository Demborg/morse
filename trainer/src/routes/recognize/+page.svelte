<script lang="ts">
	import { RecognizeGame } from './state.svelte';
	import MorseDisplay from '$lib/components/MorseDisplay.svelte';
	import InputArea from '$lib/components/InputArea.svelte';
	import { onMount } from 'svelte';

	let game = new RecognizeGame();

	onMount(() => {
		game.mount();
		return () => game.unmount();
	});
</script>

<div class="recognize-container">
	<MorseDisplay
		char={game.state === 'idle' ? null : (game.state === 'success' || game.state === 'retry' ? game.char : '?')}
		showPattern={false}
		statusText={game.statusText}
	/>

	{#if game.state === 'listening'}
		<div class="choices">
			{#each game.choices as choice}
				<button class="choice-btn" onclick={() => game.submitChoice(choice)}>{choice}</button>
			{/each}
		</div>
	{/if}
</div>

<InputArea disabled={game.state === 'listening'} hint={game.state === 'idle' ? 'Tap anywhere or press Space' : ''} />

<style>
	.recognize-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		pointer-events: none;
	}
	.choices {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 1rem 2rem 2rem;
		pointer-events: auto;
		z-index: 10;
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
</style>
