<template>
    <button :class="[s.toggle, modelValue && s.toggleOn, variant === 'wide' && s.toggleWide]" role="switch"
        :aria-checked="String(modelValue)" @click="$emit('update:modelValue', !modelValue)" type="button">

        <span :class="[s.label, variant === 'wide' && s.labelWide]">{{ label }}</span>

        <div :class="s.switch">
            <span :class="s.thumb" v-html="modelValue ? checkmark : ''" aria-hidden="true" />
        </div>

    </button>
</template>

<script setup>
    import checkmark from '@/assets/icons/checkmark.svg?raw'
    defineProps({
        modelValue: Boolean,
        label: {
            type: String,
            required: true
        },
        variant: {
            type: String,
            default: 'narrow'
        }
    })
    defineEmits(['update:modelValue'])
</script>

<style module="s">
    .toggle {
        align-items: center;
        display: flex;
        gap: var(--size-3);
        justify-content: space-between;
    }

    .label {
        color: var(--color-text-muted);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    .switch {
        background: var(--blue-950);
        border-radius: var(--radius-full);
        box-shadow: 0 0 0 3px var(--blue-950), 0 0 0 4px var(--blue-700);
        cursor: pointer;
        display: flex;
        flex-shrink: 0;
        height: var(--size-4);
        position: relative;
        transition: background var(--transition-fast), box-shadow var(--transition-fast);
        width: calc(var(--size-4) * 2);
    }

    .thumb {
        align-items: center;
        background: var(--blue-500);
        border-radius: var(--radius-full);
        /* box-shadow: var(--shadow-xs); */
        color: var(--color-accent);
        display: flex;
        flex: 0 0 50%;
        font-size: var(--text-xs);
        justify-content: center;
        transition: transform var(--transition-fast), background var(--transition-fast);
    }

    .toggleWide {
        padding: 0 var(--size-3);
    }

    .labelWide {
        color: var(--color-text-secondary);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        letter-spacing: normal;
        text-transform: none;
    }

    .toggleOn {
        .label {
            color: var(--color-heading);
        }

        .switch {
            background: var(--green-500);
            box-shadow: 0 0 0 3px var(--green-500);
        }

        .thumb {
            color: var(--green-600);
            background: var(--green-50);
            transform: translateX(var(--size-4));
        }
    }
</style>
