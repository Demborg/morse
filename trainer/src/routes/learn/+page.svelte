<script lang="ts">
	import { TrainGame } from './state.svelte';
	import MorseDisplay from '$lib/components/MorseDisplay.svelte';
	import InputArea from '$lib/components/InputArea.svelte';
	import { onMount } from 'svelte';

	let game = new TrainGame();

	onMount(() => {
		game.mount();
		return () => game.unmount();
	});

	// Determine what to show on the display
	function getDisplayChar() {
		if (game.state === 'idle') return null;
		if (game.state === 'success' || game.state === 'retry') return game.char;
		if (game.taskType === 'listen' && game.state === 'listening') return '?';
		if (game.taskType === 'recall' || game.taskType === 'mimic') return game.char;
		return game.char;
	}

	function shouldShowPattern() {
		return game.taskType === 'mimic' && (game.state === 'demo' || game.state === 'listening');
	}
</script>

<div class="train-container">
	<MorseDisplay
		char={getDisplayChar()}
		showPattern={shouldShowPattern()}
		statusText={game.statusText}
		userInput={game.taskType === 'listen' ? [] : game.userInput}
	/>

	{#if game.state === 'listening' && game.taskType === 'listen'}
		<div class="actions">
			<button class="secondary-btn" onclick={() => game.replay()}>
				Replay Pattern
			</button>
		</div>
		<div class="choices">
			{#each game.choices as choice}
				<button class="choice-btn" onclick={() => game.submitChoice(choice)}>{choice}</button>
			{/each}
		</div>
	{:else if game.state === 'listening' && game.taskType === 'mimic'}
		<div class="actions">
			<button class="secondary-btn" onclick={() => game.replay()}>
				Replay Demo
			</button>
		</div>
	{/if}
</div>

<InputArea 
	disabled={game.state === 'listening' && game.taskType === 'listen'} 
	hint={game.state === 'idle' ? 'Tap anywhere or press Space' : ''} 
/>

<style>
	.train-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		pointer-events: none;
	}

	.actions {
		display: flex;
		justify-content: center;
		padding: 1rem;
		pointer-events: auto;
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
