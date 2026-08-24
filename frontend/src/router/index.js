import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../components/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('../views/Dashboard.vue') },
      { path: 'equipments', component: () => import('../views/Equipments.vue') },
      { path: 'clients', component: () => import('../views/Clients.vue') },
      { path: 'rentals', component: () => import('../views/Rentals.vue') },
      { path: 'returns', component: () => import('../views/Returns.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login')
  } else if (to.path === '/login' && authStore.token) {
    next('/')
  } else {
    next()
  }
})

export default router