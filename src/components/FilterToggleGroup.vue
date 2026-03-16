<!-- src/components/FilterToggleGroup.vue -->
<template>
    <div :class="s.group">
        <button v-for="opt in options" :key="opt.value" :class="[s.btn, modelValue === opt.value && s.btnActive]"
            @click="$emit('update:modelValue', opt.value)">
            {{ opt.label }}
        </button>
    </div>
</template>

<script setup>
    defineProps({
        options: Array,      // [{ value, label }]
        modelValue: String,  // currently active value
    })
    defineEmits(['update:modelValue'])
</script>

<style module="s">
    .group {
        display: flex;
        gap: 2px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        padding: 2px;
    }

    .btn {
        padding: var(--size-1) var(--size-3);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        border-radius: var(--radius-full);
        border: none;
        background: none;
        color: var(--color-text-muted);
        transition: background var(--transition-fast), color var(--transition-fast);
    }

    .btnActive {
        background: var(--color-accent);
        color: var(--color-text-on-accent);
    }
</style>
