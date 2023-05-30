<script setup>
    import { ref } from 'vue'
    import { useRoute } from 'vue-router'

    const route = useRoute();
    const mode = ref(route.name);

    // if editing, get the current movie
</script>

<template>
    <div>
        <h1>{{ mode === 'add' ? 'Add Movie' : 'Edit Movie' }}</h1>
    </div>
</template>

<style scoped>
</style>
