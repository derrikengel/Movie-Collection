<template>
    <Teleport to="body">
        <ul :class="s.stack" aria-live="polite" aria-atomic="false">
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

                    <!-- <button :class="s.dismiss" @click="store.dismiss(toast.id)" aria-label="Dismiss" v-html="xIcon" /> -->

                </div>
            </TransitionGroup>
        </ul>
    </Teleport>
</template>

<script setup>
    import { useToastStore } from '@/stores/toast'
    import xIcon from '@/assets/icons/x-mark.svg?raw'

    const store = useToastStore()
</script>

<style module="s">
    .stack {
        left: 0;
        pointer-events: none;
        position: fixed;
        right: 0;
        top: var(--size-4);
        z-index: 200;

        @media (min-width: 64rem) {
            top: var(--size-8);
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
        --toast-bg: var(--green-600);
        --toast-text: var(--green-100);
        --toast-icon: var(--green-50);
        --toast-link: var(--green-50);
        --toast-link-accent: var(--green-400);
    }

    .error {
        --toast-bg: var(--red-600);
        --toast-text: var(--red-100);
        --toast-icon: var(--red-50);
        --toast-link: var(--red-50);
        --toast-link-accent: var(--red-400);
    }

    .message {
        align-items: center;
        display: flex;
        gap: var(--size-2);
    }

    .icon {
        align-items: center;
        color: var(--toast-icon, var(--blue-600));
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-xl);
        justify-content: center;
    }

    .actionLink {
        color: var(--toast-link, var(--blue-600));
        font-weight: var(--font-weight-bold);
        text-decoration-line: underline;
        text-decoration-color: var(--toast-link-accent, var(--blue-400));
        text-decoration-thickness: 0.0625em;
        text-underline-offset: 0.25em;
    }

    .dismiss {
        align-items: center;
        color: var(--toast-text, var(--blue-600));
        cursor: pointer;
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-lg);
        justify-content: center;
        padding: 0;
        transition: color var(--transition-fast);
        width: var(--size-6);
    }

    .dismiss:hover {
        color: var(--color-text);
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
