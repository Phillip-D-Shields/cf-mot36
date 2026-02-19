import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
        rollupOptions: {
            // Tells Vite not to bundle this module
            external: ['cloudflare:email']
        }
    },
    ssr: {
        // Ensures SvelteKit's server build also ignores it
        external: ['cloudflare:email']
    }
});
