import Vue from 'vue'
import myRouter from './myRouter'
import About from './components/About.vue'
import Home from './components/Home.vue'

// 插件注册
Vue.use(myRouter)

export default new myRouter({
  routes: [
    {path: "/", component: Home},
    {path: "/about", component: About}
  ]
})