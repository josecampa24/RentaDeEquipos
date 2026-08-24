const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const dirs = ['router', 'stores', 'views', 'components', 'utils'];
dirs.forEach(d => fs.mkdirSync(path.join(srcDir, d), { recursive: true }));

const files = {
  'src/style.css': `@import "tailwindcss";`,
  
  'src/main.js': `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')`,

  'src/App.vue': `<template>
  <router-view></router-view>
</template>

<script setup>
</script>`,

  'src/utils/api.js': `import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;`,

  'src/stores/auth.js': `import { defineStore } from 'pinia'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async login(email, password) {
      const res = await api.post('/auth/login', { email, password });
      this.user = res.data.user;
      this.token = res.data.token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
})`,

  'src/router/index.js': `import { createRouter, createWebHistory } from 'vue-router'
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

export default router`,

  'src/components/Layout.vue': `<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col">
      <div class="p-6 text-xl font-bold border-b border-gray-800 text-indigo-400">RentaEventos</div>
      <nav class="flex-1 px-4 py-6 space-y-2">
        <router-link to="/" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800" active-class="bg-gray-800 text-white">Dashboard</router-link>
        <router-link to="/equipments" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800" active-class="bg-gray-800 text-white">Equipos</router-link>
        <router-link to="/clients" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800" active-class="bg-gray-800 text-white">Clientes</router-link>
        <router-link to="/rentals" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800" active-class="bg-gray-800 text-white">Rentas</router-link>
        <router-link to="/returns" class="block px-4 py-2 rounded transition-colors hover:bg-gray-800" active-class="bg-gray-800 text-white">Devoluciones</router-link>
      </nav>
      <div class="p-4 border-t border-gray-800">
        <button @click="logout" class="w-full py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-colors">Cerrar Sesión</button>
      </div>
    </aside>
    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-auto">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>`,

  'src/views/Login.vue': `<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" type="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Contraseña</label>
          <input v-model="password" type="password" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
        </div>
        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Ingresar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@admin.com')
const password = ref('admin123')

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    alert('Login fallido')
  }
}
</script>`,

  'src/views/Dashboard.vue': `<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">Rentas Activas</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.activeRentals }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">Ingresos del Mes</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">\${{ stats.currentMonthIncome?.toFixed(2) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">Devoluciones Pendientes</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.pendingReturns }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">Equipos en Mantenimiento</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.maintenanceEquip }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'

const stats = ref({ activeRentals: 0, pendingReturns: 0, maintenanceEquip: 0, currentMonthIncome: 0 })

onMounted(async () => {
  try {
    const res = await api.get('/dashboard')
    stats.value = res.data
  } catch (error) {
    console.error(error)
  }
})
</script>`,

  'src/views/Equipments.vue': `<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Equipos</h1>
      <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow">+ Nuevo Equipo</button>
    </div>
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="eq in equipments" :key="eq.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ eq.sku }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ eq.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ eq.category }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="{'text-red-600 font-bold': eq.quantity === 0}">{{ eq.quantity }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${{ eq.dailyPrice }}</td>
          </tr>
          <tr v-if="equipments.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay equipos registrados</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'

const equipments = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/equipments')
    equipments.value = res.data
  } catch (error) {
    console.error(error)
  }
})
</script>`,

  'src/views/Clients.vue': `<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Clientes</h1>
    <div class="bg-white shadow rounded-lg p-6">
      <p class="text-gray-500">Módulo en construcción...</p>
    </div>
  </div>
</template>`,

  'src/views/Rentals.vue': `<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Rentas</h1>
    <div class="bg-white shadow rounded-lg p-6">
      <p class="text-gray-500">Módulo en construcción...</p>
    </div>
  </div>
</template>`,

  'src/views/Returns.vue': `<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Devoluciones</h1>
    <div class="bg-white shadow rounded-lg p-6">
      <p class="text-gray-500">Módulo en construcción...</p>
    </div>
  </div>
</template>`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filepath), content);
}
console.log('Frontend files created.');
