<template>
    <div :class="s.section">
        <button :class="s.header" @click="open = !open" :aria-expanded="open">
            <span :class="[s.label, (count > 0 || active) && s.labelActive]">{{ label }}</span>
            <span v-if="count > 0" class="badge">{{ count }}</span>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"
                :class="[s.chevron, open && s.chevronOpen]" aria-hidden="true">
                <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
                    clip-rule="evenodd" />
            </svg>
        </button>
        <div v-if="open" :class="s.body">
            <slot />
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'

    defineProps({
        label: { type: String, required: true },
        count: { type: Number, default: 0 },
        active: { type: Boolean, default: false },
    })

    const open = ref(false)
</script>

<style module="s">
    .section {
        border-bottom: 1px solid var(--color-border);
    }

    .header {
        display: flex;
        align-items: center;
        width: 100%;
        padding: var(--size-4) var(--content-padding);
        background: none;
        border: none;
        gap: var(--size-2);
        cursor: pointer;
        text-align: left;
    }

    .label {
        flex: 1;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        text-transform: uppercase;
        letter-spacing: var(--tracking-widest);
        color: var(--color-text-muted);
        transition: color var(--transition-fast);
    }

    .labelActive {
        color: var(--color-accent);
    }

    .chevron {
        color: var(--color-text-muted);
        transition: transform var(--transition-fast);
        flex-shrink: 0;
    }

    .chevronOpen {
        transform: rotate(180deg);
    }

    .body {
        padding-bottom: var(--size-2);
    }
</style>
