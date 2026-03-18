<template>
  <q-page class="q-pa-md">
    <!-- TÍTULO -->
    <div class="text-h5 text-center q-mb-md">
      Presupuesto de {{ user?.name }}
    </div>

    <q-card class="q-pa-md">

      <!-- GRAFICA + HISTORIAL -->
      <q-card-section>
        <div class="row q-col-gutter-md">

          <!-- 📊 GRAFICA -->
          <div class="col-12 col-md-6 order-1">
            <div class="chart-box flex flex-center">
              <canvas ref="canvas"></canvas>
            </div>
          </div>

          <!-- 📋 HISTORIAL -->
          <div class="col-12 col-md-6 order-2">
            <q-scroll-area style="height: 320px;">
              <q-item v-for="a in agendaHistory" :key="a.id" class="agenda-card q-mb-sm cursor-pointer"
                :style="{ borderLeftColor: a.color }" clickable @click="openPreview(a)">
                <!-- ICONO -->
                <q-item-section avatar>
                  <q-avatar :style="{ backgroundColor: a.color }" text-color="white">
                    $
                  </q-avatar>
                </q-item-section>

                <!-- INFO PRINCIPAL -->
                <q-item-section>
                  <div class="row items-center">
                    <div class="text-weight-bold">
                      {{ a.name }}
                    </div>

                    <!-- 🆕 BADGE NUEVA -->
                    <q-badge v-if="a.isNew" color="primary" class="q-ml-sm" rounded>
                      Nueva
                    </q-badge>

                    <q-badge v-else color="grey" class="q-ml-sm">
                      Antigua
                    </q-badge>
                  </div>

                  <!-- FECHAS -->
                  <div class="text-caption">
                    {{ formatDate(a.start) }} - {{ formatDate(a.end) }}
                  </div>

                  <!-- RUTA Y DESTINO-->
                  <div class="text-caption text-grey-7">
                    🛣️ Ruta:
                    <strong>{{ a.routeText || 'No definida' }}</strong>
                  </div>

                  <div class="text-caption text-grey-7 q-ml-sm">
                    📍 Destino:
                    <strong>{{ a.destination || 'No definido' }}</strong>
                  </div>


                  <!-- DETALLE -->
                  <div class="text-grey-8 text-caption">
                    Viáticos: ${{ a.viaticos.toLocaleString() }} |
                    Extras: ${{ a.extras.toLocaleString() }}
                  </div>
                </q-item-section>

                <!-- TOTAL -->
                <q-item-section side>
                  <div class="text-weight-bold">
                    ${{ a.total.toLocaleString() }}
                  </div>
                </q-item-section>
              </q-item>

            </q-scroll-area>
          </div>

        </div>
      </q-card-section>

      <q-separator />

      <!-- RESUMEN -->
      <q-card-section class="text-center">
        <div class="text-subtitle1">
          💰 Presupuesto:
          <span class="text-positive text-weight-bold">
            ${{ budgetInicial.toLocaleString() }}
          </span>
        </div>

        <div class="text-subtitle1">
          💵 Disponible:
          <span class="text-positive text-weight-bold">
            ${{ restante.toLocaleString() }}
          </span>
        </div>

        <div class="text-subtitle1">
          📉 Consumido:
          <span class="text-negative text-weight-bold">
            ${{ consumido.toLocaleString() }}
          </span>
        </div>


      </q-card-section>

      <q-card-section>
        <q-linear-progress class="budget-progress" :value="porcentajeConsumido / 100" size="28px" rounded :color="estadoPresupuesto === 'over'
          ? 'negative'
          : estadoPresupuesto === 'warning'
            ? 'warning'
            : 'positive'
          ">
          <div class="progress-label">
            {{ porcentajeConsumido.toFixed(0) }}% / 100%
          </div>
        </q-linear-progress>
      </q-card-section>


      <q-banner v-if="estadoPresupuesto !== 'ok'" rounded class="q-mt-md"
        :class="estadoPresupuesto === 'over' ? 'bg-negative text-white' : 'bg-warning text-black'">
        <template #avatar>
          <q-icon :name="estadoPresupuesto === 'over' ? 'warning' : 'report_problem'" size="md" />
        </template>

        <div v-if="estadoPresupuesto === 'over'">
          ⚠️ El presupuesto ha sido <strong>excedido</strong>.
        </div>
        <div v-else>
          🔔 Estás cerca de alcanzar el límite del presupuesto.
        </div>
      </q-banner>


    </q-card>

    <q-dialog v-model="previewDialog">
      <q-card style="width: 900px; max-width: 95vw;">

        <!-- Header -->
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista de Agenda</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- Contenido -->
        <q-card-section style="max-height: 80vh" class="scroll">
          <Preview :row="selectedAgenda" />
        </q-card-section>

      </q-card>
    </q-dialog>

  </q-page>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
import { useUserStore } from '../../../stores/user'
import { useScheduleStore } from '../../../stores/schedule'
import Preview from '../contractor/Preview.vue'


Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const userStore = useUserStore()
const scheduleStore = useScheduleStore()

const canvas = ref(null)
let chart = null

const user = ref(null)
const schedules = ref([])

const budgetInicial = ref(0)
const consumido = ref(0)
const restante = ref(0)
const dailyAllowance = ref(0)

const agendaHistory = ref([])

const previewDialog = ref(false)
const selectedAgenda = ref(null)

const openPreview = (agenda) => {
  selectedAgenda.value = agenda
  previewDialog.value = true
}


const porcentajeConsumido = computed(() => {
  if (!budgetInicial.value) return 0
  return Math.min((consumido.value / budgetInicial.value) * 100, 100)
})

const estadoPresupuesto = computed(() => {
  if (porcentajeConsumido.value >= 100) return 'over'
  if (porcentajeConsumido.value >= 80) return 'warning'
  return 'ok'
})



const buildRouteData = (agenda) => {
  const ida = agenda.route?.go?.[0]?.data || ''
  const regreso = agenda.route?.return?.[0]?.data || ''

  let routeText = 'No definida'

  if (ida && regreso) routeText = `${ida} → ${regreso}`
  else if (ida) routeText = ida
  else if (regreso) routeText = regreso

  return {
    routeText,
    destination: agenda.place || null
  }
}


/* 📅 Formatear fecha */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}


/* 🧮 CÁLCULOS */
const calcularDiasAgenda = (agenda) => {
  const start = new Date(agenda.tripStart)
  const end = new Date(agenda.tripEnd)

  const diffTime = end - start
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const calcularFactor = (dias) => {
  return dias - 0.5
}

const calcularTotalAgenda = (agenda) => {
  const dias = calcularDiasAgenda(agenda)
  const factor = calcularFactor(dias)

  const viaticos = factor * dailyAllowance.value

  const observaciones = (agenda.observations || []).reduce(
    (acc, o) => acc + (Number(o.amount) || 0),
    0
  )

  return viaticos + observaciones
}

const buildAgendaBreakdown = (agenda) => {
  const dias = calcularDiasAgenda(agenda)
  const factor = calcularFactor(dias)

  const viaticos = factor * dailyAllowance.value

  const extras = (agenda.observations || []).reduce(
    (acc, o) => acc + (Number(o.amount) || 0),
    0
  )

  return {
    dias,
    factor,
    viaticos,
    extras,
    total: viaticos + extras
  }
}

/* 📊 GRÁFICA */
const renderChart = () => {
  if (!canvas.value) return
  if (chart) chart.destroy()

  const usados = agendaHistory.value.map(a => a.total)
  const labels = agendaHistory.value.map(a => a.name)
  const colors = agendaHistory.value.map(a => a.color)

  const restanteCalc = restante.value > 0 ? restante.value : 0

  chart = new Chart(canvas.value, {
    type: 'doughnut',
    data: {
      labels: [...labels, 'Disponible'],
      datasets: [{
        data: [...usados, restanteCalc],
        backgroundColor: [...colors, '#43A047'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx =>
              `${ctx.label}: $${(ctx.raw || 0).toLocaleString()}`
          }
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

/* 🚀 CARGA PRINCIPAL */
onMounted(async () => {
  const userId = route.params.userId


  if (!userId) {
    $q.notify({ type: 'negative', message: 'Usuario no válido' })
    return router.back()
  }

  /* 1️⃣ Cargar usuario */
  const userResp = await userStore.getUserParams(userId)
  user.value = userResp?.data

  if (!user.value) {
    $q.notify({ type: 'negative', message: 'Usuario no encontrado' })
    return
  }

  /* 2️⃣ Asignar viático diario (CLAVE 🔑) */
  dailyAllowance.value = user.value.dailyAllowance?.amount ?? 0

  if (!dailyAllowance.value) {
    $q.notify({
      type: 'warning',
      message: 'El usuario no tiene viático diario configurado'
    })
  }

  /* 3️⃣ Cargar agendas */
  const schedulesResp = await scheduleStore.getSchedule({
    contractor: userId
  })
  schedules.value = schedulesResp?.data || []

  /* 4️⃣ Calcular totales */
  budgetInicial.value = user.value.budget?.amount ?? 0

  consumido.value = schedules.value.reduce(
    (acc, s) => acc + calcularTotalAgenda(s),
    0
  )

  restante.value = budgetInicial.value - consumido.value

  /* 5️⃣ Historial */
  const generateDistinctColor = (index, total = 50) => {
    const forbiddenStart = 90
    const forbiddenEnd = 150
    const availableRange = 360 - (forbiddenEnd - forbiddenStart)

    // distribuir colores uniformemente
    let hue = Math.floor((index * availableRange) / total)

    // saltar el rango verde
    if (hue >= forbiddenStart) {
      hue += (forbiddenEnd - forbiddenStart)
    }

    return `hsl(${hue}, 70%, 50%)`
  }





  // 🧠 1. ORDENAR POR FECHA (ANTIGUA → NUEVA)
  const sortedSchedules = [...schedules.value].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  )

  // 🧾 2. CONSTRUIR HISTORIAL YA ORDENADO
  agendaHistory.value = sortedSchedules.map((s, i) => {
    const createdAt = new Date(s.createdAt)
    const hoy = new Date()
    const diffHoras = (hoy - createdAt) / (1000 * 60 * 60)

    const { routeText, destination } = buildRouteData(s)

    return {
      ...s, // ← agenda completa real

      // datos visuales extra
      name: s.number || `Agenda ${i + 1}`,
      routeText,
      destination,
      isNew: diffHoras <= 24,

      ...buildAgendaBreakdown(s),
      color: generateDistinctColor(i, schedules.value.length)
    }

  })
  renderChart()
})
</script>


<style>
.chart-box {
  position: left;
  width: 50%;
  height: 320px;
  margin-left: 20%;
}

.budget-progress {
  position: relative;
}

.progress-label {
  position: absolute;
  inset: 0;
  /* top, right, bottom, left = 0 */
  display: flex;
  align-items: center;
  /* centra vertical */
  justify-content: center;
  /* centra horizontal */
  color: rgb(26, 8, 8);
  font-weight: bold;
  font-size: 1.1rem;
  pointer-events: none;
  /* evita problemas de click */
}

.agenda-card {
  background: #E4E1E1;
  border-left: 5px solid var(--q-primary);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.agenda-card:hover {
  background: #f1f5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
</style>
