import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Amplify } from 'aws-amplify'
import AmplifyVue from '@aws-amplify/ui-vue'

import './assets/main.css'
import './assets/tailwind.css'

Amplify.configure({
  Auth: {
    region: 'eu-west-1',
    userPoolId: 'eu-west-1_f2hONtpCB',
    userPoolWebClientId: '2bvhidnamaga9jg9n7qj2gsaap',
    mandatorySignIn: true
  }
})

const app = createApp(App)

app.use(router)
app.use(AmplifyVue)

app.mount('#app')
