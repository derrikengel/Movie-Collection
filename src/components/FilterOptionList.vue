<!-- src/components/FilterOptionList.vue -->
<template>
    <button v-for="opt in options" :key="opt.value"
        :class="[s.option, activeValues.includes(opt.value) && s.optionActive, opt.disabled && s.optionDisabled]"
        :disabled="opt.disabled" @click="$emit('toggle', opt.value)">
        <span>{{ opt.label }}</span>
        <span v-if="opt.sublabel !== undefined" :class="s.sublabel">{{ opt.sublabel }}</span>
    </button>
</template>

<script setup>
    defineProps({
        options: Array,      // [{ value, label, sublabel?, disabled? }]
        activeValues: Array, // currently selected values
    })
    defineEmits(['toggle'])
</script>

<style module="s">
    .option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--size-2) var(--size-3);
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-md);
        text-align: left;
        transition: background var(--transition-fast), color var(--transition-fast);
    }

    .option:hover {
        background: var(--color-bg-hover);
        color: var(--color-text);
    }

    .optionActive {
        color: var(--color-accent);
        background: var(--color-accent-subtle);
    }

    .optionDisabled {
        opacity: 0.35;
        cursor: default;
        pointer-events: none;
    }

    .sublabel {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        font-weight: var(--font-weight-medium);
    }

    .optionActive .sublabel {
        color: var(--color-accent-muted);
    }
</style>
