<template>
    <img :src="src" alt="" :class="s.avatar" :title="user" />
</template>

<script setup>
    import { computed } from 'vue'

    const props = defineProps({
        avatar: { type: String, default: null },
        user: { type: String, default: null },
    })

    const modules = import.meta.glob('@/assets/images/avatar-*.svg', { eager: true, import: 'default' })
    const avatarMap = Object.fromEntries(
        Object.entries(modules).map(([path, url]) => [
            path.replace(/.*\/(avatar-\d+)\.svg$/, '$1'),
            url,
        ])
    )

    const src = computed(() => avatarMap[props.avatar ?? 'avatar-01'] ?? avatarMap['avatar-01'])
</script>

<style module="s">
    .avatar {
        aspect-ratio: 1;
        border-radius: var(--radius-full);
        display: block;
        flex-shrink: 0;
        height: 1em;
        object-fit: cover;
        width: 1em;
    }
</style>
