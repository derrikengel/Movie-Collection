<!-- src/components/FilterRangeSlider.vue -->
<template>
    <div :class="s.rangeControls">
        <div :class="s.rangeInputRow">
            <div :class="s.rangeField">
                <span :class="s.rangeLabel">{{ labelMin }}</span>

                <div v-if="unit === 'time'" :class="s.timeFields">
                    <div :class="s.timeField">
                        <input type="number" :value="minHours" min="0" :class="s.timeInput"
                            :aria-label="ariaLabelMin + ' hours'"
                            @input="e => emitTime('min', Number(e.target.value), minMins)" />
                        <span :class="s.timeUnit">h</span>
                    </div>

                    <div :class="s.timeField">
                        <input type="number" :value="minMins" min="0" max="59" :class="s.timeInput"
                            :aria-label="ariaLabelMin + ' minutes'"
                            @input="e => emitTime('min', minHours, Number(e.target.value))" />
                        <span :class="s.timeUnit">m</span>
                    </div>
                </div>

                <input v-else type="number" :value="modelValueMin ?? min" :min="min"
                    :max="Number.isFinite(modelValueMax) ? modelValueMax : max" :class="s.rangeInput"
                    :aria-label="ariaLabelMin" @change="onNumMinChange" />
            </div>

            <div :class="s.rangeField">
                <span :class="s.rangeLabel">{{ labelMax }}</span>

                <div v-if="unit === 'time'" :class="s.timeFields">
                    <div :class="s.timeField">
                        <input type="number" :value="maxHours" min="0" :class="s.timeInput"
                            :aria-label="ariaLabelMax + ' hours'"
                            @input="e => emitTime('max', Number(e.target.value), maxMins)" />
                        <span :class="s.timeUnit">h</span>
                    </div>

                    <div :class="s.timeField">
                        <input type="number" :value="maxMins" min="0" max="59" :class="s.timeInput"
                            :aria-label="ariaLabelMax + ' minutes'"
                            @input="e => emitTime('max', maxHours, Number(e.target.value))" />
                        <span :class="s.timeUnit">m</span>
                    </div>
                </div>

                <input v-else type="number" :value="modelValueMax ?? max"
                    :min="Number.isFinite(modelValueMin) ? modelValueMin : min" :max="max" :class="s.rangeInput"
                    :aria-label="ariaLabelMax" @change="onNumMaxChange" />
            </div>
        </div>

        <div :class="s.dualSlider">
            <div :class="s.dualSliderBase" />
            <div :class="s.dualSliderFill" :style="trackStyle" />
            <input type="range" :min="min" :max="max" :value="modelValueMin ?? min" @input="onMinInput"
                :class="s.dualSliderInput" :style="{ zIndex: minZIndex }" :aria-label="ariaLabelMin" />
            <input type="range" :min="min" :max="max" :value="modelValueMax ?? max" @input="onMaxInput"
                :class="s.dualSliderInput" style="z-index: 3" :aria-label="ariaLabelMax" />
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
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
        unit: { type: String, default: null }, // 'time' for h+m display
    })

    const emit = defineEmits(['update:modelValueMin', 'update:modelValueMax'])

    const { trackStyle, minZIndex, onMinInput, onMaxInput } = useDualSlider(
        () => props.modelValueMin,
        v => emit('update:modelValueMin', v),
        () => props.modelValueMax,
        v => emit('update:modelValueMax', v),
        () => ({ min: props.min, max: props.max }),
    )

    // Time unit helpers (only used when unit === 'time')
    const minHours = computed(() => Math.floor((props.modelValueMin ?? props.min) / 60))
    const minMins = computed(() => (props.modelValueMin ?? props.min) % 60)
    const maxHours = computed(() => Math.floor((props.modelValueMax ?? props.max) / 60))
    const maxMins = computed(() => (props.modelValueMax ?? props.max) % 60)

    function emitTime(which, hours, mins) {
        const total = hours * 60 + mins
        const bound = which === 'min' ? props.min : props.max
        const event = which === 'min' ? 'update:modelValueMin' : 'update:modelValueMax'
        emit(event, total === bound ? null : total)
    }

    // Number input handlers — clamp on change, force input value back so display always matches
    function onNumMinChange(e) {
        const n = Number(e.target.value)
        const upper = Number.isFinite(props.modelValueMax) ? props.modelValueMax : props.max
        const clamped = Number.isFinite(n) ? Math.max(props.min, Math.min(n, upper)) : props.min
        e.target.value = clamped
        emit('update:modelValueMin', clamped === props.min ? null : clamped)
    }
    function onNumMaxChange(e) {
        const n = Number(e.target.value)
        const lower = Number.isFinite(props.modelValueMin) ? props.modelValueMin : props.min
        const clamped = Number.isFinite(n) ? Math.max(lower, Math.min(n, props.max)) : props.max
        e.target.value = clamped
        emit('update:modelValueMax', clamped === props.max ? null : clamped)
    }
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
        text-align: center;
    }

    .rangeLabel {
        font-size: var(--text-xs);
        color: var(--blue-100);
    }

    .rangeInput {
        appearance: textfield;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text);
        font-size: var(--text-sm);
        outline: none;
        padding: var(--size-2) var(--size-3);
        text-align: center;
        transition: border-color var(--transition-fast);
        width: 80px;
    }

    .rangeInput:focus {
        border-color: var(--color-border-strong);
    }

    .rangeInput::-webkit-outer-spin-button,
    .rangeInput::-webkit-inner-spin-button {
        appearance: none;
        margin: 0;
    }

    .timeFields {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        display: flex;
        /* padding: var(--size-2) var(--size-3); */
        transition: border-color var(--transition-fast);
    }

    .timeFields:focus-within {
        border-color: var(--color-border-strong);
    }

    .timeField {
        font-size: var(--text-sm);
        position: relative;
    }

    .timeInput {
        appearance: textfield;
        background: transparent;
        border: none;
        color: var(--color-text);
        outline: none;
        padding: var(--size-2) 0;
        text-align: right;
    }

    .timeField:first-child {
        .timeInput {
            padding-left: 1.5ch;
            padding-right: 1.75ch;
            width: 4.25ch;
        }

        .timeUnit {
            left: 3ch;
        }
    }

    .timeField:last-child {
        .timeInput {
            padding-left: 0.25ch;
            padding-right: 2.75ch;
            width: 5ch;
        }

        .timeUnit {
            left: 2.75ch;
        }
    }

    .timeInput::-webkit-outer-spin-button,
    .timeInput::-webkit-inner-spin-button {
        appearance: none;
        margin: 0;
    }

    .timeUnit {
        align-content: center;
        bottom: 0;
        color: var(--blue-400);
        font-weight: var(--font-weigh-normal);
        padding-top: 0.125em;
        pointer-events: none;
        position: absolute;
        top: 0;
    }
</style>
