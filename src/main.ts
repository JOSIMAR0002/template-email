import { createApp } from 'vue'
import { Quasar, Dialog, Notify } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import App from './App.vue'

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Dialog,
    Notify
  },
  config: {
    brand: {
      primary: '#1976D2',
      secondary: '#26A69A'
    }
  }
})

app.mount('#app')