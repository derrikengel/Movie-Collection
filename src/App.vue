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
                        <span v-html="film" :class="s.navIcon" />
                        All Movies
                    </RouterLink>

                    <template v-if="auth.user">
                        <RouterLink to="/profile/watchlist" :class="s.navLink" :active-class="s.navLinkActive">
                            <span v-html="bookmark" :class="s.navIcon" />
                            My Watchlist
                            <span v-if="watchlistCount !== null" :class="s.navBadge">{{ watchlistCount }}</span>
                        </RouterLink>

                        <RouterLink to="/profile/favorites" :class="s.navLink" :active-class="s.navLinkActive">
                            <span v-html="heart" :class="s.navIcon" />
                            My Favorites
                            <span v-if="favoritesCount !== null" :class="s.navBadge">{{ favoritesCount }}</span>
                        </RouterLink>

                        <RouterLink v-if="auth.isAdmin" to="/admin/add" :class="s.navLink"
                            :active-class="s.navLinkActive">
                            <span v-html="plus" :class="s.navIcon" />
                            Add
                        </RouterLink>

                        <RouterLink to="/profile" :class="[s.navLink, s.navUser]" :active-class="s.navLinkActive">
                            <span v-html="userGear" :class="s.navIcon" />
                            {{ auth.displayName }}
                        </RouterLink>
                    </template>

                    <template v-else>
                        <RouterLink to="/login" :class="s.navLink" :active-class="s.navLinkActive">
                            <span v-html="userCircle" :class="s.navIcon" />
                            Sign In
                        </RouterLink>
                    </template>
                </div>
            </nav>
        </header>

        <main :class="s.main">
            <RouterView v-slot="{ Component }">
                <Transition name="page" mode="out-in">
                    <component :is="Component" :key="$route.path" />
                </Transition>
            </RouterView>
        </main>

        <!-- Mobile bottom tab bar -->
        <AppTabBar />

    </div>
</template>

<script setup>
    import { useAuthStore } from '@/stores/auth'
    import { useMoviesStore } from '@/stores/movies'
    import AppTabBar from '@/components/AppTabBar.vue'
    import { useListCounts } from '@/composables/useListCounts'
    import film from '@/assets/icons/film.svg?raw'
    import bookmark from '@/assets/icons/bookmark.svg?raw'
    import heart from '@/assets/icons/heart.svg?raw'
    import userGear from '@/assets/icons/user-gear.svg?raw'
    import userCircle from '@/assets/icons/user-circle.svg?raw'
    import plus from '@/assets/icons/plus.svg?raw'

    const auth = useAuthStore()
    const moviesStore = useMoviesStore()
    const { watchlistCount, favoritesCount } = useListCounts()
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
        color: var(--color-text);
        background: var(--color-bg-hover);
    }

    .navLinkActive {
        color: var(--color-text);
        background: oklch(100% 0 0 / 0.08);
    }

    .navIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-2xl);
        justify-content: center;
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
        color: var(--color-text-on-accent);
        border-radius: var(--radius-full);
        line-height: 1;
    }

    .main {
        flex: 1;
        padding-bottom: var(--footer-space);
    }

    @media (min-width: 768px) {
        .main {
            --footer-space: 0;
        }
    }
</style>
