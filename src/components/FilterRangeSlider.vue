<!-- src/components/FilterRangeSlider.vue -->
<template>
    <div :class="s.rangeControls">
        <div :class="s.dualSlider">
            <div :class="s.dualSliderBase" />
            <div :class="s.dualSliderFill" :style="trackStyle" />
            <input type="range" :min="min" :max="max" :value="modelValueMin ?? min" @input="onMinInput"
                :class="s.dualSliderInput" :style="{ zIndex: minZIndex }" :aria-label="ariaLabelMin" />
            <input type="range" :min="min" :max="max" :value="modelValueMax ?? max" @input="onMaxInput"
                :class="s.dualSliderInput" style="z-index: 3" :aria-label="ariaLabelMax" />
        </div>
        <div :class="s.rangeInputRow">
            <label :class="s.rangeField">
                <span :class="s.rangeLabel">{{ labelMin }}</span>
                <input type="number" :value="modelValueMin ?? min" :min="min"
                    :max="Number.isFinite(modelValueMax) ? modelValueMax : max" :class="s.rangeInput"
                    :aria-label="ariaLabelMin"
                    @input="e => emit('update:modelValueMin', e.target.value === '' || Number(e.target.value) === min ? null : Number(e.target.value))" />
            </label>
            <label :class="s.rangeField">
                <span :class="s.rangeLabel">{{ labelMax }}</span>
                <input type="number" :value="modelValueMax ?? max"
                    :min="Number.isFinite(modelValueMin) ? modelValueMin : min" :max="max" :class="s.rangeInput"
                    :aria-label="ariaLabelMax"
                    @input="e => emit('update:modelValueMax', e.target.value === '' || Number(e.target.value) === max ? null : Number(e.target.value))" />
            </label>
        </div>
    </div>
</template>

<script setup>
    import { useDualSlider } from '@/composables/useDualSlider'

    const props = defineProps({
        min: Number,
        max: Number,
        modelValueMin: { type: Number, default: null },
        modelValueMax: { type: Number, default: null },
        ariaLabelMin: String,
        ariaLabelMax: String,
        labelMin: { type: String, default: 'Min' },
        labelMax: { type: String, default: 'Max' },
    })

    const emit = defineEmits(['update:modelValueMin', 'update:modelValueMax'])

    const { trackStyle, minZIndex, onMinInput, onMaxInput } = useDualSlider(
        () => props.modelValueMin,
        v => emit('update:modelValueMin', v),
        () => props.modelValueMax,
        v => emit('update:modelValueMax', v),
        () => ({ min: props.min, max: props.max }),
    )
</script>

<style module="s">
    .rangeControls {
        padding: var(--size-3);
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
    }

    /* Dual-handle range slider */
    .dualSlider {
        position: relative;
        height: 28px;
        display: flex;
        align-items: center;
    }

    .dualSliderBase {
        position: absolute;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--color-border-strong);
        border-radius: var(--radius-full);
        pointer-events: none;
    }

    .dualSliderFill {
        position: absolute;
        height: 4px;
        background: var(--color-accent);
        border-radius: var(--radius-full);
        pointer-events: none;
    }

    .dualSliderInput {
        position: absolute;
        width: 100%;
        pointer-events: none;
        background: transparent;
        appearance: none;
        height: 4px;
        margin: 0;
        padding: 0;
    }

    .dualSliderInput::-webkit-slider-runnable-track {
        background: transparent;
        height: 4px;
    }

    .dualSliderInput::-moz-range-track {
        background: transparent;
        height: 4px;
    }

    .dualSliderInput::-webkit-slider-thumb {
        appearance: none;
        pointer-events: all;
        width: 24px;
        height: 24px;
        border-radius: var(--radius-full);
        background: var(--color-accent);
        cursor: pointer;
        border: 2px solid var(--color-surface-raised);
        box-shadow: var(--shadow-md);
        margin-top: -10px;
    }

    .dualSliderInput::-moz-range-thumb {
        pointer-events: all;
        width: 24px;
        height: 24px;
        border-radius: var(--radius-full);
        background: var(--color-accent);
        cursor: pointer;
        border: 2px solid var(--color-surface-raised);
        box-shadow: var(--shadow-md);
    }

    /* Number inputs below slider */
    .rangeInputRow {
        display: flex;
        justify-content: space-between;
    }

    .rangeField {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
    }

    .rangeLabel {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
    }

    .rangeInput {
        width: 80px;
        padding: var(--size-2) var(--size-3);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text);
        font-size: var(--text-sm);
        outline: none;
        appearance: textfield;
        transition: border-color var(--transition-fast);
    }

    .rangeInput:focus {
        border-color: var(--color-border-strong);
    }

    .rangeInput::-webkit-outer-spin-button,
    .rangeInput::-webkit-inner-spin-button {
        appearance: none;
        margin: 0;
    }
</style>
