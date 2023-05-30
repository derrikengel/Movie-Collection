import { fileURLToPath, URL } from 'node:url'
import autoprefixer from 'autoprefixer'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    css: {
        postcss: {
            plugins: [
                autoprefixer({})
            ],
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
