import DashBoard from '@/views/DashBoard.vue'
import HomeView from '@/views/HomeView.vue'
import RegistrosApp from '@/views/RegistrosApp.vue'
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
  },
  {
    path: '/registros',
    name: 'Registro Fabricação',
    component: RegistrosApp
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
