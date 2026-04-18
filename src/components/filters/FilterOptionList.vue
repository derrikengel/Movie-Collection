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
        border-radius: var(--radius-lg);
        color: var(--blue-100);
        display: flex;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        justify-content: space-between;
        padding: var(--size-3);
        text-align: left;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    .option+.option {
        margin-top: var(--size-0-5);
    }

    .sublabel {
        color: var(--blue-400);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-semibold);
        transition: color var(--transition-fast);
    }

    @media (hover: hover) and (pointer: fine) {
        .option:hover {
            background: var(--color-bg-frosted-unselected);
            color: var(--blue-50);

            .sublabel {
                color: var(--blue-300);
            }
        }
    }

    .optionActive {
        background: var(--color-bg-frosted-unselected);
        color: var(--blue-50);

        .sublabel {
            color: var(--blue-300);
        }
    }

    .optionDisabled {
        color: var(--blue-400);
        cursor: default;
        opacity: 0.6;
        pointer-events: none;
    }
</style>
