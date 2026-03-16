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

All tokens live in `src/assets/global.css` in a two-layer architecture:

**Layer 1 — Primitives** (raw scale values, not used directly in components):
```css
--gray-950: oklch(var(--l-950) calc(var(--gray-c) * var(--c-950)) calc(var(--gray-h) + var(--gray-hue-dir) * var(--arc-950)));
--amber-400: oklch(var(--l-400) calc(var(--amber-c) * var(--c-400)) calc(var(--amber-h) + var(--amber-hue-dir) * var(--arc-400)));
--size-4: 16px;
--radius-md: 12px;
```

**Layer 2 — Semantic tokens** (these are what components use):
```css
--color-bg: var(--gray-950);
--color-text: var(--sand-50);
--color-accent: var(--amber-400);
```

Always use semantic tokens in components, never primitives or hardcoded values:
```css
/* ✅ correct */
padding: var(--size-4);
color: var(--color-text);
border-radius: var(--radius-md);
background: var(--color-surface);

/* ❌ wrong */
padding: 16px;
color: #f0efe9;
background: var(--gray-900);
```

All colors are in oklch format. Use relative color syntax for opacity variants — no hardcoded rgba:
```css
/* ✅ correct — derives alpha from the token */
background: oklch(from var(--gray-950) l c h / 0.85);
color: oklch(from var(--amber-400) l c h / 0.12);

/* ✅ also correct — semantic tokens for common cases */
background: var(--color-bg-frosted);
background: var(--color-accent-subtle);

/* ❌ wrong */
background: rgba(13, 13, 15, 0.85);
```

### Semantic token reference
```css
/* Surfaces */
--color-bg, --color-surface, --color-surface-raised, --color-overlay

/* Text */
--color-text, --color-text-secondary, --color-text-muted, --color-text-on-accent

/* Borders */
--color-border, --color-border-subtle, --color-border-strong

/* Accent (amber) */
--color-accent, --color-accent-bright, --color-accent-muted
--color-accent-subtle   /* accent at 12% opacity */
--color-accent-glow     /* accent at 40% opacity */

/* Status */
--color-success, --color-error, --color-warning

/* Frosted glass */
--color-bg-frosted      /* bg at 85% opacity */
--color-border-frosted  /* white at 6% opacity */

/* Interaction */
--color-bg-hover        /* white at 5% opacity */
--color-backdrop        /* black at 50% opacity */

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg
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
@media (min-width: 60rem) {
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
