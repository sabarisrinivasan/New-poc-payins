import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import {svelteTesting} from '@testing-library/svelte/vite'


export default defineConfig({
	plugins: [tailwindcss(), sveltekit(),svelteTesting()],
	server: {
		port: 3003,
		strictPort: false,
		host: true
	},
	
});
