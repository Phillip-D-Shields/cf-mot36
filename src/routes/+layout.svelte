<script lang="ts">
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.min.css';

	onMount(async () => {
		await import('bootstrap/dist/js/bootstrap.bundle.min.js');

		// Register service worker
		if ('serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('/service-worker.js');
				console.log('SW registered:', registration.scope);
			} catch (err) {
				console.log('SW registration failed:', err);
			}
		}
	});

	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}