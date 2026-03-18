import { createApp } from 'vue'
import { Quasar, Notify, LocalStorage } from 'quasar'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia } from 'pinia'

import routes from './router/routes.js'

import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import quasarLang from 'quasar/lang/es'
import 'quasar/src/css/index.sass'

import App from './App.vue'

const app = createApp(App)

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

const pinia = createPinia()

app.use(Quasar, {
    plugins: {
        Notify,
        LocalStorage
    }, lang: quasarLang,
})

app.use(router)

app.use(pinia)

app.mount('#app')