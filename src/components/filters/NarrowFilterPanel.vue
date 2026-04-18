<template>
    <details :class="s.filterPanel">
        <summary :class="s.header">
            <span :class="[s.label, (count > 0 || active) && s.labelActive]">
                <slot name="label">{{ label }}</slot>
            </span>
            <span v-if="count > 0" class="badge" :class="s.filterBadge">{{ count }}</span>
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
        label: { type: String, default: '' },
        count: { type: Number, default: 0 },
        active: { type: Boolean, default: false },
    })
</script>

<style module="s">
    .filterPanel {
        background: var(--color-bg-frosted-unselected);
        border-radius: var(--radius-lg);
        flex-shrink: 0;
        overflow: hidden;
        transition: background-color var(--transition-fast);
    }

    .filterPanel::details-content {
        height: 0;
        overflow: clip;
        transition: height 0.3s ease, content-visibility 0.3s ease allow-discrete;
    }

    @supports (interpolate-size: allow-keywords) {
        .filterPanel {
            interpolate-size: allow-keywords;
        }

        .filterPanel[open]::details-content {
            height: auto;
        }
    }

    .header {
        align-items: center;
        color: var(--blue-100);
        cursor: pointer;
        display: flex;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        gap: var(--size-2);
        list-style: none;
        padding: var(--size-4);
    }

    .header::-webkit-details-marker {
        display: none;
    }

    .label {
        align-items: center;
        display: flex;
        gap: var(--size-1);
        transition: color var(--transition-fast);
    }

    .filterBadge {
        background: var(--green-300);
        color: var(--green-800);
    }

    .chevron {
        align-items: center;
        display: flex;
        justify-content: center;
        margin-left: auto;
        transition: transform var(--transition-fast);
    }

    .filterPanel[open] {
        background: var(--color-bg-frosted-selected);

        .header {
            color: var(--blue-50);
        }

        .chevron {
            transform: rotate(180deg);
        }
    }

    .filterContent {
        padding: 0 var(--size-4) var(--size-4) var(--size-4);
    }
</style>
