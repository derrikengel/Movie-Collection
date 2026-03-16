<!-- src/components/MovieServicesSheet.vue -->
<template>
    <dialog ref="dialogEl" :class="s.sheet" @close="$emit('update:modelValue', false)" @click="onBackdropClick">
        <h2 :class="s.sheetTitle">Watch</h2>

        <div :class="s.sheetServices">
            <a v-for="service in movie.movie_services" :key="service.id" :href="service.url" target="_blank"
                rel="noopener noreferrer" :class="s.sheetService">
                <span :class="s.sheetServiceName">{{ formatService(service.service) }}</span>
                <span v-if="service.quality" :class="s.sheetServiceQuality">{{ service.quality }}</span>
            </a>

            <div v-if="movie.disc_format" :class="s.sheetDisc">
                <span :class="s.sheetServiceName">{{ movie.disc_format }}</span>
                <span :class="s.sheetServiceQuality">Disc</span>
            </div>
        </div>

        <button :class="s.sheetClose" @click="$emit('update:modelValue', false)">Dismiss</button>
    </dialog>
</template>

<script setup>
    import { ref, watch } from 'vue'

    const props = defineProps({
        movie: Object,
        modelValue: Boolean,
    })
    const emit = defineEmits(['update:modelValue'])

    const dialogEl = ref(null)

    watch(() => props.modelValue, (val) => {
        if (!dialogEl.value) return
        if (val) dialogEl.value.showModal()
        else dialogEl.value.close()
    })

    function onBackdropClick(e) {
        if (e.target === dialogEl.value) emit('update:modelValue', false)
    }

    function formatService(slug) {
        const names = {
            fandango_at_home: 'Fandango at Home',
            apple_tv: 'Apple TV',
            youtube: 'YouTube',
            plex: 'Plex',
            movies_anywhere: 'Movies Anywhere',
        }
        return names[slug] ?? slug
    }
</script>

<style module="s">
    .sheet {
        border: none;
        margin: 0 auto;
        padding: var(--size-3) var(--size-5) calc(var(--size-6) + env(safe-area-inset-bottom));
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        max-width: 40rem;
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-lg);
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        border-top: 1px solid var(--color-border-frosted);
        transform: translateY(0);
        transition:
            transform var(--transition-normal),
            overlay var(--transition-normal) allow-discrete,
            display var(--transition-normal) allow-discrete;

        @starting-style {
            transform: translateY(100%);
        }
    }

    .sheet:not([open]) {
        transform: translateY(100%);
    }

    .sheet::backdrop {
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

    .sheet:not([open])::backdrop {
        opacity: 0;
    }

    .sheetTitle {
        color: var(--color-text-muted);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: 0.08em;
        margin-bottom: var(--size-3);
        text-transform: uppercase;
    }

    .sheetServices {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
        margin-bottom: var(--size-4);
    }

    .sheetService {
        align-items: center;
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        display: flex;
        justify-content: space-between;
        padding: var(--size-3) var(--size-4);
        transition: border-color var(--transition-fast);
    }

    .sheetService:hover {
        border-color: var(--color-border-strong);
    }

    .sheetDisc {
        align-items: center;
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
        display: flex;
        justify-content: space-between;
        padding: var(--size-3) var(--size-4);
    }

    .sheetServiceName {
        color: var(--color-text);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-bold);
    }

    .sheetServiceQuality {
        color: var(--color-accent);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
    }

    .sheetClose {
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

    .sheetClose:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }
</style>
