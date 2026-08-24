<template>
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ eq.dailyPrice }}</td>
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
import { supabase } from '../utils/supabase'

const equipments = ref([])

onMounted(async () => {
  try {
    const { data, error } = await supabase.from('equipments').select('*')
    if (error) throw error
    equipments.value = data
  } catch (error) {
    console.error('Error fetching equipments:', error)
  }
})
</script>