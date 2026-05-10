<template>
    <nav :class="s.tabBar" aria-label="Main navigation">
        <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to"
            :class="[s.tab, tab.listClass && s.tabColored, tab.listClass, forcedActiveRoute === tab.to.name && s.tabActive]"
            :active-class="s.tabActive" :exact="tab.exact" @click="handleTabClick(tab)">
            <span :class="s.tabIcon" v-html="tab.icon" aria-hidden="true" />
            <span :class="s.tabLabel">{{ tab.label }}</span>
        </RouterLink>
    </nav>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import { useNavContextStore } from '@/stores/navContext'
    import film from '@/assets/icons/film.svg?raw'
    import bookmark from '@/assets/icons/bookmark.svg?raw'
    import heart from '@/assets/icons/heart.svg?raw'
    import userIcon from '@/assets/icons/user.svg?raw'
    import plus from '@/assets/icons/plus.svg?raw'

    const route = useRoute()
    const auth = useAuthStore()
    const navContext = useNavContextStore()
    const forcedActiveRoute = computed(() =>
        route.name === 'movie' ? (navContext.sourceList ?? 'home') : null
    )

    function handleTabClick(tab) {
        if (route.name === tab.to.name) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const tabs = computed(() => {
        const items = [
            {
                to: { name: 'home' },
                exact: true,
                label: 'Movies',
                icon: film,
            },
        ]

        if (auth.user) {
            items.push(
                {
                    to: { name: 'watchlist' },
                    exact: false,
                    label: 'Watchlist',
                    icon: bookmark,
                    listClass: 'list-watchlist',
                },
                {
                    to: { name: 'favorites' },
                    exact: false,
                    label: 'Favorites',
                    icon: heart,
                    listClass: 'list-favorite',
                },
                {
                    to: { name: 'profile' },
                    exact: true,
                    label: auth.displayName,
                    icon: userIcon,
                }
            )
        } else {
            items.push({
                to: { name: 'login' },
                exact: false,
                label: 'Sign In',
                icon: userIcon,
            })
        }

        if (auth.isAdmin) {
            items.push({
                to: { name: 'add-movie' },
                exact: false,
                label: 'Add',
                icon: plus,
            })
        }

        return items
    })
</script>

<style module="s">
    .tabBar {
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-3xl);
        border-top-left-radius: var(--radius-2xl);
        border-top-right-radius: var(--radius-2xl);
        box-shadow: 0 -5px 25px -5px oklch(from var(--blue-950) l c h / 0.5), 0 -2px 10px -6px oklch(from var(--blue-950) l c h / 0.5);
        bottom: 0;
        height: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
        padding-bottom: env(safe-area-inset-bottom);
        display: flex;
        left: 0;
        overflow: hidden;
        position: fixed;
        right: 0;
        z-index: 90;

        @media (min-width: 64rem) {
            display: none;
        }
    }

    .tab {
        align-items: center;
        color: var(--blue-400);
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-2);
        justify-content: center;
        position: relative;
        text-decoration: none;
    }

    .tabIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-xl);
        justify-content: center;
        transition: color var(--transition-fast);
    }

    .tabLabel {
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    .tabActive {
        color: var(--blue-50);
        position: relative;

        &:before {
            background-color: var(--red-400);
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
            color: var(--color-list-400);
        }
    }
</style>
