<template>
    <div :class="[s.hero, !hasBackdrop && s.heroFallback]">
        <div :class="s.heroMedia" :style="`background-image: url(${backdropImage})`">
            <div v-if="movie.trailer_youtube_id && !trailerError" ref="youtubeEl" :class="s.youtubePlayer" />
        </div>

        <a :href="backHref" :class="[s.overlayBtn, s.backBtn]" aria-label="Go back" @click.prevent="handleBack"
            v-html="arrowLeft" />

        <button v-if="trailerLoaded" :class="`${s.overlayBtn} ${s.muteBtn} ${!muted && s.muteBtnUnmuted}`"
            @click="toggleMute" :aria-label="muted ? 'Unmute trailer' : 'Mute trailer'"
            v-html="muted ? volumeMute : volumeFull" />
    </div>
</template>

<script setup>
    import { ref, computed, onUnmounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { usePlayer } from '@vue-youtube/core'
    import { posterUrl, backdropUrl } from '@/lib/tmdb'
    import { useNavContextStore } from '@/stores/navContext'
    import volumeFull from '@/assets/icons/volume-full.svg?raw'
    import volumeMute from '@/assets/icons/volume-mute.svg?raw'
    import arrowLeft from '@/assets/icons/arrow-left.svg?raw'

    const router = useRouter()
    const navContext = useNavContextStore()

    const backHref = computed(() => router.resolve({ name: navContext.sourceList ?? 'home' }).href)

    function handleBack() {
        if (navContext.sourceList !== null) {
            router.back()
        } else {
            router.push({ name: 'home' })
        }
    }

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
    const trailerError = ref(false)
    const muted = ref(true)

    const { instance, onReady, onError } = props.movie.trailer_youtube_id
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
        : { instance: ref(null), onReady: () => { }, onError: () => { } }

    onReady((event) => {
        event.target.setPlaybackQuality('hd1080')
        event.target.playVideo()
        trailerLoaded.value = true
        muted.value = event.target.isMuted()
    })

    onError(() => {
        trailerError.value = true
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
        max-width: 120rem;
        overflow: hidden;
        position: relative;
    }

    .heroMedia {
        aspect-ratio: 2 / 1;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        background-size: cover;
        mask-image: linear-gradient(to top, transparent, black 50%, black 100%);
        mask-composite: intersect;
        mask-repeat: no-repeat;

        @media (min-width: 64rem) {
            aspect-ratio: 2.25 / 1;
        }

        @media (min-width: 80rem) {
            aspect-ratio: 12 / 5;
        }

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
        aspect-ratio: 16 / 9;
        height: auto;
        pointer-events: none;
        position: absolute;
        top: 50%;
        translate: 0 -50%;
        width: 100%;
    }

    .overlayBtn {
        aspect-ratio: 1 / 1;
        align-items: center;
        backdrop-filter: var(--bg-frosted-xs);
        background: var(--color-bg-frosted-subtle);
        border: none;
        border-radius: var(--radius-full);
        color: var(--color-text);
        display: flex;
        font-size: var(--text-xl);
        justify-content: center;
        position: absolute;
        top: var(--size-2);
        transition: background var(--transition-fast), opacity var(--transition-normal);
        width: var(--size-8);
        z-index: 2;

        @container (min-width: 32rem) {
            top: var(--size-3);
        }

        @container (min-width: 48rem) {
            top: var(--size-4);
        }

        @container (min-width: 64rem) {
            top: var(--size-6);
            width: var(--size-10);
        }
    }

    .overlayBtn:hover {
        background: var(--color-bg-frosted);
    }

    .backBtn {
        left: var(--content-padding);

        @media (min-width: 64rem) {
            display: none;
        }
    }

    .muteBtn {
        right: var(--content-padding);
    }

    .muteBtnUnmuted {
        opacity: 0.4;
    }
</style>
