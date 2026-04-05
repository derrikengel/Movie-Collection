<template>
    <div :class="s.app">
        <WideHeader />

        <main :class="s.main">
            <RouterView v-slot="{ Component }">
                <Transition name="page" mode="out-in" @after-leave="triggerScrollResolve">
                    <KeepAlive :include="['HomeView']">
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
    import { triggerScrollResolve } from '@/router'
    import WideHeader from '@/components/navigation/WideHeader.vue'
    import NarrowTabBar from '@/components/navigation/NarrowTabBar.vue'
    import ToastStack from '@/components/ToastStack.vue'
    import ConfirmDialog from '@/components/ConfirmDialog.vue'
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
</style>
