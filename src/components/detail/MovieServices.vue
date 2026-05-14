<template>
    <div :class="s.services">
        <component :is="primaryService ? 'a' : 'button'" v-bind="primaryService ? { href: primaryService.url } : {}"
            :class="[s.watchNowBtn, primaryService && serviceClass(primaryService.service)]"
            @click="!primaryService ? popoverEl?.showPopover() : undefined">
            <span v-if="primaryService" :class="s.primaryIcon" v-html="serviceIcon(primaryService.service)" />
            {{ primaryService ? 'Watch Now' : 'Watch Options' }}
            <span v-if="primaryService" :class="s.watchNowArrow" v-html="arrowRightIcon" />
        </component>

        <button v-if="primaryService && linkedServices.length !== 1" :class="s.optionsBtn"
            @click="popoverEl?.showPopover()">
            Other watch options
        </button>
    </div>

    <div ref="popoverEl" popover :class="s.popover">
        <div :class="s.modal">
            <h2 :class="s.title">Watch Options</h2>

            <button v-html="closeIcon" :class="s.closeBtn" @click="popoverEl?.hidePopover" />

            <ul :class="s.serviceList">
                <li v-for="service in movie.movie_services" :key="service.id" :class="s.serviceItem">
                    <component :is="service.url ? 'a' : 'div'" v-bind="service.url ? { href: service.url } : {}"
                        :class="[s.service, serviceClass(service.service), 'light']">

                        <p :class="s.serviceInfo">
                            <span :class="s.serviceIcon" v-html="serviceIcon(service.service)" />
                            <span :class="s.serviceName">{{ serviceLabel(service.service) }}</span>
                            <span v-if="service.quality" :class="s.serviceQuality">{{ service.quality }}</span>
                        </p>

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
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import appletvIcon from '@/assets/icons/apple-tv.svg?raw'
    import fandangoIcon from '@/assets/icons/fandango-at-home.svg?raw'
    import youtubeIcon from '@/assets/icons/youtube.svg?raw'
    import plexIcon from '@/assets/icons/plex.svg?raw'
    import moviesAnywhereIcon from '@/assets/icons/movies-anywhere.svg?raw'
    import discIcon from '@/assets/icons/disc.svg?raw'
    import arrowRightIcon from '@/assets/icons/arrow-right.svg?raw'
    import closeIcon from '@/assets/icons/x-mark.svg?raw'

    const props = defineProps({
        movie: Object
    })

    const popoverEl = ref(null)

    const services = {
        fandango_at_home: { name: 'Fandango at Home', icon: fandangoIcon },
        apple_tv: { name: 'Apple TV', icon: appletvIcon },
        youtube: { name: 'YouTube', icon: youtubeIcon },
        plex: { name: 'Plex', icon: plexIcon },
        movies_anywhere: { name: 'Movies Anywhere', icon: moviesAnywhereIcon },
    }

    const linkedServices = computed(() => props.movie.movie_services?.filter(svc => svc.url) ?? [])

    const qualityRank = { '4K': 3, 'HD': 2, 'SD': 1 }
    const preferredOrder = ['fandango_at_home', 'movies_anywhere', 'apple_tv', 'youtube']

    const primaryService = computed(() => {
        const linked = props.movie.movie_services?.filter(svc => svc.url) ?? []
        if (!linked.length) return null

        const bestRank = Math.max(...linked.map(svc => qualityRank[svc.quality] ?? 0))
        const bestQualityServices = linked.filter(svc => (qualityRank[svc.quality] ?? 0) === bestRank)

        for (const slug of preferredOrder) {
            const match = bestQualityServices.find(svc => svc.service === slug)
            if (match) return match
        }
        return bestQualityServices[0]
    })

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

    /* ─── Primary "Watch Now" button ─── */
    .watchNowBtn {
        align-items: center;
        background: var(--btn-bg, var(--blue-50));
        border: none;
        border-radius: var(--radius-full);
        color: var(--btn-fg, var(--blue-800));
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-3);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tight);
        min-height: var(--size-12);
        padding: var(--size-3) var(--size-4);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: stretch;
    }

    .watchNowBtn:global(.svc-apple-tv) {
        --brand-fg: #000;
    }

    .watchNowBtn:global(.svc-plex) {
        --brand-fg: #e5a00d;
        --brand-bg: #282a2d;
    }

    @media (hover: hover) and (pointer: fine) {
        .watchNowBtn:hover {
            background: oklch(from var(--btn-bg, var(--blue-300)) calc(l - 0.05) c h);
        }
    }

    .primaryIcon {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-2xl);
        justify-content: center;
    }

    .primaryIcon :global(.brand-fg) {
        fill: var(--brand-fg, currentColor);
    }

    .primaryIcon :global(.brand-bg) {
        fill: var(--brand-bg, transparent);
    }

    /* ─── Secondary "Other Services" button ─── */
    .optionsBtn {
        align-items: center;
        color: var(--blue-400);
        display: flex;
        justify-content: center;
        gap: var(--size-1);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-normal);
        padding-top: var(--size-2);
        text-align: center;
        text-decoration-line: underline;
        text-decoration-thickness: 0.0625em;
        text-underline-offset: 0.25em;
        transition: color var(--transition-fast);
        width: stretch;
    }

    @media (hover: hover) and (pointer: fine) {
        .optionsBtn:hover {
            color: var(--blue-50);
        }
    }

    /* ─── All Services Modal ─── */
    .popover {
        background: none;
        border: none;
        left: 50%;
        max-height: calc(100dvh - var(--size-8));
        max-width: 30rem;
        opacity: 0;
        overflow: visible;
        padding: 0;
        position: fixed;
        top: 50%;
        transition:
            display var(--transition-normal) allow-discrete,
            opacity var(--transition-normal),
            overlay var(--transition-normal) allow-discrete,
            translate var(--transition-normal);
        translate: -50% calc(-50% + var(--size-8));
        width: calc(100% - var(--size-8));
    }

    .popover:popover-open {
        opacity: 1;
        scale: 1;
        translate: -50% -50%;
    }

    @starting-style {
        .popover:popover-open {
            opacity: 0;
            translate: -50% calc(-50% + var(--size-4));
        }
    }

    .popover::backdrop {
        backdrop-filter: var(--bg-frosted-sm);
        background: oklch(from var(--blue-950) l c h / 0.75);
        opacity: 0;
        transition:
            display allow-discrete,
            opacity var(--transition-slow),
            overlay allow-discrete;
    }

    .popover:popover-open::backdrop {
        opacity: 1;
    }

    @starting-style {
        .popover:popover-open::backdrop {
            opacity: 0;
        }
    }

    .modal {
        background: var(--white);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-2xl);
        color: var(--blue-800);
        max-height: calc(100dvh - var(--size-8));
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: var(--size-11) 0 0 0;
        position: relative;
        scrollbar-width: thin;

        @media (min-width: 32rem) {
            padding: var(--size-11) var(--size-8) var(--size-8) var(--size-8);
        }
    }

    .title {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tight);
        margin-bottom: var(--size-4);
        text-align: center;
        text-transform: uppercase;
    }

    .closeBtn {
        align-items: center;
        color: var(--blue-600);
        display: flex;
        height: var(--size-8);
        justify-content: center;
        font-size: var(--text-xl);
        position: absolute;
        right: var(--size-3);
        top: var(--size-3);
        width: var(--size-8);
        transition: color var(--transition-fast);
    }

    @media (hover: hover) and (pointer: fine) {
        .closeBtn:hover {
            color: var(--blue-800);
        }
    }

    /* ─── Full Service list ─── */

    .serviceList {
        display: flex;
        flex-direction: column;
        list-style: none;
        padding: 0;
    }

    .serviceItem:not(:last-child) {
        border-bottom: 1px solid oklch(from var(--blue-700) l c h / .12);
    }

    .service {
        align-items: center;
        display: flex;
        gap: var(--size-4);
        justify-content: space-between;
        line-height: var(--leading-tight);
        padding: var(--size-5);

        @media (min-width: 32rem) {
            padding: var(--size-5) var(--size-3);
        }
    }

    .serviceInfo {
        align-items: center;
        display: flex;
        gap: var(--size-2);

        @media (min-width: 32rem) {
            gap: var(--size-3);
        }
    }

    .serviceIcon {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-2xl);
        justify-content: center;
    }

    .serviceIcon :global(.brand-fg) {
        fill: var(--brand-fg, currentColor);
    }

    .serviceIcon :global(.brand-bg) {
        fill: var(--brand-bg, transparent);
    }

    .serviceName {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-semibold);
    }

    .serviceQuality {
        color: var(--blue-500);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
    }

    .watchNow {
        align-items: center;
        background: oklch(from var(--blue-400) l c h / 0.1);
        border-radius: var(--radius-full);
        color: var(--blue-600);
        display: flex;
        flex: 0 0 auto;
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-1);
        letter-spacing: var(--tracking-widest);
        padding: var(--size-2) var(--size-4);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
    }

    .watchNowArrow {
        align-items: center;
        display: flex;
        font-size: var(--text-xs);
        justify-content: center;
    }

    a.service:hover {
        .watchNow {
            background: var(--blue-300);
            color: var(--blue-800);
        }
    }
</style>
