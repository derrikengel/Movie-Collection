<template>
  <div :class="s.list">
    <h1 :class="s.title">{{ title }}</h1>

    <p v-if="movies.length === 0" :class="s.empty">Nothing here yet.</p>

    <div :class="s.grid">
      <article v-for="movie in movies" :key="movie.id" :class="s.card">
        <RouterLink :to="`/${movie.slug}`" :class="s.cardLink">
          <div :class="s.poster">
            <img
              v-if="movie.poster_path"
              :src="`https://image.tmdb.org/t/p/w300${movie.poster_path}`"
              :alt="movie.title"
              loading="lazy"
            />
            <div v-else :class="s.posterPlaceholder">
              <span>{{ movie.title }}</span>
            </div>
          </div>
          <div :class="s.info">
            <h2 :class="s.movieTitle">{{ movie.title }}</h2>
            <p :class="s.meta">{{ movie.year }}</p>
          </div>
        </RouterLink>
      </article>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  movies: {
    type: Array,
    default: () => [],
  },
})
</script>

<style module="s">
.list {
  container-type: inline-size;
  padding: var(--content-padding);
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
}

.empty {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-4);
}

@container (min-width: 480px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@container (min-width: 720px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

.cardLink {
  display: block;
  color: inherit;
}

.poster {
  aspect-ratio: 2 / 3;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--space-2);
  transition: opacity var(--transition-fast);
}

.cardLink:hover .poster {
  opacity: 0.85;
}

.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.posterPlaceholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
  font-size: var(--text-xs);
  text-align: center;
  color: var(--color-text-muted);
}

.movieTitle {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-snug);
  margin-bottom: var(--space-1);
  color: var(--color-text-primary);
}

.meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
