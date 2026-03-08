<template>
  <div class="app">
    <header class="app-header">
      <nav class="app-nav">
        <RouterLink to="/" class="nav-brand">Movies</RouterLink>
        <div class="nav-actions">
          <template v-if="auth.user">
            <RouterLink to="/lists">Lists</RouterLink>
            <RouterLink v-if="auth.isAdmin" to="/admin/add">Add</RouterLink>
            <button @click="handleLogout">Sign out</button>
          </template>
          <template v-else>
            <RouterLink to="/login">Sign in</RouterLink>
          </template>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 56px;
}

.nav-brand {
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  color: inherit;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-actions a {
  text-decoration: none;
  color: inherit;
  font-size: 0.9rem;
}

.nav-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.app-main {
  flex: 1;
}
</style>
