import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Markdown from 'vue3-markdown-it';

createApp(App)
  // .use(Markdown)
  .component('Markdown', Markdown)
  .mount('#app')
