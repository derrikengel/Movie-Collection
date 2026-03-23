<!-- src/components/AppTabBar.vue -->
<template>
    <nav :class="s.tabBar" aria-label="Main navigation">
        <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" :class="s.tab" :active-class="s.tabActive"
            :exact="tab.exact">
            <span :class="s.tabIcon" v-html="tab.icon" aria-hidden="true" />
            <span :class="s.tabLabel">{{ tab.label }}</span>
            <span v-if="tab.badge" class="badge" :class="s.tabBadge">{{ tab.badge }}</span>
        </RouterLink>
    </nav>
</template>

<script setup>
    import { computed } from 'vue'
    import { useAuthStore } from '@/stores/auth'
    import { useListCounts } from '@/composables/useListCounts'
    import film from '@/assets/icons/film.svg?raw'
    import bookmark from '@/assets/icons/bookmark.svg?raw'
    import heart from '@/assets/icons/heart.svg?raw'
    import userGear from '@/assets/icons/user-gear.svg?raw'
    import userCircle from '@/assets/icons/user-circle.svg?raw'
    import plus from '@/assets/icons/plus.svg?raw'

    const auth = useAuthStore()
    const { watchlistCount, favoritesCount } = useListCounts()

    const tabs = computed(() => {
        const items = [
            {
                to: '/',
                exact: true,
                label: 'Movies',
                icon: film,
                badge: null,
            },
        ]

        if (auth.user) {
            items.push(
                {
                    to: '/profile/watchlist',
                    exact: false,
                    label: 'Watchlist',
                    icon: bookmark,
                    badge: watchlistCount.value || null,
                },
                {
                    to: '/profile/favorites',
                    exact: false,
                    label: 'Favorites',
                    icon: heart,
                    badge: favoritesCount.value || null,
                },
                {
                    to: '/profile',
                    exact: true,
                    label: auth.displayName,
                    icon: userGear,
                    badge: null,
                }
            )
        } else {
            items.push({
                to: '/login',
                exact: false,
                label: 'Sign In',
                icon: userCircle,
                badge: null,
            })
        }

        if (auth.isAdmin) {
            items.push({
                to: '/admin/add',
                exact: false,
                label: 'Add',
                icon: plus,
                badge: null,
            })
        }

        return items
    })
</script>

<style module="s">

    /* Only visible on mobile */
    .tabBar {
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-lg);
        border-top: 1px solid var(--color-border-frosted);
        border-top-left-radius: var(--radius-xl);
        border-top-right-radius: var(--radius-xl);
        bottom: 0;
        /* box-shadow: var(--shadow-lg); */
        display: flex;
        height: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
        left: 0;
        overflow: hidden;
        padding-bottom: env(safe-area-inset-bottom);
        position: fixed;
        right: 0;
        z-index: 90;

        @media (min-width: 64rem) {
            display: none;
        }
    }

    .tab {
        align-items: center;
        color: var(--color-text-muted);
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-1);
        justify-content: center;
        position: relative;
        text-decoration: none;
        transition: color var(--transition-fast);
    }

    .tab:hover {
        color: var(--color-text-secondary);
    }

    .tabActive {
        color: var(--color-text);
        position: relative;
    }

    .tabActive:before {
        background-color: var(--color-primary);
        border-top-left-radius: var(--radius-md);
        border-top-right-radius: var(--radius-md);
        bottom: 0;
        content: '';
        height: var(--size-1);
        left: 50%;
        translate: -50% 0;
        position: absolute;
        width: var(--size-12);
    }

    .tabIcon {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
    }



    .tabLabel {
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-medium);
    }

    .tabBadge {
        box-shadow: var(--shadow-md);
        position: absolute;
        right: calc(50% - var(--size-5));
        top: var(--size-1);
    }
</style>
