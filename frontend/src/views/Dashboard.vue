<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">Rentas Activas</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.activeRentals }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">Ingresos del Mes</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">${{ stats.currentMonthIncome?.toFixed(2) }}</p>
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
import { supabase } from '../utils/supabase'

const stats = ref({ activeRentals: 0, pendingReturns: 0, maintenanceEquip: 0, currentMonthIncome: 0 })

onMounted(async () => {
  try {
    // Queries básicos usando Supabase
    const { count: activeRentals } = await supabase.from('rentals').select('*', { count: 'exact', head: true }).in('status', ['PENDIENTE', 'CONFIRMADA'])
    const { count: maintenanceEquip } = await supabase.from('equipments').select('*', { count: 'exact', head: true }).eq('status', 'MANTENIMIENTO')
    
    stats.value.activeRentals = activeRentals || 0
    stats.value.maintenanceEquip = maintenanceEquip || 0
    // pendingReturns y currentMonthIncome se pueden calcular sumando campos de los resultados en futuros updates
  } catch (error) {
    console.error('Error cargando stats de Supabase:', error)
  }
})
</script>