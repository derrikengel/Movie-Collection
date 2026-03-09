import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/login', component: () => import('@/views/LoginView.vue') },
{ path: '/profile', component: () => import('@/views/lists/ProfileView.vue'), meta: { requiresAuth: true } },
{ path: '/profile/watchlist', component: () => import('@/views/lists/WatchlistView.vue'), meta: { requiresAuth: true } },
{ path: '/profile/favorites', component: () => import('@/views/lists/FavoritesView.vue'), meta: { requiresAuth: true } },
{ path: '/profile/watched', component: () => import('@/views/lists/WatchedView.vue'), meta: { requiresAuth: true } },
{ path: '/profile/ignored', component: () => import('@/views/lists/IgnoredView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/add', component: () => import('@/views/admin/MovieFormView.vue'), meta: { requiresAdmin: true } },
    { path: '/admin/edit/:slug', component: () => import('@/views/admin/MovieFormView.vue'), meta: { requiresAdmin: true } },
    { path: '/:slug', component: () => import('@/views/MovieDetailView.vue') },
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
})

export default router
