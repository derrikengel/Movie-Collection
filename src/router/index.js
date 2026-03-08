import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/login', component: () => import('@/views/LoginView.vue') },
    { path: '/lists', component: () => import('@/views/lists/ListsView.vue'), meta: { requiresAuth: true } },
    { path: '/lists/watchlist', component: () => import('@/views/lists/WatchlistView.vue'), meta: { requiresAuth: true } },
    { path: '/lists/favorites', component: () => import('@/views/lists/FavoritesView.vue'), meta: { requiresAuth: true } },
    { path: '/lists/watched', component: () => import('@/views/lists/WatchedView.vue'), meta: { requiresAuth: true } },
    { path: '/lists/ignored', component: () => import('@/views/lists/IgnoredView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/add', component: () => import('@/views/admin/AddMovieView.vue'), meta: { requiresAdmin: true } },
    { path: '/admin/edit/:slug', component: () => import('@/views/admin/EditMovieView.vue'), meta: { requiresAdmin: true } },
    { path: '/:slug', component: () => import('@/views/MovieDetailView.vue') },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.user) {
    return '/login'
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return '/'
  }
})

export default router
