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
        position: relative;
        width: 40px;
        height: 24px;
        border-radius: var(--radius-full);
        border: none;
        background: oklch(35% 0.01 265);
        cursor: pointer;
        flex-shrink: 0;
        transition: background var(--transition-fast);
    }

    .toggleOn {
        background: var(--color-accent);
    }

    .thumb {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: var(--radius-full);
        background: oklch(70% 0.01 265);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-accent);
        transition: transform var(--transition-fast), background var(--transition-fast);
    }

    .toggleOn .thumb {
        transform: translateX(16px);
        background: var(--color-text-on-accent);
        color: var(--color-accent);
        font-size: var(--text-xs);
    }
</style>
