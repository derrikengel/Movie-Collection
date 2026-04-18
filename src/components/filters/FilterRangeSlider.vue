<template>
    <div :class="s.rangeControls">
        <div :class="s.rangeInputRow">
            <div :class="s.rangeField">
                <label :class="s.rangeLabel" :for="`${inputId}-min`">{{ labelMin }}</label>

                <div v-if="unit === 'time'" :class="s.timeFields">
                    <div :class="s.timeField">
                        <input type="number" :id="`${inputId}-min`" :value="minHours" min="0" :class="s.timeInput"
                            :aria-label="ariaLabelMin + ' hours'"
                            @input="e => emitTime('min', Number(e.target.value), minMins)" />
                        <span :class="s.timeUnit">h</span>
                    </div>

                    <div :class="s.timeField">
                        <input type="number" :id="`${inputId}-min-m`" :value="minMins" min="0" max="59"
                            :class="s.timeInput" :aria-label="ariaLabelMin + ' minutes'"
                            @input="e => emitTime('min', minHours, Number(e.target.value))" />
                        <span :class="s.timeUnit">m</span>
                    </div>
                </div>

                <input v-else type="number" :id="`${inputId}-min`" :value="modelValueMin ?? min" :min="min"
                    :max="Number.isFinite(modelValueMax) ? modelValueMax : max" :class="s.rangeInput"
                    :aria-label="ariaLabelMin" @change="onNumMinChange" />
            </div>

            <div :class="s.rangeField">
                <label :class="s.rangeLabel" :for="`${inputId}-max`">{{ labelMax }}</label>

                <div v-if="unit === 'time'" :class="s.timeFields">
                    <div :class="s.timeField">
                        <input type="number" :id="`${inputId}-max`" :value="maxHours" min="0" :class="s.timeInput"
                            :aria-label="ariaLabelMax + ' hours'"
                            @input="e => emitTime('max', Number(e.target.value), maxMins)" />
                        <span :class="s.timeUnit">h</span>
                    </div>

                    <div :class="s.timeField">
                        <input type="number" :id="`${inputId}-max-m`" :value="maxMins" min="0" max="59"
                            :class="s.timeInput" :aria-label="ariaLabelMax + ' minutes'"
                            @input="e => emitTime('max', maxHours, Number(e.target.value))" />
                        <span :class="s.timeUnit">m</span>
                    </div>
                </div>

                <input v-else type="number" :id="`${inputId}-max`" :value="modelValueMax ?? max"
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
    import { computed, useId } from 'vue'
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

    const inputId = useId()

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
        display: flex;
        flex-direction: column;
        gap: var(--size-4);
        margin-inline: auto;
        min-width: 14rem;
        max-width: 20rem;

        @media (min-width: 64rem) {
            padding: var(--size-2) var(--size-4);
        }
    }

    /* Dual-handle range slider */
    .dualSlider {
        align-items: center;
        display: flex;
        height: var(--size-6);
        position: relative;
    }

    .dualSliderBase {
        background: var(--color-bg-frosted-selected);
        border-radius: var(--radius-full);
        height: var(--size-0-5);
        left: 0;
        pointer-events: none;
        position: absolute;
        right: 0;
    }

    .dualSliderFill {
        background: var(--blue-400);
        border-radius: var(--radius-full);
        height: var(--size-0-5);
        pointer-events: none;
        position: absolute;
    }

    .dualSliderInput {
        appearance: none;
        background: transparent;
        height: var(--size-0-5);
        margin: 0;
        padding: 0;
        pointer-events: none;
        position: absolute;
        width: 100%;
    }

    .dualSliderInput::-webkit-slider-runnable-track {
        background: transparent;
        height: var(--size-0-5);
    }

    .dualSliderInput::-moz-range-track {
        background: transparent;
        height: var(--size-0-5);
    }

    .dualSliderInput::-webkit-slider-thumb {
        appearance: none;
        background: var(--blue-400);
        border-radius: var(--radius-full);
        border: none;
        box-shadow: 0 0 0 var(--size-1) var(--blue-700);
        cursor: pointer;
        height: var(--size-5);
        pointer-events: all;
        translate: 0 calc(-50% + (var(--size-1) * 0.5));
        width: var(--size-5);
    }

    .dualSliderInput::-moz-range-thumb {
        background: var(--blue-400);
        border: none;
        border-radius: var(--radius-full);
        box-shadow: 0 0 0 var(--size-1) var(--blue-700);
        cursor: pointer;
        height: var(--size-5);
        pointer-events: all;
        width: var(--size-5);
    }

    /* Number inputs below slider */
    .rangeInputRow {
        display: flex;
        gap: var(--size-2);
        justify-content: space-between;
    }

    .rangeField {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
        text-align: center;
    }

    .rangeLabel {
        color: var(--blue-300);
        font-size: var(--text-2xs);
        letter-spacing: var(--tracking-widest);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
    }

    .rangeInput {
        appearance: textfield;
        background: var(--color-frosted-input);
        border: none;
        border-radius: var(--radius-full);
        color: var(--blue-50);
        font-size: var(--text-sm);
        outline: none;
        padding: var(--size-2) var(--size-3);
        text-align: center;
        transition: background-color var(--transition-fast);
        width: var(--size-20);
    }

    .rangeInput:focus {
        background: var(--color-frosted-input-focus);
    }

    .rangeInput::-webkit-outer-spin-button,
    .rangeInput::-webkit-inner-spin-button {
        appearance: none;
        margin: 0;
    }

    .timeFields {
        background: var(--color-frosted-input);
        border: none;
        border-radius: var(--radius-full);
        display: flex;
        /* padding: var(--size-2) var(--size-3); */
        transition: background-color var(--transition-fast);
    }

    .timeFields:focus-within {
        background: var(--color-frosted-input-focus);
    }

    .timeField {
        font-size: var(--text-sm);
        position: relative;
    }

    .timeInput {
        appearance: textfield;
        background: transparent;
        border: none;
        color: var(--blue-50);
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
