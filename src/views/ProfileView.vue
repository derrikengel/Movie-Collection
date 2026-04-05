<template>
    <div :class="s.page">

        <!-- User header -->
        <div :class="s.userHeader">
            <!-- <div :class="s.avatar">
                {{ initials }}
            </div> -->
            <div :class="s.userInfo">
                <h1 :class="s.displayName">{{ auth.displayName }}</h1>
                <div :class="s.stats">
                    <template v-for="(stat, i) in stats" :key="stat.label">
                        <span v-if="i > 0" :class="s.statDivider" />
                        <span :class="[s.stat, stat.listClass]">
                            <span :class="s.statValue">{{ stat.value }}</span>
                            <span :class="s.statLabel">{{ stat.label }}</span>
                        </span>
                    </template>
                </div>
            </div>
        </div>

        <!-- Lists -->
        <div :class="s.lists">
            <ProfileListCard v-for="list in lists" :key="list.to" v-bind="list" />
        </div>

        <!-- Account -->
        <div :class="s.section">
            <h2 :class="s.sectionTitle">Account</h2>
            <div :class="s.accountCard">
                <div :class="s.accountRow">
                    <span :class="s.accountLabel">Signed in as</span>
                    <span :class="s.accountValue">{{ auth.user?.email }}</span>
                </div>
                <div :class="s.accountDivider" />
                <button :class="s.signOutBtn" @click="handleSignOut">
                    Sign out
                </button>
            </div>
        </div>

    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import { useToastStore } from '@/stores/toast'
    import { useUserMoviesStore } from '@/stores/userMovies'
    import { useMoviesStore } from '@/stores/movies'
    import ProfileListCard from '@/components/profile/ProfileListCard.vue'
    import watchedIcon from '@/assets/icons/eye.svg?raw'
    import watchlistIcon from '@/assets/icons/bookmark.svg?raw'
    import favoritesIcon from '@/assets/icons/heart.svg?raw'
    import ignoredIcon from '@/assets/icons/ignore.svg?raw'

    const auth = useAuthStore()
    const toast = useToastStore()
    const userMoviesStore = useUserMoviesStore()
    const moviesStore = useMoviesStore()
    const router = useRouter()

    const initials = computed(() => {
        const name = auth.displayName ?? ''
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    })

    const counts = computed(() => ({
        watched: userMoviesStore.userMovies.filter(m => m.watched).length,
        watchlist: userMoviesStore.userMovies.filter(m => m.watchlist).length,
        favorites: userMoviesStore.userMovies.filter(m => m.favorite).length,
        ignored: userMoviesStore.userMovies.filter(m => m.ignored).length,
    }))

    function getPreviewMovies(field) {
        return userMoviesStore.userMovies
            .filter(m => m[field])
            .slice(0, 5)
            .map(m => moviesStore.movies.find(mv => mv.id === m.movie_id))
            .filter(m => m?.poster_path)
    }

    const lists = computed(() => [
        {
            to: '/profile/watchlist',
            label: 'Watchlist',
            count: counts.value.watchlist,
            previews: getPreviewMovies('watchlist'),
            icon: watchlistIcon,
            listClass: 'list-watchlist',
        },
        {
            to: '/profile/watched',
            label: 'Watched',
            count: counts.value.watched,
            previews: getPreviewMovies('watched'),
            icon: watchedIcon,
            listClass: 'list-watched',
        },
        {
            to: '/profile/favorites',
            label: 'Favorites',
            count: counts.value.favorites,
            previews: getPreviewMovies('favorite'),
            icon: favoritesIcon,
            listClass: 'list-favorite',
        },
        {
            to: '/profile/ignored',
            label: 'Ignored',
            count: counts.value.ignored,
            previews: getPreviewMovies('ignored'),
            icon: ignoredIcon,
            listClass: 'list-ignored',
        },
    ])

    const stats = computed(() => [
        { label: 'Watched', value: counts.value.watched, listClass: 'list-watched' },
        { label: 'Watchlist', value: counts.value.watchlist, listClass: 'list-watchlist' },
        { label: 'Favorites', value: counts.value.favorites, listClass: 'list-favorite' },
        { label: 'Ignored', value: counts.value.ignored, listClass: 'list-ignored' },
    ])

    async function handleSignOut() {
        toast.show('Signed out')
        await auth.logout()
        router.push('/')
    }
</script>

<style module="s">
    .page {
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: var(--size-8);
        margin-inline: auto;
        max-width: var(--content-width);
    }

    /* ── User header ── */
    .userHeader {
        display: flex;
        align-items: center;
        gap: var(--size-4);
    }

    /* .avatar {
        width: var(--size-14);
        aspect-ratio: 1 / 1;
        border-radius: var(--radius-full);
        background: var(--color-accent-subtle);
        border: 1px solid var(--color-accent-muted);
        color: var(--color-accent);
        font-size: var(--text-lg);
        font-weight: var(--font-weight-bold);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    } */

    .userInfo {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .displayName {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
    }

    .stats {
        display: flex;
        align-items: center;
        gap: var(--size-3);
        flex-wrap: wrap;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    .statValue {
        color: var(--color-list-400);
        font-size: var(--text-base);
        font-weight: var(--font-weight-bold);
        line-height: 1;
    }

    .statLabel {
        color: var(--color-text);
        font-size: 10px;
        font-weight: var(--font-weight-medium);
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .statDivider {
        width: 1px;
        height: 24px;
        background: var(--color-border);
    }

    /* ── Lists ── */
    .lists {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--size-3);

        @container (min-width: 48rem) {
            grid-template-columns: repeat(2, 1fr);
        }

        @container (min-width: 48rem) {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    /* ── Account ── */
    .section {
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
    }

    .sectionTitle {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-text-muted);
    }

    .accountCard {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        overflow: hidden;
    }

    .accountRow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--size-4);
        gap: var(--size-4);
    }

    .accountLabel {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        flex-shrink: 0;
    }

    .accountValue {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .accountDivider {
        height: 1px;
        background: var(--color-border);
    }

    .signOutBtn {
        width: 100%;
        padding: var(--size-4);
        text-align: left;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-error);
        background: none;
        border: none;
        cursor: pointer;
        transition: background var(--transition-fast);
    }
</style>
