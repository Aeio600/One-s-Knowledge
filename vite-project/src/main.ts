import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import * as echarts from 'echarts'
import "@/assets/style/common.scss"
import "@/assets/style/flex.scss"
import "@/assets/style/animation.scss"
import '@/assets/style/var.scss'

const app = createApp(App)


app.use(echarts as any)
app.use(router).mount('#app')
