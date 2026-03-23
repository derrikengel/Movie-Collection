import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'

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
            component: () => import('@/views/HomeView.vue'),
            meta: {
                title: 'Movie Collection'
            }
        },
        {
            path: '/login',
            component: () => import('@/views/LoginView.vue'),
            meta: {
                title: 'Sign In'
            }
        },
        {
            path: '/profile',
            component: () => import('@/views/lists/ProfileView.vue'),
            meta: {
                requiresAuth: true,
                title: 'Your Profile'
            }
        },
        {
            path: '/profile/watchlist',
            component: () => import('@/views/lists/WatchlistView.vue'),
            meta: {
                requiresAuth: true,
                title: 'Watchlist'
            }
        },
        {
            path: '/profile/favorites',
            component: () => import('@/views/lists/FavoritesView.vue'),
            meta: {
                requiresAuth: true,
                title: 'Favorites'
            }
        },
        {
            path: '/profile/watched',
            component: () => import('@/views/lists/WatchedView.vue'),
            meta: {
                requiresAuth: true,
                title: 'Watched'
            }
        },
        {
            path: '/profile/ignored',
            component: () => import('@/views/lists/IgnoredView.vue'),
            meta: {
                requiresAuth: true,
                title: 'Not Interested'
            }
        },
        {
            path: '/styleguide',
            component: () => import('@/views/StyleGuideView.vue')
        },
        {
            path: '/admin/add',
            component: () => import('@/views/admin/MovieFormView.vue'),
            meta: {
                requiresAdmin: true,
                title: 'Add Movie'
            }
        },
        {
            path: '/admin/edit/:slug',
            component: () => import('@/views/admin/MovieFormView.vue'),
            meta: {
                requiresAdmin: true,
                title: 'Edit Movie'
            }
        },
        {
            path: '/:slug',
            component: () => import('@/views/MovieDetailView.vue')
        },
    ],
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

    if (to.meta.requiresAuth && !auth.user) return '/login'
    if (to.meta.requiresAdmin && !auth.isAdmin) return '/'

    if (to.meta.title) {
        document.title = to.path === '/'
            ? to.meta.title
            : `${to.meta.title} | Movie Collection`
    }
})

export default router
