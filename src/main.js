import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AmplifyVue from '@aws-amplify/ui-vue'

import './assets/main.css'
import './assets/tailwind.css'

const app = createApp(App)

app.use(router)
app.use(AmplifyVue)

app.mount('#app')
