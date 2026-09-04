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

    <!-- Secciones de Gráficas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Gráfica de Ingresos -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-700 text-lg font-semibold mb-4">Ingresos (Últimos 6 Meses)</h3>
        <div class="h-72">
          <Bar v-if="chartsLoaded" :data="incomeChartData" :options="chartOptions" />
          <div v-else class="h-full flex items-center justify-center text-gray-400">Cargando...</div>
        </div>
      </div>

      <!-- Gráfica de Estado de Rentas -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-700 text-lg font-semibold mb-4">Estado de Rentas</h3>
        <div class="h-72 flex justify-center">
          <Pie v-if="chartsLoaded" :data="statusChartData" :options="pieChartOptions" />
          <div v-else class="h-full flex items-center justify-center text-gray-400">Cargando...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../utils/supabase'

import { Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const stats = ref({ activeRentals: 0, pendingReturns: 0, maintenanceEquip: 0, currentMonthIncome: 0 })

// Gráficas config
const chartsLoaded = ref(false)

const incomeChartData = ref({
  labels: [],
  datasets: []
})

const statusChartData = ref({
  labels: [],
  datasets: []
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
}

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

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

      // Procesar datos para gráfica de ingresos (Últimos 6 meses)
      const monthsLabel = []
      const incomeData = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = d.toLocaleString('es-ES', { month: 'short' }).toUpperCase()
        monthsLabel.push(monthStr)
        
        const yyyy = String(d.getFullYear())
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const prefix = `${yyyy}-${mm}`
        
        const monthIncome = rentals
          .filter(r => r.start_date && r.start_date.startsWith(prefix) && r.status !== 'CANCELADA')
          .reduce((sum, r) => sum + (Number(r.total_price) || 0), 0)
          
        incomeData.push(monthIncome)
      }

      incomeChartData.value = {
        labels: monthsLabel,
        datasets: [
          {
            label: 'Ingresos ($)',
            backgroundColor: '#4f46e5', // Indigo-600
            borderRadius: 4,
            data: incomeData
          }
        ]
      }

      // Procesar datos para gráfica de estado
      const statusCounts = { 'CONFIRMADA': 0, 'PENDIENTE': 0, 'DEVUELTO': 0, 'CANCELADA': 0 }
      rentals.forEach(r => {
        const status = r.status || 'OTRO'
        if (statusCounts[status] !== undefined) statusCounts[status]++
        else statusCounts[status] = 1
      })

      // Limpiar estados que no queremos o sumar si son muchos
      const labelsStatus = Object.keys(statusCounts).filter(k => statusCounts[k] > 0)
      const dataStatus = labelsStatus.map(k => statusCounts[k])
      
      const colorsMap = {
        'CONFIRMADA': '#4ade80', // green-400
        'PENDIENTE': '#fbbf24', // amber-400
        'DEVUELTO': '#60a5fa', // blue-400
        'CANCELADA': '#f87171', // red-400
        'OTRO': '#9ca3af' // gray-400
      }

      statusChartData.value = {
        labels: labelsStatus,
        datasets: [
          {
            backgroundColor: labelsStatus.map(l => colorsMap[l] || colorsMap['OTRO']),
            data: dataStatus
          }
        ]
      }
      
      chartsLoaded.value = true
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