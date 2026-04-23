<template>
    <Teleport to="body">
        <ul :class="s.stack" :style="stackStyle" aria-live="polite" aria-atomic="false">
            <TransitionGroup name="toast" tag="li" :class="s.toastItem">
                <div v-for="toast in store.toasts" :key="toast.id" :class="[s.toast, s[toast.type]]" role="status">

                    <p :class="s.message">
                        <span v-if="toast.icon" :class="s.icon" v-html="toast.icon" aria-hidden="true" />

                        <span>
                            <RouterLink v-if="toast.action?.before" :to="toast.action.to" :class="s.actionLink">
                                {{ toast.action.label }}
                            </RouterLink>

                            {{ toast.message }}

                            <RouterLink v-if="toast.action && !toast.action.before" :to="toast.action.to"
                                :class="s.actionLink">
                                {{ toast.action.label }}
                            </RouterLink>
                        </span>
                    </p>

                </div>
            </TransitionGroup>
        </ul>
    </Teleport>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { useToastStore } from '@/stores/toast'

    const store = useToastStore()
    const route = useRoute()

    const stackStyle = computed(() => ({
        '--toast-top': route.meta.filterBar ? '8.5rem' : '1rem',
        '--toast-top-wide': route.meta.filterBar ? '12rem' : '7rem',
    }))
</script>

<style module="s">
    .stack {
        left: 0;
        pointer-events: none;
        position: fixed;
        right: 0;
        top: var(--toast-top, 8rem);
        z-index: 200;

        @media (min-width: 64rem) {
            top: var(--toast-top-wide, 12rem);
        }
    }

    .toastItem {
        align-items: center;
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .toast {
        align-items: center;
        background: var(--toast-bg, var(--blue-200));
        border-radius: var(--radius-4xl);
        box-shadow: var(--shadow-lg);
        color: var(--toast-text, var(--blue-800));
        display: flex;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        gap: var(--size-3);
        max-width: calc(100vw - var(--size-8));
        padding: var(--size-2) var(--size-4);
        pointer-events: auto;
    }

    .success {
        --toast-bg: var(--green-300);
        --toast-text: var(--green-800);
        --toast-icon: var(--green-950);
        --toast-link: var(--green-950);
        --toast-link-accent: var(--green-500);
    }

    .error {
        --toast-bg: var(--red-400);
        --toast-text: var(--red-800);
        --toast-icon: var(--red-950);
        --toast-link: var(--red-950);
        --toast-link-accent: var(--red-600);
    }

    .message {
        align-items: center;
        display: flex;
        gap: var(--size-2);
    }

    .icon {
        align-items: center;
        color: var(--toast-icon, var(--blue-950));
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-xl);
        justify-content: center;
    }

    .actionLink {
        color: var(--toast-link, var(--blue-950));
        font-weight: var(--font-weight-bold);
        text-decoration-line: underline;
        text-decoration-color: var(--toast-link-accent, var(--blue-500));
        text-decoration-thickness: 0.0625em;
        text-underline-offset: 0.25em;
    }
</style>

<style>

    .toast-enter-active,
    .toast-leave-active {
        transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .toast-enter-from,
    .toast-leave-to {
        opacity: 0;
        transform: translateY(-8px);
    }

    .toast-move {
        transition: transform 0.2s ease;
    }
</style>
