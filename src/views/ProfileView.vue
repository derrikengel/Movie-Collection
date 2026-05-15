<template>
    <div :class="s.page">

        <p v-if="notFound" :class="s.notFound">User not found.</p>

        <template v-else-if="resolvedProfile">

            <div v-if="isOwnProfile" :class="s.account">
                <div :class="s.accountUser">
                    <span :class="s.accountLabel">Signed in as</span>
                    <span :class="s.accountName">{{ auth.user?.email }}</span>
                </div>
                <button :class="s.signOutBtn" @click="handleSignOut">
                    Sign out
                </button>
            </div>

            <div v-if="isOwnProfile" :class="s.avatarSelector">
                <!-- <span :class="s.accountLabel">Select Your Avatar</span> -->
                <div ref="avatarGridRef" :class="s.avatarGrid">
                    <button type="button" v-for="key in AVATAR_KEYS" :key="key"
                        :class="[s.avatarOption, resolvedProfile?.avatar === key && s.avatarOptionSelected]"
                        :aria-label="`Select ${key}`" @click="auth.updateAvatar(key)">
                        <UserAvatar :avatar="key" />
                    </button>
                </div>
            </div>

            <section>
                <h2 :class="s.listsHeading">
                    {{ isOwnProfile ? 'Your' : `${resolvedProfile.display_name.split(' ')[0]}'s` }}
                    Lists
                </h2>
                <div :class="s.lists">
                    <ProfileListCard v-for="list in lists" :key="list.to.name" v-bind="list" />
                </div>
            </section>

            <div v-if="otherProfiles.length" :class="s.family">
                <h2 :class="s.familyHeading">Other User Lists</h2>
                <div :class="s.familyLinks">
                    <RouterLink v-for="p in otherProfiles" :key="p.id"
                        :to="{ name: 'profile', params: { name: slugifyName(p.display_name) } }" :class="s.familyLink">
                        <UserAvatar :avatar="p.avatar" :class="s.familyLinkAvatar" />
                        {{ p.id === auth.user?.id ? 'My Lists' : `${p.display_name}'s Lists` }}
                    </RouterLink>
                </div>
            </div>

        </template>

    </div>
</template>

<script setup>
    import { computed, ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import { useToastStore } from '@/stores/toast'
    import { useUserMoviesStore } from '@/stores/userMovies'
    import { useMoviesStore } from '@/stores/movies'
    import { useResolvedUser } from '@/composables/useResolvedUser'
    import { usePageTitle } from '@/composables/usePageTitle'
    import { slugifyName } from '@/lib/movies'
    import ProfileListCard from '@/components/profile/ProfileListCard.vue'
    import UserAvatar from '@/components/profile/UserAvatar.vue'
    import watchedIcon from '@/assets/icons/eye.svg?raw'
    import watchlistIcon from '@/assets/icons/bookmark.svg?raw'
    import favoritesIcon from '@/assets/icons/heart.svg?raw'
    import ignoredIcon from '@/assets/icons/ignore.svg?raw'
    import userIcon from '@/assets/icons/user.svg?raw'

    const route = useRoute()
    const router = useRouter()
    const auth = useAuthStore()
    const toast = useToastStore()
    const userMoviesStore = useUserMoviesStore()
    const moviesStore = useMoviesStore()
    const { resolvedProfile, notFound } = useResolvedUser()

    const AVATAR_KEYS = Array.from({ length: 16 }, (_, i) => `avatar-${String(i + 1).padStart(2, '0')}`)

    const avatarGridRef = ref(null)

    watch(avatarGridRef, (grid) => {
        if (!grid) return
        const selectedIndex = AVATAR_KEYS.indexOf(resolvedProfile.value?.avatar ?? 'avatar-01')
        const btn = grid.querySelectorAll('button')[selectedIndex]
        btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' })
    }, { flush: 'post' })

    const isOwnProfile = computed(() => resolvedProfile.value?.id === auth.user?.id)

    const otherProfiles = computed(() => {
        const others = auth.allProfiles.filter(p => p.id !== resolvedProfile.value?.id)
        const me = others.find(p => p.id === auth.user?.id)
        const rest = others.filter(p => p.id !== auth.user?.id)
        return me ? [...rest, me] : rest
    })

    usePageTitle(computed(() => {
        if (!resolvedProfile.value) return 'Profile | Movie Collection'
        return `${resolvedProfile.value.display_name} | Movie Collection`
    }))

    const counts = computed(() => {
        const userId = resolvedProfile.value?.id
        if (!userId) return { watched: 0, watchlist: 0, favorites: 0, ignored: 0 }
        const entries = userMoviesStore.allUserMovies.filter(m => m.user_id === userId)
        return {
            watched: entries.filter(m => m.watched).length,
            watchlist: entries.filter(m => m.watchlist).length,
            favorites: entries.filter(m => m.favorite).length,
            ignored: entries.filter(m => m.ignored).length,
        }
    })

    function getPreviewMovies(field) {
        const userId = resolvedProfile.value?.id
        if (!userId) return []
        return userMoviesStore.allUserMovies
            .filter(m => m.user_id === userId && m[field])
            .slice(0, 5)
            .map(m => moviesStore.movies.find(mv => mv.id === m.movie_id))
            .filter(m => m?.poster_path)
    }

    const lists = computed(() => [
        {
            to: { name: 'watchlist', params: { name: route.params.name } },
            label: 'Watchlist',
            count: counts.value.watchlist,
            previews: getPreviewMovies('watchlist'),
            icon: watchlistIcon,
            listClass: 'list-watchlist',
        },
        {
            to: { name: 'watched', params: { name: route.params.name } },
            label: 'Watched',
            count: counts.value.watched,
            previews: getPreviewMovies('watched'),
            icon: watchedIcon,
            listClass: 'list-watched',
        },
        {
            to: { name: 'favorites', params: { name: route.params.name } },
            label: 'Favorites',
            count: counts.value.favorites,
            previews: getPreviewMovies('favorite'),
            icon: favoritesIcon,
            listClass: 'list-favorite',
        },
        {
            to: { name: 'ignored', params: { name: route.params.name } },
            label: 'Ignored',
            count: counts.value.ignored,
            previews: getPreviewMovies('ignored'),
            icon: ignoredIcon,
            listClass: 'list-ignored',
        },
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

    /* ── Not Found ── */
    .notFound {
        color: var(--blue-400);
        font-weight: var(--font-weight-medium);
        padding: var(--size-12) 0;
        text-align: center;
    }

    /* ── Lists ── */
    .listsHeading {
        color: var(--blue-500);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        margin-bottom: var(--size-2);
        text-transform: uppercase;
    }

    .lists {
        display: grid;
        gap: var(--size-4);
        grid-template-columns: 1fr;

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
        color: var(--blue-500);
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
        cursor: pointer;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
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

    /* ── Avatar Selector ── */
    .avatarSelector {
        margin-inline: calc(var(--content-padding) * -1);

        @media (min-width: 64rem) {
            margin-inline: 0;
        }
    }

    .avatarGrid {
        display: flex;
        gap: var(--size-1);
        overflow-x: auto;
        padding-block: var(--size-1);
        padding-inline: var(--content-padding);
        scroll-padding-inline: var(--content-padding);
        scrollbar-width: thin;
        scrollbar-color: var(--blue-800) transparent;
        scroll-snap-type: x proximity;

        @media (min-width: 64rem) {
            display: grid;
            gap: var(--size-1);
            grid-template-columns: repeat(auto-fill, minmax(var(--size-20), 1fr));
            overflow-x: visible;
            padding: 0;
        }
    }

    .avatarOption {
        align-items: center;
        background: none;
        background-clip: padding-box;
        border: 0.125rem solid transparent;
        border-radius: var(--radius-full);
        cursor: pointer;
        display: flex;
        flex: 0 0 auto;
        font-size: var(--text-7xl);
        justify-content: center;
        scroll-snap-align: start;
        transition: box-shadow var(--transition-fast);

        @media (min-width: 64rem) {
            border-width: 0.25rem;

            img {
                aspect-ratio: 1;
                height: auto;
                width: 100%;
            }
        }
    }

    .avatarOptionSelected {
        box-shadow: 0 0 0 0.125rem var(--yellow-300);
    }

    /* ── Family ── */
    .family {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .familyHeading {
        color: var(--blue-500);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
    }

    .familyLinks {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-2);
    }

    .familyLink {
        align-items: center;
        background: var(--blue-900);
        border-radius: var(--radius-xl);
        color: var(--blue-50);
        display: flex;
        flex: 1;
        flex-direction: column;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-3);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-6);
        text-align: center;
        text-decoration: none;
        text-transform: uppercase;
        transition: background var(--transition-fast), border-color var(--transition-fast);

        @container (min-width: 32rem) {
            font-size: var(--text-sm);
        }

        @container (min-width: 48rem) {
            border-radius: var(--radius-2xl);
            font-size: var(--text-base);
            padding: var(--size-8);
        }

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                background: var(--blue-800);
            }
        }
    }


    .familyLinkAvatar {
        font-size: var(--text-4xl);

        @container (min-width: 32rem) {
            font-size: var(--text-5xl);
        }
    }
</style>
