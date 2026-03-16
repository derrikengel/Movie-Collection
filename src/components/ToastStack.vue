<template>
    <Teleport to="body">
        <div :class="s.stack" aria-live="polite" aria-atomic="false">
            <TransitionGroup name="toast" tag="div" :class="s.inner">
                <div v-for="toast in store.toasts" :key="toast.id" :class="[s.toast, s[toast.type]]" role="status">
                    <span :class="s.message">
                        <RouterLink v-if="toast.action?.before" :to="toast.action.to" :class="s.actionLink">
                            {{ toast.action.label }}
                        </RouterLink>
                        {{ toast.message }}
                        <RouterLink v-if="toast.action && !toast.action.before" :to="toast.action.to"
                            :class="s.actionLink">
                            {{ toast.action.label }}
                        </RouterLink>
                    </span>
                    <button :class="s.dismiss" @click="store.dismiss(toast.id)" aria-label="Dismiss" v-html="xIcon" />
                </div>
            </TransitionGroup>
        </div>
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
        top: calc(var(--header-height) + var(--size-3));
        z-index: 200;
    }

    .inner {
        align-items: center;
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .toast {
        align-items: center;
        background: var(--color-toast-bg);
        border-left-width: 3px;
        border-left-color: var(--color-border);
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-lg);
        color: var(--color-toast-text);
        display: flex;
        font-size: var(--text-sm);
        gap: var(--size-2);
        max-width: calc(100vw - var(--size-8));
        padding: var(--size-2) var(--size-2) var(--size-2) var(--size-4);
        pointer-events: auto;
        white-space: nowrap;
    }

    .success {
        border-left-color: var(--color-success);
    }

    .error {
        border-left-color: var(--color-error);
    }

    .message {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .actionLink {
        color: var(--color-accent);
        font-weight: var(--font-weight-bold);
        margin-right: var(--size-1);
    }

    .dismiss {
        align-items: center;
        background: none;
        border: none;
        border-radius: var(--radius-full);
        color: var(--color-text-muted);
        cursor: pointer;
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-base);
        height: var(--size-6);
        justify-content: center;
        line-height: 1;
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
