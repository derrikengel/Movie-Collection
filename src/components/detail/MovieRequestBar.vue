<template>
    <div :class="s.bar">
        <button :class="[s.wantBtn, isWanted && s.wantBtnActive]" @click="handleToggleWant" :aria-pressed="isWanted">
            <span v-html="isWanted ? checkIcon : plusIcon" :class="s.wantIcon" />
            <span :class="s.wantLabel">{{ isWanted ? 'Requested' : 'Request' }}</span>
        </button>

        <p v-if="wantSegments.length" :class="s.communityRow">
            <template v-for="seg in wantSegments" :key="seg.key">
                <span v-if="seg.type === 'name'" :class="s.nameGroup">
                    <UserAvatar :avatar="seg.avatar" :class="s.nameAvatar" />
                    <RouterLink :to="{ name: 'profile', params: { name: seg.slug } }" :class="s.name">
                        {{ seg.text }}
                    </RouterLink>
                </span>
                <template v-else>{{ seg.text }}</template>
            </template>
        </p>

        <div v-if="auth.isAdmin" :class="s.adminActions">
            <RouterLink :to="{ name: 'add-movie', query: { requestId: request.id } }" :class="s.addBtn">
                <span v-html="plusIcon" :class="s.addIcon" />
                Add to Collection
            </RouterLink>
            <button :class="s.removeBtn" @click="handleRemove">
                <span v-html="trashIcon" :class="s.removeIcon" />
                Delete Request
            </button>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import { useRequestsStore } from '@/stores/requests'
    import { slugifyName } from '@/lib/movies'
    import UserAvatar from '@/components/profile/UserAvatar.vue'
    import checkIcon from '@/assets/icons/checkmark.svg?raw'
    import plusIcon from '@/assets/icons/plus-simple.svg?raw'
    import trashIcon from '@/assets/icons/trash.svg?raw'

    const props = defineProps({
        request: {
            type: Object,
            required: true,
        },
    })

    const auth = useAuthStore()
    const requestsStore = useRequestsStore()
    const router = useRouter()

    const isWanted = computed(() =>
        props.request.wants.some(w => w.user_id === auth.user?.id)
    )

    function buildSegments(profiles) {
        const n = profiles.length
        const segments = []
        profiles.forEach((p, i) => {
            if (i > 0) {
                const sep = n === 2 ? ' and ' : i < n - 1 ? ', ' : ', and '
                segments.push({ type: 'text', key: `sep-${i}`, text: sep })
            }
            segments.push({
                type: 'name',
                key: p.id,
                text: p.display_name,
                slug: slugifyName(p.display_name),
                avatar: p.avatar,
            })
        })
        const singleThirdPerson = n === 1 && !profiles[0].isMe
        segments.push({ type: 'text', key: 'verb', text: ' requested this' })
        return segments
    }

    const wantSegments = computed(() => {
        if (!props.request.wants.length) return []

        const profiles = props.request.wants
            .map(w => {
                if (w.user_id === auth.user?.id) {
                    return {
                        id: auth.user.id,
                        display_name: 'You',
                        avatar: auth.profile?.avatar ?? null,
                        isMe: true,
                    }
                }
                const p = auth.allProfiles.find(p => p.id === w.user_id)
                return p ? { id: p.id, display_name: p.display_name, avatar: p.avatar, isMe: false } : null
            })
            .filter(Boolean)
            .sort((a, b) => (b.isMe ? 1 : 0) - (a.isMe ? 1 : 0))

        if (!profiles.length) return []
        return buildSegments(profiles)
    })

    async function handleToggleWant() {
        await requestsStore.toggleWant(props.request.id)
        // If we just removed the last want, the request is gone — navigate back
        if (!requestsStore.requests.find(r => r.id === props.request.id)) {
            router.push({ name: 'requests' })
        }
    }

    async function handleRemove() {
        await requestsStore.removeRequest(props.request.id)
        router.push({ name: 'requests' })
    }
</script>

<style module="s">
    .bar {
        display: flex;
        flex-direction: column;
        gap: var(--size-4);
    }

    .wantBtn {
        align-items: center;
        background: var(--blue-50);
        border-radius: var(--radius-full);
        color: var(--blue-800);
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-4) var(--size-6);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    .wantBtnActive {
        background: var(--yellow-300);
        color: var(--yellow-800);
    }

    @media (hover: hover) and (pointer: fine) {
        .wantBtn:hover {
            background: oklch(from var(--blue-300) calc(l - 0.05) c h);
        }

        .wantBtnActive:hover {
            background: var(--yellow-400);
            color: var(--yellow-900);
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

    .communityRow {
        color: var(--blue-50);
        /* font-size: var(--text-sm); */
        font-weight: var(--font-weight-normal);
        line-height: var(--leading-snug);
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
        font-size: var(--text-xl);
    }

    .name {
        font-weight: var(--font-weight-bold);
        transition: color var(--transition-fast);

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                color: var(--blue-50);
                text-decoration-line: underline;
                text-decoration-thickness: 0.0625em;
                text-underline-offset: 0.25em;
            }
        }
    }

    .adminActions {
        border-top: 1px solid var(--blue-800);
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
        margin-top: var(--size-2);
        padding-top: var(--size-6);
    }

    .addBtn {
        align-items: center;
        background: var(--green-300);
        border-radius: var(--radius-full);
        color: var(--green-800);
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-4) var(--size-6);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    @media (hover: hover) and (pointer: fine) {
        .addBtn:hover {
            background: var(--green-400);
            color: var(--green-900);
        }
    }

    .addIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-base);
        justify-content: center;
    }

    .removeBtn {
        align-items: center;
        color: var(--red-400);
        display: flex;
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        padding: var(--size-2) 0;
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    @media (hover: hover) and (pointer: fine) {
        .removeBtn:hover {
            color: var(--red-500);
        }
    }

    .removeIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-sm);
        justify-content: center;
    }
</style>
