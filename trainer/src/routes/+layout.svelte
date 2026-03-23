<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { handleKeyDown, handleKeyUp } from '$lib/input.svelte';
	import { shell } from '$lib/shell.svelte';
	import Settings from '$lib/components/Settings.svelte';

	let { children } = $props();
	let showSettings = $state(false);

	function isActive(path: string) {
		const fullPath = base + path;
		return (
			page.url.pathname === fullPath || (path === '/learn' && page.url.pathname === base + '/')
		);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Morse Trainer</title>
</svelte:head>

<svelte:window onkeydown={handleKeyDown} onkeyup={handleKeyUp} />

<div class="app" class:flash={shell.flash} class:success={shell.success} class:retry={shell.retry}>
	<div class="header">
		<button class="settings-btn" onclick={() => (showSettings = true)} aria-label="Settings">
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="3"></circle>
				<path
					d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
				></path>
			</svg>
		</button>
	</div>

	{#if showSettings}
		<Settings onclose={() => (showSettings = false)} />
	{/if}

	<div class="main-content">
		{@render children()}
	</div>

	<div class="footer">
		<div class="modes">
			<a class:active={isActive('/learn')} href="{base}/learn">Learn</a>
			<a class:active={isActive('/words')} href="{base}/words">Words</a>
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

	.header {
		display: flex;
		justify-content: flex-end;
		padding: 1rem;
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		z-index: 50;
	}

	.settings-btn {
		background: transparent;
		border: none;
		color: #444;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 100ms;
	}

	.settings-btn:active {
		color: #eee;
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
