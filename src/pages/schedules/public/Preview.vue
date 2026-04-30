<template>
  <div class="flex flex-center q-pa-md">

  <!-- CONTENEDOR CENTRADO CON ENCABEZADO + CUERPO -->
  <div id="element" style="width: 900px; max-width: 100%; padding: 32px;">

  <!-- ENCABEZADO -->
  <div style="border: 2px solid black; border-bottom: none;">
    <div class="row">
      <div class="col-2 justify-center flex q-py-xs" style="border-right: 1px solid black">
        <img :src="sigaSenaLogo" style="height: 70px; width: 100px; object-fit: contain;" crossorigin="anonymous" />
      </div>
      <div class="col-10 flex flex-center">
        <p class="q-my-none text-center" style="font-size: 18px;">
          <strong>AGENDA DE LABORES PARA COMISIÓN SERVIDORES PÚBLICOS</strong>
        </p>
      </div>
    </div>
  </div>

  <!-- CUERPO DEL FORMULARIO -->
  <div style="border: 2px solid black;">

    <!-- SECCIÓN: DATOS DE LA AGENDA DE COMISIÓN -->
    <div class="row border-bottom" style="background-color: rgb(217, 217, 217);">
      <div class="col-12">
        <p class="q-my-none q-pt-xs text-center"><strong>DATOS DE LA AGENDA DE COMISIÓN</strong></p>
      </div>
    </div>

    <!-- FECHA DE ELABORACIÓN -->
    <div class="row border-bottom">
      <div class="col-5 border-right">
        <p class="q-my-none q-pl-xs q-pt-xs"><strong>FECHA DE ELABORACIÓN DE AGENDA</strong></p>
        <p class="q-my-none q-pl-xs q-pt-xs">Según la Resolución 2838/2016 art.14</p>
      </div>
      <div class="col-7">
        <p
          v-text="date.formatDate(props.row.createdAt !== null ? props.row.createdAt : Date.now(), 'DD/MM/YYYY')"
          class="q-my-none q-pl-xs"
          style="margin-top: 3px;"
        />
      </div>
    </div>

    <!-- NOMBRES Y APELLIDOS DEL COMISIONADO -->
    <div class="row border-bottom">
      <div class="col-5 border-right">
        <p class="q-my-none q-pl-xs"><strong>NOMBRES Y APELLIDOS DEL COMISIONADO</strong></p>
      </div>
      <div class="col-7">
        <p v-text="publicWorker" class="q-my-none q-pl-xs" />
      </div>
    </div>

    <!-- FECHA INICIO Y FIN -->
    <div class="row border-bottom">
      <div class="col-4 border-right">
        <p class="q-my-none q-pl-xs q-pt-xs"><strong>FECHA INICIO DE COMISIÓN</strong></p>
      </div>
      <div class="col-2 border-right">
        <p
          v-text="tripStart && tripStart.length
            ? `${tripStart.slice(8,10)}/${tripStart.slice(5,7)}/${tripStart.slice(0,4)}`
            : 'DD/MM/AAAA'"
          class="q-my-none q-pl-xs"
        />
      </div>
      <div class="col-4 border-right">
        <p class="q-my-none q-pl-xs q-pt-xs"><strong>FECHA FIN DE LA COMISIÓN</strong></p>
      </div>
      <div class="col-2">
        <p
          v-text="tripEnd && tripEnd.length
            ? `${tripEnd.slice(8,10)}/${tripEnd.slice(5,7)}/${tripEnd.slice(0,4)}`
            : 'DD/MM/AAAA'"
          class="q-my-none q-pl-xs"
        />
      </div>
    </div>

    <!-- SECCIÓN: LUGAR DE LA COMISIÓN -->
    <div class="row border-bottom" style="background-color: rgb(217, 217, 217);">
      <div class="col-12">
        <p class="q-my-none q-pt-xs text-center"><strong>LUGAR DE LA COMISIÓN</strong></p>
      </div>
    </div>

    <!-- CABECERAS DE LUGAR -->
    <div class="row border-bottom">
      <div class="col-2 border-right">
        <p class="q-my-none q-pl-xs"><strong>CIUDAD O MUNICIPIO</strong></p>
      </div>
      <div class="col-2 border-right">
        <p class="q-my-none q-pl-xs q-pt-xs"><strong>DIRECCIÓN GENERAL / REGIONAL</strong></p>
      </div>
      <div class="col-8 border-right">
        <p class="q-my-none q-pl-xs q-pt-xs">
          <strong>DEPENDENCIA / CENTRO DE FORMACIÓN / SEDE / INSTITUCIÓN A VISITAR</strong>
        </p>
      </div>
    </div>

    <!-- DATOS DE LUGAR -->
    <div class="row border-bottom">
      <div class="col-2 border-right">
        <p class="q-my-none q-pl-xs">
          <span
            v-for="(element, index) in place"
            :key="index"
            v-text="`${element.data}${index !== place.length - 1 ? ', ' : ''}`"
          />
        </p>
      </div>
      <div class="col-2 border-right">
        <p v-text="props.row.regional || '-'" class="q-my-none q-pl-xs" />
      </div>
      <div class="col-8 border-right">
        <p class="q-my-none q-pl-xs">
          <span
            v-for="(element, index) in institute"
            :key="index"
            v-text="`${element.data}${index !== institute.length - 1 ? ', ' : ''}`"
          />
        </p>
      </div>
    </div>

    <!-- OBJETO DE LA COMISIÓN -->
    <div class="row border-bottom">
      <div class="col-12">
        <div class="row">
          <div class="col-12">
            <p class="q-my-none q-pl-xs q-pt-xs">
              <strong>OBJETO DE LA COMISIÓN:</strong>
            </p>
          </div>
          <div class="col-12">
            <p
              v-text="props.row.tripObjective ? props.row.tripObjective : '-'"
              class="q-my-none q-px-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- SECCIÓN: ACTIVIDADES -->
    <div class="row border-bottom" style="background-color: rgb(217, 217, 217);">
      <div class="col-12">
        <p class="q-my-none q-pt-xs text-center">
          <strong>ACTIVIDADES A DESARROLLAR DURANTE LA COMISIÓN RESOLUCIÓN 2838/2016 Art.17:</strong>
        </p>
        <p class="q-my-none q-pt-xs text-center">
          (Deberá contener información detallada de las tareas a realizar día a día)
        </p>
      </div>
    </div>

    <!-- LISTADO DE ACTIVIDADES -->
    <div class="row">
      <div class="col-12">
        <template v-for="(element, index) in activities" :key="index">
          <div class="row">
            <div class="col-12 q-mt-sm q-px-sm">
              <!-- FECHA DEL DÍA -->
              <p class="q-my-none">
                <strong>Día {{ index + 1 }}: </strong>
                {{ element.date
                  ? `${element.date.slice(8,10)}/${element.date.slice(5,7)}/${element.date.slice(0,4)}`
                  : 'DD/MM/AAAA'
                }}
              </p>
            </div>
          </div>

          <div class="row">
            <div class="col-12 q-px-sm">

              <!-- RUTA DE IDA (solo primer día) -->
              <template v-if="index === 0">
                <p class="q-my-none q-mt-xs">
                  <strong>Desplazamiento Ruta de Ida:</strong>
                  <template v-if="goRoute?.length">
                    {{ goRoute[0]?.label || goRoute[0]?.data || '-' }} -
                    {{ goRoute.at(-1)?.label || goRoute.at(-1)?.data || '-' }}
                  </template>
                  <template v-else>-</template>
                </p>
                <p class="q-my-none">
                  <strong>Medio de Transporte:</strong>
                  <template v-if="goMeanstransport?.length">
                    <span v-for="(mean, i) in goMeanstransport" :key="i">
                      {{ mean.label || mean.data }}{{ i !== goMeanstransport.length - 1 ? ', ' : '' }}
                    </span>
                  </template>
                  <template v-else>-</template>
                </p>
              </template>

              <!-- ACTIVIDADES DEL DÍA -->
              <template v-if="element.items?.length">
                <!-- Primer item -->
                <p class="q-my-none q-pl-sm q-mt-sm">
                  <strong>Actividades a ejecutar:</strong>
                  <span class="q-ml-sm">{{ element.items[0].data || '-' }}</span>
                  <br />
                  <ul style="list-style: none; padding-left: 0; margin: 0;">
                    <li>- <strong>Hora inicio:</strong> {{ formatTime12h(element.items[0].startTime) }}</li>
                    <li>- <strong>Hora fin:</strong> {{ formatTime12h(element.items[0].endTime) }}</li>
                  </ul>
                </p>

                <!-- Items adicionales -->
                <ul
                  v-if="element.items.length > 1"
                  class="q-pl-lg q-pr-sm q-mt-xs"
                  :class="{ 'q-mb-xs': index === activities.length - 1 }"
                  style="list-style-type: none; margin-bottom: 0;"
                >
                  <template v-for="(item, itemIndex) in element.items" :key="itemIndex">
                    <template v-if="itemIndex > 0">
                      <li class="q-mt-xs">
                        - <strong>Hora:</strong>
                        {{ formatTime12h(item.startTime) }} - {{ formatTime12h(item.endTime) }}
                        <span class="q-ml-sm">{{ item.data || '-' }}</span>
                      </li>
                    </template>
                  </template>
                </ul>
              </template>

              <!-- Desplazamientos internos (días intermedios) -->
              <template v-if="index > 0 && index < activities.length - 1">
                <p class="q-my-none q-mt-sm">
                  <strong>Desplazamientos Internos:</strong> Si hay lugar a ellos o N/A
                </p>
              </template>

              <!-- RUTA DE REGRESO (solo último día) -->
              <template v-if="index === activities.length - 1">
                <p class="q-my-none q-mt-sm">
                  <strong>Desplazamiento Ruta de Regreso:</strong>
                  <template v-if="returnRoute?.length">
                    {{ returnRoute[0]?.label || returnRoute[0]?.data || '-' }} -
                    {{ returnRoute.at(-1)?.label || returnRoute.at(-1)?.data || '-' }}
                  </template>
                  <template v-else>-</template>
                </p>
                <p class="q-my-none q-pb-sm">
                  <strong>Medio de Transporte:</strong>
                  <template v-if="returnMeanstransport?.length">
                    <span v-for="(mean, i) in returnMeanstransport" :key="i">
                      {{ mean.label || mean.data }}{{ i !== returnMeanstransport.length - 1 ? ', ' : '' }}
                    </span>
                  </template>
                  <template v-else>-</template>
                </p>
              </template>

            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- OBSERVACIONES -->
    <div class="row border-bottom">
      <div class="col-12">
        <template v-if="observations && observations.length > 0">
          <p class="q-my-none q-pl-sm"><strong>Observaciones:</strong></p>
          <ul class="q-my-none q-pl-lg" style="list-style-type: none; padding-left: 1rem;">
            <li v-for="(element, index) in observations" :key="index">
              - {{ element || '-' }}
            </li>
          </ul>
        </template>
        <template v-else>
          <p class="q-my-none q-pl-sm"><strong>Observaciones:</strong> Ninguna.</p>
        </template>
      </div>
    </div>

    <!-- SECCIÓN: FIRMAS -->
    <div class="row border-bottom" style="background-color: rgb(217, 217, 217);">
      <div class="col-6 border-right">
        <p class="q-my-none q-pl-xs"><strong>COMISIONADO</strong></p>
      </div>
      <div class="col-6">
        <p class="q-my-none q-pl-xs q-pt-xs"><strong>AUTORIZA LA COMISIÓN</strong></p>
      </div>
    </div>

    <div class="row">
      <!-- FIRMA COMISIONADO -->
      <div class="col-6 border-right">
        <div class="row">
          <div class="col-12">
            <img
              v-if="signature.publicWorker"
              :src="signature.publicWorker"
              style="width: 180px; height: 80px; object-fit: contain; margin-left: 6.5px; margin-top: 4px;"
            />
            <div
              v-else
              style="width: 180px; height: 80px; margin-left: 6.5px; margin-top: 4px;"
            />
            <p class="q-my-none q-pl-sm"><strong>Firma</strong></p>
          </div>
          <div class="col-12">
            <p class="q-my-none q-pl-sm">
              <strong>Nombres y Apellidos: </strong>{{ publicWorker }}
            </p>
          </div>
        </div>
      </div>

      <!-- FIRMA AUTORIZADOR -->
      <div class="col-6">
        <div class="row">
          <div class="col-12">
            <q-img
              v-if="signature.paymaster !== null"
              :src="signature.paymaster"
              fit="contain"
              style="width: 180px; height: 80px; margin-left: 6.5px; margin-top: 4px;"
            />
            <div
              v-else
              style="width: 180px; height: 80px; margin-left: 6.5px; margin-top: 4px;"
            />
            <p class="q-my-none q-pl-sm"><strong>Firma</strong></p>
          </div>
          <div class="col-12">
            <p class="q-my-none q-pl-sm">
              <strong>Nombres y Apellidos: </strong>{{ paymaster.name || '-' }}
            </p>
            <p class="q-my-none q-pl-sm">
              <strong>Cargo: </strong>{{ paymaster.position || '-' }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- CÓDIGO DE VERSIÓN -->
  <div class="row justify-end q-mt-xs">
    <p class="q-my-none">GTH-F-188 V01</p>
  </div>

  </div><!-- fin #element -->
  </div><!-- fin flex-center -->
</template>

<script setup>
import { ref, onBeforeMount, watch } from 'vue'
import { useUserStore } from '../../../stores/user.js'
import { date, useQuasar } from 'quasar'
import sigaSenaLogo from '../../../assets/siga sena.png'

const props = defineProps({
  row: {
    type: Object,
    default: () => ({
      activities: [],
      institutes: [],
      places: [],
      route: { go: [], return: [] },           // 🚩 RUTA (ciudades)
      meanstransport: { go: [], return: [] },  // 🚍 MEDIOS DE TRANSPORTE
      paymaster: { name: '-', id: '', position: '-' },
      signature: { publicWorker: null, paymaster: null },
      status: { index: null },
      tripStart: '',
      tripEnd: '',
      tripObjective: '',
      conclusions: [],
      collections: [],
      observations: [],
      legalization: { createdAt: null, signature: { publicWorker: null } }
    })
  }
})



const userStore = useUserStore()
const $q = useQuasar()

const user = ref({})
const publicWorker = ref('')
const paymaster = ref({})
const place = ref([])
const institute = ref([])
const activities = ref([])
const observations = ref([])

// 🚩 RUTAS (Ciudades/Lugares)
const goRoute = ref([])
const returnRoute = ref([])

// 🚍 MEDIOS DE TRANSPORTE
const goMeanstransport = ref([])
const returnMeanstransport = ref([])

const tripStart = ref('')
const tripEnd = ref('')
const conclusions = ref([])
const collections = ref([])
const signature = ref({ publicWorker: null, paymaster: null })
const legalization = ref({ createdAt: null, signature: { publicWorker: null } })

// 🔥 WATCH para RUTAS con LOGS DETALLADOS
watch(
  () => props.row.route,
  (newVal) => {
    console.log('🔄 ===== ROUTE CAMBIÓ =====')
    console.log('📦 Valor completo de route:', newVal)
    console.log('📦 Tipo de route:', typeof newVal)
    console.log('📦 route es Proxy?:', newVal?.constructor?.name)
    
    // GO ROUTE
    console.log('🟢 --- RUTA DE IDA (GO) ---')
    console.log('🔍 route.go:', newVal?.go)
    console.log('🔍 Es array?:', Array.isArray(newVal?.go))
    console.log('🔍 Longitud:', newVal?.go?.length)
    console.log('🔍 Contenido completo:', JSON.stringify(newVal?.go, null, 2))
    
    if (newVal?.go && Array.isArray(newVal.go)) {
      if (newVal.go.length > 0) {
        goRoute.value = [...newVal.go]
        console.log('✅ goRoute actualizado:', goRoute.value)
        console.log('✅ Primer elemento:', goRoute.value[0])
        console.log('✅ Último elemento:', goRoute.value[goRoute.value.length - 1])
      } else {
        console.warn('⚠️ route.go es un array pero está VACÍO')
        goRoute.value = []
      }
    } else {
      console.error('❌ route.go NO es un array válido')
      goRoute.value = []
    }
    
    // RETURN ROUTE
    console.log('🔴 --- RUTA DE REGRESO (RETURN) ---')
    console.log('🔍 route.return:', newVal?.return)
    console.log('🔍 Es array?:', Array.isArray(newVal?.return))
    console.log('🔍 Longitud:', newVal?.return?.length)
    console.log('🔍 Contenido completo:', JSON.stringify(newVal?.return, null, 2))
    
    if (newVal?.return && Array.isArray(newVal.return)) {
      if (newVal.return.length > 0) {
        returnRoute.value = [...newVal.return]
        console.log('✅ returnRoute actualizado:', returnRoute.value)
        console.log('✅ Primer elemento:', returnRoute.value[0])
        console.log('✅ Último elemento:', returnRoute.value[returnRoute.value.length - 1])
      } else {
        console.warn('⚠️ route.return es un array pero está VACÍO')
        returnRoute.value = []
      }
    } else {
      console.error('❌ route.return NO es un array válido')
      returnRoute.value = []
    }
    
    console.log('🏁 ===== FIN ROUTE CAMBIÓ =====\n')
  },
  { deep: true, immediate: true }
)

// 🔥 WATCH para MEDIOS DE TRANSPORTE con LOGS DETALLADOS
watch(
  () => props.row.meanstransport,
  (newVal) => {
    console.log('🔄 ===== MEANSTRANSPORT CAMBIÓ =====')
    console.log('📦 Valor completo:', newVal)
    console.log('📦 Tipo:', typeof newVal)
    
    // GO MEANSTRANSPORT
    console.log('🟢 --- MEDIOS DE IDA (GO) ---')
    console.log('🔍 meanstransport.go:', newVal?.go)
    console.log('🔍 Es array?:', Array.isArray(newVal?.go))
    console.log('🔍 Longitud:', newVal?.go?.length)
    console.log('🔍 Contenido:', JSON.stringify(newVal?.go, null, 2))
    
    if (newVal?.go && Array.isArray(newVal.go)) {
      if (newVal.go.length > 0) {
        goMeanstransport.value = [...newVal.go]
        console.log('✅ goMeanstransport actualizado:', goMeanstransport.value)
      } else {
        console.warn('⚠️ meanstransport.go está VACÍO')
        goMeanstransport.value = []
      }
    } else {
      console.error('❌ meanstransport.go NO es válido')
      goMeanstransport.value = []
    }
    
    // RETURN MEANSTRANSPORT
    console.log('🔴 --- MEDIOS DE REGRESO (RETURN) ---')
    console.log('🔍 meanstransport.return:', newVal?.return)
    console.log('🔍 Es array?:', Array.isArray(newVal?.return))
    console.log('🔍 Longitud:', newVal?.return?.length)
    console.log('🔍 Contenido:', JSON.stringify(newVal?.return, null, 2))
    
    if (newVal?.return && Array.isArray(newVal.return)) {
      if (newVal.return.length > 0) {
        returnMeanstransport.value = [...newVal.return]
        console.log('✅ returnMeanstransport actualizado:', returnMeanstransport.value)
      } else {
        console.warn('⚠️ meanstransport.return está VACÍO')
        returnMeanstransport.value = []
      }
    } else {
      console.error('❌ meanstransport.return NO es válido')
      returnMeanstransport.value = []
    }
    
    console.log('🏁 ===== FIN MEANSTRANSPORT CAMBIÓ =====\n')
  },
  { deep: true, immediate: true }
)

onBeforeMount(async () => {
    console.log('🚀 ===== INICIO onBeforeMount =====')
    console.log('📦 props.row completo:', props.row)
    console.log('📦 props.row.route:', props.row.route)
    console.log('📦 props.row.meanstransport:', props.row.meanstransport)
    
    user.value = $q.localStorage.getItem('user') || {}
    
    // 🧠 Carga del trabajador público o supervisor
    if (props.row.publicWorker) {
        const { data } = await userStore.getUserParams(props.row.publicWorker)
        publicWorker.value = data?.name || ''
    } else if (props.row.supervisor_id) {
        const { data } = await userStore.getUserParams(props.row.supervisor_id)
        publicWorker.value = data?.name || ''
    }

    // 📅 Fechas
    tripStart.value = props.row.tripStart?.slice(0, 10) || ''
    tripEnd.value = props.row.tripEnd?.slice(0, 10) || ''

    // 👨‍💼 Pagador
    paymaster.value = {
        name: props.row.paymaster?.name || '-',
        id: props.row.paymaster?.id || '',
        position: props.row.paymaster?.position || '-'
    }

    // 📍 Lugares e instituciones
    place.value = Array.isArray(props.row.places) ? props.row.places : []
    institute.value = Array.isArray(props.row.institutes) ? props.row.institutes : []

    observations.value = Array.isArray(props.row.observations) ? props.row.observations : []

    console.log('🟢 --- CARGANDO RUTAS INICIAL ---')
    // 🚩 Cargar RUTAS inicial (si ya existen)
    if (props.row.route?.go?.length > 0) {
        goRoute.value = [...props.row.route.go]
        console.log('✅ goRoute inicial cargado:', goRoute.value)
    } else {
        console.warn('⚠️ NO hay route.go inicial')
    }
    
    if (props.row.route?.return?.length > 0) {
        returnRoute.value = [...props.row.route.return]
        console.log('✅ returnRoute inicial cargado:', returnRoute.value)
    } else {
        console.warn('⚠️ NO hay route.return inicial')
    }

    console.log('🚍 --- CARGANDO MEDIOS INICIAL ---')
    // 🚍 Cargar MEDIOS DE TRANSPORTE inicial (si ya existen)
    if (props.row.meanstransport?.go?.length > 0) {
        goMeanstransport.value = [...props.row.meanstransport.go]
        console.log('✅ goMeanstransport inicial cargado:', goMeanstransport.value)
    } else {
        console.warn('⚠️ NO hay meanstransport.go inicial')
    }
    
    if (props.row.meanstransport?.return?.length > 0) {
        returnMeanstransport.value = [...props.row.meanstransport.return]
        console.log('✅ returnMeanstransport inicial cargado:', returnMeanstransport.value)
    } else {
        console.warn('⚠️ NO hay meanstransport.return inicial')
    }

    // =======================================================
    // 🗓 CÓDIGO CORREGIDO PARA GENERAR Y FUSIONAR ACTIVIDADES
    // =======================================================
    const start = tripStart.value ? date.extractDate(tripStart.value, 'YYYY-MM-DD') : null
    const end = tripEnd.value ? date.extractDate(tripEnd.value, 'YYYY-MM-DD') : null

    // 1. Crear un mapa de las actividades existentes (props.row.activities) para fácil acceso.
    const existingActivitiesMap = (Array.isArray(props.row.activities) ? props.row.activities : [])
        .reduce((map, activity) => {
            if (activity.date) {
                // Asegura que la clave sea la fecha 'YYYY-MM-DD'
                map[activity.date.slice(0, 10)] = activity.items; 
            }
            return map;
        }, {});
    
    console.log('🔍 Mapa de actividades existentes:', existingActivitiesMap);

    activities.value = [] // Se inicializa el array que contendrá las actividades finales

    if (start && end && start <= end) {
        const dateDiff = date.getDateDiff(end, start, 'days')

        for (let i = 0; i <= dateDiff; i++) {
            const currentDate = date.addToDate(start, { days: i })
            const formatted = date.formatDate(currentDate, 'YYYY-MM-DD')
            
            // 2. Buscar si ya hay actividades guardadas para este día
            const itemsForDay = existingActivitiesMap[formatted];

            activities.value.push({
                date: formatted,
                // Si itemsForDay existe, úsalo. Si no, usa el placeholder vacío.
                items: itemsForDay || [{ data: '', startTime: '', endTime: '' }] 
            })
        }
    } else {
        // En caso de que no haya fechas válidas
        activities.value.push({ date: '', items: [{ data: '', startTime: '', endTime: '' }] })
    }
    // =======================================================
    
    // 📋 Firma: siempre se carga independiente del estado
    signature.value = props.row.signature || {
        publicWorker: null,
        paymaster: null
    }

    // 📋 Datos adicionales según estado
    if ([2, 4, 6].includes(props.row.status?.index)) {
        conclusions.value = props.row.conclusions || []
        collections.value = (props.row.collections || []).map(collection => ({
            ...collection,
            items: Array.isArray(collection.items) ? collection.items : []
        }))
        legalization.value = props.row.legalization || {
            createdAt: null,
            signature: { publicWorker: null }
        }
    }
    
    console.log('🏁 ===== FIN onBeforeMount =====\n')
})

// Dentro de <script setup> (después de 'const legalization = ref(...)')

const formatTime12h = (time) => {
  return time || '--:--'
}


</script>


<style scoped>
.border-bottom {
    border-bottom: 1px solid black;
}

.border-right {
    border-right: 1px solid black;
}

</style>