<!-- src/components/ConfirmDialog.vue -->
<template>
    <Teleport to="body">
        <dialog ref="dialogEl" :class="s.dialog" role="alertdialog" aria-modal="true"
            :aria-labelledby="store.title ? 'confirm-title' : undefined"
            aria-describedby="confirm-message"
            @close="store.respond(false)"
            @click="onBackdropClick"
        >
            <h2 v-if="store.title" id="confirm-title" :class="s.title">{{ store.title }}</h2>
            <p id="confirm-message" :class="s.message">{{ store.message }}</p>
            <div :class="s.actions">
                <button :class="s.btnCancel" @click="store.respond(false)">{{ store.cancelLabel }}</button>
                <button :class="s.btnConfirm" @click="store.respond(true)">{{ store.confirmLabel }}</button>
            </div>
        </dialog>
    </Teleport>
</template>

<script setup>
    import { ref, watch } from 'vue'
    import { useConfirmStore } from '@/stores/confirm'

    const store = useConfirmStore()
    const dialogEl = ref(null)

    watch(() => store.visible, (val) => {
        if (!dialogEl.value) return
        if (val) dialogEl.value.showModal()
        else if (dialogEl.value.open) dialogEl.value.close()
    })

    function onBackdropClick(e) {
        if (e.target === dialogEl.value) store.respond(false)
    }
</script>

<style module="s">
    .dialog {
        background: var(--color-overlay);
        backdrop-filter: blur(16px);
        border: 1px solid var(--color-border-frosted);
        border-bottom: none;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        bottom: 0;
        left: 0;
        margin: 0 auto;
        max-width: 32rem;
        padding: var(--size-6) var(--size-5) calc(var(--size-6) + env(safe-area-inset-bottom));
        position: fixed;
        right: 0;
        transform: translateY(0);
        transition:
            transform var(--transition-normal),
            overlay var(--transition-normal) allow-discrete,
            display var(--transition-normal) allow-discrete;
        width: 100%;

        @starting-style {
            transform: translateY(100%);
        }
    }

    .dialog:not([open]) {
        transform: translateY(100%);
    }

    .dialog::backdrop {
        background: var(--color-backdrop);
        backdrop-filter: var(--bg-frosted-lg);
        opacity: 1;
        transition:
            opacity var(--transition-normal),
            overlay var(--transition-normal) allow-discrete,
            display var(--transition-normal) allow-discrete;

        @starting-style {
            opacity: 0;
        }
    }

    .dialog:not([open])::backdrop {
        opacity: 0;
    }

    .title {
        color: var(--color-text);
        font-size: var(--text-base);
        font-weight: var(--font-weight-bold);
        margin-bottom: var(--size-2);
    }

    .message {
        color: var(--color-text-secondary);
        font-size: var(--text-sm);
        line-height: var(--leading-normal);
        margin-bottom: var(--size-5);
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .btnConfirm {
        background: var(--color-error);
        border: none;
        border-radius: var(--radius-md);
        color: #fff;
        font-size: var(--text-base);
        font-weight: var(--font-weight-bold);
        padding: var(--size-3) var(--size-5);
        transition: opacity var(--transition-fast);
        width: 100%;
    }

    .btnConfirm:hover {
        opacity: 0.85;
    }

    .btnCancel {
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        padding: var(--size-3);
        transition: border-color var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    .btnCancel:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }
</style>
