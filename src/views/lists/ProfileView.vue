<template>
    <div :class="s.page">

        <!-- User header -->
        <div :class="s.userHeader">
            <div :class="s.avatar">
                {{ initials }}
            </div>
            <div :class="s.userInfo">
                <h1 :class="s.displayName">{{ auth.displayName }}</h1>
                <div :class="s.stats">
                    <span :class="s.stat">
                        <span :class="s.statValue">{{ counts.watched }}</span>
                        <span :class="s.statLabel">Watched</span>
                    </span>
                    <span :class="s.statDivider" />
                    <span :class="s.stat">
                        <span :class="s.statValue">{{ counts.watchlist }}</span>
                        <span :class="s.statLabel">Watchlist</span>
                    </span>
                    <span :class="s.statDivider" />
                    <span :class="s.stat">
                        <span :class="s.statValue">{{ counts.favorites }}</span>
                        <span :class="s.statLabel">Favorites</span>
                    </span>
                    <span :class="s.statDivider" />
                    <span :class="s.stat">
                        <span :class="s.statValue">{{ counts.ignored }}</span>
                        <span :class="s.statLabel">Ignored</span>
                    </span>
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
    import { useUserMoviesStore } from '@/stores/userMovies'
    import { useMoviesStore } from '@/stores/movies'
    import ProfileListCard from '@/components/ProfileListCard.vue'
    const auth = useAuthStore()
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
            icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a2 2 0 0 0-2 2v14l7-3 7 3V4a2 2 0 0 0-2-2H5z"/></svg>`,
        },
        {
            to: '/profile/watched',
            label: 'Watched',
            count: counts.value.watched,
            previews: getPreviewMovies('watched'),
            icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5.5 3 1.73 5.61 0 9.5 1.73 13.39 5.5 16 10 16s8.27-2.61 10-6.5C18.27 5.61 14.5 3 10 3zm0 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>`,
        },
        {
            to: '/profile/favorites',
            label: 'Favorites',
            count: counts.value.favorites,
            previews: getPreviewMovies('favorite'),
            icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 0 0-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.957z"/></svg>`,
        },
        {
            to: '/profile/ignored',
            label: 'Ignored',
            count: counts.value.ignored,
            previews: getPreviewMovies('ignored'),
            icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/></svg>`,
        },
    ])

    async function handleSignOut() {
        await auth.logout()
        router.push('/')
    }
</script>

<style module="s">
    .page {
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: var(--space-8);
        margin: 0 auto;
        max-width: var(--content-max-width);
    }

    /* ── User header ── */
    .userHeader {
        display: flex;
        align-items: center;
        gap: var(--space-4);
    }

    .avatar {
        width: 56px;
        height: 56px;
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
    }

    .userInfo {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .displayName {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
    }

    .stats {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        flex-wrap: wrap;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    .statValue {
        font-size: var(--text-base);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
        line-height: 1;
    }

    .statLabel {
        font-size: 10px;
        font-weight: var(--font-weight-medium);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
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
        gap: var(--space-3);
    }

    @container (min-width: 500px) {
        .lists {
            grid-template-columns: 1fr 1fr;
        }
    }

    /* ── Account ── */
    .section {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .sectionTitle {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
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
        padding: var(--space-4);
        gap: var(--space-4);
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
        padding: var(--space-4);
        text-align: left;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-error);
        background: none;
        border: none;
        cursor: pointer;
        transition: background var(--transition-fast);
    }

    .signOutBtn:hover {
        background: oklch(70% 0.191 23 / 0.06);
    }
</style>
