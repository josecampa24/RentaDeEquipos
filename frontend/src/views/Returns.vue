<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Rentas y Devoluciones</h1>
      <button @click="openNewRentalModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition-colors">+ Nueva Renta</button>
    </div>

    <!-- Rentas activas (Pendientes de Devolución) -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-medium text-gray-800">Rentas Activas</h2>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Cliente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipos Rentados</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="rental in pendingRentals" :key="rental.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div class="font-bold">#{{ rental.id }}</div>
              <div class="text-gray-500">{{ rental.clients?.name || 'Desconocido' }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">
              <ul class="list-disc pl-4 space-y-1">
                <li v-for="item in rental.rental_items" :key="item.id">
                  <span class="font-semibold">{{ item.quantity }}x</span> {{ item.equipments?.name || 'Equipo eliminado' }}
                </li>
              </ul>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" :class="{'text-red-600 font-bold': isOverdue(rental.end_date)}">
              {{ formatDate(rental.start_date) }} - {{ formatDate(rental.end_date) }}
              <span v-if="isOverdue(rental.end_date)" class="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full block mt-1 w-fit">Atrasado</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${{ rental.total_price }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button @click="openReturnModal(rental)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors font-medium">Procesar Devolución</button>
            </td>
          </tr>
          <tr v-if="pendingRentals.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 py-8">No hay rentas activas en este momento.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Historial de rentas completadas -->
    <div class="mt-8 bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-medium text-gray-800">Historial (Rentas Completadas)</h2>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Cliente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipos Rentados</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Devolución</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condición</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pagado</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="ret in recentReturns" :key="ret.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div class="font-bold">#{{ ret.rental_id }}</div>
              <div class="text-gray-500">{{ ret.rentals?.clients?.name || 'Desconocido' }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">
              <ul class="list-disc pl-4 space-y-1">
                <li v-for="item in ret.rentals?.rental_items" :key="item.id">
                  <span class="font-semibold">{{ item.quantity }}x</span> {{ item.equipments?.name || 'Equipo eliminado' }}
                </li>
              </ul>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDateTime(ret.return_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="getConditionClass(ret.condition)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ ret.condition }}
              </span>
              <div class="text-xs text-gray-400 mt-1 truncate max-w-[200px]" v-if="ret.comments">{{ ret.comments }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${{ ret.rentals?.total_price || 0 }}</td>
          </tr>
          <tr v-if="recentReturns.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 py-8">Aún no hay historial de devoluciones.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Procesar Devolución -->
    <div v-if="showReturnModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Procesar Devolución - Renta #{{ selectedRental?.id }}</h2>
        <form @submit.prevent="processReturn" class="space-y-4">
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Condición del Equipo</label>
            <select v-model="returnForm.condition" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border">
              <option value="BUENA">Buena (Sin daños aparentes)</option>
              <option value="DAÑADA">Dañada (Requiere reparación)</option>
              <option value="PERDIDA">Perdida / Incompleta</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Comentarios Adicionales</label>
            <textarea v-model="returnForm.comments" rows="3" class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" placeholder="Observaciones de la devolución..."></textarea>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" @click="closeReturnModal" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">Cancelar</button>
            <button type="submit" :disabled="isSavingReturn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {{ isSavingReturn ? 'Procesando...' : 'Confirmar Devolución' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal Nueva Renta -->
    <div v-if="showNewRentalModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Registrar Nueva Renta</h2>
        <form @submit.prevent="saveRental" class="space-y-4">
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Cliente</label>
            <select v-model="rentalForm.client_id" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border">
              <option value="" disabled>Selecciona un cliente</option>
              <option v-for="client in allClients" :key="client.id" :value="client.id">{{ client.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input type="date" v-model="rentalForm.start_date" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha de Fin</label>
              <input type="date" v-model="rentalForm.end_date" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4 mt-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Equipos</h3>
            
            <div v-for="(item, index) in rentalForm.items" :key="index" class="flex gap-4 mb-2 items-end">
              <div class="flex-1">
                <label class="block text-xs font-medium text-gray-700">Equipo</label>
                <select v-model="item.equipment_id" required @change="updateItemPrice(index)" class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border text-sm">
                  <option value="" disabled>Selecciona equipo</option>
                  <option v-for="eq in allEquipments" :key="eq.id" :value="eq.id">{{ eq.name }} (${{ eq.dailyPrice }}/día)</option>
                </select>
              </div>
              <div class="w-24">
                <label class="block text-xs font-medium text-gray-700">Cantidad</label>
                <input type="number" v-model.number="item.quantity" min="1" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border text-sm" />
              </div>
              <button type="button" @click="removeItem(index)" class="text-red-500 hover:text-red-700 p-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              </button>
            </div>
            
            <button type="button" @click="addItem" class="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">+ Agregar otro equipo</button>
          </div>
          
          <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <div class="text-lg font-bold text-gray-900">
              Total estimado: ${{ calculatedTotal.toFixed(2) }}
            </div>
            <div class="flex space-x-3">
              <button type="button" @click="closeNewRentalModal" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">Cancelar</button>
              <button type="submit" :disabled="isSavingRental || rentalForm.items.length === 0" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {{ isSavingRental ? 'Guardando...' : 'Guardar Renta' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../utils/supabase'

const pendingRentals = ref([])
const recentReturns = ref([])
const showReturnModal = ref(false)
const showNewRentalModal = ref(false)
const isSavingReturn = ref(false)
const isSavingRental = ref(false)
const selectedRental = ref(null)

const allClients = ref([])
const allEquipments = ref([])

const returnForm = ref({
  condition: 'BUENA',
  comments: ''
})

const rentalForm = ref({
  client_id: '',
  start_date: '',
  end_date: '',
  items: []
})

const fetchData = async () => {
  try {
    // Fetch rentas activas
    const { data: rentals, error: rentalsError } = await supabase
      .from('rentals')
      .select('*, clients(name), rental_items(*, equipments(name))')
      .eq('status', 'CONFIRMADA')
      .order('end_date', { ascending: true })
      
    if (rentalsError) console.error('Error fetching rentals:', rentalsError)
    if (rentals) pendingRentals.value = rentals
    
    // Fetch returns history nested info
    const { data: returns, error: returnsError } = await supabase
      .from('returns')
      .select('*, rentals(*, clients(name), rental_items(*, equipments(name)))')
      .order('return_date', { ascending: false })
      .limit(10)
      
    if (returnsError) console.error('Error fetching returns:', returnsError)
    if (returns) recentReturns.value = returns
      
    // Fetch para el modal de nueva renta
    const { data: cData } = await supabase.from('clients').select('*')
    if (cData) allClients.value = cData
    
    const { data: eData } = await supabase.from('equipments').select('*')
    if (eData) allEquipments.value = eData
      
  } catch (error) {
    console.error('Error fetching return data:', error)
  }
}

// Lógica de Devoluciones
const openReturnModal = (rental) => {
  selectedRental.value = rental
  returnForm.value = { condition: 'BUENA', comments: '' }
  showReturnModal.value = true
}

const closeReturnModal = () => {
  showReturnModal.value = false
  selectedRental.value = null
}

const processReturn = async () => {
  if (!selectedRental.value) return
  isSavingReturn.value = true
  
  try {
    const { error: returnError } = await supabase.from('returns').insert([{
      rental_id: selectedRental.value.id,
      return_date: new Date().toISOString(),
      condition: returnForm.value.condition,
      comments: returnForm.value.comments
    }])
    
    if (returnError) throw returnError
    
    const { error: updateError } = await supabase
      .from('rentals')
      .update({ status: 'COMPLETADA' })
      .eq('id', selectedRental.value.id)
      
    if (updateError) throw updateError
    
    if (selectedRental.value.rental_items) {
      for (const item of selectedRental.value.rental_items) {
        const { data: eqData } = await supabase.from('equipments').select('quantity').eq('id', item.equipment_id).single()
        if (eqData) {
          await supabase.from('equipments').update({ quantity: eqData.quantity + item.quantity }).eq('id', item.equipment_id)
        }
      }
    }
    
    await fetchData()
    closeReturnModal()
    
  } catch (error) {
    console.error('Error procesando devolución:', error)
    alert('Hubo un error al procesar: ' + error.message)
  } finally {
    isSavingReturn.value = false
  }
}

// Lógica de Nueva Renta
const openNewRentalModal = () => {
  rentalForm.value = {
    client_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    items: [{ equipment_id: '', quantity: 1, price: 0 }]
  }
  showNewRentalModal.value = true
}

const closeNewRentalModal = () => {
  showNewRentalModal.value = false
}

const addItem = () => {
  rentalForm.value.items.push({ equipment_id: '', quantity: 1, price: 0 })
}

const removeItem = (index) => {
  rentalForm.value.items.splice(index, 1)
}

const updateItemPrice = (index) => {
  const item = rentalForm.value.items[index]
  const eq = allEquipments.value.find(e => e.id === item.equipment_id)
  if (eq) {
    item.price = eq.dailyPrice
  }
}

const calculatedTotal = computed(() => {
  if (!rentalForm.value.start_date || !rentalForm.value.end_date) return 0
  const start = new Date(rentalForm.value.start_date)
  const end = new Date(rentalForm.value.end_date)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
  
  let itemsTotal = rentalForm.value.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  return itemsTotal * diffDays
})

const saveRental = async () => {
  isSavingRental.value = true
  try {
    const { data: rentalData, error: rentalError } = await supabase.from('rentals').insert([{
      client_id: rentalForm.value.client_id,
      start_date: rentalForm.value.start_date,
      end_date: rentalForm.value.end_date,
      total_price: calculatedTotal.value,
      status: 'CONFIRMADA'
    }]).select()
    
    if (rentalError) throw rentalError
    
    const rentalId = rentalData[0].id
    
    const itemsToInsert = rentalForm.value.items.map(item => ({
      rental_id: rentalId,
      equipment_id: item.equipment_id,
      quantity: item.quantity,
      price: item.price
    }))
    
    const { error: itemsError } = await supabase.from('rental_items').insert(itemsToInsert)
    if (itemsError) throw itemsError
    
    for (const item of rentalForm.value.items) {
      const eq = allEquipments.value.find(e => e.id === item.equipment_id)
      if (eq) {
        const newQuantity = Math.max(0, eq.quantity - item.quantity)
        await supabase.from('equipments').update({ quantity: newQuantity }).eq('id', eq.id)
      }
    }
    
    await fetchData()
    closeNewRentalModal()
    
  } catch (error) {
    console.error('Error guardando renta:', error)
    alert('Hubo un error al guardar renta: ' + error.message)
  } finally {
    isSavingRental.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString()
}

const isOverdue = (dateStr) => {
  if (!dateStr) return false
  const end = new Date(dateStr)
  end.setHours(23, 59, 59, 999)
  return new Date() > end
}

const getConditionClass = (condition) => {
  switch (condition) {
    case 'BUENA': return 'bg-green-100 text-green-800'
    case 'DAÑADA': return 'bg-yellow-100 text-yellow-800'
    case 'PERDIDA': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  fetchData()
})
</script>