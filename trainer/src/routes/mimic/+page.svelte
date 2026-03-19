<script lang="ts">
	import { MimicGame } from './state.svelte';
	import MorseDisplay from '$lib/components/MorseDisplay.svelte';
	import InputArea from '$lib/components/InputArea.svelte';
	import { onMount } from 'svelte';

	let game = new MimicGame();

	onMount(() => {
		game.mount();
		return () => game.unmount();
	});
</script>

<MorseDisplay
	char={game.state === 'idle' ? null : game.char}
	pattern={game.state === 'idle' ? '' : game.pattern}
	userInput={game.userInput}
	showPattern={game.state !== 'idle'}
	demoElementIndex={game.demoElementIndex}
	statusText={game.statusText}
/>

<InputArea hint={game.state === 'idle' ? 'Tap anywhere or press Space' : ''} />
