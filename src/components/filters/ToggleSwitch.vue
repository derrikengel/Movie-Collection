<template>
    <button :class="[s.toggle, modelValue && s.toggleOn]" role="switch" :aria-checked="String(modelValue)"
        @click="$emit('update:modelValue', !modelValue)" type="button">

        <span :class="s.check" v-if="modelValue" v-html="checkmark" aria-hidden="true" />

        {{ label }}
    </button>
</template>

<script setup>
    import checkmark from '@/assets/icons/checkmark.svg?raw'
    defineProps({
        modelValue: Boolean,
        label: {
            type: String,
            required: true
        }
    })
    defineEmits(['update:modelValue'])
</script>

<style module="s">
    .toggle {
        align-items: center;
        background: var(--color-bg-frosted-unselected);
        border-radius: var(--radius-full);
        color: var(--blue-100);
        display: flex;
        flex: 1 1 0;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        gap: var(--size-2);
        line-height: var(--leading-tight);
        justify-content: center;
        padding: var(--size-3) var(--size-4);
        transition: background-color var(--transition-fast), color var(--transition-fast);

        @media (min-width: 64rem) {
            flex-grow: 0;
            padding: var(--size-2) var(--size-4);
        }
    }

    .check {
        align-items: center;
        display: flex;
        color: var(--blue-400);
        opacity: 0.2;
        font-size: var(--text-base);
        justify-content: center;
        line-height: 0;
    }

    @media (hover: hover) and (pointer: fine) {
        .toggle:hover {
            background: var(--color-bg-frosted-selected);
            color: var(--blue-50);
        }
    }

    .toggleOn {
        background: var(--color-bg-frosted-selected);
        color: var(--blue-50);

        .check {
            color: var(--green-400);
            opacity: 1;
        }
    }
</style>
