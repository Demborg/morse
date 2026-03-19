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

<MorseDisplay
	word={game.state === 'idle' ? null : game.currentWord}
	wordProgress={game.wordProgress}
	pattern={game.state === 'idle' ? '' : game.expectedPattern}
	userInput={game.userInput}
	showPattern={game.state !== 'idle' && game.state !== 'success'}
	hideUnenteredPattern={game.state === 'listening'}
	statusText={game.statusText}
/>

<InputArea hint={game.state === 'idle' ? 'Tap anywhere or press Space' : ''} />
