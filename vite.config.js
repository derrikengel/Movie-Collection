import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                // Serve cached index.html for all navigation requests (SPA routing)
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api\//],
                runtimeCaching: [
                    {
                        // Supabase API — NetworkFirst: fresh data when online, cached data as fallback
                        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-cache',
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24
                            },
                            cacheableResponse: { statuses: [0, 200] }
                        }
                    },
                    {
                        // TMDB poster/backdrop images — CacheFirst, they never change
                        urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'tmdb-images',
                            expiration: {
                                maxEntries: 1000,
                                maxAgeSeconds: 60 * 60 * 24 * 30
                            },
                            cacheableResponse: { statuses: [0, 200] }
                        }
                    }
                ]
            },
            manifest: {
                id: '/',
                name: 'Movies',
                short_name: 'Movies',
                description: 'Browse and manage the movie collection.',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                launch_handler: {
                    client_mode: 'focus-existing'
                },
                background_color: '#060A0C',
                theme_color: '#060A0C',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: '/icon-1024.png',
                        sizes: '1024x1024',
                        type: 'image/png'
                    },
                    {
                        src: '/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: '/icon-1024.png',
                        sizes: '1024x1024',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ]
            }
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
})
