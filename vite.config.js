import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import {
    defineConfig
} from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    server: {
        port: 5173,
        host: '0.0.0.0',
        hmr: {
            host: 'spark.localhost'
        },
    },

    esbuild: {
        jsx: 'automatic',
    },

});
