
<template>
  <div>
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Resumen general de RentaEventos
        </p>
      </div>

      <button
        @click="fetchDashboard"
        :disabled="loading"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow disabled:opacity-50"
      >
        {{ loading ? 'Actualizando...' : 'Actualizar datos' }}
      </button>
    </div>

    <!-- Mensaje de error -->
    <div
      v-if="loadError"
      class="bg-red-50 text-red-700 rounded p-4 mb-6"
      role="alert"
    >
      {{ loadError }}
    </div>

    <!-- Tarjetas de estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

      <!-- Rentas activas -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">
          Rentas Activas
        </h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">
          {{ stats.activeRentals }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          Equipos actualmente rentados
        </p>
      </div>

      <!-- Ingresos -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">
          Valor de Rentas del Mes
        </h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">
          {{ money(stats.currentMonthIncome) }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          No incluye rentas canceladas
        </p>
      </div>

      <!-- Devoluciones atrasadas -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">
          Devoluciones Atrasadas
        </h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">
          {{ stats.pendingReturns }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          Rentas activas fuera de fecha
        </p>
      </div>

      <!-- Equipos agotados -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">
          Equipos Agotados
        </h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">
          {{ stats.outOfStock }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          Tipos de equipos con stock en cero
        </p>
      </div>

      <!-- Mantenimiento -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">
          Equipos en Mantenimiento
        </h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">
          {{ stats.maintenanceEquip }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          Equipos marcados como mantenimiento
        </p>
      </div>

      <!-- Total de clientes -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <h3 class="text-gray-500 text-sm font-medium uppercase">
          Clientes Registrados
        </h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">
          {{ stats.totalClients }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          Clientes en la base de datos
        </p>
      </div>
    </div>

    <!-- Gráficas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

      <!-- Gráfica de ingresos -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-700 text-lg font-semibold mb-4">
          Valor de Rentas (Últimos 6 Meses)
        </h3>

        <div class="h-72">
          <Bar
            v-if="chartsLoaded"
            :data="incomeChartData"
            :options="chartOptions"
          />

          <div
            v-else
            class="h-full flex items-center justify-center text-gray-400"
          >
            {{ loading ? 'Cargando...' : 'Sin datos disponibles' }}
          </div>
        </div>
      </div>

      <!-- Gráfica de estados -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-700 text-lg font-semibold mb-4">
          Estado de Rentas
        </h3>

        <div class="h-72 flex justify-center">
          <Pie
            v-if="chartsLoaded && statusChartData.labels.length"
            :data="statusChartData"
            :options="pieChartOptions"
          />

          <div
            v-else
            class="h-full flex items-center justify-center text-gray-400"
          >
            Sin rentas registradas
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de alertas -->
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <div class="px-6 py-4 border-b">
        <h3 class="text-xl font-semibold text-gray-800">
          Alertas de Devoluciones
        </h3>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs text-gray-500 uppercase">
              ID de renta
            </th>
            <th class="px-6 py-3 text-left text-xs text-gray-500 uppercase">
              Fecha esperada
            </th>
            <th class="px-6 py-3 text-left text-xs text-gray-500 uppercase">
              Días de atraso
            </th>
            <th class="px-6 py-3 text-left text-xs text-gray-500 uppercase">
              Estado
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="rental in overdueRentals"
            :key="rental.id"
          >
            <td class="px-6 py-4 text-sm">
              {{ rental.id }}
            </td>

            <td class="px-6 py-4 text-sm">
              {{ rental.end_date }}
            </td>

            <td class="px-6 py-4 text-sm text-red-600 font-semibold">
              {{ daysOverdue(rental.end_date) }}
            </td>

            <td class="px-6 py-4">
              <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                Atrasada
              </span>
            </td>
          </tr>

          <tr v-if="overdueRentals.length === 0">
            <td
              colspan="4"
              class="px-6 py-8 text-center text-gray-500"
            >
              No hay devoluciones atrasadas.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-xs text-gray-400 mt-4">
      Última actualización: {{ lastUpdated || 'Sin actualizar' }}
    </p>
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
)

// Estadísticas
const stats = ref({
  activeRentals: 0,
  currentMonthIncome: 0,
  pendingReturns: 0,
  outOfStock: 0,
  maintenanceEquip: 0,
  totalClients: 0
})

const loading = ref(false)
const loadError = ref('')
const lastUpdated = ref('')
const chartsLoaded = ref(false)
const overdueRentals = ref([])

// Estados activos válidos
const ACTIVE_STATUSES = ['ACTIVA', 'CONFIRMADA']

const incomeChartData = ref({
  labels: [],
  datasets: []
})

const statusChartData = ref({
  labels: [],
  datasets: []
})

// Opciones de Chart.js
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

// Formato monetario
const money = value => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(Number(value) || 0)
}

// Fecha local YYYY-MM-DD
const localDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Días de atraso
const daysOverdue = date => {
  if (!date || date >= localDate()) return 0

  const start = Date.parse(`${date}T12:00:00Z`)
  const end = Date.parse(`${localDate()}T12:00:00Z`)

  return Math.max(0, Math.round((end - start) / 86400000))
}

// Cargar información del Dashboard
const fetchDashboard = async () => {
  if (loading.value) return

  loading.value = true
  loadError.value = ''
  chartsLoaded.value = false

  try {
    // Consultar datos desde Supabase
    const [
      rentalsResult,
      equipmentsResult,
      clientsResult
    ] = await Promise.all([
      supabase
        .from('rentals')
        .select('id, start_date, end_date, total_price, status'),

      supabase
        .from('equipments')
        .select('id, quantity, status'),

      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
    ])

    if (rentalsResult.error) throw rentalsResult.error
    if (equipmentsResult.error) throw equipmentsResult.error
    if (clientsResult.error) throw clientsResult.error

    const rentals = rentalsResult.data || []
    const equipments = equipmentsResult.data || []

    const currentDate = localDate()
    const currentMonth = currentDate.slice(0, 7)

    // Rentas activas
    const activeRentals = rentals.filter(
      rental => ACTIVE_STATUSES.includes(rental.status)
    )

    stats.value.activeRentals = activeRentals.length

    // Rentas con devolución atrasada
    overdueRentals.value = activeRentals
      .filter(rental =>
        rental.end_date &&
        rental.end_date < currentDate
      )
      .sort((a, b) => a.end_date.localeCompare(b.end_date))

    stats.value.pendingReturns = overdueRentals.value.length

    // Valor de rentas del mes
    // No es necesariamente dinero cobrado
    stats.value.currentMonthIncome = rentals
      .filter(rental =>
        rental.start_date?.startsWith(currentMonth) &&
        rental.status !== 'CANCELADA'
      )
      .reduce(
        (total, rental) =>
          total + (Number(rental.total_price) || 0),
        0
      )

    // Equipos con cantidad cero
    stats.value.outOfStock = equipments.filter(
      eq => Number(eq.quantity) === 0
    ).length

    // Equipos en mantenimiento
    stats.value.maintenanceEquip = equipments.filter(
      eq => eq.status === 'MANTENIMIENTO'
    ).length

    // Clientes registrados
    stats.value.totalClients = clientsResult.count || 0

    // Gráfica últimos seis meses
    const monthsLabels = []
    const incomeValues = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      )

      const monthLabel = date.toLocaleDateString('es-MX', {
        month: 'short',
        year: 'numeric'
      })

      const monthPrefix = localDate(date).slice(0, 7)

      const monthTotal = rentals
        .filter(rental =>
          rental.start_date?.startsWith(monthPrefix) &&
          rental.status !== 'CANCELADA'
        )
        .reduce(
          (total, rental) =>
            total + (Number(rental.total_price) || 0),
          0
        )

      monthsLabels.push(monthLabel)
      incomeValues.push(monthTotal)
    }

    incomeChartData.value = {
      labels: monthsLabels,
      datasets: [
        {
          label: 'Valor de rentas ($)',
          backgroundColor: '#4f46e5',
          borderRadius: 4,
          data: incomeValues
        }
      ]
    }

    // Gráfica de estados
    const stateCounts = {}

    rentals.forEach(rental => {
      const status = rental.status || 'SIN ESTADO'

      stateCounts[status] = (stateCounts[status] || 0) + 1
    })

    const labels = Object.keys(stateCounts)

    const colorsMap = {
      ACTIVA: '#4ade80',
      CONFIRMADA: '#22c55e',
      PENDIENTE: '#fbbf24',
      COMPLETADA: '#60a5fa',
      CANCELADA: '#f87171',
      DEVUELTO: '#a78bfa'
    }

    statusChartData.value = {
      labels,
      datasets: [
        {
          data: labels.map(label => stateCounts[label]),
          backgroundColor: labels.map(
            label => colorsMap[label] || '#9ca3af'
          )
        }
      ]
    }

    chartsLoaded.value = true

    lastUpdated.value = new Date().toLocaleString('es-MX')

  } catch (error) {
    console.error('Error cargando Dashboard:', error)

    loadError.value =
      'No se pudieron actualizar las estadísticas: ' +
      error.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)
</script>
