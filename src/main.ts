import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'vue3-ts-picker/dist/vue3-ts-picker.css'
createApp(App).use(store).use(router).mount('#app')
