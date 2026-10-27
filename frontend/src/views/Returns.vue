
<template>
  <div class="space-y-8">
    <!-- Encabezado -->
    <header class="flex items-center justify-between gap-3">
      <h1 class="text-3xl font-bold text-gray-900">
        Rentas y Devoluciones
      </h1>

      <button
        @click="openNewRentalModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
      >
        + Nueva Renta
      </button>
    </header>

    <p
      v-if="loadError"
      role="alert"
      class="p-3 bg-red-50 text-red-700 rounded"
    >
      {{ loadError }}
    </p>

    <!-- RENTAS ACTIVAS -->
    <section class="bg-white shadow rounded-lg overflow-x-auto">
      <h2 class="text-xl font-semibold p-5 border-b">
        Rentas activas
      </h2>

      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-600">
          <tr>
            <th class="p-4">Cliente / ID</th>
            <th class="p-4">Equipos</th>
            <th class="p-4">Fechas</th>
            <th class="p-4">Total</th>
            <th class="p-4">Acción</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <tr
            v-for="rental in pendingRentals"
            :key="rental.id"
          >
            <td class="p-4">
              <strong>
                {{ rental.clients?.name || 'Sin cliente' }}
              </strong>

              <div class="text-xs text-gray-500">
                {{ rental.id }}
              </div>
            </td>

            <td class="p-4">
              <div
                v-for="item in rental.rental_items || []"
                :key="item.id"
              >
                {{ item.quantity }} ×
                {{ item.equipments?.name || 'Equipo' }}
              </div>
            </td>

            <td
              class="p-4"
              :class="isOverdue(rental.end_date)
                ? 'text-red-600 font-semibold'
                : ''"
            >
              {{ rental.start_date }} →
              {{ rental.end_date }}

              <span
                v-if="isOverdue(rental.end_date)"
                class="block"
              >
                Atrasado
              </span>
            </td>

            <td class="p-4">
              {{ money(rental.total_price) }}
            </td>

            <td class="p-4">
              <button
                @click="openReturnModal(rental)"
                class="text-indigo-700 bg-indigo-50 px-3 py-2 rounded"
              >
                Procesar devolución
              </button>
            </td>
          </tr>

          <tr v-if="!pendingRentals.length">
            <td
              colspan="5"
              class="p-8 text-center text-gray-500"
            >
              No hay rentas activas.
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- HISTORIAL -->
    <section class="bg-white shadow rounded-lg overflow-x-auto">
      <h2 class="text-xl font-semibold p-5 border-b">
        Historial de devoluciones (últimas 50)
      </h2>

      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-600">
          <tr>
            <th class="p-4">Cliente</th>
            <th class="p-4">Equipos</th>
            <th class="p-4">Fecha</th>
            <th class="p-4">Condición</th>
            <th class="p-4">Total de renta</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <tr
            v-for="ret in recentReturns"
            :key="ret.id"
          >
            <td class="p-4">
              {{ ret.rentals?.clients?.name || 'Sin cliente' }}
            </td>

            <td class="p-4">
              <div
                v-for="item in ret.rentals?.rental_items || []"
                :key="item.id"
              >
                {{ item.quantity }} ×
                {{ item.equipments?.name }}
              </div>
            </td>

            <td class="p-4">
              {{ new Date(ret.return_date).toLocaleString('es-MX') }}
            </td>

            <td class="p-4">
              {{ ret.condition }}

              <div
                v-if="ret.comments"
                class="text-xs text-gray-500"
              >
                {{ ret.comments }}
              </div>
            </td>

            <td class="p-4">
              {{ money(ret.rentals?.total_price) }}
            </td>
          </tr>

          <tr v-if="!recentReturns.length">
            <td
              colspan="5"
              class="p-8 text-center text-gray-500"
            >
              Sin devoluciones registradas.
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- MODAL NUEVA RENTA -->
    <div
      v-if="showNewRentalModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-xl"
      >
        <h2 class="text-xl font-bold mb-4">
          Registrar nueva renta
        </h2>

        <form
          @submit.prevent="saveRental"
          class="space-y-4"
        >
          <!-- Cliente -->
          <div>
            <label class="block text-sm font-medium">
              Cliente
            </label>

            <select
              v-model="rentalForm.client_id"
              required
              class="w-full mt-1 border rounded p-2"
            >
              <option value="" disabled>
                Selecciona un cliente
              </option>

              <option
                v-for="client in allClients"
                :key="client.id"
                :value="client.id"
              >
                {{ client.name }}
              </option>
            </select>
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium">
                Fecha de inicio
              </label>

              <input
                v-model="rentalForm.start_date"
                type="date"
                required
                class="w-full mt-1 border rounded p-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium">
                Fecha de fin
              </label>

              <input
                v-model="rentalForm.end_date"
                type="date"
                :min="rentalForm.start_date"
                required
                class="w-full mt-1 border rounded p-2"
              />
            </div>
          </div>

          <!-- Equipos -->
          <div class="space-y-3 border-t pt-4">
            <h3 class="font-semibold">
              Equipos de la renta
            </h3>

            <div
              v-for="(item, index) in rentalForm.items"
              :key="index"
              class="flex gap-2 items-end"
            >
              <div class="flex-1">
                <label class="block text-sm">
                  Equipo
                </label>

                <select
                  v-model="item.equipment_id"
                  required
                  class="w-full mt-1 border rounded p-2"
                >
                  <option value="" disabled>
                    Selecciona equipo
                  </option>

                  <option
                    v-for="eq in allEquipments.filter(
                      e => e.status !== 'INACTIVO' &&
                           e.status !== 'MANTENIMIENTO'
                    )"
                    :key="eq.id"
                    :value="eq.id"
                    :disabled="rentalForm.items.some(
                      (it, i) =>
                        i !== index &&
                        it.equipment_id === eq.id
                    )"
                  >
                    {{ eq.name }}
                    ({{ eq.quantity }} disponibles,
                    {{ money(eq.dailyPrice) }}/día)
                  </option>
                </select>
              </div>

              <div class="w-24">
                <label class="block text-sm">
                  Cantidad
                </label>

                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  step="1"
                  required
                  class="w-full mt-1 border rounded p-2"
                />
              </div>

              <button
                type="button"
                @click="removeItem(index)"
                :disabled="rentalForm.items.length === 1"
                class="text-red-600 p-2 disabled:opacity-40"
              >
                Quitar
              </button>
            </div>

            <button
              type="button"
              @click="addItem"
              class="text-indigo-700 font-medium"
            >
              + Agregar otro equipo
            </button>
          </div>

          <!-- Total -->
          <div class="text-right font-bold">
            {{ rentalDays }} día(s) —
            Total estimado: {{ money(calculatedTotal) }}
          </div>

          <p
            v-if="rentalError"
            role="alert"
            class="bg-red-50 text-red-700 p-3 rounded"
          >
            {{ rentalError }}
          </p>

          <div class="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              @click="showNewRentalModal = false"
              :disabled="isSavingRental"
              class="p-2"
            >
              Cancelar
            </button>

            <button
              type="submit"
              :disabled="isSavingRental"
              class="bg-indigo-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              {{ isSavingRental ? 'Guardando...' : 'Guardar renta' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DEVOLUCIÓN -->
    <div
      v-if="showReturnModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div class="bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
        <h2 class="text-xl font-bold mb-2">
          Devolución de {{ selectedRental?.clients?.name }}
        </h2>

        <p class="text-sm text-gray-600 mb-4">
          Esta operación devuelve la renta completa.
          La condición elegida se aplica a todos sus equipos.
        </p>

        <form
          @submit.prevent="processReturn"
          class="space-y-4"
        >
          <div>
            <label class="block text-sm font-medium">
              Condición de los equipos
            </label>

            <select
              v-model="returnForm.condition"
              required
              class="w-full border p-2 rounded mt-1"
            >
              <option value="BUENA">
                BUENA — vuelve al inventario
              </option>

              <option value="DAÑADA">
                DAÑADA — no vuelve al disponible
              </option>

              <option value="PERDIDA">
                PERDIDA — no vuelve al disponible
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium">
              Observaciones
            </label>

            <textarea
              v-model="returnForm.comments"
              rows="3"
              class="w-full border rounded p-2 mt-1"
            ></textarea>
          </div>

          <p
            v-if="returnError"
            role="alert"
            class="text-red-700 bg-red-50 p-3 rounded"
          >
            {{ returnError }}
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showReturnModal = false"
              :disabled="isSavingReturn"
            >
              Cancelar
            </button>

            <button
              type="submit"
              :disabled="isSavingReturn"
              class="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {{ isSavingReturn ? 'Procesando...' : 'Confirmar devolución' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../utils/supabase'

// Estados
const pendingRentals = ref([])
const recentReturns = ref([])
const allClients = ref([])
const allEquipments = ref([])

const loadError = ref('')
const rentalError = ref('')
const returnError = ref('')

const isSavingRental = ref(false)
const isSavingReturn = ref(false)

const showNewRentalModal = ref(false)
const showReturnModal = ref(false)
const selectedRental = ref(null)

const rentalForm = ref({
  client_id: '',
  start_date: '',
  end_date: '',
  items: []
})

const returnForm = ref({
  condition: 'BUENA',
  comments: ''
})

// Formato de dinero
const money = value =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(Number(value) || 0)

// Fecha local
const today = () => {
  const d = new Date()

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Sumar días
const addDays = (date, days) => {
  const d = new Date(`${date}T12:00:00`)
  d.setDate(d.getDate() + days)

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Renta atrasada
const isOverdue = date =>
  Boolean(date && date < today())

// Días de renta
const rentalDays = computed(() => {
  const { start_date, end_date } = rentalForm.value

  if (!start_date || !end_date || end_date < start_date) {
    return 0
  }

  const diff = (
    Date.parse(`${end_date}T12:00:00Z`) -
    Date.parse(`${start_date}T12:00:00Z`)
  ) / 86400000

  return Math.max(1, Math.round(diff))
})

// Total automático
const calculatedTotal = computed(() =>
  rentalDays.value * rentalForm.value.items.reduce(
    (sum, item) => {
      const eq = allEquipments.value.find(
        x => x.id === item.equipment_id
      )

      return sum +
        (Number(eq?.dailyPrice) || 0) *
        (Number(item.quantity) || 0)
    },
    0
  )
)

// Consultar información
async function fetchData() {
  loadError.value = ''

  try {
    const [
      rentals,
      returns,
      clients,
      equipments
    ] = await Promise.all([
      supabase
        .from('rentals')
        .select(
          '*, clients(name), rental_items(*, equipments(name))'
        )
        .in('status', ['ACTIVA', 'CONFIRMADA'])
        .order('end_date'),

      supabase
        .from('returns')
        .select(
          '*, rentals(*, clients(name), rental_items(*, equipments(name)))'
        )
        .order('return_date', { ascending: false })
        .limit(50),

      supabase
        .from('clients')
        .select('id, name')
        .order('name'),

      supabase
        .from('equipments')
        .select('id, name, quantity, dailyPrice, status')
        .order('name')
    ])

    for (const result of [
      rentals,
      returns,
      clients,
      equipments
    ]) {
      if (result.error) throw result.error
    }

    pendingRentals.value = rentals.data || []
    recentReturns.value = returns.data || []
    allClients.value = clients.data || []
    allEquipments.value = equipments.data || []

  } catch (err) {
    loadError.value =
      `No se pudo cargar la información: ${err.message}`
  }
}

// Abrir nueva renta
function openNewRentalModal() {
  rentalForm.value = {
    client_id: '',
    start_date: today(),
    end_date: addDays(today(), 1),
    items: [
      {
        equipment_id: '',
        quantity: 1
      }
    ]
  }

  rentalError.value = ''
  showNewRentalModal.value = true
}

// Agregar equipo
function addItem() {
  rentalForm.value.items.push({
    equipment_id: '',
    quantity: 1
  })
}

// Quitar equipo
function removeItem(index) {
  if (rentalForm.value.items.length > 1) {
    rentalForm.value.items.splice(index, 1)
  }
}

// Validar nueva renta
function validateRental() {
  const f = rentalForm.value

  if (!f.client_id) {
    return 'Selecciona un cliente.'
  }

  if (
    !f.start_date ||
    !f.end_date ||
    rentalDays.value < 1
  ) {
    return 'La fecha final no puede ser anterior a la inicial.'
  }

  if (!f.items.length) {
    return 'Agrega al menos un equipo.'
  }

  const ids = new Set()

  for (const item of f.items) {
    if (!item.equipment_id) {
      return 'Selecciona un equipo en cada fila.'
    }

    if (ids.has(item.equipment_id)) {
      return 'No puedes agregar el mismo equipo dos veces.'
    }

    ids.add(item.equipment_id)

    if (
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return 'La cantidad debe ser un entero positivo.'
    }

    const eq = allEquipments.value.find(
      x => x.id === item.equipment_id
    )

    if (!eq) {
      return 'Uno de los equipos ya no está disponible.'
    }

    if (
      ['INACTIVO', 'MANTENIMIENTO'].includes(eq.status)
    ) {
      return `El equipo ${eq.name} no está habilitado.`
    }

    if (item.quantity > Number(eq.quantity)) {
      return `Solo quedan ${eq.quantity} unidades de ${eq.name}.`
    }
  }

  return ''
}

// Guardar nueva renta
async function saveRental() {
  if (isSavingRental.value) return

  rentalError.value = validateRental()

  if (rentalError.value) return

  isSavingRental.value = true

  try {
    const { error } = await supabase.rpc(
      'create_rental_safe',
      {
        p_client_id: rentalForm.value.client_id,
        p_start_date: rentalForm.value.start_date,
        p_end_date: rentalForm.value.end_date,
        p_items: rentalForm.value.items.map(x => ({
          equipment_id: x.equipment_id,
          quantity: x.quantity
        }))
      }
    )

    if (error) throw error

    showNewRentalModal.value = false

    await fetchData()

    alert('Renta guardada correctamente.')

  } catch (err) {
    rentalError.value =
      `No se pudo crear la renta: ${err.message}`
  } finally {
    isSavingRental.value = false
  }
}

// Abrir devolución
function openReturnModal(rental) {
  selectedRental.value = rental

  returnForm.value = {
    condition: 'BUENA',
    comments: ''
  }

  returnError.value = ''
  showReturnModal.value = true
}

// Procesar devolución
async function processReturn() {
  if (
    !selectedRental.value ||
    isSavingReturn.value
  ) return

  isSavingReturn.value = true
  returnError.value = ''

  try {
    const { error } = await supabase.rpc(
      'complete_rental_safe',
      {
        p_rental_id: selectedRental.value.id,
        p_condition: returnForm.value.condition,
        p_comments: returnForm.value.comments
      }
    )

    if (error) throw error

    showReturnModal.value = false
    selectedRental.value = null

    await fetchData()

    alert('Devolución procesada correctamente.')

  } catch (err) {
    returnError.value =
      `No se pudo procesar: ${err.message}`
  } finally {
    isSavingReturn.value = false
  }
}

onMounted(fetchData)
</script>
