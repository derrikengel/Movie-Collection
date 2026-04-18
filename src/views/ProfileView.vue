<template>
    <div :class="s.page">

        <!-- <dl :class="s.stats">
            <div v-for="(stat, i) in stats" :key="stat.label" :class="[s.stat, stat.listClass]">
                <dd :class="s.statValue">{{ stat.value }}</dd>
                <dt :class="s.statLabel">{{ stat.label }}</dt>
            </div>
        </dl> -->

        <div :class="s.account">
            <div :class="s.accountUser">
                <span :class="s.accountLabel">Signed in as</span>
                <span :class="s.accountName">{{ auth.user?.email }}</span>
            </div>

            <button :class="s.signOutBtn" @click="handleSignOut">
                Sign out
            </button>
        </div>

        <div :class="s.lists">
            <ProfileListCard v-for="list in lists" :key="list.to" v-bind="list" />
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
    import userIcon from '@/assets/icons/user.svg?raw'

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
            to: { name: 'watchlist' },
            label: 'Watchlist',
            count: counts.value.watchlist,
            previews: getPreviewMovies('watchlist'),
            icon: watchlistIcon,
            listClass: 'list-watchlist',
        },
        {
            to: { name: 'watched' },
            label: 'Watched',
            count: counts.value.watched,
            previews: getPreviewMovies('watched'),
            icon: watchedIcon,
            listClass: 'list-watched',
        },
        {
            to: { name: 'favorites' },
            label: 'Favorites',
            count: counts.value.favorites,
            previews: getPreviewMovies('favorite'),
            icon: favoritesIcon,
            listClass: 'list-favorite',
        },
        {
            to: { name: 'ignored' },
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
        toast.success('You have been signed out', { icon: userIcon })
        await auth.logout()
        router.push({ name: 'home' })
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
        padding-top: var(--size-6);
    }

    .stats {
        align-items: center;
        display: flex;
        list-style: none;
    }

    .stat {
        display: flex;
        flex: 1;
        flex-direction: column;
    }

    .statValue {
        color: var(--color-list-400);
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold);
    }

    .statLabel {
        color: var(--blue-50);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        text-transform: uppercase;
    }

    /* ── Lists ── */
    .lists {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--size-4);

        @container (min-width: 48rem) {
            grid-template-columns: repeat(2, 1fr);
        }

        @container (min-width: 48rem) {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    /* ── Account ── */
    .account {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-6);
        justify-content: space-between;
    }

    .accountLabel {
        color: var(--blue-400);
        display: block;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
    }

    .accountName {
        color: var(--blue-50);
    }

    .signOutBtn {
        background: var(--red-400);
        border: none;
        border-radius: var(--radius-full);
        color: var(--red-900);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        padding: var(--size-3) var(--size-5);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
    }

    @media (hover: hover) and (pointer: fine) {
        .signOutBtn:hover {
            background: var(--red-500);
            color: var(--red-950);
        }
    }
</style>
