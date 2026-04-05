import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])
    let nextId = 0

    function show(message, { type = 'info', duration = 3000, action = null, icon = null } = {}) {
        const id = nextId++

        if (toasts.value.length >= 3) {
            dismiss(toasts.value[0].id)
        }

        const timer = setTimeout(() => dismiss(id), duration)
        toasts.value.push({ id, message, type, action, icon, timer })
    }

    function dismiss(id) {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index === -1) return
        clearTimeout(toasts.value[index].timer)
        toasts.value.splice(index, 1)
    }

    function success(message, options = {}) {
        show(message, { ...options, type: 'success' })
    }

    function error(message, options = {}) {
        show(message, { ...options, type: 'error' })
    }

    return { toasts, show, success, error, dismiss }
})
