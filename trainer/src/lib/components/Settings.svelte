<script lang="ts">
	import { settings } from '$lib/shell.svelte';
	import { onMount } from 'svelte';

	let { onclose } = $props<{ onclose: () => void }>();
	let dialog = $state<HTMLDialogElement>();

	onMount(() => {
		dialog?.showModal();
	});

	function handleClose() {
		dialog?.close();
	}

	function toggleLetters() {
		if (settings.trainNumbers) {
			settings.trainLetters = !settings.trainLetters;
		} else {
			settings.trainLetters = true;
		}
	}

	function toggleNumbers() {
		if (settings.trainLetters) {
			settings.trainNumbers = !settings.trainNumbers;
		} else {
			settings.trainNumbers = true;
		}
	}
</script>

<dialog
	bind:this={dialog}
	{onclose}
	onclick={(e) => e.target === dialog && handleClose()}
	class="settings-modal"
>
	<div class="settings-content">
		<div class="header">
			<h2>Settings</h2>
			<button class="close-btn" onclick={handleClose} aria-label="Close settings">&times;</button>
		</div>

		<div class="setting-item">
			<label>
				<input type="checkbox" checked={settings.trainLetters} onchange={toggleLetters} />
				<span>Train Letters (A-Z)</span>
			</label>
		</div>

		<div class="setting-item">
			<label>
				<input type="checkbox" checked={settings.trainNumbers} onchange={toggleNumbers} />
				<span>Train Numbers (0-9)</span>
			</label>
		</div>

		<div class="footer">
			<p>Changes will take effect in the next session.</p>
		</div>
	</div>
</dialog>

<style>
	.settings-modal {
		background: #222;
		border: 1px solid #333;
		border-radius: 8px;
		width: 90%;
		max-width: 400px;
		padding: 0;
		color: #eee;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
	}

	.settings-modal::backdrop {
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(4px);
	}

	.settings-content {
		padding: 1.5rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h2 {
		margin: 0;
		font-size: 1.2rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #888;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: #555;
		font-size: 2rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
		transition: color 100ms;
	}

	.close-btn:hover {
		color: #eee;
	}

	.setting-item {
		margin-bottom: 1.5rem;
	}

	label {
		display: flex;
		align-items: center;
		gap: 1rem;
		cursor: pointer;
		color: #eee;
		font-size: 1rem;
	}

	input[type='checkbox'] {
		width: 1.2rem;
		height: 1.2rem;
		accent-color: #fff;
	}

	.footer {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid #333;
	}

	.footer p {
		font-size: 0.75rem;
		color: #555;
		margin: 0;
		text-align: center;
	}
</style>
