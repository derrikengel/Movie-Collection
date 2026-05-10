<template>
    <ul :class="s.actions">
        <li v-for="action in actions" :key="action.field" :class="s.actionItem">
            <button
                :class="[s.actionBtn, isActive(action.field) && s.actionBtnActive, isGuest && s.actionBtnGuest, action.listClass]"
                @click="handleAction(action.field)">

                <span :class="s.actionBtnIcon" v-html="action.icon" aria-hidden="true" />

                <span :class="s.actionBtnLabel">{{ action.label }}</span>

            </button>
        </li>
    </ul>
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
    .actions {
        display: grid;
        gap: var(--size-1);
        grid-template-columns: repeat(2, 1fr);
        list-style: none;

        @container wide-col1 (min-width: 20rem) {
            grid-template-columns: repeat(4, 1fr);
        }

        @container wide-col1 (min-width: 32rem) {
            gap: var(--size-2);
        }

        @media (min-width: 48rem) {
            gap: var(--size-2);
            order: 1;
        }
    }

    @property --grad-start {
        inherits: false;
        initial-value: transparent;
        syntax: '<color>';
    }

    @property --grad-end {
        inherits: false;
        initial-value: transparent;
        syntax: '<color>';
    }

    .actionItem {
        container-name: action-item;
        container-type: inline-size;
    }

    .actionBtn {
        --grad-start: oklch(from var(--color-list-400) l c h / 0.1);
        --grad-end: var(--grad-start);
        align-items: center;
        background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
        border-radius: var(--radius-lg);
        color: var(--color-list-400);
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
        justify-content: center;
        padding: var(--size-2);
        position: relative;
        transition: color var(--transition-fast), --grad-start var(--transition-fast), --grad-end var(--transition-fast);
        width: 100%;

        @container action-item (min-width: 7rem) {
            border-radius: var(--radius-xl);
            padding: var(--size-4) 0;
        }

        @media (min-width: 48rem) {
            @container action-item (min-width: 7rem) {
                gap: var(--size-3);
            }
        }
    }

    .actionBtnIcon {
        align-items: center;
        border: 2px solid currentColor;
        border-radius: var(--radius-full);
        display: flex;
        font-size: var(--text-base);
        height: var(--size-8);
        justify-content: center;
        transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
        width: var(--size-8);

        @media (min-width: 48rem) {
            @container action-item (min-width: 7rem) {
                font-size: var(--text-xl);
                height: var(--size-10);
                width: var(--size-10);
            }
        }
    }

    .actionBtnLabel {
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        text-transform: uppercase;
        transition: color var(--transition-fast);

        @media (min-width: 48rem) {
            @container action-item (min-width: 7rem) {
                font-size: var(--text-xs);
            }
        }
    }

    @media (hover: hover) and (pointer: fine) {
        .actionBtn:hover {
            --grad-start: oklch(from var(--color-list-400) l c h / 0.25);
            /* --grad-end: var(--grad-start); */
        }
    }

    .actionBtnActive {
        --grad-start: var(--color-list-400);
        --grad-end: var(--color-list-500);
        color: var(--color-list-900);

        .actionBtnIcon {
            background: var(--color-list-900);
            border-color: var(--color-list-900);
            color: var(--color-list-400);
        }
    }

    @media (hover: hover) and (pointer: fine) {
        .actionBtnActive:hover {
            --grad-start: var(--color-list-400);
            --grad-end: var(--color-list-400);
        }
    }
</style>
