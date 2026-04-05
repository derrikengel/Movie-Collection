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
        align-items: center;
        background: none;
        border: none;
        border-radius: var(--radius-md);
        color: var(--blue-300);
        display: flex;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        justify-content: space-between;
        padding: var(--size-2) var(--size-3);
        text-align: left;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    .sublabel {
        font-size: var(--text-2xs);
        color: var(--blue-500);
        font-weight: var(--font-weight-semibold);
    }

    .option:hover {
        background: var(--blue-700);
        color: var(--blue-50);

        .sublabel {
            color: var(--blue-400);
        }
    }

    .optionActive {
        background: var(--blue-700);
        color: var(--blue-50);

        .sublabel {
            color: var(--blue-400);
        }
    }

    .optionDisabled {
        opacity: 0.35;
        cursor: default;
        pointer-events: none;
    }
</style>
