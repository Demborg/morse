<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { handleKeyDown, handleKeyUp } from '$lib/input.svelte';
	import { shell } from '$lib/shell.svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Morse Trainer</title>
</svelte:head>

<svelte:window onkeydown={handleKeyDown} onkeyup={handleKeyUp} />

<div class="app" class:flash={shell.flash} class:success={shell.success} class:retry={shell.retry}>
	<div class="main-content">
		{@render children()}
	</div>

	<div class="footer">
		<div class="modes">
			<a class:active={page.url.pathname === '/mimic' || page.url.pathname === '/'} href="/mimic">Mimic</a>
			<a class:active={page.url.pathname === '/recall'} href="/recall">Recall</a>
			<a class:active={page.url.pathname === '/recognize'} href="/recognize">Listen</a>
			<a class:active={page.url.pathname === '/words'} href="/words">Words</a>
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
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
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

	.modes a {
		text-decoration: none;
		background: transparent;
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

	.modes a.active {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}
</style>
