<template>
    <div :class="s.page">
        <h1 :class="s.heading">Style Guide</h1>

        <section :class="s.section">
            <h2 :class="s.sectionHeading">Color Palettes</h2>

            <div v-for="palette in palettes" :key="palette.name" :class="s.palette">
                <h3 :class="s.paletteLabel">{{ palette.name }}</h3>
                <div :class="s.swatches">
                    <div v-for="step in steps" :key="step" :class="s.swatch"
                        :style="{ background: `var(--${palette.name}-${step})` }">
                        <span :class="s.swatchLabel">{{ step }}</span>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    const palettes = [
        { name: 'blue' },
        { name: 'purple' },
        { name: 'red' },
        { name: 'yellow' },
        { name: 'green' }
    ]

    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
</script>

<style module="s">
    .page {
        container-type: inline-size;
        margin-inline: auto;
        max-width: var(--content-width);
    }

    .heading {
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
        margin-bottom: var(--size-8);
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: var(--size-6);
    }

    .sectionHeading {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-secondary);
        margin-bottom: var(--size-2);
    }

    .palette {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .paletteLabel {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-muted);
        text-transform: capitalize;
    }

    .swatches {
        display: grid;
        grid-template-columns: repeat(11, 1fr);
        border-radius: var(--radius-md);
        overflow: hidden;
    }

    .swatch {
        aspect-ratio: 1;
        display: flex;
        align-items: flex-end;
        padding: var(--size-1);
    }

    .swatchLabel {
        color: oklch(100% 0 0 / 0.65);
        font-weight: var(--font-weight-medium);
        font-size: var(--text-xs);
    }

    @container (max-width: 600px) {
        .swatches {
            grid-template-columns: repeat(6, 1fr);
        }
    }
</style>
