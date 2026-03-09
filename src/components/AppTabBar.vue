<!-- src/components/AppTabBar.vue -->
<template>
  <nav :class="s.tabBar" aria-label="Main navigation">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      :class="s.tab"
      :active-class="s.tabActive"
      :exact="tab.exact"
    >
      <span :class="s.tabIcon" v-html="tab.icon" aria-hidden="true" />
      <span :class="s.tabLabel">{{ tab.label }}</span>
      <span v-if="tab.badge" :class="s.tabBadge">{{ tab.badge }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserMoviesStore } from '@/stores/userMovies'

const auth = useAuthStore()
const userMoviesStore = useUserMoviesStore()

const watchlistCount = computed(() =>
  userMoviesStore.userMovies.filter(m => m.watchlist).length
)
const favoritesCount = computed(() =>
  userMoviesStore.userMovies.filter(m => m.favorite).length
)

const tabs = computed(() => {
  const items = [
    {
      to: '/',
      exact: true,
      label: 'Movies',
      icon: `<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2z"/></svg>`,
      badge: null,
    },
  ]

  if (auth.user) {
    items.push(
      {
        to: '/profile/watchlist',
        exact: false,
        label: 'Watchlist',
        icon: `<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a2 2 0 0 0-2 2v14l7-3 7 3V4a2 2 0 0 0-2-2H5z"/></svg>`,
        badge: watchlistCount.value || null,
      },
      {
        to: '/profile/favorites',
        exact: false,
        label: 'Favorites',
        icon: `<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 0 0-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.957z"/></svg>`,
        badge: favoritesCount.value || null,
      },
      {
        to: '/profile',
        exact: true,
        label: auth.displayName,
        icon: `<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" clip-rule="evenodd"/></svg>`,
        badge: null,
      }
    )
  } else {
    items.push({
      to: '/login',
      exact: false,
      label: 'Sign In',
      icon: `<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" clip-rule="evenodd"/></svg>`,
      badge: null,
    })
  }

  if (auth.isAdmin) {
    items.push({
      to: '/admin/add',
      exact: false,
      label: 'Add',
      icon: `<svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clip-rule="evenodd"/></svg>`,
      badge: null,
    })
  }

  return items
})
</script>

<style module="s">
/* Only visible on mobile */
.tabBar {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(13, 13, 15, 0.85);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 90;
}

@media (min-width: 768px) {
  .tabBar {
    display: none;
  }
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--color-text-muted);
  text-decoration: none;
  position: relative;
  transition: color var(--transition-fast);
}

.tab:hover {
  color: var(--color-text-secondary);
}

.tabActive {
  color: var(--color-accent);
}

.tabIcon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabLabel {
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.02em;
}

.tabBadge {
  position: absolute;
  top: 6px;
  right: calc(50% - 18px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 9px;
  font-weight: var(--font-weight-bold);
  background: var(--color-accent);
  color: #000;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
