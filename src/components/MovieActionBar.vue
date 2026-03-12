<!-- src/components/MovieActionBar.vue -->
<template>
    <div :class="s.bottomBar">
        <button v-for="action in actions" :key="action.field"
            :class="[s.barBtn, isActive(action.field) && s.barBtnActive, isGuest && s.barBtnGuest]"
            @click="$emit('action', action.field)" :aria-label="action.label" :title="action.label">
            <span :class="s.barBtnIcon" v-html="action.icon" aria-hidden="true" />
            <span :class="s.barBtnLabel">{{ action.label }}</span>
        </button>

        <!-- Center play button -->
        <button v-if="hasServices" :class="[s.barBtn, s.barBtnPlay]" @click="$emit('open-sheet')"
            aria-label="Watch options">
            <span :class="s.playIcon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.5 4.5l9 5.5-9 5.5V4.5z" />
                </svg>
            </span>
        </button>
    </div>
</template>

<script setup>
    defineProps({
        actions: Array,
        isActive: Function,
        hasServices: [Boolean, Number, null],
        isGuest: Boolean,
    })
    defineEmits(['action', 'open-sheet'])
</script>

<style module="s">
    .bottomBar {
        --tab-bar-height: var(--space-15);
        --footer-height: calc(var(--tab-bar-height) + var(--space-6));
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-md);
        border: 1px solid var(--color-border-frosted);
        border-bottom: none;
        border-top-left-radius: var(--radius-xl);
        border-top-right-radius: var(--radius-xl);
        bottom: 0;
        box-shadow: var(--shadow-lg);
        display: flex;
        height: var(--tab-bar-height);
        left: 0;
        padding-bottom: env(safe-area-inset-bottom);
        position: fixed;
        right: 0;
        z-index: 90;
    }

    .barBtn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-2);
        background: none;
        border: none;
        color: var(--color-text-muted);
        font-size: var(--text-2xs, 10px);
        font-weight: var(--font-weight-medium);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        transition: color var(--transition-fast);
        min-width: 56px;
    }

    .barBtn:hover {
        color: var(--color-text-secondary);
    }

    .barBtnActive {
        color: var(--color-accent);
    }

    .barBtnGuest {
        opacity: 0.4;
    }

    .barBtnIcon {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .barBtnLabel {
        font-size: 10px;
    }

    .barBtnPlay {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-full);
        background: var(--color-accent);
        color: var(--color-text-on-accent);
        min-width: unset;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px var(--color-accent-glow);
        transition: background var(--transition-fast), transform var(--transition-fast);
    }

    .barBtnPlay:hover {
        background: var(--color-accent-bright);
        transform: scale(1.05);
    }

    .playIcon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-left: 2px;
        /* optical centering for play triangle */
    }
</style>
