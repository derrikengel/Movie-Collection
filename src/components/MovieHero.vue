<template>
    <div :class="[s.hero, !hasBackdrop && s.heroFallback]">
        <div :class="s.heroMedia" :style="`background-image: url(${backdropImage})`">
            <div v-if="movie.trailer_youtube_id" ref="youtubeEl" :class="s.youtubePlayer" />
        </div>

        <button v-if="trailerLoaded" :class="s.muteBtn" @click="toggleMute"
            :aria-label="muted ? 'Unmute trailer' : 'Mute trailer'" v-html="muted ? volumeMute : volumeFull" />
    </div>
</template>

<script setup>
    import { ref, onUnmounted } from 'vue'
    import { usePlayer } from '@vue-youtube/core'
    import { posterUrl, backdropUrl } from '@/lib/tmdb'
    import volumeFull from '@/assets/icons/volume-full.svg?raw'
    import volumeMute from '@/assets/icons/volume-mute.svg?raw'

    const props = defineProps({
        movie: {
            type: Object,
            required: true
        }
    })

    const hasBackdrop = !!props.movie.backdrop_path

    const backdropImage = hasBackdrop ? backdropUrl(props.movie.backdrop_path) : posterUrl(props.movie.poster_path, 'w1280');

    const youtubeEl = ref(null)
    const trailerLoaded = ref(false)
    const muted = ref(true)

    const { instance, onReady } = props.movie.trailer_youtube_id
        ? usePlayer(props.movie.trailer_youtube_id, youtubeEl, {
            playerVars: {
                controls: 0,
                modestbranding: 1,
                loop: 1,
                playlist: props.movie.trailer_youtube_id,
                rel: 0,
                mute: 1,
                playsinline: 1,
                autoplay: 1,
                fs: 0,
            },
        })
        : { instance: ref(null), onReady: () => { } }

    onReady((event) => {
        event.target.playVideo()
        trailerLoaded.value = true
        muted.value = event.target.isMuted()
    })

    function toggleMute() {
        if (!instance.value) return
        if (instance.value.isMuted()) {
            instance.value.unMute()
            muted.value = false
        } else {
            instance.value.mute()
            muted.value = true
        }
    }

    onUnmounted(() => {
        if (instance.value) {
            try { instance.value.destroy() } catch { }
        }
    })
</script>

<style module="s">
    .hero {
        margin-inline: auto;
        max-width: 90rem;
        overflow: hidden;
        position: relative;
    }

    .heroMedia {
        aspect-ratio: 2/1;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        background-size: cover;
        mask-image: linear-gradient(to top, transparent, black 50%, black 100%);
        mask-composite: intersect;
        mask-repeat: no-repeat;

        @media (min-width: 90rem) {
            mask-image: linear-gradient(to top, transparent, black 50%, black 100%),
                linear-gradient(to right, transparent, black 30%, black 100%),
                linear-gradient(to left, transparent, black 30%, black 100%);
        }
    }

    /* Tier 3: blurred poster */
    .posterFill {
        position: absolute;
        inset: 0;
    }

    .posterFillImg {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: var(--bg-frosted-lg) brightness(0.5) saturate(1.4);
        transform: scale(1.1);
    }

    /* Tier 2: backdrop */
    .backdropImg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
        transition: opacity 0.6s ease;
    }

    .backdropImgHidden {
        opacity: 0;
    }

    .youtubePlayer {
        aspect-ratio: 16/9;
        height: auto;
        pointer-events: none;
        width: 100%;
        position: absolute;
        top: 50%;
        translate: 0 -50%;
    }

    /* Mute toggle */
    .muteBtn {
        align-items: center;
        backdrop-filter: var(--bg-frosted-xs);
        background: var(--color-bg-frosted-subtle);
        border: none;
        border-radius: var(--radius-full);
        color: var(--color-text);
        display: flex;
        font-size: var(--text-xl);
        height: var(--size-8);
        justify-content: center;
        position: absolute;
        right: var(--size-4);
        top: calc((var(--header-height) - var(--size-8)) / 2);
        transition: background var(--transition-fast);
        width: var(--size-8);
        z-index: 2;
    }

    .muteBtn:hover {
        background: var(--color-bg-frosted);
    }
</style>
