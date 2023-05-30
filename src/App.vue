<script setup>
    import { RouterLink, RouterView } from 'vue-router'
</script>


<template>
    <header>
        <nav>
            <RouterLink to="/">Movie Collection</RouterLink>
            <RouterLink to="/add">Add a Movie</RouterLink>
        </nav>
    </header>

    <RouterView />
</template>


<style scoped></style>