<template>
    <header :class="[s.header, isMovieDetail && s.hideHeaderNarrow]">

        <!-- Left side: transitions between count, profile name, and page title -->
        <Transition name="count" mode="out-in">
            <div v-if="isListPage" :key="route.path" :class="s.countHeader">
                <span :class="s.countHeaderNumber">{{ displayCount }}</span>
                <span :class="s.countHeaderLabel">
                    <span v-if="listName" :class="s.countHeaderList">{{ listName }}</span>
                    {{ displayCount === 1 ? 'movie' : 'movies' }}
                </span>
            </div>
            <div v-else-if="isProfile" key="profile" :class="s.headerTitle">Profile</div>
            <div v-else :key="`title-${route.path}`" :class="s.headerTitle">{{ route.meta.title }}</div>
        </Transition>

        <nav :class="s.nav">
            <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" :exact="link.exact"
                :class="[s.navLink, link.colored && s.navLinkColored, link.listClass, forcedActiveRoute === link.to.name && s.navLinkActive]"
                :active-class="s.navLinkActive">
                <span v-html="link.icon" :class="s.navIcon" />
                <span :class="s.navLabel">{{ link.label }}</span>
                <span v-if="link.badge" class="badge" :class="s.navBadge">{{ link.badge }}</span>
            </RouterLink>
        </nav>
    </header>
</template>

<script setup>
    import { computed, ref, watch, onUnmounted } from 'vue'
    import { useRoute } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import { useFiltersStore } from '@/stores/filters'
    import { useListCounts } from '@/composables/useListCounts'
    import { useNavContextStore } from '@/stores/navContext'
    import film from '@/assets/icons/film.svg?raw'
    import bookmark from '@/assets/icons/bookmark.svg?raw'
    import heart from '@/assets/icons/heart.svg?raw'
    import userIcon from '@/assets/icons/user.svg?raw'
    import plus from '@/assets/icons/plus.svg?raw'

    const route = useRoute()
    const auth = useAuthStore()
    const filters = useFiltersStore()
    const navContext = useNavContextStore()
    const { watchlistCount, favoritesCount } = useListCounts()

    const forcedActiveRoute = computed(() =>
        route.name === 'movie' ? (navContext.sourceList ?? 'home') : null
    )

    const listingNames = ['home', 'watchlist', 'watched', 'favorites', 'ignored']
    const isListPage = computed(() => listingNames.includes(route.name))
    const isMovieDetail = computed(() => !route.meta?.title && route.name !== 'home')
    const isProfile = computed(() => route.name === 'profile')

    const listNameMap = {
        watchlist: 'Watchlist',
        watched: 'Watched',
        favorites: 'Favorite',
        ignored: 'Ignored',
    }
    const listName = computed(() => listNameMap[route.name] ?? null)

    // ── Animated count ─────────────────────────────────
    // ── Animated count ─────────────────────────────────
    const displayCount = ref(filters.visibleMovies.length)
    let animFrame = null
    let debounceTimer = null
    let routeTimer = null
    let isRouteChange = false

    function cancelAnim() {
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null }
    }

    function runAnim(from, to) {
        cancelAnim()
        if (from === to) return
        const start = performance.now()
        const duration = 400
        function step(now) {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - (1 - t) ** 3
            displayCount.value = Math.round(from + (to - from) * eased)
            if (t < 1) animFrame = requestAnimationFrame(step)
        }
        animFrame = requestAnimationFrame(step)
    }

    // Route change: reset to 0 while count is hidden; flag to skip debounce on next update.
    // Fallback timer handles the KeepAlive case where filters.visibleMovies.length doesn't
    // change (base was already correct), so the length watcher never fires.
    watch(() => route.name, (newName) => {
        cancelAnim()
        clearTimeout(debounceTimer)
        clearTimeout(routeTimer)
        if (!listingNames.includes(newName)) return
        displayCount.value = 0
        isRouteChange = true
        routeTimer = setTimeout(() => {
            if (!isRouteChange) return
            isRouteChange = false
            runAnim(0, filters.visibleMovies.length)
        }, 200)
    })

    // Count change: immediate for route changes, debounced for filter/slider changes
    watch(() => filters.visibleMovies.length, (to) => {
        if (isRouteChange) {
            isRouteChange = false
            clearTimeout(routeTimer)
            runAnim(0, to)
            return
        }
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => { runAnim(displayCount.value, to) }, 150)
    })

    onUnmounted(() => {
        cancelAnim()
        clearTimeout(debounceTimer)
        clearTimeout(routeTimer)
    })

    const navLinks = computed(() => {
        const items = [
            { to: { name: 'home' }, exact: true, label: 'All Movies', icon: film, badge: null },
        ]

        if (auth.user) {
            items.push(
                {
                    to: { name: 'watchlist' },
                    exact: false,
                    label: 'Watchlist',
                    icon: bookmark,
                    badge: watchlistCount.value || null,
                    listClass: 'list-watchlist',
                    colored: true,
                },
                {
                    to: { name: 'favorites' },
                    exact: false,
                    label: 'Favorites',
                    icon: heart,
                    badge: favoritesCount.value || null,
                    listClass: 'list-favorite',
                    colored: true,
                },
            )

            if (auth.isAdmin) {
                items.push({ to: { name: 'add-movie' }, exact: false, label: 'Add Movie', icon: plus, badge: null })
            }

            items.push({ to: { name: 'profile' }, exact: true, label: auth.displayName, icon: userIcon, badge: null, isUser: true })
        } else {
            items.push({ to: { name: 'login' }, exact: false, label: 'Sign In', icon: userIcon, badge: null })
        }

        return items
    })
</script>

<style module="s">

    :global(.count-enter-active),
    :global(.count-leave-active) {
        transition: opacity 150ms ease;
    }

    :global(.count-enter-from),
    :global(.count-leave-to) {
        opacity: 0;
    }

    .header {
        align-items: center;
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-lg);
        display: flex;
        height: var(--header-height);
        justify-content: space-between;
        padding: 0 var(--content-padding);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .hideHeaderNarrow {
        display: none;

        @media (min-width: 64rem) {
            display: flex;
        }
    }

    .countHeader {
        align-items: last baseline;
        display: flex;
        gap: var(--size-2);
    }

    .countHeaderNumber {
        color: var(--color-primary);
        font-size: var(--text-3xl);
        font-weight: var(--font-weight-bold);

        @media (min-width: 64rem) {
            font-size: var(--text-5xl);
        }
    }

    .countHeaderLabel {
        color: var(--color-text-muted);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tight);
        text-transform: uppercase;

        @media (min-width: 64rem) {
            font-size: var(--text-lg);
        }
    }

    .countHeaderList {
        color: var(--color-heading);
        display: block;
        font-size: var(--text-2xs);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;

        @media (min-width: 64rem) {
            font-size: var(--text-xs);
        }
    }

    .headerTitle {
        color: var(--color-text);
        font-size: var(--text-lg);
        font-weight: var(--font-weight-bold);
    }

    .nav {
        display: none;
        gap: var(--size-2);

        @media (min-width: 64rem) {
            display: flex;
        }
    }

    .navLink {
        align-items: center;
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        display: inline-flex;
        font-size: var(--text-sm);
        gap: var(--size-2);
        padding: var(--size-2) var(--size-3);
        transition: color var(--transition-fast), background var(--transition-fast);
    }

    .navIcon {
        align-items: center;
        color: var(--color-list-500, var(--color-text-muted));
        display: flex;
        font-size: var(--text-2xl);
        justify-content: center;
        transition: color var(--transition-fast);

        :global(.solid) {
            display: none;
            transition: fill var(--transition-fast);
        }

        :global(.outline) {
            display: block;
        }
    }

    .navLabel {
        color: var(--color-text-muted);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    .navBadge {
        background: oklch(from var(--color-list-400) l c h / 0.26);
        color: var(--color-list-300);
        transition: color var(--transition-fast), background var(--transition-fast);
    }

    .navLink:hover {
        background: var(--color-surface-raised);

        .navIcon {
            color: var(--color-list-400, var(--blue-50));
            opacity: 1;
        }

        .navLabel {
            color: var(--color-text);
        }

        .navBadge {
            background: var(--color-list-400);
            color: var(--color-list-800);
        }
    }

    .navLinkActive {
        background: var(--color-surface-raised);

        .navIcon {
            color: var(--color-list-400, var(--blue-50));
            opacity: 1;

            :global(.solid) {
                display: block;
            }

            :global(.outline) {
                display: none;
            }
        }

        .navLabel {
            color: var(--blue-50);
        }

        .navBadge {
            background: var(--color-list-400);
            color: var(--color-list-800);
        }
    }
</style>
