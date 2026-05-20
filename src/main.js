import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createManager } from '@vue-youtube/core'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { useUserMoviesStore } from '@/stores/userMovies'
import { useMoviesStore } from '@/stores/movies'
import { useRequestsStore } from '@/stores/requests'
import '@/assets/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(createManager())

const auth = useAuthStore()
const movies = useMoviesStore()

auth.init().then(() => {
    if (auth.user) {
        const userMovies = useUserMoviesStore()
        userMovies.fetchUserMovies(auth.user.id)
        userMovies.fetchAllUserMovies()
        auth.fetchAllProfiles()
        useRequestsStore().fetchRequests()
    }
    app.mount('#app')
})

movies.fetchMovies()
