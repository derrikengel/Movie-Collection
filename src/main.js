import './assets/main.css'

import { createManager } from '@vue-youtube/core'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.use(createManager())

app.mount('#movie-collection')