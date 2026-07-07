<template>
    <div :class="s.app">
        <AppHeader />

        <main :class="[s.main, route.name === 'login' && s.mainCentered]">
            <RouterView v-slot="{ Component }">
                <Transition name="page" mode="out-in" @after-leave="triggerScrollResolve">
                    <KeepAlive
                        :include="['HomeView', 'WatchlistView', 'WatchedView', 'FavoritesView', 'IgnoredView', 'ActorView']">
                        <component :is="Component" :key="$route.path" />
                    </KeepAlive>
                </Transition>
            </RouterView>
        </main>

        <NarrowTabBar />
        <ToastStack />
        <ConfirmDialog />
    </div>
</template>

<script setup>
    import { onMounted, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { triggerScrollResolve } from '@/router'
    import { useAuthStore } from '@/stores/auth'
    import { usePushNotifications } from '@/composables/usePushNotifications'
    import AppHeader from '@/components/navigation/AppHeader.vue'
    import NarrowTabBar from '@/components/navigation/NarrowTabBar.vue'
    import ToastStack from '@/components/ToastStack.vue'
    import ConfirmDialog from '@/components/ConfirmDialog.vue'

    const route = useRoute()
    const router = useRouter()
    const auth = useAuthStore()
    const { permissionStatus, subscribe } = usePushNotifications()

    watch(() => auth.user, (user) => {
        if (!user) return
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
        if (permissionStatus.value === 'default' || permissionStatus.value === 'granted') subscribe()
    }, { immediate: true })

    onMounted(() => {
        if (!navigator.serviceWorker) return
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'navigate') {
                const url = new URL(event.data.url)
                router.push(url.pathname + url.search + url.hash)
            }
        })
    })
</script>

<style module="s">
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
    }

    .main {
        flex: 1;
        padding: var(--content-padding) var(--content-padding) calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + var(--content-padding)) var(--content-padding);

        @media (min-width: 64rem) {
            padding: var(--content-padding);
        }
    }

    .mainCentered {
        align-items: center;
        display: flex;
        justify-content: center;
    }
</style>
