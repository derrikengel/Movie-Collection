<template>
    <div :class="s.bar">
        <div :class="s.barBtns">
            <button v-for="action in actions" :key="action.field"
                :class="[s.barBtn, isActive(action.field) && s.barBtnActive, isGuest && s.barBtnGuest, action.listClass]"
                @click="handleAction(action.field)" :aria-label="action.label" :title="action.label">
                <span :class="s.barBtnIcon" v-html="action.icon" aria-hidden="true" />
                <span :class="s.barBtnLabel">{{ action.label }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useAuthStore } from '@/stores/auth'
    import { useMovieActions } from '@/composables/useMovieActions'

    const props = defineProps({
        movie: Object,
    })

    const auth = useAuthStore()
    const isGuest = computed(() => !auth.user)
    const movieRef = computed(() => props.movie)
    const { actions, isActive, handleAction } = useMovieActions(movieRef)
</script>

<style module="s">
    .bar {
        margin-inline: auto;
        margin-top: var(--size-12);
        max-width: var(--content-width);
        padding-inline: var(--content-padding);
        position: relative;
    }

    .barBtns {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        display: flex;
        justify-content: space-around;
    }

    .barBtn {
        align-items: center;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-1);
        justify-content: center;
        padding: var(--size-3) 0;
        position: relative;

        @media (min-width: 64rem) {
            padding: var(--size-4) 0;
        }
    }

    .barBtnGuest {
        opacity: 0.4;
    }

    .barBtnIcon {
        align-items: center;
        color: var(--color-list-300);
        display: flex;
        font-size: var(--text-3xl);
        justify-content: center;
        opacity: 0.4;
        transition: color var(--transition-fast), opacity var(--transition-fast);

        :global(.solid) {
            display: none;
            transition: fill var(--transition-fast);
        }

        :global(.outline) {
            display: block;
        }
    }

    .barBtnLabel {
        color: var(--color-text-muted);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    .barBtn:hover {
        .barBtnIcon {
            color: var(--color-list-400);
            opacity: 1;
        }

        .barBtnLabel {
            color: var(--color-text);
        }
    }

    .barBtnActive {
        .barBtnIcon {
            color: var(--color-list-400);
            opacity: 1;

            :global(.solid) {
                display: block;
            }

            :global(.outline) {
                display: none;
            }
        }

        .barBtnLabel {
            color: var(--color-list-200);
        }
    }
</style>
