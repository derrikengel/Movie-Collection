<!-- src/components/MovieServicesSheet.vue -->
<template>

    <dialog ref="dialogEl" :class="s.sheet" @close="$emit('update:modelValue', false)" @click="onBackdropClick">
        <h2 :class="s.sheetTitle">How to Watch</h2>

        <div :class="s.sheetServices">
            <a v-for="service in movie.movie_services" :key="service.id" :href="service.url" target="_blank"
                rel="noopener noreferrer" :class="[s.sheetService, serviceClass(service.service)]">
                <span :class="s.serviceLeft">
                    <span :class="s.serviceIcon" v-html="serviceIcon(service.service)" />
                    <span :class="s.sheetServiceName">{{ serviceLabel(service.service) }}</span>
                </span>
                <span v-if="service.quality" :class="s.sheetServiceQuality">{{ service.quality }}</span>
            </a>

            <div v-if="movie.disc_format" :class="[s.sheetService, s.sheetDisc]">
                <span :class="s.serviceLeft">
                    <span :class="[s.serviceIcon, s.discIcon]" v-html="discIcon" />
                    <span :class="s.sheetServiceName">{{ movie.disc_format }}</span>
                </span>
                <span :class="s.sheetServiceQuality">Disc</span>
            </div>
        </div>

        <button :class="s.sheetClose" @click="$emit('update:modelValue', false)">Dismiss</button>
    </dialog>

</template>

<script setup>
    import { ref, watch } from 'vue'
    import appletvIcon from '@/assets/icons/apple-tv.svg?raw'
    import fandangoIcon from '@/assets/icons/fandango-at-home.svg?raw'
    import youtubeIcon from '@/assets/icons/youtube.svg?raw'
    import plexIcon from '@/assets/icons/plex.svg?raw'
    import moviesAnywhereIcon from '@/assets/icons/movies-anywhere.svg?raw'
    import discIcon from '@/assets/icons/disc.svg?raw'

    const props = defineProps({
        movie: Object,
        modelValue: Boolean,
    })
    const emit = defineEmits(['update:modelValue'])

    const services = {
        fandango_at_home: { name: 'Fandango at Home', icon: fandangoIcon },
        apple_tv: { name: 'Apple TV', icon: appletvIcon },
        youtube: { name: 'YouTube', icon: youtubeIcon },
        plex: { name: 'Plex', icon: plexIcon },
        movies_anywhere: { name: 'Movies Anywhere', icon: moviesAnywhereIcon },
    }

    const dialogEl = ref(null)

    watch(() => props.modelValue, (val) => {
        if (!dialogEl.value) return
        if (val) dialogEl.value.showModal()
        else dialogEl.value.close()
    })

    function onBackdropClick(e) {
        if (e.target === dialogEl.value) emit('update:modelValue', false)
    }

    function serviceClass(slug) {
        return `svc-${slug.replaceAll('_', '-')}`
    }

    function serviceIcon(slug) {
        return services[slug]?.icon ?? ''
    }

    function serviceLabel(slug) {
        return services[slug]?.name ?? slug
    }
</script>

<style module="s">
    .sheet {
        background: var(--color-surface);
        backdrop-filter: var(--bg-frosted-lg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-2xl);
        inset: 0;
        margin: auto;
        max-width: 28rem;
        opacity: 1;
        padding: var(--size-5) var(--size-5) var(--size-6);
        position: fixed;
        transform: scale(1) translateY(0);
        transition:
            opacity var(--transition-normal),
            transform var(--transition-normal),
            overlay var(--transition-normal) allow-discrete,
            display var(--transition-normal) allow-discrete;
        width: calc(100% - var(--size-8));

        @starting-style {
            opacity: 0;
            transform: scale(0.95) translateY(var(--size-8));
        }
    }

    .sheet:not([open]) {
        opacity: 0;
        transform: scale(0.95) translateY(var(--size-8));
    }

    .sheet::backdrop {
        background: var(--color-bg-frosted-subtle);
        backdrop-filter: var(--bg-frosted-xl);
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
        font-weight: var(--font-weight-normal);
        letter-spacing: var(--tracking-widest);
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

    a.sheetService:hover {
        border-color: var(--color-border-strong);
    }

    .sheetDisc {
        color: var(--color-text-secondary);
    }

    .serviceLeft {
        align-items: center;
        display: flex;
        gap: var(--size-3);
    }

    .serviceIcon {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        height: var(--size-5);
        justify-content: center;
        width: var(--size-5);
    }

    .serviceIcon :global(svg) {
        width: 100%;
        height: 100%;
    }

    .serviceIcon :global(.brand-fg) {
        fill: var(--brand-fg, currentColor);
    }

    .serviceIcon :global(.brand-bg) {
        fill: var(--brand-bg, transparent);
    }

    /* .discIcon {
        background: oklch(from var(--color-text-muted) l c h / 0.15);
        border-radius: var(--radius-sm);
        height: var(--size-6);
        padding: var(--size-1);
        width: var(--size-6);
    } */

    .sheetServiceName {
        color: var(--color-text);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
    }

    .sheetServiceQuality {
        color: var(--color-accent);
        font-size: var(--text-xs);
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
