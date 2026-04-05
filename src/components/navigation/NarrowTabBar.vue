<template>
    <nav :class="s.tabBar" aria-label="Main navigation">
        <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to"
            :class="[s.tab, tab.listClass && s.tabColored, tab.listClass]" :active-class="s.tabActive"
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
    import userIcon from '@/assets/icons/user.svg?raw'
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
                    listClass: 'list-watchlist',
                },
                {
                    to: '/profile/favorites',
                    exact: false,
                    label: 'Favorites',
                    icon: heart,
                    badge: favoritesCount.value || null,
                    listClass: 'list-favorite',
                },
                {
                    to: '/profile',
                    exact: true,
                    label: auth.displayName,
                    icon: userIcon,
                    badge: null,
                }
            )
        } else {
            items.push({
                to: '/login',
                exact: false,
                label: 'Sign In',
                icon: userIcon,
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
    .tabBar {
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-lg);
        border-top: 1px solid var(--color-border-frosted);
        border-top-left-radius: var(--radius-xl);
        border-top-right-radius: var(--radius-xl);
        bottom: 0;
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
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-1);
        justify-content: center;
        position: relative;
        text-decoration: none;
    }

    .tabIcon {
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

    .tabLabel {
        color: var(--color-text-muted);
        font-size: 0.5rem;
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    .tabBadge {
        background: var(--color-list-400);
        color: var(--color-list-800);
        box-shadow: 0 0 0 var(--size-0-5) var(--color-bg-frosted);
        position: absolute;
        right: calc(50% - var(--size-6));
        top: var(--size-1);
        transition: background var(--transition-fast);
    }

    .tab:hover {
        .tabIcon {
            color: var(--color-list-400, var(--blue-50));
        }

        .tabLabel {
            color: var(--color-text);
        }
    }

    .tabActive {
        position: relative;

        &:before {
            background-color: var(--color-primary);
            border-top-left-radius: var(--radius-md);
            border-top-right-radius: var(--radius-md);
            bottom: 0;
            content: '';
            height: var(--size-1);
            left: 50%;
            position: absolute;
            translate: -50% 0;
            width: var(--size-12);
        }

        .tabIcon {
            color: var(--color-list-400, var(--blue-50));

            :global(.solid) {
                display: block;
            }

            :global(.outline) {
                display: none;
            }
        }

        .tabLabel {
            color: var(--blue-50);
        }
    }
</style>
