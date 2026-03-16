<template>
    <div :class="s.bar">
        <div :class="s.barBtns">
            <button v-for="action in actions" :key="action.field"
                :class="[s.barBtn, isActive(action.field) && s.barBtnActive, isGuest && s.barBtnGuest]"
                @click="$emit('action', action.field)" :aria-label="action.label" :title="action.label">
                <span :class="s.barBtnIcon" v-html="action.icon" aria-hidden="true" />
                <span :class="s.barBtnLabel">{{ action.label }}</span>
                <span v-if="isActive(action.field)" class="badge" :class="s.barBtnBadge" v-html="checkmarkIcon" />
            </button>

            <button v-if="hasServices" :class="s.barBtnPlay" @click="sheetOpen = true" aria-label="Watch options">
                <span :class="s.playIcon" aria-hidden="true" v-html="playIcon" />
            </button>
        </div>
    </div>

    <MovieServicesSheet v-model="sheetOpen" :movie="movie" />
</template>

<script setup>
    import { ref } from 'vue'
    import playIcon from '@/assets/icons/play.svg?raw'
    import checkmarkIcon from '@/assets/icons/checkmark.svg?raw'
    import MovieServicesSheet from '@/components/MovieServicesSheet.vue'

    defineProps({
        actions: Array,
        isActive: Function,
        hasServices: [Boolean, Number, null],
        isGuest: Boolean,
        movie: Object,
    })

    defineEmits(['action'])

    const sheetOpen = ref(false)
</script>

<style module="s">
    .bar {
        margin-inline: auto;
        margin-top: var(--size-6);
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

        /*
        backdrop-filter: var(--bg-frosted-lg);
        background: var(--color-bg-frosted-subtle);
        margin-top: -10%;
        @media (min-width: 1280px) {
            margin-top: -16%;
        } */
    }

    .barBtn {
        align-items: center;
        color: var(--color-text-muted);
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-1);
        justify-content: center;
        padding: var(--size-3) 0;
        position: relative;
        transition: color var(--transition-fast);

        @media (min-width: 60rem) {
            padding: var(--size-4) 0;
        }
    }

    .barBtn:hover {
        color: var(--color-text-secondary);
    }

    .barBtnActive {
        color: var(--color-text);
    }

    .barBtnGuest {
        opacity: 0.4;
    }

    .barBtnIcon {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
    }

    .barBtnLabel {
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-medium);

        @media (min-width: 60rem) {
            font-size: var(--text-sm);
        }
    }

    .barBtnBadge {
        box-shadow: var(--shadow-md);
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        right: calc(50% - var(--size-5));
        top: var(--size-1);

        svg {
            flex-shrink: 0;
        }
    }

    .barBtn:nth-child(3) {
        order: 4;
    }

    .barBtn:nth-child(4) {
        order: 5;
    }

    .barBtnPlay {
        aspect-ratio: 1 / 1;
        align-items: center;
        align-self: center;
        background: var(--color-primary);
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-xl);
        color: var(--color-text-on-accent);
        display: flex;
        justify-content: center;
        margin: 0 var(--size-1);
        order: 3;
        transition: background var(--transition-fast), color var(--transition-fast), scale var(--transition-fast);
        width: var(--size-16);
        translate: 0 calc(var(--size-2) * -1);
    }

    .barBtnPlay:hover {
        background: var(--color-primary-muted);
        color: var(--color-heading);
    }

    .playIcon {
        display: flex;
        font-size: var(--text-3xl);
        align-items: center;
        justify-content: center;
    }
</style>
