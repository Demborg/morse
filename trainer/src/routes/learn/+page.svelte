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
		
		// If we are succeeding or retrying, always show the correct answer
		if (game.state === 'success' || game.state === 'retry') return game.char;
		
		// Listen mode: hide character during playback and listening
		if (game.taskType === 'listen') {
			if (game.state === 'demo' || game.state === 'listening') return '?';
		}
		
		// Mimic/Recall: show the character
		return game.char;
	}

	function shouldShowPattern() {
		// Show pattern during Mimic (Learning)
		if (game.taskType === 'mimic') return true;
		
		// Show pattern during Retry (Correcting)
		if (game.state === 'retry') return true;
		
		// Show pattern during Success (Feedback)
		if (game.state === 'success') return true;

		return false;
	}
</script>

<div class="train-container">
	<MorseDisplay
		char={getDisplayChar()}
		pattern={game.pattern}
		showPattern={shouldShowPattern()}
		statusText={game.statusText}
		userInput={game.taskType === 'listen' ? [] : game.userInput}
		demoElementIndex={game.demoElementIndex}
	/>

	<div class="game-ui">
		{#if game.state === 'listening'}
			{#if game.taskType === 'listen'}
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
			{:else if game.taskType === 'mimic'}
				<div class="actions">
					<button class="secondary-btn" onclick={() => game.replay()}>
						Replay Demo
					</button>
				</div>
			{/if}
		{/if}
	</div>
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

	.game-ui {
		min-height: 280px; /* Reserved space for choices + actions */
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.actions {
		display: flex;
		justify-content: center;
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

	.choices {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 1rem 2rem 2rem;
		pointer-events: auto;
		position: relative;
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
