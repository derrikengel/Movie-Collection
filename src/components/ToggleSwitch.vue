<!-- src/components/ToggleSwitch.vue -->
<template>
    <button :class="[s.toggle, modelValue && s.toggleOn]" role="switch" :aria-checked="String(modelValue)"
        @click="$emit('update:modelValue', !modelValue)" type="button">
        <span :class="s.thumb" v-html="modelValue ? checkmark : ''" aria-hidden="true" />
    </button>
</template>

<script setup>
    import checkmark from '@/assets/icons/checkmark.svg?raw'
    defineProps({ modelValue: Boolean })
    defineEmits(['update:modelValue'])
</script>

<style module="s">
    .toggle {
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        cursor: pointer;
        flex-shrink: 0;
        height: var(--size-6);
        position: relative;
        transition: background var(--transition-fast);
        width: var(--size-11);
    }

    .toggleOn {
        background: var(--color-primary);
    }

    .thumb {
        align-items: center;
        background: var(--color-accent-muted);
        border-radius: var(--radius-full);
        color: var(--color-accent);
        display: flex;
        font-size: var(--text-xs);
        height: var(--size-5);
        justify-content: center;
        left: var(--size-1);
        position: absolute;
        top: var(--size-0-5);
        transition: transform var(--transition-fast), background var(--transition-fast);
        width: var(--size-5);
    }

    .toggleOn .thumb {
        color: var(--color-accent);
        background: var(--color-bg);
        transform: translateX(var(--size-4));
    }
</style>
