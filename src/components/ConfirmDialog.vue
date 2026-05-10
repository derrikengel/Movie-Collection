<!-- src/components/ConfirmDialog.vue -->
<template>
    <Teleport to="body">
        <dialog ref="dialogEl" :class="s.dialog" role="alertdialog" aria-modal="true"
            :aria-labelledby="store.title ? 'confirm-title' : undefined" aria-describedby="confirm-message"
            @close="store.respond(false)" @click="onBackdropClick">
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
        background: transparent;
        border: none;
        border-radius: var(--radius-xl);
        left: 50%;
        max-width: 32rem;
        opacity: 1;
        padding: var(--size-5);
        position: fixed;
        top: 50%;
        translate: -50% -50%;
        transition:
            opacity var(--transition-normal),
            translate var(--transition-normal),
            overlay var(--transition-normal) allow-discrete,
            display var(--transition-normal) allow-discrete;
        width: calc(100% - var(--size-8));

        @starting-style {
            opacity: 0;
            translate: -50% calc(-50% + var(--size-4));
        }
    }

    .dialog:not([open]) {
        opacity: 0;
        translate: -50% calc(-50% + var(--size-4));
    }

    .dialog::backdrop {
        background: var(--color-bg-frosted);
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
        color: var(--blue-50);
        font-size: var(--text-xl);
        font-weight: var(--font-weight-bold);
        margin-bottom: var(--size-2);
    }

    .message {
        color: var(--blue-200);
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
        background: var(--red-400);
        border: none;
        border-radius: var(--radius-md);
        color: var(--red-900);
        font-weight: var(--font-weight-bold);
        padding: var(--size-3) var(--size-5);
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    .btnConfirm:hover {
        background: var(--red-500);
        color: var(--red-950);
    }

    .btnCancel {
        background: var(--blue-800);
        border-radius: var(--radius-md);
        color: var(--blue-200);
        font-weight: var(--font-weight-bold);
        padding: var(--size-3);
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    .btnCancel:hover {
        background: var(--blue-700);
        color: var(--blue-100);
    }
</style>
