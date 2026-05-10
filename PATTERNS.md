# Patterns & Conventions

Reference for consistent code patterns used throughout this project.

---

## Vue Component Structure

Every component follows this order:
```vue
<template>
  <!-- markup -->
</template>

<script setup>
// imports
// props/emits
// store access
// refs/computed
// functions
</script>

<style module="s">
/* styles */
</style>
```

No TypeScript. No Options API. Composition API with `<script setup>` only.

---

## CSS Modules

**Always** use `module="s"`:
```vue
<style module="s">
.myClass { ... }
</style>
```

Access in template:
```vue
<div :class="s.myClass">
<div :class="[s.base, isActive && s.active]">
<div :class="{ [s.active]: isActive }">
```

Class names are **camelCase** — required for JS property access without bracket notation.

---

## CSS Formatting

- **One space** between property and value — never align values in columns
- No trailing whitespace

```css
/* ✅ correct */
--gray-hue: 265;
--amber-hue: 75;
background: var(--color-surface);

/* ❌ wrong — column-aligned */
--gray-hue:  265;
--amber-hue:  75;
background:  var(--color-surface);
```

---

## Design Token Usage

All tokens live in `src/assets/global.css`. The app uses **primitives directly** in most cases — the strict two-layer semantic abstraction (surface/text/border) is being phased out.

**Primitives** (color scales, spacing, radius, typography — use these directly in components):
```css
--blue-50 through --blue-950   /* main palette */
--green-*, --red-*, --yellow-*, --purple-*
--size-1 through --size-24     /* 0.25rem increments */
--radius-xs through --radius-full
--text-2xs through --text-9xl
```

**Semantic tokens** (pre-composed values worth naming — use these where they apply):
```css
/* Frosted glass */
--color-bg-frosted              /* blue-800 at 85% opacity */
--color-bg-frosted-subtle       /* blue-950 at 50% opacity */
--color-bg-frosted-dark         /* blue-950 at 85% opacity */
--color-divider-frosted         /* blue-400 at 10% opacity */
--color-bg-frosted-selected     /* blue-400 at 20% opacity */
--color-bg-frosted-unselected   /* blue-950 at 20% opacity */
--color-bg-frosted-hover        /* blue-950 at 50% opacity */
--color-border-frosted          /* blue-50 at 8% opacity */
--color-border-frosted-strong   /* blue-50 at 16% opacity */
--color-frosted-input           /* blue-950 at 50% opacity */
--color-frosted-input-focus     /* blue-950 at 75% opacity */

/* Frosted blur values */
--bg-frosted-xs through --bg-frosted-6xl   /* blur(0.25rem) … blur(10rem) */

/* Status */
--color-success     /* green-400 */
--color-error       /* red-400 */
--color-warning     /* red-400 */

/* Toast */
--color-toast-bg, --color-toast-text, --color-toast-text-secondary, --color-toast-text-muted

/* List context (set by .list-watched / .list-watchlist / .list-favorite / .list-ignored) */
--color-list-50 through --color-list-950

/* Shadows */
--shadow-2xs, --shadow-xs, --shadow-sm, --shadow-md, --shadow-lg, --shadow-xl, --shadow-2xl
--text-shadow-2xs through --text-shadow-lg

/* Transitions */
--transition-fast, --transition-normal, --transition-slow
```

Use primitives directly for one-off values; reach for a semantic token when it captures the intent:
```css
/* ✅ correct */
background: var(--blue-950);
color: var(--blue-200);
padding: var(--size-4);
background: var(--color-bg-frosted);
box-shadow: var(--shadow-md);

/* ❌ wrong — hardcoded values */
padding: 16px;
color: #e0e8ff;
background: rgba(13, 13, 15, 0.85);
```

All colors are in oklch format. Use relative color syntax for opacity variants — no hardcoded rgba:
```css
/* ✅ correct */
background: oklch(from var(--blue-950) l c h / 0.85);
border-color: oklch(from var(--blue-50) l c h / 0.08);

/* ❌ wrong */
background: rgba(13, 13, 15, 0.85);
```

---

## Responsive Layout

Use **container queries** inside components, **media queries** for global layout only:

```css
/* Inside a component — container query */
@container (min-width: 600px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* Global layout in App.vue — media query is fine */
@media (min-width: 64rem) {
  .desktopNav { display: flex; }
}
```

The root `.page` or outermost wrapper in a view should always have:
```css
.page {
  container-type: inline-size;
}
```

---

## Modern HTML — Prefer Native Features

Use native browser APIs over custom JS implementations where possible:

- **Popover API** for dropdowns, tooltips, and non-modal overlays
- **`<dialog>`** for true modal dialogs (blocks interaction, handles focus trap)
- **`<details>`/`<summary>`** for collapsible sections (where animation isn't required)

### Popover API

`popover="auto"` gives you click-outside-to-close and mutual exclusion (only one open at a time) for free:

```html
<!-- Trigger -->
<button popovertarget="my-popover">Open</button>

<!-- Popover panel -->
<div id="my-popover" popover="auto" :class="s.panel">...</div>
```

Pair with **CSS Anchor Positioning** to position the panel relative to its trigger — no JS needed:

```css
/* Trigger button gets an anchor name */
.triggerBtn { anchor-name: --my-anchor; }

/* Panel attaches to it */
.panel {
  position-anchor: --my-anchor;
  position-area: bottom span-left; /* aligns panel below, left-aligned */
  margin-top: var(--size-2);      /* gap from trigger */

  /* Reset popover UA styles */
  margin-inline: 0;
  inset: auto;
  border: 1px solid var(--color-border);
}
```

Use CSS `:has()` with `:popover-open` to style the trigger when its panel is open — no JS state needed:

```css
/* Rotate a chevron icon when the sibling popover is open */
.triggerBtn:has(+ .panel:popover-open) .chevron {
  transform: rotate(180deg);
}
```

Anchor names are global CSS idents — use descriptive, namespaced names (e.g. `--filter-genre`, `--filter-year`).

---

## Fixed/Sticky Positioning + backdrop-filter

**Critical pattern:** `backdrop-filter` on an ancestor creates a containing block for `position: fixed` children, trapping them. Always teleport overlays to body:

```vue
<Teleport to="body">
  <Transition name="fade">
    <div v-if="open" class="backdrop" @click="open = false" />
  </Transition>
  <Transition name="sheet">
    <div v-if="open" class="sheet">...</div>
  </Transition>
</Teleport>
```

Global transition classes (must be in a non-scoped `<style>` block or global.css):
```css
.sheet-enter-active, .sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
```

---

## Pinia Stores

All stores use the Composition API style (not options):
```js
export const useMyStore = defineStore('name', () => {
  const thing = ref(null)
  const computed = computed(() => ...)
  async function doSomething() { ... }
  return { thing, computed, doSomething }
})
```

---

## Optimistic Updates Pattern (userMovies store)

```js
// 1. Save current value
const currentValue = existing?.[field] ?? false
// 2. Apply optimistic update locally
existing[field] = newValue
// 3. Write to Supabase
const { error } = await supabase.from('user_movies').upsert(...)
// 4. Rollback on failure
if (error) {
  existing[field] = currentValue
  throw error
}
```

---

## RouterLink with CSS Modules active class

Vue Router's `:active-class` prop accepts a string class name. With CSS Modules, the hashed name must be passed dynamically:

```vue
<RouterLink to="/" :class="s.navLink" :active-class="s.navLinkActive">
```

---

## Icon Pattern

Icons are inline SVG strings in component data, rendered with `v-html`:
```vue
<span v-html="tab.icon" aria-hidden="true" />
```

Always add `aria-hidden="true"` to decorative icons. Add `aria-label` to the parent button.

---

## Admin-Only UI

Check `auth.isAdmin` from `useAuthStore()`:
```vue
<RouterLink v-if="auth.isAdmin" to="/admin/edit/...">Edit</RouterLink>
```

Route guards in `router/index.js` handle redirect, but always conditionally render admin UI too.

---

## TMDB Image URLs

```js
// Poster (movie cards, small)
`https://image.tmdb.org/t/p/w300${movie.poster_path}`

// Poster (detail page)
`https://image.tmdb.org/t/p/w500${movie.poster_path}`

// Backdrop / hero
`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`

// Thumbnail (profile previews, TMDB search results)
`https://image.tmdb.org/t/p/w92${movie.poster_path}`
```

---

## Supabase Query Pattern

```js
const { data, error } = await supabase
  .from('movies')
  .select('*, movie_services(*)')
  .order('title')

if (error) {
  // handle error
} else {
  // use data
}
```

For upserts (user_movies):
```js
await supabase
  .from('user_movies')
  .upsert(
    { user_id, movie_id, [field]: newValue, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,movie_id' }
  )
```
