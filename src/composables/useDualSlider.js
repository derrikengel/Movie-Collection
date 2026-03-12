import { computed } from 'vue'

/**
 * Dual-handle range slider logic.
 *
 * @param {() => number|null} getMin - Getter for current min value (null = at lower bound)
 * @param {(v: number|null) => void} setMin - Setter for min value
 * @param {() => number|null} getMax - Getter for current max value (null = at upper bound)
 * @param {(v: number|null) => void} setMax - Setter for max value
 * @param {() => { min: number, max: number }} getBounds - Getter for the slider's min/max bounds
 */
export function useDualSlider(getMin, setMin, getMax, setMax, getBounds) {
    // CSS fill track: left/right % based on current values relative to bounds
    const trackStyle = computed(() => {
        const { min, max } = getBounds()
        if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return {}
        const lo = getMin() ?? min
        const hi = getMax() ?? max
        const range = max - min
        return {
            left: `${((lo - min) / range) * 100}%`,
            right: `${((max - hi) / range) * 100}%`,
        }
    })

    // Min thumb z-index: raised to 4 when at/past max so it can be dragged back left.
    // Max thumb always has z-index 3 (set inline in the template).
    const minZIndex = computed(() => {
        const { min: bMin, max: bMax } = getBounds()
        const lo = getMin() ?? bMin
        const hi = getMax() ?? bMax
        return lo >= hi ? 4 : 2
    })

    // Null at bounds (unset filter), push the linked handle when thumbs cross
    function onMinInput(e) {
        const val = Number(e.target.value)
        const { min: bMin, max: bMax } = getBounds()
        setMin(val === bMin ? null : val)
        if (Number.isFinite(getMax()) && val > getMax()) {
            setMax(val === bMax ? null : val)
        }
    }

    function onMaxInput(e) {
        const val = Number(e.target.value)
        const { min: bMin, max: bMax } = getBounds()
        setMax(val === bMax ? null : val)
        if (Number.isFinite(getMin()) && val < getMin()) {
            setMin(val === bMin ? null : val)
        }
    }

    return { trackStyle, minZIndex, onMinInput, onMaxInput }
}
