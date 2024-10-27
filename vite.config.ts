import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        viteStaticCopy({
            targets: [
                {
                    src: 'manifest.json',
                    dest: '.'
                }
            ]
        })
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    },
    build: {
        rollupOptions: {
            input: {
                popup: 'src/pages/popup/popup.html',
                options: 'src/pages/options/options.html',
                background: 'src/background.js',
                'content-script': 'src/content-script.js'
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            }
        }
    }
})
