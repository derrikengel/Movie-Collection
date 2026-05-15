import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFiltersStore } from '@/stores/filters'
import { useNavContextStore } from '@/stores/navContext'

let scrollResolve = null

export function triggerScrollResolve() {
    if (scrollResolve) {
        const resolve = scrollResolve
        scrollResolve = null
        nextTick(resolve)
    }
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        return new Promise(resolve => {
            scrollResolve = () => resolve(savedPosition ?? { top: 0 })
        })
    },
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue'),
            meta: {
                title: 'Movie Collection',
                filterBar: true,
            }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
            meta: {
                title: 'Sign In'
            }
        },
        {
            path: '/user/:name',
            name: 'profile',
            component: () => import('@/views/ProfileView.vue'),
            meta: {
                requiresAuth: true,
            }
        },
        {
            path: '/user/:name/watchlist',
            name: 'watchlist',
            component: () => import('@/views/lists/WatchlistView.vue'),
            meta: {
                requiresAuth: true,
                filterBar: true,
            }
        },
        {
            path: '/user/:name/favorites',
            name: 'favorites',
            component: () => import('@/views/lists/FavoritesView.vue'),
            meta: {
                requiresAuth: true,
                filterBar: true,
            }
        },
        {
            path: '/user/:name/watched',
            name: 'watched',
            component: () => import('@/views/lists/WatchedView.vue'),
            meta: {
                requiresAuth: true,
                filterBar: true,
            }
        },
        {
            path: '/user/:name/ignored',
            name: 'ignored',
            component: () => import('@/views/lists/IgnoredView.vue'),
            meta: {
                requiresAuth: true,
                filterBar: true,
            }
        },
        {
            path: '/styleguide',
            name: 'styleguide',
            component: () => import('@/views/StyleGuideView.vue'),
            meta: {
                requiresAdmin: true,
                title: 'Style Guide'
            }
        },
        {
            path: '/admin/add',
            name: 'add-movie',
            component: () => import('@/views/admin/MovieFormView.vue'),
            meta: {
                requiresAdmin: true,
                title: 'Add Movie'
            }
        },
        {
            path: '/admin/edit/:slug',
            name: 'edit-movie',
            component: () => import('@/views/admin/MovieFormView.vue'),
            meta: {
                requiresAdmin: true,
                title: 'Edit Movie'
            }
        },
        {
            path: '/:slug',
            name: 'movie',
            component: () => import('@/views/MovieDetailView.vue')
        },
    ],
})

router.beforeEach((to, from) => {
    if (to.params.slug && !from.params.slug) {
        const filters = useFiltersStore()
        const navContext = useNavContextStore()
        navContext.setContext([...filters.filteredMovies], from.name, { ...from.params })
    }
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (!auth.initialized) {
        await new Promise(resolve => {
            const unwatch = setInterval(() => {
                if (auth.initialized) {
                    clearInterval(unwatch)
                    resolve()
                }
            }, 10)
        })
    }

    if (to.meta.requiresAuth && !auth.user) return { name: 'login' }
    if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'home' }

    if (to.meta.title) {
        document.title = to.path === '/'
            ? to.meta.title
            : `${to.meta.title} | Movie Collection`
    }
})

export default router
