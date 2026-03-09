<!-- App.vue -->
<template>
  <div :class="s.app">

    <header :class="s.header">
      <nav :class="s.nav">
        <RouterLink to="/" :class="s.brand">
          <span :class="s.brandCount">{{ moviesStore.movies.length }}</span>
          <span :class="s.brandLabel">Movies</span>
        </RouterLink>

        <!-- Desktop nav -->
        <div :class="s.desktopNav">
          <RouterLink to="/" :class="s.navLink" :active-class="s.navLinkActive" exact>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2 3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9zm0 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2z"/></svg>
            All Movies
          </RouterLink>

          <template v-if="auth.user">
            <RouterLink to="/profile/watchlist" :class="s.navLink" :active-class="s.navLinkActive">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5 2a2 2 0 0 0-2 2v14l7-3 7 3V4a2 2 0 0 0-2-2H5z"/></svg>
              My Watchlist
              <span v-if="watchlistCount !== null" :class="s.navBadge">{{ watchlistCount }}</span>
            </RouterLink>

            <RouterLink to="/profile/favorites" :class="s.navLink" :active-class="s.navLinkActive">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 0 0-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.957z"/></svg>
              My Favorites
              <span v-if="favoritesCount !== null" :class="s.navBadge">{{ favoritesCount }}</span>
            </RouterLink>

            <RouterLink v-if="auth.isAdmin" to="/admin/add" :class="s.navLink" :active-class="s.navLinkActive">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clip-rule="evenodd"/></svg>
              Add
            </RouterLink>

            <RouterLink to="/profile" :class="[s.navLink, s.navUser]" :active-class="s.navLinkActive">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" clip-rule="evenodd"/></svg>
              {{ auth.displayName }}
            </RouterLink>
          </template>

          <template v-else>
            <RouterLink to="/login" :class="s.navLink" :active-class="s.navLinkActive">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" clip-rule="evenodd"/></svg>
              Sign In
            </RouterLink>
          </template>
        </div>
      </nav>
    </header>

    <main :class="s.main">
      <RouterView />
    </main>

    <!-- Mobile bottom tab bar -->
    <AppTabBar />

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMoviesStore } from '@/stores/movies'
import { useUserMoviesStore } from '@/stores/userMovies'
import AppTabBar from '@/components/AppTabBar.vue'

const auth = useAuthStore()
const moviesStore = useMoviesStore()
const userMoviesStore = useUserMoviesStore()

const watchlistCount = computed(() =>
  userMoviesStore.userMovies.filter(m => m.watchlist).length
)
const favoritesCount = computed(() =>
  userMoviesStore.userMovies.filter(m => m.favorite).length
)
</script>

<style module="s">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.header {
  border-bottom: 1px solid var(--color-border);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--content-padding);
  height: var(--header-height);
  margin: 0 auto;
  width: 100%;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  text-decoration: none;
}

.brandCount {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
  line-height: 1;
  letter-spacing: -0.02em;
}

.brandLabel {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Desktop nav — hidden on mobile */
.desktopNav {
  display: none;
  align-items: center;
  gap: var(--space-1);
}

@media (min-width: 768px) {
  .desktopNav {
    display: flex;
  }
}

.navLink {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: color var(--transition-fast), background var(--transition-fast);
  white-space: nowrap;
}

.navLink:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.navLinkActive {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.08);
}

.navUser {
  margin-left: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
}

.navUser:hover {
  border-color: var(--color-border-strong);
}

.navBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 var(--space-1);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  background: var(--color-accent);
  color: #000;
  border-radius: var(--radius-full);
  line-height: 1;
}

.main {
  flex: 1;
  padding-top: var(--header-height);
  padding-bottom: 60px; /* tab bar height */
}

@media (min-width: 768px) {
  .main {
    padding-bottom: 0;
  }
}
</style>
