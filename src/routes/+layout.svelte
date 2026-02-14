<script lang="ts">
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.min.css';

	onMount(async () => {
		// We use a dynamic import here so it doesn't run during Server Side Rendering
		await import('bootstrap/dist/js/bootstrap.bundle.min.js');
	});
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
