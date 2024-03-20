import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { socketInstance } from '@/js/Socket';
import Vue3Lottie from 'vue3-lottie'
const app = createApp(App);
app.config.globalProperties.$socketIo = socketInstance();
app.use(Vue3Lottie);
app.mount('#app');
