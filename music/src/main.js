import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { socketInstance } from '@/js/Socket';
const app = createApp(App);
app.config.globalProperties.$socketIo = socketInstance();
app.mount('#app');
