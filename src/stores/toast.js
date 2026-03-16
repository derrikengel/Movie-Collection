import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])
    let nextId = 0

    function show(message, { type = 'info', duration = 10000, action = null } = {}) {
        const id = nextId++

        if (toasts.value.length >= 3) {
            dismiss(toasts.value[0].id)
        }

        const timer = setTimeout(() => dismiss(id), duration)
        toasts.value.push({ id, message, type, action, timer })
    }

    function dismiss(id) {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index === -1) return
        clearTimeout(toasts.value[index].timer)
        toasts.value.splice(index, 1)
    }

    return { toasts, show, dismiss }
})
