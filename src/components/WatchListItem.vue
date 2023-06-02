<script setup>
    defineProps({
        name: {
            type: String,
            required: true
        },
        icon: {
            type: Object,
            required: true
        },
        quality: {
            type: String,
            required: true
        },
        link: {
            type: String
        }
    })

    function brandToClassName(name) {
        const formatted = name.toLowerCase().replace(' ', '-')
        return `brand-${formatted}`
    }
</script>

<template>
    <a v-if="link" :href="link" :class="`btn movie-provider ${brandToClassName(name)}`" :title="`Watch on ${name}`" target="_blank">
        <dl class="movie-quality">
            <dt><component :is="icon" /> {{ name }}</dt>
            <dd>{{ quality }}</dd>
        </dl>
    </a>

    <span v-if="!link" :class="`movie-provider ${brandToClassName(name)}`">
        <dl class="movie-quality">
            <dt><component :is="icon" /> {{ name }}</dt>
            <dd>{{ quality }}</dd>
        </dl>
    </span>
</template>

<style>
    .movie-provider {
        align-items: center;
        display: flex;
        flex: 1;
        justify-content: center;
        padding: var(--size-base) var(--size2);
    }

    .movie-provider:not(a) + .movie-provider {
        border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    .movie-provider:not(a):first-child {
        border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    .movie-provider:not(a):last-child {
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .movie-quality {
        align-items: center;
        display: flex;
        margin: 0;
    }

    .movie-quality dt {
        align-items: center;
        display: flex;
        gap: var(--size-1);
    }

    .movie-quality dd {
        border-left: 1px solid var(--color-divider, var(--color-border-light));
        font-weight: var(--font-weight-regular);
        margin-left: var(--size-1);
        padding-left: var(--size-1);
    }

    .movie-provider svg .brand-fg {
        fill: var(--color-brand-fg);
        transition: fill var(--transition);
    }

    .movie-provider svg .brand-bg {
        fill: var(--color-brand-bg);
        transition: fill var(--transition);
    }

    a.movie-provider {
        background-color: var(--color-brand-fg);
        box-shadow: 0 0 0 #000;
        color: var(--color-base);
        transition: box-shadow var(--transition), transform var(--transition);
    }

    a.movie-provider:hover {
        box-shadow: var(--shadow-sm);
        position: relative;
        transform: translateY(calc(-1 * var(--size-4)));
    }

    a.movie-provider + .movie-provider,
    .movie-provider:not(a) + a.movie-provider {
        margin-top: var(--size-1);
    }

    .brand-vudu {
        --color-brand-fg: #fff;
        --color-brand-bg: #3478c1;
    }
    
    a.brand-vudu {
        --color-brand-fg: #3478c1;
        --color-brand-bg: #fff;
        color: var(--color-brand-bg);
    }

    .brand-youtube {
        --color-brand-fg: #fff;
        --color-brand-bg: #f00;
    }

    a.brand-youtube {
        --color-brand-fg:#fff;
        --color-brand-bg: #f00;
        --color-divider: var(--color-border-dark);
    }

    .brand-apple-tv {
        --color-brand-fg: #fff;
        --color-brand-bg: #000;
    }

    a.brand-apple-tv {
        background-color: var(--color-brand-bg);
        color: var(--color-brand-fg);
    }

    .brand-plex {
        --color-brand-fg: #282a2d;
        --color-brand-bg: #e5a00d;
    }

    a.brand-plex {
        --color-brand-fg: #e5a00d;
        --color-brand-bg: #282a2d;
        --color-divider: var(--color-border-dark);
    }

    .brand-movies-anywhere {
        --color-brand-fg: #fff;
        --color-brand-bg: #9800D3;
    }

    a.brand-movies-anywhere {
        --color-brand-fg: #9800D3;
        --color-brand-bg: #fff;
        color: var(--color-brand-bg);
    }

    @media screen and (min-width: 42rem) {
        .movie-provider {
            flex: 0 1 auto;
        }

        .movie-provider:not(a) {
            padding: 0;
        }

        .movie-provider:not(a):first-child,
        .movie-provider:not(a) + .movie-provider,
        .movie-provider:not(a):last-child {
            border: none;
        }

        a.movie-provider + .movie-provider,
        .movie-provider:not(a) + a.movie-provider {
            margin-top: 0;
        }
    }
</style>