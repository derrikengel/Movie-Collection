<template>
    <div :class="s.card">
        <div :class="s.cardBackdrop" :style="`--card-backdrop: url('${backdropUrl(request.backdrop_path, 'w780')}')`">
            <div :class="s.cardWrap">
                <div :class="s.cardContent">
                    <div :class="s.poster">
                        <img v-if="request.poster_path" :src="posterUrl(request.poster_path, 'w154')"
                            :alt="request.title" :class="s.posterImg" />
                        <div v-else :class="s.posterPlaceholder" />
                    </div>

                    <div :class="s.meta">
                        <p :class="s.title">{{ request.title }}</p>
                        <p :class="s.year">{{ releaseYear(request.release_date) }}</p>
                        <p v-if="wantSegments.length" :class="s.wantLine">
                            <template v-for="seg in wantSegments" :key="seg.key">
                                <span v-if="seg.type === 'name'" :class="s.nameGroup">
                                    <UserAvatar :avatar="seg.avatar" :class="s.nameAvatar" />
                                    <strong>{{ seg.text }}</strong>
                                </span>
                                <template v-else>{{ seg.text }}</template>
                            </template>
                        </p>
                    </div>
                </div>

                <div :class="s.cardBtns">
                    <button :class="[s.wantBtn, isWanted && s.wantBtnActive]" @click="handleToggleWant"
                        :disabled="toggling" :aria-pressed="isWanted">
                        <span v-html="isWanted ? checkIcon : plusIcon" :class="s.wantIcon" aria-hidden="true" />
                        <span :class="s.wantLabel">{{ isWanted ? 'Requested' : 'Request' }}</span>
                    </button>

                    <RouterLink :to="{ name: 'request', params: { slug: request.slug } }" :class="s.detailsBtn">
                        View Details
                        <span v-html="rightArrowIcon" :class="s.arrowIcon" aria-hidden="true" />
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { useAuthStore } from '@/stores/auth'
    import { useRequestsStore } from '@/stores/requests'
    import { posterUrl, backdropUrl } from '@/lib/tmdb'
    import { releaseYear, slugifyName } from '@/lib/movies'
    import UserAvatar from '@/components/profile/UserAvatar.vue'
    import checkIcon from '@/assets/icons/checkmark.svg?raw'
    import plusIcon from '@/assets/icons/plus-simple.svg?raw'
    import rightArrowIcon from '@/assets/icons/arrow-right.svg?raw'

    const props = defineProps({
        request: {
            type: Object,
            required: true,
        },
    })

    const auth = useAuthStore()
    const requestsStore = useRequestsStore()
    const toggling = ref(false)

    const isWanted = computed(() =>
        props.request.wants.some(w => w.user_id === auth.user?.id)
    )

    const wantSegments = computed(() => {
        const profiles = props.request.wants.map(w => {
            const profile = auth.allProfiles.find(p => p.id === w.user_id)
            if (!profile) return null
            const isMe = w.user_id === auth.user?.id
            return {
                id: w.user_id,
                display_name: isMe ? 'You' : profile.display_name,
                slug: slugifyName(profile.display_name),
                avatar: profile.avatar,
                isMe,
            }
        }).filter(Boolean).sort((a, b) => (b.isMe ? 1 : 0) - (a.isMe ? 1 : 0))

        if (!profiles.length) return []

        const segments = []
        profiles.forEach((p, i) => {
            if (i > 0) {
                const sep = profiles.length === 2 ? ' and '
                    : i < profiles.length - 1 ? ', '
                        : ', and '
                segments.push({ type: 'text', key: `sep-${i}`, text: sep })
            }
            segments.push({ type: 'name', key: p.id, text: p.display_name, slug: p.slug, avatar: p.avatar })
        })
        segments.push({ type: 'text', key: 'verb', text: profiles.length === 1 ? ' requested this' : ' requested this' })
        return segments
    })

    async function handleToggleWant() {
        if (toggling.value) return
        toggling.value = true
        try {
            await requestsStore.toggleWant(props.request.id)
        } finally {
            toggling.value = false
        }
    }
</script>

<style module="s">
    .card {
        container-name: card;
        container-type: inline-size;
    }

    .cardBackdrop {
        background-color: var(--blue-900);
        background-image: var(--card-backdrop);
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        border-top-left-radius: var(--radius-xl);
        border-top-right-radius: var(--radius-xl);
        overflow: hidden;

        @container card (min-width: 24rem) {
            border-top-left-radius: var(--radius-2xl);
            border-top-right-radius: var(--radius-2xl);
        }
    }

    .cardWrap {
        background: linear-gradient(oklch(from var(--blue-950) l c h / 0.65), oklch(from var(--blue-950) l c h / 1));
        /* backdrop-filter: var(--bg-frosted-xs); */
        display: flex;
        flex-direction: column;
        gap: var(--size-4);
        padding: var(--size-4) var(--size-4) var(--size-2) var(--size-4);

        @container card (min-width: 30rem) {
            gap: var(--size-6);
            padding: var(--size-6) var(--size-6) var(--size-4) var(--size-6);
        }
    }

    .cardContent {
        align-items: end;
        border-radius: var(--radius-lg);
        display: flex;
        gap: var(--size-4);
        padding-inline: var(--size-2);

        @container card (min-width: 30rem) {
            gap: var(--size-6);
            padding-inline: var(--size-4);
        }
    }

    .poster {
        aspect-ratio: 2 / 3;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        flex-shrink: 0;
        overflow: hidden;
        width: 6rem;

        /* @container card (min-width: 30rem) {
            width: 8rem;
        } */
    }

    .posterImg {
        display: block;
        height: 100%;
        object-fit: cover;
        width: 100%;
    }

    .posterPlaceholder {
        background: var(--blue-800);
        height: 100%;
        width: 100%;
    }

    .meta {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-1);
        min-width: 0;
    }

    .title {
        color: var(--blue-50);
        font-size: var(--text-base);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tight);
        text-transform: uppercase;
        text-wrap: balance;

        @container card (min-width: 24rem) {
            font-size: var(--text-lg);
        }

        @container card (min-width: 30rem) {
            font-size: var(--text-2xl)
        }
    }

    .year {
        /* color: var(--blue-400); */
        color: var(--blue-300);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;

        @container card (min-width: 30rem) {
            font-size: var(--text-xs);
        }
    }

    .wantLine {
        color: var(--blue-50);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-normal);
        line-height: var(--leading-snug);
        margin-top: var(--size-3);
        text-wrap: pretty;
    }

    .nameGroup {
        align-items: baseline;
        display: inline-flex;
        gap: 0.3125em;

        /* &:not(:first-child) {
            margin-left: 0.125em;
        } */
    }

    .nameAvatar {
        align-self: center;
        font-size: var(--text-base);
    }

    .cardBtns {
        display: grid;
        gap: var(--size-2);
        grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    }

    .detailsBtn,
    .wantBtn {
        align-items: center;
        backdrop-filter: var(--bg-frosted-md);
        background: oklch(from var(--blue-400) l c h / 0.15);
        border-radius: var(--radius-full);
        color: var(--blue-300);
        display: flex;
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-3) var(--size-5);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;

        @media (hover: hover) and (pointer: fine) {

            &:hover,
            .card:hover &:hover {
                background: var(--blue-300);
                color: var(--blue-800);
            }
        }
    }

    .wantBtn {
        background: oklch(from var(--yellow-400) l c h / 0.15);
        color: var(--yellow-300);

        @media (hover: hover) and (pointer: fine) {

            &:hover,
            .card:hover &:hover {
                background: var(--yellow-300);
                color: var(--yellow-800);
            }
        }
    }

    .wantBtnActive {
        background: var(--yellow-300);
        color: var(--yellow-800);

        @media (hover: hover) and (pointer: fine) {

            &:hover,
            .card:hover &:hover {
                background: var(--yellow-400);
                color: var(--yellow-900);
            }
        }
    }

    .wantIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-base);
        justify-content: center;
    }

    .wantLabel {
        flex-shrink: 0;
    }

    .arrowIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-xs);
        justify-content: center;
    }
</style>
