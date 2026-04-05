<template>
    <details :class="s.filterPanel">
        <summary :class="s.header">
            <span :class="[s.label, (count > 0 || active) && s.labelActive]">{{ label }}</span>
            <span v-if="count > 0" class="badge">{{ count }}</span>
            <span :class="s.chevron" v-html="chevronIcon" />
        </summary>

        <div :class="s.filterContent">
            <slot />
        </div>
    </details>

</template>

<script setup>
    import chevronIcon from '@/assets/icons/chevron-down.svg?raw'

    defineProps({
        label: { type: String, required: true },
        count: { type: Number, default: 0 },
        active: { type: Boolean, default: false },
    })
</script>

<style module="s">
    .filterPanel {
        border-bottom: 1px solid var(--color-border);
    }

    .header {
        align-items: center;
        display: flex;
        cursor: pointer;
        gap: var(--size-2);
        padding: var(--size-4) var(--content-padding);
    }

    .label {
        color: var(--color-text-muted);
        flex: 1;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    .chevron {
        align-items: center;
        display: flex;
        justify-content: center;
    }

    .labelActive {
        color: var(--color-heading);
    }

    .filterContent {
        padding: 0 var(--content-padding) var(--size-4) var(--content-padding);
    }
</style>
