import { useConfirmStore } from '@/stores/confirm'

export function useConfirm() {
    const store = useConfirmStore()
    return {
        confirm: (message, options) => store.request(message, options)
    }
}
