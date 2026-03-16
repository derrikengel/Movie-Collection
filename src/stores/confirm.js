import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmStore = defineStore('confirm', () => {
    const visible = ref(false)
    const message = ref('')
    const title = ref('')
    const confirmLabel = ref('Confirm')
    const cancelLabel = ref('Cancel')
    let resolveFn = null

    function request(msg, options = {}) {
        message.value = msg
        title.value = options.title ?? ''
        confirmLabel.value = options.confirmLabel ?? 'Confirm'
        cancelLabel.value = options.cancelLabel ?? 'Cancel'
        visible.value = true
        return new Promise((resolve) => { resolveFn = resolve })
    }

    function respond(confirmed) {
        visible.value = false
        resolveFn?.(confirmed)
        resolveFn = null
    }

    return { visible, message, title, confirmLabel, cancelLabel, request, respond }
})
