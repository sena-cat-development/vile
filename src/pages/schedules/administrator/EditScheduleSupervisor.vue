<template>
  < <q-page class="q-pa-md">
    <div class="row justify-center">

      <div class="col-12 col-md-10 col-lg-9">
        <div class="text-h5 text-center q-mb-md">
          Editar Agenda
        </div>

        <q-card class="q-pa-md">
          <q-form @submit.prevent="guardar">

            <!-- CLASIFICACIÓN DE LA INFORMACIÓN -->
            <q-select v-model="infoClassification" label="Clasificación de la información"
              :options="['Pública', 'Pública Clasificada', 'Pública Reservada']" outlined dense class="q-mb-md" />

            <!-- REGIONAL -->
            <q-select v-model="regional" :options="regionalOptions" label="Regional" outlined emit-value map-options
              class="q-mb-md" @update:model-value="onRegionalChange" />

            <!-- INSTITUTO -->
            <q-select v-model="institute" :options="instituteOptions" label="Instituto" outlined emit-value map-options
              :disable="!regional" />

            <!-- LUGAR -->
            <q-input v-model="place" label="Lugar" outlined class="q-mb-md" />


            <!-- EMPRESA -->
            <q-input v-model="company" label="Empresa" outlined class="q-mb-md" />

            <!-- CONTACTO -->
            <q-input v-model="companyContact" label="Contacto empresa" outlined class="q-mb-md" />

            <!-- FECHAS -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <q-input v-model="tripStart" type="date" label="Fecha inicio" outlined />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="tripEnd" type="date" label="Fecha fin" outlined />
              </div>
            </div>

            <!-- OBJETIVO -->
            <q-input v-model="tripObjective" type="textarea" label="Objetivo del viaje" outlined class="q-mb-md"
              rows="3" />

            <!-- RUTA DE IDA -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Ruta de Ida</div>

              <q-card flat bordered class="q-pa-md bg-grey-2">

                <!-- OTRO DESTINO (todas las rutas juntas) -->
                <q-input v-model="routeGo[0].legacy" label="Otro destino" outlined dense class="q-mb-md" />

                <!-- DEPARTAMENTO -->
                <q-select v-model="routeGo[0].county" :options="countyOptions" label="Departamento" outlined dense
                  emit-value map-options class="q-mb-md" @update:model-value="val => onCountyChange(val, 0, 'go')" />

                <!-- MUNICIPIO -->
                <q-select v-model="routeGo[0].city" :options="cityOptionsByKey['go-0'] || []"
                  label="Seleccionar Municipio" outlined dense multiple emit-value map-options
                  :disable="!routeGo[0].county" />

              </q-card>
            </div>

            <!-- RUTA DE REGRESO -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Ruta de Regreso</div>

              <q-card flat bordered class="q-pa-md bg-grey-2">

                <!-- OTRO DESTINO -->
                <q-input v-model="routeReturn[0].legacy" label="Otro destino"
                  placeholder="Escribe un destino personalizado" outlined dense class="q-mb-md" />

                <!-- DEPARTAMENTO -->
                <q-select v-model="routeReturn[0].county" :options="countyOptions" label="Departamento" outlined dense
                  emit-value map-options class="q-mb-md"
                  @update:model-value="val => onCountyChange(val, 0, 'return')" />


                <!-- MUNICIPIO -->
                <q-select v-model="routeReturn[0].city" :options="cityOptionsByKey['return-0'] || []"
                  label="Seleccionar Municipio" outlined dense multiple emit-value map-options
                  :disable="!routeReturn[0].county"/>

                <div class="row justify-end">
                  <q-btn color="positive" icon="check" label="AGREGAR" unelevated />
                </div>

              </q-card>
            </div>


            <!-- MEDIO DE TRANSPORTE IDA -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Medio de Transporte - Ida</div>
              <div v-for="(item, index) in meansTransportGo" :key="index" class="row q-gutter-sm q-mb-sm">
                <q-input v-model="meansTransportGo[index]" label="Medio de transporte" outlined dense class="col" />
                <q-btn icon="delete" color="negative" flat dense @click="meansTransportGo.splice(index, 1)" />
              </div>
              <q-btn icon="add" label="Agregar medio" flat dense color="primary" @click="meansTransportGo.push('')" />
            </div>

            <!-- MEDIO DE TRANSPORTE REGRESO -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Medio de Transporte - Regreso</div>
              <div v-for="(item, index) in meansTransportReturn" :key="index" class="row q-gutter-sm q-mb-sm">
                <q-input v-model="meansTransportReturn[index]" label="Medio de transporte" outlined dense class="col" />
                <q-btn icon="delete" color="negative" flat dense @click="meansTransportReturn.splice(index, 1)" />
              </div>
              <q-btn icon="add" label="Agregar medio" flat dense color="primary"
                @click="meansTransportReturn.push('')" />
            </div>

            <!-- FUNCIONES -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Funciones</div>
              <div v-for="(duty, index) in duties" :key="index" class="row q-gutter-sm q-mb-sm">
                <q-input v-model="duties[index]" outlined dense class="col" />
                <q-btn icon="delete" color="negative" flat dense @click="duties.splice(index, 1)" />
              </div>
              <q-btn icon="add" label="Agregar función" flat dense color="primary" @click="duties.push('')" />
            </div>

            <!-- ACTIVIDADES -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Actividades por Fecha</div>
              <div v-for="(act, index) in activities" :key="index" class="q-mb-md q-pa-md bg-grey-1 rounded-borders">
                <q-input v-model="activities[index].date" type="date" label="Fecha" outlined dense class="q-mb-sm" />
                <div class="text-caption q-mb-xs">Items de la actividad:</div>
                <div v-for="(item, itemIndex) in act.items" :key="itemIndex"
                  class="q-mb-sm q-pa-sm bg-white rounded-borders">
                  <q-input v-model="activities[index].items[itemIndex].data" label="Descripción de la actividad"
                    outlined dense class="q-mb-sm" />
                  <div class="row q-col-gutter-sm q-mb-sm">
                    <div class="col-12 col-md-6">
                      <q-input v-model="activities[index].items[itemIndex].startTime" type="time" label="Hora inicio"
                        outlined dense />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input v-model="activities[index].items[itemIndex].endTime" type="time" label="Hora fin"
                        outlined dense />
                    </div>
                  </div>
                  <q-btn icon="delete" label="Eliminar item" color="negative" flat dense size="sm"
                    @click="activities[index].items.splice(itemIndex, 1)" />
                </div>
                <div class="row q-gutter-sm q-mt-sm">
                  <q-btn icon="add" label="Agregar item" flat dense size="sm" color="primary"
                    @click="activities[index].items.push({ data: '', startTime: null, endTime: null })" />
                  <q-btn icon="delete" label="Eliminar día" flat dense size="sm" color="negative"
                    @click="activities.splice(index, 1)" />
                </div>
              </div>
            </div>

            <!-- OBSERVACIONES -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Observaciones / Gastos</div>

              <div v-for="(obs, index) in observations" :key="index" class="q-mb-md q-pa-md bg-grey-1 rounded-borders">
                <q-input v-model="observations[index].text" type="textarea" label="Descripción" outlined dense rows="2"
                  class="q-mb-sm" />

                <div class="row q-gutter-sm items-center">
                  <q-input outlined dense label="Monto" prefix="$" class="col"
                    :model-value="moneyStore.format(obs.amount)" @update:model-value="val => {
                      observations[index].amount = Number(val.replace(/\./g, '')) || 0
                    }" />

                  <q-btn icon="delete" label="Eliminar" flat dense color="negative"
                    @click="observations.splice(index, 1)" />
                </div>
              </div>

              <q-btn icon="add" label="Agregar observación" flat color="primary"
                @click="observations.push({ key: '', text: '', amount: 0 })" />
            </div>


            <!-- BOTONES -->
            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn label="Cancelar" color="grey" flat @click="volver" />
              <q-btn label="Guardar cambios" color="primary" type="submit" :loading="loading" />
            </div>

          </q-form>
        </q-card>
      </div>
    </div>

    <q-btn round color="info" icon="visibility" size="lg" class="preview-fab" @click="abrirVistaPrevia" />


    <!-- DIALOG DE VISTA PREVIA -->
    <q-dialog v-model="showPreview" maximized>
      <q-card style="width: 900px; max-width: 95vw; height: 90vh;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista Previa de la Agenda</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <Preview v-if="scheduleData" :row="scheduleData" />
        </q-card-section>
      </q-card>
    </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onBeforeMount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useScheduleStore } from '../../../stores/schedule'
import Preview from '../contractor/Preview.vue'
import { useMoneyStore } from '../../../stores/money.js'

const moneyStore = useMoneyStore()


const route = useRoute()
const router = useRouter()
const scheduleStore = useScheduleStore()

const loading = ref(false)
const showPreview = ref(false)
const scheduleData = ref(null)

/* MODELOS (INPUTS) - BÁSICOS */
const typeSchedule = ref(null)
const infoClassification = ref(null)
const place = ref('')
const company = ref('')
const companyContact = ref('')
const tripStart = ref('')
const tripEnd = ref('')
const tripObjective = ref('')

/* SUPERVISOR */
const supervisorId = ref(null)
const supervisorName = ref('')
const supervisorPosition = ref('')

/* PAGADOR */
const paymasterId = ref(null)
const paymasterName = ref('')
const paymasterPosition = ref('')

/* CONTRATO */
const contractNumber = ref('')
const contractorName = ref('')
const contractMail = ref('')
const contractObject = ref('')
const contractDate = ref('')

/* RUTAS - Ahora siempre en formato nuevo con county/city */
const routeGo = ref([
  {
    legacy: '',     // ← aquí va "Bogotá"
    county: null,
    city: []
  }
])

const routeReturn = ref([
  {
    legacy: '',
    county: null,
    city: []
  }
])


const countyOptions = ref([])
const cityOptionsByKey = ref({})

/* MEDIOS DE TRANSPORTE */
const meansTransportGo = ref([])
const meansTransportReturn = ref([])

/* ARRAYS COMPLEJOS */
const duties = ref([])
const activities = ref([])
const observations = ref([])
const results = ref([])
const conclusions = ref([])

const regional = ref(null)
const institute = ref(null)

const regionalOptions = ref([])
const instituteOptions = ref([])

function getLabelByValue(options, value) {
  return options.find(o => o.value === value)?.label || value
}

const loadCounties = async () => {
  const res = await scheduleStore.getCounty()
  countyOptions.value = res.data.map(c => ({
    label: c.name,
    value: c._id
  }))
}

const loadCities = async (countyIds, index, type) => {
  if (!Array.isArray(countyIds) || !countyIds.length) return

  let cities = []

  for (const countyId of countyIds) {
    const res = await scheduleStore.getCity(countyId)
    cities.push(
      ...res.data.map(c => ({
        label: c.name,
        value: c._id
      }))
    )
  }

  // Eliminar duplicados
  const unique = Object.values(
    cities.reduce((acc, c) => {
      acc[c.value] = c
      return acc
    }, {})
  )

  cityOptionsByKey.value[`${type}-${index}`] = unique
}


/* CARGAR AGENDA */
onBeforeMount(async () => {
  await loadCounties()

  try {
    console.log('ID recibido:', route.params.id)

    /* 1️⃣ CARGAR REGIONALES */
    const regionalRes = await scheduleStore.getCounty()
    regionalOptions.value = regionalRes.data.map(r => ({
      label: r.name,
      value: r._id
    }))



    /* 2️⃣ CARGAR AGENDA */
    const res = await scheduleStore.getScheduleById(route.params.id)
    console.log('Respuesta completa:', res)

    const s = res.data

    // Guardar datos completos para la vista previa
    scheduleData.value = s

    if (!s || !s._id) {
      Notify.create({
        type: 'warning',
        message: 'No se encontró la agenda'
      })
      router.back()
      return
    }

    /* 3️⃣ CAMPOS BÁSICOS */
    typeSchedule.value = s.typeSchedule ?? null
    infoClassification.value = s.infoClassification ?? null

    regional.value =
      s.regional && typeof s.regional === 'object'
        ? s.regional._id
        : s.regional ?? null


    /* 4️⃣ CARGAR INSTITUTOS SEGÚN REGIONAL */
    if (regional.value) {
      const instituteRes = await scheduleStore.getInstitute(regional.value)
      instituteOptions.value = instituteRes.data.map(city => ({
        label: city.name,
        value: city._id
      }))
    }

    institute.value =
      s.institute && typeof s.institute === 'object'
        ? s.institute._id
        : s.institute ?? null


    place.value = s.place ?? ''
    company.value = s.company ?? ''
    companyContact.value = s.companyContact ?? ''

    tripStart.value = s.tripStart ? s.tripStart.slice(0, 10) : ''
    tripEnd.value = s.tripEnd ? s.tripEnd.slice(0, 10) : ''
    tripObjective.value = s.tripObjective ?? ''

    /* 5️⃣ SUPERVISOR */
    if (s.supervisor) {
      supervisorId.value = s.supervisor.id ?? null
      supervisorName.value = s.supervisor.name ?? ''
      supervisorPosition.value = s.supervisor.position ?? ''
    }

    /* 6️⃣ PAGADOR */
    if (s.paymaster) {
      paymasterId.value = s.paymaster.id ?? null
      paymasterName.value = s.paymaster.name ?? ''
      paymasterPosition.value = s.paymaster.position ?? ''
    }

    /* 7️⃣ CONTRATO */
    if (s.contract) {
      contractNumber.value = s.contract.number ?? ''
      contractorName.value = s.contract.contractorName ?? ''
      contractMail.value = s.contract.mail ?? ''
      contractObject.value = s.contract.object ?? ''

      if (s.contract.date?.start) {
        contractDate.value = s.contract.date.start.slice(0, 10)
      }
    }

    /* 8️⃣ RUTAS - Convertir formato legacy a selects vacíos */
    if (s.route) {
      const mapRouteData = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return [{ county: [], city: [] }];

        return arr.map(r => {
          // Si el campo es legacy y viene como 'data', lo tratamos como ciudad
          // Si el select es multiple, el valor DEBE ser un array [v]
          const cityValue = r.city ? (Array.isArray(r.city) ? r.city : [r.city])
            : (r.data ? [r.data] : []);

          const countyValue = r.county ? (Array.isArray(r.county) ? r.county : [r.county])
            : [];

          return {
            county: countyValue,
            city: cityValue,
            _id: r._id // Mantener el ID original del objeto de ruta
          };
        });
      };

      if (s.route?.go?.length) {
        routeGo.value = [{
          county: null,
          city: s.route.go.map(r => r.data), // 🔥 AQUÍ
        }]
      }

      if (s.route?.return?.length) {
        routeReturn.value = [{
          county: [],
          city: s.route.return.map(r => r.data),
        }]
      }



      // 2. CARGAR LAS LISTAS DE CIUDADES (Sin esto, el select de ciudad sale vacío)
      nextTick(() => {
        routeGo.value.forEach((item, index) => {
          if (item.county > 0) {
            loadCities(item.county, index, 'go');
          }
        });
        routeReturn.value.forEach((item, index) => {
          if (item.county > 0) {
            loadCities(item.county, index, 'return');
          }
        });
      });
    }

    /* 🔟 FUNCIONES */
    duties.value = Array.isArray(s.duties)
      ? s.duties.map(d => typeof d === 'object' ? d.data : d)
      : []

    /* 1️⃣1️⃣ ACTIVIDADES */
    activities.value = Array.isArray(s.activities)
      ? s.activities.map(act => ({
        date: act.date || '',
        items: Array.isArray(act.items)
          ? act.items.map(item => ({
            data: item.data || '',
            startTime: item.startTime || null,
            endTime: item.endTime || null,
            _id: item._id
          }))
          : [],
        _id: act._id
      }))
      : []

    /* 1️⃣2️⃣ OBSERVACIONES */
    observations.value = Array.isArray(s.observations)
      ? s.observations.map(obs => ({
        key: obs.key || '',
        text: obs.text || '',
        amount: obs.amount || 0,
        _id: obs._id
      }))
      : []

    /* 1️⃣3️⃣ RESULTADOS Y CONCLUSIONES */
    results.value = Array.isArray(s.results) ? [...s.results] : []
    conclusions.value = Array.isArray(s.conclusions) ? [...s.conclusions] : []

  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'Error al cargar la agenda'
    })
    router.back()
  }
})

const convertirRutaAString = async (rutas) => {
  const rutasConvertidas = []

  for (const r of rutas) {
    // Si no hay ciudades seleccionadas ni datos legacy
    if (!r.city?.length) {
      rutasConvertidas.push({ data: '' })
      continue
    }

    let cityNames = []

    // 1. Manejar casos donde r.city ya tiene los nombres (Strings legacy)
    // Si el primer elemento no parece un ID de MongoDB (ej. tiene espacios o es corto),
    // asumimos que ya son nombres.
    const isLegacy = r.city.some(c => c && c.length > 0 && !/^[0-9a-fA-F]{24}$/.test(c))

    if (isLegacy) {
      cityNames = [...r.city]
    } else {
      // 2. Si son IDs, buscamos en la API
      for (const countyId of (r.county || [])) {
        try {
          const cityRes = await scheduleStore.getCity(countyId)
          const cities = cityRes.data
            .filter(c => r.city.includes(c._id))
            .map(c => c.name)
          cityNames.push(...cities)
        } catch (error) {
          console.error('Error cargando ciudades:', error)
        }
      }
    }

    // Si después de buscar no hay nombres (caso donde el ID no se encontró en la API)
    // usamos lo que esté en r.city para no dejarlo vacío
    if (cityNames.length === 0 && r.city.length > 0) {
      cityNames = [...r.city]
    }

    rutasConvertidas.push({
      data: cityNames.join(' - ') || 'Sin especificar'
    })
  }

  return rutasConvertidas
}

/* GUARDAR CAMBIOS */
async function guardar() {
  loading.value = true

  try {
    // Convertir rutas a formato String según el modelo

    const regionalSeleccionada = regionalOptions.value.find(o => o.value === regional.value)
    const institutoSeleccionado = instituteOptions.value.find(o => o.value === institute.value)

    const goConverted = await convertirRutaAString(routeGo.value)
    const returnConverted = await convertirRutaAString(routeReturn.value)



    const payload = {
      typeSchedule: typeSchedule.value,
      infoClassification: infoClassification.value,
      regional: regionalSeleccionada ? regionalSeleccionada.label : regional.value,
      institute: institutoSeleccionado ? institutoSeleccionado.label : institute.value,
      place: place.value,
      company: company.value,
      companyContact: companyContact.value,
      tripStart: tripStart.value,
      tripEnd: tripEnd.value,
      tripObjective: tripObjective.value,
      status: scheduleData.value?.status ?? { data: 'Borrador' },

      supervisor: {
        id: supervisorId.value,
        name: supervisorName.value,
        position: supervisorPosition.value
      },

      paymaster: {
        id: paymasterId.value,
        name: paymasterName.value,
        position: paymasterPosition.value
      },

      contract: {
        number: contractNumber.value,
        contractorName: contractorName.value,
        mail: contractMail.value,
        object: contractObject.value,
        date: {
          start: contractDate.value,
          end: contractDate.value
        }
      },

      route: {
        go: goConverted,
        return: returnConverted
      },

      meanstransport: {
        go: meansTransportGo.value.map(m => ({ data: m })),
        return: meansTransportReturn.value.map(m => ({ data: m }))
      },

      duties: duties.value.map(d => ({ data: d })),
      activities: activities.value,
      observations: observations.value,
      results: results.value,
      conclusions: conclusions.value
    }

    console.log('Payload a enviar:', payload)

    await scheduleStore.putSchedule(payload, route.params.id)

    Notify.create({
      type: 'positive',
      message: 'Agenda actualizada correctamente'
    })

    router.back()
  } catch (error) {
    console.error('Error completo:', error)
    Notify.create({
      type: 'negative',
      message: 'Error al guardar la agenda'
    })
  } finally {
    loading.value = false
  }
}

function volver() {
  router.back()
}

/* VISTA PREVIA */
async function abrirVistaPrevia() {
  const goConverted = await convertirRutaAString(routeGo.value)
  const returnConverted = await convertirRutaAString(routeReturn.value)

  scheduleData.value = {
    ...scheduleData.value,
    _id: scheduleData.value?._id,
    contractor: scheduleData.value?.contractor,
    createdAt: scheduleData.value?.createdAt,

    typeSchedule: typeSchedule.value,
    regional: getLabelByValue(regionalOptions.value, regional.value),
    institute: getLabelByValue(instituteOptions.value, institute.value),
    place: place.value,
    company: company.value,
    companyContact: companyContact.value,
    tripStart: tripStart.value,
    tripEnd: tripEnd.value,
    tripObjective: tripObjective.value,

    supervisor: {
      id: supervisorId.value,
      name: supervisorName.value,
      position: supervisorPosition.value
    },

    paymaster: {
      id: paymasterId.value,
      name: paymasterName.value,
      position: paymasterPosition.value
    },

    contract: {
      number: contractNumber.value,
      contractorName: contractorName.value,
      mail: contractMail.value,
      object: contractObject.value,
      regional: scheduleData.value?.contract?.regional,
      institute: scheduleData.value?.contract?.institute,
      date: {
        data: contractDate.value,
        start: contractDate.value,
        end: scheduleData.value?.contract?.date?.end || contractDate.value
      }
    },

    route: {
      go: goConverted,
      return: returnConverted
    },

    meanstransport: {
      go: meansTransportGo.value.map(m => ({ data: m })),
      return: meansTransportReturn.value.map(m => ({ data: m }))
    },

    duties: duties.value.map(d => ({ data: d })),
    activities: activities.value,
    observations: observations.value,
    results: results.value,
    conclusions: conclusions.value,

    signature: scheduleData.value?.signature || {}
  }

  console.log('Vista previa con datos:', scheduleData.value)
  showPreview.value = true
}

function generarActividadesPorRango(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return []

  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)

  if (inicio > fin) return []

  const dias = []
  const fechaActual = new Date(inicio)

  while (fechaActual <= fin) {
    dias.push({
      date: fechaActual.toISOString().slice(0, 10),
      items: [
        {
          data: '',
          startTime: '08:00',
          endTime: '12:00'
        }
      ]
    })

    fechaActual.setDate(fechaActual.getDate() + 1)
  }

  return dias
}

const onRegionalChange = async (countyId) => {
  institute.value = null
  instituteOptions.value = []

  if (!countyId) return

  const { data } = await scheduleStore.getInstitute(countyId)

  instituteOptions.value = data.map(city => ({
    label: city.name,
    value: city._id
  }))
}

function agregarRutaIda() {
  routeGo.value.push({ county: [], city: [] })
}

function agregarRutaRegreso() {
  routeReturn.value.push({ county: [], city: [] })
}

function onCountyChange(val, index, type) {
  if (type === 'go') {
    routeGo.value[index].city = []
  } else {
    routeReturn.value[index].city = []
  }

  delete cityOptionsByKey.value[`${type}-${index}`]

  // 👇 ahora es un solo departamento
  if (val) {
    loadCities([val], index, type)
  }
}





watch([tripStart, tripEnd], ([newStart, newEnd]) => {
  if (!newStart || !newEnd) return
  if (activities.value.length > 0) return

  activities.value = generarActividadesPorRango(newStart, newEnd)
})

// Función para generar el rango de fechas
const updateActivitiesByRange = () => {
  if (!tripStart.value || !tripEnd.value) return

  const start = new Date(tripStart.value)
  const end = new Date(tripEnd.value)

  if (start > end) return // Evitar fechas inválidas

  const newActivities = []
  let current = new Date(start)

  while (current <= end) {
    const dateString = current.toISOString().split('T')[0]

    // 💡 IMPORTANTE: Buscamos si ya existe una actividad para esta fecha
    // para no borrar lo que el usuario ya escribió.
    const existingActivity = activities.value.find(a => a.date === dateString)

    if (existingActivity) {
      newActivities.push(existingActivity)
    } else {
      // Si el día es nuevo, lo agregamos con un item vacío
      newActivities.push({
        date: dateString,
        items: [{ data: '', startTime: null, endTime: null }]
      })
    }

    // Sumar un día
    current.setDate(current.getDate() + 1)
  }

  // Actualizamos el array de actividades con el nuevo rango
  activities.value = newActivities
}

// Observar ambos campos de fecha
watch([tripStart, tripEnd], () => {
  updateActivitiesByRange()
})
</script>

<style scoped>
.preview-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
}
</style>
