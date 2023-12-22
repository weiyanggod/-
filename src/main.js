import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// import DataV from '@dataview/datav-vue3'
// .use(DataV, { classNamePrefix: 'dv-' })
createApp(App).use(ElementPlus).use(router).mount('#app')
