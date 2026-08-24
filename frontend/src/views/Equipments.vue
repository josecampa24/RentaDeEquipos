<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Equipos</h1>
      <button @click="showModal = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition-colors">+ Nuevo Equipo</button>
    </div>

    <!-- Tabla -->
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
          <tr v-for="eq in equipments" :key="eq.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ eq.sku }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ eq.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ eq.category }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="{'text-red-600 font-bold': eq.quantity === 0, 'text-green-600': eq.quantity > 0}">{{ eq.quantity }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${{ eq.dailyPrice }}</td>
          </tr>
          <tr v-if="equipments.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 py-8">No hay equipos registrados. ¡Agrega el primero!</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Registrar Nuevo Equipo</h2>
        <form @submit.prevent="saveEquipment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre del equipo</label>
            <input v-model="form.name" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" placeholder="Ej: Bocina Yamaha 15 pulgadas" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Categoría</label>
            <select v-model="form.category" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border">
              <option value="" disabled>Selecciona una categoría</option>
              <option value="Audio">Audio</option>
              <option value="Iluminación">Iluminación</option>
              <option value="Video">Video</option>
              <option value="Mobiliario">Mobiliario</option>
              <option value="Decoración">Decoración</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">SKU / Código</label>
              <input v-model="form.sku" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" placeholder="YAM-001" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Precio x Día ($)</label>
              <input v-model.number="form.dailyPrice" type="number" step="0.01" min="0" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Cantidad (Stock disponible)</label>
            <input v-model.number="form.quantity" type="number" min="0" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
          </div>
          
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" @click="closeModal" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">Cancelar</button>
            <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {{ isSaving ? 'Guardando...' : 'Guardar Equipo' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../utils/supabase'

const equipments = ref([])
const showModal = ref(false)
const isSaving = ref(false)

const form = ref({
  name: '',
  category: '',
  sku: '',
  dailyPrice: 0,
  quantity: 1
})

const fetchEquipments = async () => {
  try {
    const { data, error } = await supabase.from('equipments').select('*').order('createdAt', { ascending: false })
    if (error) throw error
    equipments.value = data
  } catch (error) {
    console.error('Error fetching equipments:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  form.value = { name: '', category: '', sku: '', dailyPrice: 0, quantity: 1 }
}

const saveEquipment = async () => {
  isSaving.value = true
  try {
    const { error } = await supabase.from('equipments').insert([{
      name: form.value.name,
      category: form.value.category,
      sku: form.value.sku,
      dailyPrice: form.value.dailyPrice,
      quantity: form.value.quantity
    }])
    
    if (error) throw error
    
    // Recargar tabla y cerrar modal
    await fetchEquipments()
    closeModal()
    
  } catch (error) {
    console.error('Error guardando:', error)
    alert('Hubo un error al guardar: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchEquipments()
})
</script>