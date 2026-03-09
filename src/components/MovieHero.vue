<template>
  <div :class="[s.hero, !hasBackdrop && s.heroFallback]">

    <!-- Tier 3: blurred poster fallback -->
    <div v-if="!hasBackdrop" :class="s.posterFill">
      <img
        v-if="movie.poster_path"
        :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
        :alt="movie.title"
        :class="s.posterFillImg"
      />
    </div>

    <!-- Tier 2: backdrop image (always rendered, hidden when video is loaded) -->
    <img
      v-if="movie.backdrop_path"
      :src="`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`"
      :alt="movie.title"
      :class="[s.backdropImg, trailerLoaded && s.backdropImgHidden]"
    />

    <!-- Tier 1: YouTube background video -->
    <div v-if="movie.trailer_youtube_id" ref="youtubeEl" :class="s.youtubePlayer" />

    <!-- Overlay gradient -->
    <div :class="s.overlay" />

    <!-- Mute toggle (only once video is playing) -->
    <button
      v-if="trailerLoaded"
      :class="s.muteBtn"
      @click="toggleMute"
      :aria-label="muted ? 'Unmute trailer' : 'Mute trailer'"
    >
      <!-- Speaker with sound waves -->
      <svg v-if="!muted" width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9.41 3.24a1 1 0 0 1 .59.92v11.68a1 1 0 0 1-1.66.75L4.12 13H2a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.12l4.22-3.59a1 1 0 0 1 1.07-.17z"/>
        <path d="M15.07 5.07a7 7 0 0 1 0 9.86M12.54 7.54a3.5 3.5 0 0 1 0 4.92" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      </svg>
      <!-- Speaker muted (X) -->
      <svg v-else width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9.41 3.24a1 1 0 0 1 .59.92v11.68a1 1 0 0 1-1.66.75L4.12 13H2a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.12l4.22-3.59a1 1 0 0 1 1.07-.17z"/>
        <line x1="14" y1="7" x2="20" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="20" y1="7" x2="14" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>

  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { usePlayer } from '@vue-youtube/core'

const props = defineProps({
  movie: { type: Object, required: true },
})

const hasBackdrop = !!props.movie.backdrop_path

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
  : { instance: ref(null), onReady: () => {} }

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
    try { instance.value.destroy() } catch {}
  }
})
</script>

<style module="s">
.hero {
  position: relative;
  height: 260px;
  overflow: hidden;
  background: var(--color-bg-surface);
}

.heroFallback {
  height: 200px;
}

@container (min-width: 600px) {
  .hero {
    height: 400px;
  }
  .heroFallback {
    height: 300px;
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
  filter: blur(32px) brightness(0.5) saturate(1.4);
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

/* Tier 1: YouTube player */
.youtubePlayer {
  position: absolute;
  /* Oversized to hide letterboxing */
  top: 50%;
  left: 50%;
  width: 177.78vh; /* 16:9 based on height */
  height: 56.25vw; /* 16:9 based on width */
  min-width: 100%;
  min-height: 100%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* Gradient overlay */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    transparent 40%,
    var(--color-bg-base) 100%
  );
  pointer-events: none;
}

/* Mute toggle */
.muteBtn {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  backdrop-filter: blur(8px);
  transition: background var(--transition-fast);
  z-index: 2;
}

.muteBtn:hover {
  background: rgba(0, 0, 0, 0.7);
}
</style>
