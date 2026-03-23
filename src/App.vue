<!-- App.vue -->
<template>
    <div :class="s.app">

        <header :class="[s.header, isMovieDetail && s.hideHeaderNarrow]">
            <nav :class="s.nav">

                <!-- Any listing page: filtered count + list name -->
                <div v-if="isListPage" :class="s.countHeader">
                    <span :class="s.countHeaderNumber">{{ filters.visibleMovies.length }}</span>
                    <span :class="s.countHeaderLabel">
                        {{ filters.visibleMovies.length === 1 ? 'movie' : 'movies' }}
                    </span>
                </div>

                <!-- Profile: display name -->
                <div v-else-if="isProfile" :class="s.headerTitle">{{ auth.displayName }}</div>

                <!-- All other pages: route meta title -->
                <div v-else :class="s.headerTitle">{{ route.meta.title }}</div>

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
                            <span v-if="watchlistCount !== null" class="badge" :class="s.navBadge">{{ watchlistCount
                                }}</span>
                        </RouterLink>

                        <RouterLink to="/profile/favorites" :class="s.navLink" :active-class="s.navLinkActive">
                            <span v-html="heart" :class="s.navIcon" />
                            My Favorites
                            <span v-if="favoritesCount !== null" class="badge" :class="s.navBadge">{{ favoritesCount
                                }}</span>
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
                <Transition name="page" mode="out-in" @after-leave="triggerScrollResolve">
                    <KeepAlive :include="['HomeView']">
                        <component :is="Component" :key="$route.path" />
                    </KeepAlive>
                </Transition>
            </RouterView>
        </main>

        <!-- Mobile bottom tab bar (hidden on movie detail — action bar takes its place) -->
        <AppTabBar />
        <ToastStack />
        <ConfirmDialog />
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { triggerScrollResolve } from '@/router'
    import { useAuthStore } from '@/stores/auth'
    import { useFiltersStore } from '@/stores/filters'
    import AppTabBar from '@/components/AppTabBar.vue'
    import ToastStack from '@/components/ToastStack.vue'
    import ConfirmDialog from '@/components/ConfirmDialog.vue'
    import { useListCounts } from '@/composables/useListCounts'
    import film from '@/assets/icons/film.svg?raw'
    import bookmark from '@/assets/icons/bookmark.svg?raw'
    import heart from '@/assets/icons/heart.svg?raw'
    import userGear from '@/assets/icons/user-gear.svg?raw'
    import userCircle from '@/assets/icons/user-circle.svg?raw'
    import plus from '@/assets/icons/plus.svg?raw'

    const route = useRoute()
    const auth = useAuthStore()
    const filters = useFiltersStore()
    const { watchlistCount, favoritesCount } = useListCounts()

    const listingPaths = ['/', '/profile/watchlist', '/profile/watched', '/profile/favorites', '/profile/ignored']
    const isListPage = computed(() => listingPaths.includes(route.path))
    const isMovieDetail = computed(() => !route.meta?.title && route.path !== '/')
    const isProfile = computed(() => route.path === '/profile')
</script>

<style module="s">
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
    }

    .header {
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-lg);
        /* border-bottom: 1px solid var(--color-border); */
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .hideHeaderNarrow {
        display: none;

        @media (min-width: 64rem) {
            display: block;
        }
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

    /* Overlay header on mobile movie detail — hero fills the top */
    /* .headerOverlay {
        background: transparent;
        backdrop-filter: none;
        border: none;
        pointer-events: none;

        @media (min-width: 64rem) {
            background: var(--color-bg-frosted);
            backdrop-filter: var(--bg-frosted-lg);
            border-bottom-color: var(--color-border);
            pointer-events: auto;
        }
    } */

    /* Re-enable pointer events on the back button itself */
    /* .headerOverlay .backBtn {
        pointer-events: auto;
    } */

    .countHeader {
        display: flex;
        align-items: baseline;
        gap: var(--size-2);
    }

    .countHeaderNumber {
        font-size: var(--text-3xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary);

        @media (min-width: 64rem) {
            font-size: var(--text-5xl);
        }
    }

    .countHeaderLabel {
        color: var(--color-text);
        font-size: var(--text-xs);
        text-transform: uppercase;
        letter-spacing: var(--tracking-widest);

        @media (min-width: 64rem) {
            font-size: var(--text-lg);
        }
    }

    /* Desktop nav — hidden on mobile */
    .desktopNav {
        display: none;
        align-items: center;
        gap: var(--size-1);

        @media (min-width: 64rem) {
            display: flex;
        }
    }

    .navLink {
        display: inline-flex;
        align-items: center;
        gap: var(--size-2);
        padding: var(--size-2) var(--size-3);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
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
        background: var(--color-surface-raised);
    }

    .navIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-2xl);
        justify-content: center;
    }

    .navUser {
        margin-left: var(--size-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
    }

    .navUser:hover {
        border-color: var(--color-border-strong);
    }

    .headerTitle {
        color: var(--color-text);
        font-size: var(--text-lg);
        font-weight: var(--font-weight-bold);
    }

    /* .mainOverlay {
        margin-top: calc(-1 * var(--header-height));

        @media (min-width: 64rem) {
            margin-top: 0;
        }
    } */

    .main {
        flex: 1;
        padding: var(--content-padding) var(--content-padding) calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + var(--content-padding)) var(--content-padding);

        @media (min-width: 64rem) {
            padding: var(--content-padding);
        }
    }
</style>
