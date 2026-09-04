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
        <h3 class="text-gray-500 text-sm font-medium uppercase">Equipos Agotados</h3>
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
    const { data: rentals, error: rentalsError } = await supabase.from('rentals').select('*')
    
    if (rentalsError) {
      console.error('Error fetching rentals:', rentalsError)
    }
    
    if (rentals) {
      stats.value.activeRentals = rentals.filter(r => r.status === 'CONFIRMADA' || r.status === 'PENDIENTE').length
      
      // Devoluciones pendientes son rentas activas cuya fecha final ya pasó
      stats.value.pendingReturns = rentals.filter(r => {
        if (r.status !== 'CONFIRMADA') return false
        if (!r.end_date) return false
        const end = new Date(r.end_date)
        end.setHours(23, 59, 59, 999)
        return new Date() > end
      }).length
      
      // Ingresos del mes (filtrando por año y mes usando strings para evitar problemas de zona horaria)
      const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0')
      const currentYearStr = String(new Date().getFullYear())
      const currentPrefix = `${currentYearStr}-${currentMonthStr}`
      
      stats.value.currentMonthIncome = rentals
        .filter(r => r.start_date && r.start_date.startsWith(currentPrefix))
        .reduce((sum, r) => sum + (Number(r.total_price) || 0), 0)
    }
    
    // Equipos sin stock (En lugar de mantenimiento, mostramos los que tienen stock agotado)
    const { count: outOfStock, error: eqError } = await supabase.from('equipments').select('*', { count: 'exact', head: true }).eq('quantity', 0)
    if (!eqError) {
      stats.value.maintenanceEquip = outOfStock || 0
    }
    
  } catch (error) {
    console.error('Error cargando stats de Supabase:', error)
  }
})
</script>