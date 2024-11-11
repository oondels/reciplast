import DashBoard from '@/views/DashBoard.vue'
import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Início',
    component: HomeView
  },
  {
    path: '/dashboard',
    name: 'Gerenciamento',
    component: DashBoard
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
