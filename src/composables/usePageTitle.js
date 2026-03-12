import { watchEffect, toValue } from 'vue'

export function usePageTitle(title) {
    watchEffect(() => {
        document.title = toValue(title)
    })
}
