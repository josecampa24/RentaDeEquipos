
<template>
  <div>
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Equipos</h1>

      <button
        @click="openCreateModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
      >
        + Nuevo Equipo
      </button>
    </div>

    <!-- Buscador y filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Buscar equipo
          </label>
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nombre o SKU..."
            class="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por categoría
          </label>
          <select
            v-model="selectedCategory"
            class="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las categorías</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>

      </div>
    </div>

    <!-- Error de carga -->
    <div
      v-if="loadError"
      class="bg-red-50 text-red-700 p-4 rounded mb-4"
    >
      {{ loadError }}
    </div>

    <!-- Tabla -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio diario</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="eq in filteredEquipments"
            :key="eq.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 text-sm">{{ eq.sku }}</td>
            <td class="px-6 py-4 text-sm font-medium">{{ eq.name }}</td>
            <td class="px-6 py-4 text-sm">{{ eq.category }}</td>

            <td class="px-6 py-4 text-sm">
              <span
                :class="Number(eq.quantity) === 0
                  ? 'text-red-600 font-bold'
                  : 'text-green-600'"
              >
                {{ eq.quantity }}
              </span>
            </td>

            <td class="px-6 py-4 text-sm">
              ${{ Number(eq.dailyPrice || 0).toFixed(2) }}
            </td>

            <td class="px-6 py-4 text-sm">
              <button
                @click="openEditModal(eq)"
                class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded"
              >
                Editar
              </button>
            </td>
          </tr>

          <tr v-if="!loading && filteredEquipments.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
              No se encontraron equipos.
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
              Cargando equipos...
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
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">

        <h2 class="text-xl font-bold mb-4 text-gray-800">
          {{ editingId ? 'Editar Equipo' : 'Registrar Nuevo Equipo' }}
        </h2>

        <form @submit.prevent="saveEquipment" class="space-y-4">

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Nombre del equipo
            </label>
            <input
              v-model.trim="form.name"
              required
              maxlength="150"
              class="mt-1 w-full rounded border p-2"
              placeholder="Ej: Bocina Yamaha 15 pulgadas"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              v-model="form.category"
              required
              class="mt-1 w-full rounded border p-2"
            >
              <option value="" disabled>Selecciona una categoría</option>
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                SKU / Código
              </label>
              <input
                v-model.trim="form.sku"
                required
                maxlength="50"
                class="mt-1 w-full rounded border p-2"
                placeholder="YAM-001"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Precio por día ($)
              </label>
              <input
                v-model.number="form.dailyPrice"
                type="number"
                step="0.01"
                min="0"
                required
                class="mt-1 w-full rounded border p-2"
              />
            </div>
          </div>

          <div v-if="!editingId">
            <label class="block text-sm font-medium text-gray-700">
              Cantidad inicial
            </label>
            <input
              v-model.number="form.quantity"
              type="number"
              min="0"
              step="1"
              required
              class="mt-1 w-full rounded border p-2"
            />
          </div>

          <div v-else class="bg-gray-50 p-3 rounded text-sm text-gray-600">
            Stock actual: {{ form.quantity }}.
            La cantidad no se modifica desde este formulario para evitar
            inconsistencias con las rentas activas.
          </div>

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
              {{ isSaving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Guardar Equipo' }}
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

const equipments = ref([])
const search = ref('')
const selectedCategory = ref('')
const showModal = ref(false)
const isSaving = ref(false)
const loading = ref(false)
const loadError = ref('')
const editingId = ref(null)

const baseCategories = [
  'Audio',
  'Iluminación',
  'Video',
  'Mobiliario',
  'Decoración'
]

const emptyForm = () => ({
  name: '',
  category: '',
  sku: '',
  dailyPrice: 0,
  quantity: 1
})

const form = ref(emptyForm())

// Categorías disponibles, incluyendo las existentes en Supabase
const categories = computed(() => {
  return [...new Set([
    ...baseCategories,
    ...equipments.value.map(eq => eq.category).filter(Boolean)
  ])]
})

// Búsqueda y filtros combinados
const filteredEquipments = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('es')

  return equipments.value.filter(eq => {
    const matchesSearch =
      String(eq.name || '').toLocaleLowerCase('es').includes(term) ||
      String(eq.sku || '').toLocaleLowerCase('es').includes(term)

    const matchesCategory =
      !selectedCategory.value ||
      eq.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

// Consultar inventario
const fetchEquipments = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) throw error

    equipments.value = data || []
  } catch (error) {
    console.error('Error al cargar equipos:', error)
    loadError.value = 'No se pudieron cargar los equipos: ' + error.message
  } finally {
    loading.value = false
  }
}

// Abrir formulario para nuevo equipo
const openCreateModal = () => {
  editingId.value = null
  form.value = emptyForm()
  showModal.value = true
}

// Abrir formulario para editar
const openEditModal = (equipment) => {
  editingId.value = equipment.id

  form.value = {
    name: equipment.name,
    category: equipment.category,
    sku: equipment.sku,
    dailyPrice: Number(equipment.dailyPrice),
    quantity: Number(equipment.quantity)
  }

  showModal.value = true
}

// Cerrar formulario
const closeModal = () => {
  if (isSaving.value) return

  showModal.value = false
  editingId.value = null
  form.value = emptyForm()
}

// Registrar o actualizar
const saveEquipment = async () => {
  if (isSaving.value) return

  const name = form.value.name.trim()
  const sku = form.value.sku.trim()
  const price = Number(form.value.dailyPrice)
  const quantity = Number(form.value.quantity)

  if (!name || !sku || !form.value.category) {
    alert('Completa todos los campos obligatorios.')
    return
  }

  if (!Number.isFinite(price) || price < 0) {
    alert('Ingresa un precio válido.')
    return
  }

  if (
    !editingId.value &&
    (!Number.isSafeInteger(quantity) || quantity < 0)
  ) {
    alert('La cantidad debe ser un número entero mayor o igual a cero.')
    return
  }

  const duplicateSku = equipments.value.some(
    eq =>
      String(eq.sku).toLowerCase() === sku.toLowerCase() &&
      eq.id !== editingId.value
  )

  if (duplicateSku) {
    alert('Ya existe otro equipo con ese SKU.')
    return
  }

  const wasEditing = Boolean(editingId.value)

  isSaving.value = true

  try {
    const payload = {
      name,
      sku,
      category: form.value.category,
      dailyPrice: price
    }

    let error

    if (editingId.value) {
      // Editar sin modificar el stock
      const result = await supabase
        .from('equipments')
        .update(payload)
        .eq('id', editingId.value)
        .select('id')

      error = result.error

      if (!error && (!result.data || result.data.length === 0)) {
        throw new Error('No se actualizó el equipo. Revisa los permisos de Supabase.')
      }
    } else {
      // Registrar nuevo equipo
      const result = await supabase
        .from('equipments')
        .insert([{
          ...payload,
          quantity
        }])

      error = result.error
    }

    if (error) throw error

    await fetchEquipments()
    isSaving.value = false
    closeModal()

    alert(wasEditing
      ? 'Cambios guardados correctamente.'
      : 'Equipo registrado correctamente.')

  } catch (error) {
    console.error('Error al guardar equipo:', error)
    alert('No se pudo guardar: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchEquipments)
</script>
