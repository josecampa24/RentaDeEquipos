<template>
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
</script>