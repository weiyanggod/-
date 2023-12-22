import { createRouter, createWebHashHistory } from 'vue-router'
const index = () => import('../views/indexPage.vue')
const routes = [
  {
    path: '/',
    name: 'index',
    component: index
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
