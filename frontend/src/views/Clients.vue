<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Clientes</h1>
      <button @click="showModal = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition-colors">+ Nuevo Cliente</button>
    </div>

    <!-- Tabla -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="client in clients" :key="client.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ client.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ client.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ client.phone }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ client.address }}</td>
          </tr>
          <tr v-if="clients.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 py-8">No hay clientes registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Registrar Nuevo Cliente</h2>
        <form @submit.prevent="saveClient" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre completo</label>
            <input v-model="form.name" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" placeholder="Ej: Juan Pérez" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input v-model="form.email" type="email" class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" placeholder="juan@ejemplo.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Teléfono</label>
            <input v-model="form.phone" required class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" placeholder="555-1234" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Dirección</label>
            <textarea v-model="form.address" class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" rows="3"></textarea>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" @click="closeModal" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">Cancelar</button>
            <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {{ isSaving ? 'Guardando...' : 'Guardar Cliente' }}
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

const clients = ref([])
const showModal = ref(false)
const isSaving = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const fetchClients = async () => {
  try {
    const { data, error } = await supabase.from('clients').select('*')
    if (error && error.code !== '42P01') {
      console.error('Supabase error:', error)
      throw error
    }
    if (data) clients.value = data.reverse() // Reverse in frontend to show newest first
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  form.value = { name: '', email: '', phone: '', address: '' }
}

const saveClient = async () => {
  isSaving.value = true
  try {
    const { error } = await supabase.from('clients').insert([{
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      address: form.value.address
    }])
    
    if (error) throw error
    
    await fetchClients()
    closeModal()
    
  } catch (error) {
    console.error('Error guardando:', error)
    alert('Hubo un error al guardar: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchClients()
})
</script>
