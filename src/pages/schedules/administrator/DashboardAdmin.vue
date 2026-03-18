<template>
  <q-page class="q-pa-md">

    <div class="text-h4 text-center q-mb-md">
      Control De Presupuesto
    </div>

    <q-input v-model="filter" dense outlined debounce="300" placeholder="Buscar usuario, rol o agendas..."
      class="q-mb-md">
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- 📋 TABLA -->
    <q-table class="q-mt-lg" title="Control de usuarios" :rows="rows" :columns="columns" row-key="_id" flat bordered
      :loading="loading" :filter="filter" :filter-method="filterMethod">


      <!-- 🔘 BOTÓN ACCIONES -->
      <template v-slot:body-cell-actions="props">
        <q-td align="center" class="q-gutter-sm">
          <q-btn color="primary" label="Ver presupuesto" size="sm" @click="goToBudget(props.row)" />
          <q-btn color="primary" label="Agendas" size="sm" @click="openAgendas(props.row)" />
        </q-td>
      </template>

    </q-table>

    <q-dialog v-model="dialogAgendas" persistent>
      <q-card style="min-width: 800px; max-width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">
            Agendas de {{ selectedUser?.name }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-table dense flat bordered :rows="agendasByUser" :columns="agendaColumns" row-key="_id"
            no-data-label="Este usuario no tiene agendas" :virtual-scroll="false">

            <template v-slot:body-cell-actions="props">
              <q-td align="center">
                <q-btn color="primary" label="Ver agenda" size="sm" @click="verAgenda(props.row)" />
              </q-td>
            </template>
          </q-table>

        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" color="negative" flat v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>



        <q-dialog v-model="showDialog" maximized>
      <q-card style="width: 900px; max-width: 95vw; height: 90vh;">
        <!-- HEADER -->
        <q-card-section class="row items-center bg-green text-white q-pa-sm">
          <div class="text-h6 q-ml-md">Agenda Firmada</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- CONTENIDO -->
        <q-card-section class="col q-pa-md scroll">

          <Preview v-if="selectedRow" :row="selectedRow" />

        </q-card-section>

      </q-card>
    </q-dialog>





  </q-page>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/user'
import { useScheduleStore } from '../../../stores/schedule'

import Preview from '../contractor/Preview.vue'


const $q = useQuasar()
const router = useRouter()

const userStore = useUserStore()
const scheduleStore = useScheduleStore()

const role = ref(null)
const users = ref([])
const schedules = ref([])
const loading = ref(false)

const dialogAgendas = ref(false)
const selectedUser = ref(null)

const showDialog = ref(false)
const selectedRow = ref(null)

const filter = ref('')


/* 🔐 PROTECCIÓN */
onBeforeMount(async () => {
  const currentUser = $q.localStorage.getItem('user')

  role.value = currentUser?.role?.data

  if (role.value !== 'supervisor') {
    router.replace('/layout/home')
    return
  }

  try {
    loading.value = true

    const usersResp = await userStore.getUser()
    users.value = usersResp?.data || []

    const schedulesResp = await scheduleStore.getSchedule()
    schedules.value = schedulesResp?.data || []

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Error cargando datos'
    })
  } finally {
    loading.value = false
  }
})


/* 📋 COLUMNAS */
const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'center' },
  { name: 'total', label: 'Agendas', field: 'total', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

/* 📋 FILAS */
const rows = computed(() =>
  users.value
    .filter(user =>
      user.role?.data === 'user' &&
      user.staffType?.data === 'contractor'
    )
    .map(user => {
      const totalAgendas = schedules.value.filter(
        s => s.contractor === user._id
      ).length

      return {
        _id: user._id,
        name: user.name,
        role: 'contractor',
        total: totalAgendas
      }
    })
)



/* 🔀 REDIRECCIÓN */
const goToBudget = (user) => {
  router.push({
    name: 'grafica',
    params: { userId: user._id }
  })
}

const agendaColumns = [
  {
    name: 'fechaInicio',
    label: 'Fecha Inicio',
    field: row => {
      if (!row.tripStart) return ''
      return new Date(row.tripStart).toLocaleDateString('en-US') // MM/DD/YYYY
    },
    align: 'left'
  },

  {
    name: 'fechaFin',
    label: 'Fecha Final',
    field: row => {
      if (!row.tripEnd) return ''
      return new Date(row.tripEnd).toLocaleDateString('en-US') // MM/DD/YYYY
    },
    align: 'left'
  }, { name: 'status', label: 'Estado', align: 'center', field: row => row.status?.data || 'Sin estado' },
  { name: 'actions', align: 'center', label: 'Acciones' }
]


const agendasByUser = computed(() => {
  if (!selectedUser.value) return []

  return schedules.value.filter(
    agenda => agenda.contractor === selectedUser.value._id
  )
})



const openAgendas = (user) => {
  selectedUser.value = user
  dialogAgendas.value = true
}

const verAgenda = (agenda) => {
  console.log('AGENDA REAL:', agenda)
  selectedRow.value = agenda   // asigna la fila seleccionada
  showDialog.value = true      // abre el dialog
}



//filtro 
const filterMethod = (rows, terms) => {
  const search = terms.toLowerCase()

  return rows.filter(row => {
    return (
      row.name.toLowerCase().includes(search) ||
      row.role.toLowerCase().includes(search) ||
      String(row.total).includes(search)
    )
  })
}

</script>
