
<template>
  <div>
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">
        Clientes
      </h1>

      <button
        @click="openCreateModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
      >
        + Nuevo Cliente
      </button>
    </div>

    <!-- Buscador y filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Buscar cliente
          </label>

          <input
            v-model="search"
            type="text"
            placeholder="Nombre, correo o teléfono..."
            class="w-full rounded border p-2 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tipo de cliente
          </label>

          <select
            v-model="selectedType"
            class="w-full rounded border p-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos los clientes</option>
            <option value="particular">Particulares</option>
            <option value="empresa">Empresas</option>
          </select>
        </div>
      </div>

      <p class="mt-3 text-sm text-gray-500">
        Mostrando {{ filteredClients.length }} de
        {{ clients.length }} clientes
      </p>
    </div>

    <!-- Mensajes -->
    <div
      v-if="loadError"
      class="bg-red-50 text-red-700 rounded p-4 mb-4"
    >
      {{ loadError }}
    </div>

    <!-- Tabla de clientes -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
            >
              {{ column }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="client in filteredClients"
            :key="client.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 text-sm font-medium">
              {{ client.name }}
            </td>

            <td class="px-6 py-4 text-sm">
              {{ client.email || 'Sin correo' }}
            </td>

            <td class="px-6 py-4 text-sm">
              {{ client.phone || 'Sin teléfono' }}
            </td>

            <td class="px-6 py-4 text-sm">
              {{ client.company || 'Particular' }}
            </td>

            <td class="px-6 py-4 text-sm">
              {{ client.address || 'Sin dirección' }}
            </td>

            <td class="px-6 py-4 text-sm">
              <button
                @click="openEditModal(client)"
                class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded"
              >
                Editar
              </button>
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
              Cargando clientes...
            </td>
          </tr>

          <tr v-else-if="filteredClients.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
              No se encontraron clientes.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de registro y edición -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 class="text-xl font-bold mb-4 text-gray-800">
          {{ editingId ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}
        </h2>

        <form @submit.prevent="saveClient" class="space-y-4">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>

            <input
              v-model.trim="form.name"
              required
              maxlength="150"
              class="mt-1 w-full rounded border p-2"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <!-- Correo -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <input
              v-model.trim="form.email"
              type="email"
              maxlength="254"
              class="mt-1 w-full rounded border p-2"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Teléfono
            </label>

            <input
              v-model.trim="form.phone"
              type="tel"
              maxlength="25"
              class="mt-1 w-full rounded border p-2"
              placeholder="8112345678"
            />
          </div>

          <!-- Empresa -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Empresa (opcional)
            </label>

            <input
              v-model.trim="form.company"
              maxlength="150"
              class="mt-1 w-full rounded border p-2"
              placeholder="Ej: Eventos Monterrey"
            />

            <p class="text-xs text-gray-500 mt-1">
              Déjalo vacío si es un cliente particular.
            </p>
          </div>

          <!-- Dirección -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Dirección
            </label>

            <textarea
              v-model.trim="form.address"
              rows="3"
              class="mt-1 w-full rounded border p-2"
              placeholder="Dirección del cliente"
            ></textarea>
          </div>

          <!-- Error de formulario -->
          <div
            v-if="formError"
            class="bg-red-50 text-red-700 rounded p-3 text-sm"
          >
            {{ formError }}
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              :disabled="isSaving"
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Cancelar
            </button>

            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {{
                isSaving
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar Cambios'
                    : 'Guardar Cliente'
              }}
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

// Estado general
const clients = ref([])
const search = ref('')
const selectedType = ref('todos')
const showModal = ref(false)
const editingId = ref(null)
const isSaving = ref(false)
const loading = ref(false)
const loadError = ref('')
const formError = ref('')

const columns = [
  'Nombre',
  'Correo',
  'Teléfono',
  'Empresa',
  'Dirección',
  'Acciones'
]

const emptyForm = () => ({
  name: '',
  email: '',
  phone: '',
  company: '',
  address: ''
})

const form = ref(emptyForm())

// Buscar y filtrar clientes
const filteredClients = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('es')

  return clients.value.filter(client => {
    const name = String(client.name || '').toLocaleLowerCase('es')
    const email = String(client.email || '').toLocaleLowerCase('es')
    const phone = String(client.phone || '').toLowerCase()
    const company = String(client.company || '').toLocaleLowerCase('es')

    const matchesSearch =
      name.includes(term) ||
      email.includes(term) ||
      phone.includes(term) ||
      company.includes(term)

    const hasCompany = Boolean(client.company?.trim())

    const matchesType =
      selectedType.value === 'todos' ||
      (selectedType.value === 'empresa' && hasCompany) ||
      (selectedType.value === 'particular' && !hasCompany)

    return matchesSearch && matchesType
  })
})

// Consultar clientes de Supabase
const fetchClients = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) throw error

    clients.value = data || []

    return true
  } catch (error) {
    console.error('Error al cargar clientes:', error)
    loadError.value = 'No se pudieron cargar los clientes: ' + error.message

    return false
  } finally {
    loading.value = false
  }
}

// Abrir modal de registro
const openCreateModal = () => {
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  showModal.value = true
}

// Abrir modal de edición
const openEditModal = client => {
  editingId.value = client.id

  form.value = {
    name: client.name || '',
    email: client.email || '',
    phone: client.phone || '',
    company: client.company || '',
    address: client.address || ''
  }

  formError.value = ''
  showModal.value = true
}

// Cerrar modal
const closeModal = () => {
  if (isSaving.value) return

  showModal.value = false
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
}

// Guardar o actualizar cliente
const saveClient = async () => {
  if (isSaving.value) return

  formError.value = ''

  const name = form.value.name.trim()
  const email = form.value.email.trim().toLowerCase()
  const phone = form.value.phone.trim()
  const company = form.value.company.trim()
  const address = form.value.address.trim()

  if (!name) {
    formError.value = 'El nombre del cliente es obligatorio.'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (email && !emailRegex.test(email)) {
    formError.value = 'Ingresa un correo electrónico válido.'
    return
  }

  // Validar correo duplicado en los clientes cargados
  if (email) {
    const duplicate = clients.value.some(client =>
      String(client.email || '').toLowerCase() === email &&
      client.id !== editingId.value
    )

    if (duplicate) {
      formError.value = 'Ya existe un cliente con ese correo electrónico.'
      return
    }
  }

  const wasEditing = Boolean(editingId.value)

  const payload = {
    name,
    email: email || null,
    phone,
    company: company || null,
    address
  }

  isSaving.value = true

  try {
    if (wasEditing) {
      // Actualizar cliente
      const { data, error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', editingId.value)
        .select('id')

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error(
          'No se pudo actualizar el cliente. Revisa los permisos de Supabase.'
        )
      }
    } else {
      // Registrar cliente
      const { error } = await supabase
        .from('clients')
        .insert([payload])

      if (error) throw error
    }

    const refreshed = await fetchClients()

    isSaving.value = false
    closeModal()

    alert(
      wasEditing
        ? 'Cliente actualizado correctamente.'
        : 'Cliente registrado correctamente.'
    )

    if (!refreshed) {
      console.warn('Se guardó el cliente, pero no se pudo actualizar la lista.')
    }
  } catch (error) {
    console.error('Error al guardar cliente:', error)

    if (error.code === '23505') {
      formError.value = 'El correo electrónico ya está registrado.'
    } else {
      formError.value = 'No se pudo guardar: ' + error.message
    }
  } finally {
    isSaving.value = false
  }
}

// Cargar datos al iniciar
onMounted(fetchClients)
</script>
