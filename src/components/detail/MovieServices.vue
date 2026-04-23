<template>
    <div :class="s.services">
        <h2 :class="s.title">How to Watch</h2>

        <ul :class="s.list">
            <li v-for="service in movie.movie_services" :key="service.id">
                <component :is="service.url ? 'a' : 'div'"
                    v-bind="service.url ? { href: service.url } : {}"
                    :class="[s.service, serviceClass(service.service)]">

                    <span :class="s.serviceInfo">
                        <span :class="s.serviceIcon" v-html="serviceIcon(service.service)" />
                        <span :class="s.serviceName">{{ serviceLabel(service.service) }}</span>
                        <span v-if="service.quality" :class="s.serviceQuality">{{ service.quality }}</span>
                    </span>

                    <span v-if="service.url" :class="s.watchNow">
                        Watch Now
                        <span :class="s.watchNowArrow" v-html="arrowRightIcon" />
                    </span>
                </component>
            </li>
            <li v-if="movie.disc_format" :class="[s.service, s.disc]">
                <span :class="s.serviceInfo">
                    <span :class="[s.serviceIcon, s.discIcon]" v-html="discIcon" />
                    <span :class="s.serviceName">{{ discLabel }}</span>
                    <span :class="s.serviceQuality">{{ discQuality }}</span>
                </span>
            </li>
        </ul>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import appletvIcon from '@/assets/icons/apple-tv.svg?raw'
    import fandangoIcon from '@/assets/icons/fandango-at-home.svg?raw'
    import youtubeIcon from '@/assets/icons/youtube.svg?raw'
    import plexIcon from '@/assets/icons/plex.svg?raw'
    import moviesAnywhereIcon from '@/assets/icons/movies-anywhere.svg?raw'
    import discIcon from '@/assets/icons/disc.svg?raw'
    import arrowRightIcon from '@/assets/icons/arrow-right.svg?raw'

    const props = defineProps({
        movie: Object
    })

    const services = {
        fandango_at_home: { name: 'Fandango at Home', icon: fandangoIcon },
        apple_tv: { name: 'Apple TV', icon: appletvIcon },
        youtube: { name: 'YouTube', icon: youtubeIcon },
        plex: { name: 'Plex', icon: plexIcon },
        movies_anywhere: { name: 'Movies Anywhere', icon: moviesAnywhereIcon },
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

    const discFormats = {
        '4K Blu-Ray': { label: 'Blu-Ray', quality: '4K' },
        'Blu-Ray': { label: 'Blu-Ray', quality: 'HD' },
        'DVD': { label: 'DVD', quality: 'SD' },
    }

    const discLabel = computed(() => discFormats[props.movie.disc_format]?.label ?? props.movie.disc_format)
    const discQuality = computed(() => discFormats[props.movie.disc_format]?.quality ?? '')
</script>

<style module="s">
    .services {
        margin-inline: auto;
        margin-top: var(--size-12);
        max-width: var(--content-width);
        padding-inline: var(--content-padding);
    }

    .title {
        color: var(--blue-400);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        margin-bottom: var(--size-3);
        text-transform: uppercase;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
        list-style: none;
        margin-bottom: var(--size-4);
        padding: 0;
    }

    .service {
        align-items: center;
        background: var(--blue-900);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        display: flex;
        gap: var(--size-4);
        justify-content: space-between;
        padding: var(--size-3) var(--size-4);
        transition: border-color var(--transition-fast), background var(--transition-fast);
    }

    .disc {
        color: var(--color-text-secondary);
    }

    .serviceInfo {
        align-items: center;
        display: flex;
        gap: var(--size-3);
    }

    .serviceIcon {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-2xl);
        justify-content: center;
    }

    /* .serviceIcon :global(svg) {
        width: 100%;
        height: 100%;
    } */

    .serviceIcon :global(.brand-fg) {
        fill: var(--brand-fg, currentColor);
    }

    .serviceIcon :global(.brand-bg) {
        fill: var(--brand-bg, transparent);
    }

    .serviceName {
        color: var(--blue-100);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-semibold);
    }

    .serviceQuality {
        color: var(--color-text-muted);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-semibold);
    }

    .watchNow {
        align-items: center;
        color: var(--blue-300);
        display: flex;
        gap: var(--size-1);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    .watchNowArrow {
        align-items: center;
        display: flex;
        font-size: var(--text-xs);
        justify-content: center;
    }

    a.service:hover {
        background: var(--blue-800);

        .watchNow {
            color: var(--blue-50);
        }
    }
</style>
