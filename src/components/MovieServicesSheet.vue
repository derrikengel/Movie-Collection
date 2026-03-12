<!-- src/components/MovieServicesSheet.vue -->
<template>
    <Transition name="fade">
        <div v-if="modelValue" :class="s.backdrop" @click="$emit('update:modelValue', false)" aria-hidden="true" />
    </Transition>

    <Transition name="sheet">
        <div v-if="modelValue" :class="s.sheet" role="dialog" aria-modal="true" aria-label="Watch options">
            <div :class="s.sheetHandle" />
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
        </div>
    </Transition>
</template>

<script setup>
    defineProps({
        movie: Object,
        modelValue: Boolean,
    })
    defineEmits(['update:modelValue'])

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
    .backdrop {
        position: fixed;
        inset: 0;
        background: oklch(0% 0 0 / 0.6);
        z-index: 60;
        backdrop-filter: var(--bg-frosted-xs);
    }

    .sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: oklch(11% 0.006 265 / 0.85);
        backdrop-filter: var(--bg-frosted-lg);
        border-top: 1px solid oklch(100% 0 0 / 0.08);
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        padding: var(--space-3) var(--space-5) var(--space-6);
        padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
        z-index: 70;
        max-width: 600px;
        margin: 0 auto;
    }

    .sheetHandle {
        width: 36px;
        height: 4px;
        border-radius: var(--radius-full);
        background: var(--color-border-strong);
        margin: 0 auto var(--space-4);
    }

    .sheetTitle {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-text-muted);
        margin-bottom: var(--space-3);
    }

    .sheetServices {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        margin-bottom: var(--space-4);
    }

    .sheetService {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-3) var(--space-4);
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        transition: border-color var(--transition-fast);
    }

    .sheetService:hover {
        border-color: var(--color-border-strong);
    }

    .sheetDisc {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-3) var(--space-4);
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
    }

    .sheetServiceName {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
    }

    .sheetServiceQuality {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
        color: var(--color-accent);
    }

    .sheetClose {
        width: 100%;
        padding: var(--space-3);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
        transition: border-color var(--transition-fast), color var(--transition-fast);
    }

    .sheetClose:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }
</style>
