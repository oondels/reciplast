import DashBoard from '@/views/DashBoard.vue'
import HomeView from '@/views/HomeView.vue'
import Login from '@/views/Login.vue'
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
    component: DashBoard,
		meta: {requiresAuth: true}
  },
  {
    path: '/registros',
    name: 'Registro Fabricação',
    component: RegistrosApp,
		meta: {requiresAuth: true}
  },
  {
    path: '/login',
    name: 'Autenticação',
    component: Login,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
	const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
	const isAuthenticated = !!sessionStorage.getItem("token")

	if (requiresAuth && !isAuthenticated) {
		next('/login')
	} else {
		next()
	}
})

export default router
