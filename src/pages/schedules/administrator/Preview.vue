<template>
    <div class="row justify-center q-my-md" v-if="currentUser?.role?.data === 'user' && !isPdfRendering">
        <q-btn color="primary" icon="folder" label="Mis Documentos de Legalización" @click="showLegalDocs = true" />
    </div>

    <q-dialog v-model="showLegalDocs" persistent>
        <q-card style="width: 90vw; max-width: 1200px; border-radius: 12px;">
            <q-card-section class="row items-center bg-primary text-white">
                <div class="text-h6">Documentos de Legalización</div>
                <q-space />
                <q-btn icon="close" flat dense v-close-popup />
            </q-card-section>
            <q-separator />
            <q-card-section style="max-height: 75vh; overflow-y: auto;">
                <LegalizationDocuments :documents="documentsToShow" />
            </q-card-section>
        </q-card>
    </q-dialog>

    <div v-if="isReady" class="col-6 contenedor-principal contenedor-preview">
        <!-- TÍTULO -->
        <div id="block-titulo" class="row q-pb-md justify-center"
            style="border-bottom: 1px solid black; margin-top: 20px;">
            <div class="col-10">
                <p class="q-my-none text-center" style="font-size: 18px;">
                    <strong>FORMATO INFORME LEGALIZACION DESPLAZAMIENTO - CONTRATISTA</strong>
                </p>
            </div>
        </div>

        <!-- CIUDAD Y FECHA -->
        <div id="block-ciudad-fecha" class="row" style="border-bottom: 1px solid black;">
            <div class="col-12">
                <p class="q-my-none q-pl-xs"><strong>CIUDAD Y FECHA</strong> (En la que se presenta el informe)</p>
            </div>
            <div class="col-12">
                <p v-text="`San Gil - ${createdAt && currentUser.role.data !== 'user' ? date.formatDate(createdAt, 'DD/MM/YYYY') : date.formatDate(Date.now(), 'DD/MM/YYYY')}`"
                    class="q-my-none q-pl-sm" />
            </div>
        </div>

        <!-- PRESENTADO A -->
        <div id="block-presentado" class="row" style="border-bottom: 1px solid black;">
            <div class="col-12">
                <p class="q-my-none q-pl-xs"><strong>PRESENTADO A:</strong> (Nombre del ordenador del gasto y cargo)</p>
            </div>
            <div class="col-12">
                <p v-text="`${paymaster.name} - ${paymaster.position}`" class="q-my-none q-pl-sm" />
            </div>
        </div>

        <!-- ORDEN DE VIAJE -->
        <div id="block-orden-viaje" class="row" style="border-bottom: 1px solid black">
            <div class="col-4" style="border-right: 1px solid black;">
                <div class="row">
                    <div class="col-12">
                        <p class="q-my-none q-pl-xs"><strong>ORDEN DE VIAJE No:</strong></p>
                    </div>
                    <div class="col-12">
                        <p v-text="tripOrder" class="q-my-none q-pl-sm" />
                    </div>
                </div>
            </div>
            <div class="col-4" style="border-right: 1px solid black;">
                <div class="row">
                    <div class="col-12" style="border-bottom: 1px solid black;">
                        <p class="q-my-none q-pl-xs"><strong>FECHA DE INICIO:</strong></p>
                    </div>
                    <div class="col-12">
                        <p v-text="`${tripStart.slice(8, 10)}/${tripStart.slice(5, 7)}/${tripStart.slice(0, 4)}`"
                            class="q-my-none q-pl-sm" />
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="row">
                    <div class="col-12" style="border-bottom: 1px solid black;">
                        <p class="q-my-none q-pl-xs"><strong>FECHA DE FINALIZACIÓN:</strong></p>
                    </div>
                    <div class="col-12">
                        <p v-text="`${tripEnd.slice(8, 10)}/${tripEnd.slice(5, 7)}/${tripEnd.slice(0, 4)}`"
                            class="q-my-none q-pl-sm" />
                    </div>
                </div>
            </div>
        </div>

        <!-- LUGAR -->
        <div id="block-lugar" class="row" style="border-bottom: 1px solid black;">
            <div class="col-4" style="border-right: 1px solid black;">
                <div class="row">
                    <div class="col-12">
                        <p class="q-my-none q-pl-xs"><strong>LUGAR A DONDE REALIZÓ EL DESPLAZAMIENTO</strong></p>
                    </div>
                    <div class="col-12">
                        <p v-text="company" class="q-my-none q-pl-sm" />
                    </div>
                </div>
            </div>
            <div class="col-4" style="border-right: 1px solid black;">
                <div class="row">
                    <div class="col-12" style="border-bottom: 1px solid black;">
                        <p class="q-my-none q-pl-xs"><strong>REGIONAL / CENTRO DE FORMACIÓN</strong></p>
                    </div>
                    <div class="col-12">
                        <p v-text="regional !== null ? `${regional} / ${institute}` : '-'" class="q-my-none q-pl-sm" />
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="row">
                    <div class="col-12" style="border-bottom: 1px solid black;">
                        <p class="q-my-none q-pl-xs"><strong>OTRA: (ciudad)</strong></p>
                    </div>
                    <div class="col-12">
                        <p v-text="place || '-'" class="q-my-none q-pl-sm" />
                    </div>
                </div>
            </div>
        </div>

        <!-- OBJETIVO -->
        <div id="block-objetivo" class="row" style="border-bottom: 1px solid black;">
            <div class="col-12">
                <p class="q-my-none q-pl-xs"><strong>OBJETIVO DEL DESPLAZAMIENTO:</strong></p>
            </div>
            <div class="col-12">
                <p v-text="tripObjective" class="q-my-none q-px-sm" />
            </div>
        </div>

        <!-- ACTIVIDADES DESARROLLADAS -->
        <div id="block-actividades" style="border-bottom: 1px solid black;">
            <div class="row">
                <p class="q-my-none q-pl-xs"><strong>ACTIVIDADES DESARROLLADAS</strong></p>
            </div>
            <div class="row">
                <div v-for="(element, index) in mainActivities" class="col-12">
                    <p class="q-my-none q-pl-md">
                        <strong v-text="`${parseInt(index) + 1}. `" />{{ element.data || 'Actividad' }}
                    </p>
                </div>
            </div>
        </div>

        <!-- RESULTADOS -->
        <div id="block-resultados" style="border-bottom: 1px solid black;">
            <div class="row">
                <p class="q-my-none q-pl-xs"><strong>RESULTADOS:</strong></p>
            </div>
            <div class="row">
                <div v-for="(element, index) in results" class="col-12">
                    <p class="q-my-none q-pl-md">
                        <strong v-text="`${index + 1}. `" />{{ element.data || 'Resultado' }}
                    </p>
                </div>
            </div>
        </div>

        <!-- EVIDENCIAS -->
        <div id="block-evidencias" class="row" style="border-bottom: 1px solid black;">
            <p class="q-my-none q-pl-xs"><strong>EVIDENCIAS O SOPORTES:</strong></p>
            <div class="col-12">
                <div v-for="(element, index) in collections" :key="index" class="q-mt-md q-mb-md"
                    style="page-break-inside: avoid; break-inside: avoid;">
                    <p class="q-my-none q-mb-sm q-pl-xs" style="font-size: 14px;">
                        <strong>{{ index + 1 }}. {{ element.name }}</strong>
                    </p>
                    <div v-for="(pair, pairIndex) in chunkItems(element.items, 2)" :key="pairIndex"
                        style="display: flex; flex-direction: row; width: 100%; margin-bottom: 8px;">
                        <div v-for="(item, itemIndex) in pair" :key="itemIndex"
                            style="flex: 1; display: flex; justify-content: center; align-items: center; padding: 4px;">
                            <img :src="item.url" crossorigin="anonymous"
                                style="max-width: 100%; max-height: 180px; width: auto; height: auto; display: block;" />
                        </div>
                        <div v-if="pair.length === 1" style="flex: 1;" />
                    </div>
                </div>
            </div>
        </div>

        <!-- COMPROMISOS -->
        <div id="block-compromisos" style="border-bottom: 1px solid black;">
            <div class="row justify-center" style="border-bottom: 1px solid black;">
                <p class="q-my-none"><strong>COMPROMISOS</strong></p>
            </div>
            <div class="row" style="border-bottom: 1px solid black;">
                <div class="col-4" style="border-right: 1px solid black;">
                    <p class="q-my-none text-center"><strong>ACTIVIDAD</strong></p>
                </div>
                <div class="col-4" style="border-right: 1px solid black;">
                    <p class="q-my-none text-center"><strong>REPONSABLE</strong></p>
                </div>
                <div class="col-4">
                    <p class="q-my-none text-center"><strong>FECHA</strong></p>
                </div>
            </div>
            <div v-for="(element, index) in activities" class="row">
                <div v-for="(item, itemIndex) in element.items" class="col-12" style="border-bottom: 1px solid black;">
                    <div class="row">
                        <div class="col-4" style="border-right: 1px solid black;">
                            <p class="q-my-none q-pl-sm">
                                <strong v-text="`${getNumberOther()}. `" />{{ item.data || 'Actividad' }}
                            </p>
                        </div>
                        <div class="col-4" style="border-right: 1px solid black;">
                            <p v-text="contractorName" class="q-my-none text-center" />
                        </div>
                        <div class="col-4">
                            <p v-text="`${element.date.slice(8, 10)}/${element.date.slice(5, 7)}/${element.date.slice(0, 4)}`"
                                class="q-my-none text-center" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CONCLUSIONES -->
        <div id="block-conclusiones" style="border-bottom: 1px solid black;">
            <div class="row">
                <p class="q-my-none q-pl-xs"><strong>CONCLUSIONES:</strong></p>
            </div>
            <div class="row">
                <div v-for="(element, index) in conclusions" class="col-12">
                    <p class="q-my-none q-pl-xs">
                        <strong v-text="`${index + 1}. `" />
                        {{ element.data || 'Conclusión' }}
                    </p>
                </div>
            </div>
        </div>

        <!-- DATOS DEL CONTRATISTA -->
        <div id="block-contratista" style="border-bottom: 1px solid black;">
            <div class="row justify-center" style="border-bottom: 1px solid black;">
                <p class="q-my-none"><strong>DATOS DEL CONTRATISTA</strong></p>
            </div>
            <div class="row" style="border-bottom: 1px solid black;">
                <div class="col-8" style="border-right: 1px solid black;">
                    <p class="q-my-none q-pl-xs"><strong>NOMBRE Y APELLIDO</strong></p>
                </div>
                <div class="col-4">
                    <p class="q-my-none text-center"><strong>FIRMA</strong></p>
                </div>
            </div>
            <div class="row">
                <div class="col-8" style="border-right: 1px solid black;">
                    <p v-text="contractorName" class="q-my-none q-pl-sm" />
                </div>
                <div class="col-4">
                    <img v-if="sign.contractor || sign.publicWorker"
                        :src="sign.contractor || sign.publicWorker" crossorigin="anonymous"
                        style="width: 180px; height: 75px; margin-left: 6.5px; margin-top: 4px; object-fit: contain;" />
                </div>
            </div>
        </div>

        <!-- VISTO BUENO SUPERVISOR -->
        <div id="block-supervisor" style="border-bottom: 1px solid black;">
            <div class="row justify-center" style="border-bottom: 1px solid black;">
                <p class="q-my-none"><strong>VISTO BUENO SUPERVISOR</strong></p>
            </div>
            <div class="row" style="border-bottom: 1px solid black;">
                <div class="col-4" style="border-right: 1px solid black;">
                    <p class="q-my-none q-pl-xs"><strong>CARGO DEL SUPERVISOR</strong></p>
                </div>
                <div class="col-4" style="border-right: 1px solid black;">
                    <p class="q-my-none q-pl-xs"><strong>NOMBRE Y APELLIDO SUPERVISOR</strong></p>
                </div>
                <div class="col-4">
                    <p class="q-my-none text-center"><strong>FIRMA</strong></p>
                </div>
            </div>
            <div class="row">
                <div class="col-4" style="border-right: 1px solid black;">
                    <p v-text="props.row.supervisor?.position || '-'" class="q-my-none q-pl-sm" />
                </div>
                <div class="col-4" style="border-right: 1px solid black;">
                    <p v-text="props.row.supervisor?.name || '-'" class="q-my-none q-pl-sm" />
                </div>
                <div class="col-4">
                    <img v-if="sign.supervisor" :src="sign.supervisor" crossorigin="anonymous"
                        style="width: 180px; height: 75px; margin-left: 6.5px; margin-top: 4px; object-fit: contain;" />
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { date, useQuasar } from 'quasar'
import LegalizationDocuments from '../administrator/LegalizationDocuments.vue'
const showLegalDocs = ref(false)

const props = defineProps({
    row: Object,
    isPdfRendering: Boolean
})

const isReady = ref(false)

const $q = useQuasar()

const documentsToShow = computed(() => {
    return props.row?.legalization?.documents || {}
})


    const BASE_URL = import.meta.env.VITE_API_URL

async function convertirImagenABase64(url) {
    try {
        // Construir URL completa si es relativa
        // ✅ agregar blob: a la condición
        const fullUrl = (url.startsWith('http') || url.startsWith('blob:')) ? url : `${BASE_URL}${url}`
        const response = await fetch(fullUrl, {
            headers: {
                // Si tu backend requiere token
                // 'Authorization': `Bearer ${$q.localStorage.getItem('token')}`
            }
        })

        if (!response.ok) {
            console.error('Error fetch imagen:', fullUrl, response.status)
            return fullUrl // retornar URL completa como fallback
        }

        const blob = await response.blob()
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(blob)
        })
    } catch (e) {
        console.error('convertirImagenABase64 error:', e, url)
        // ✅ agregar blob: a la condición
const fullUrl = (url.startsWith('http') || url.startsWith('blob:')) ? url : `${BASE_URL}${url}`
        return fullUrl
    }
}

// ✅ Función para agrupar imágenes en pares
function chunkItems(items, size) {
    const chunks = []
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size))
    }
    return chunks
}

// ✅ onBeforeMount async
onBeforeMount(async () => {
    currentUser.value = $q.localStorage.getItem('user')
    createdAt.value = props.row.legalization.createdAt
    paymaster.value = props.row.paymaster
    tripOrder.value = props.row.tripOrder
    tripStart.value = props.row.tripStart
    tripEnd.value = props.row.tripEnd
    place.value = props.row.place
    institute.value = props.row.institute
    regional.value = props.row.regional
    company.value = props.row.company
    tripObjective.value = props.row.tripObjective

    // ✅ Colecciones con conversión a base64
    collections.value = await Promise.all(
        (props.row.collections || []).map(async collection => {
            console.log('Procesando collection:', collection.name, 'items:', collection.items)

            const items = await Promise.all(
                (collection.items || []).map(async img => {
                    let url = null

                    if (img.url) url = img.url
                    else if (img.__img?.src) url = img.__img.src
                    else if (img instanceof File) url = URL.createObjectURL(img)
                    else if (typeof img === 'string') url = img

                    console.log('URL antes de convertir:', url)

                    if (!url) return null

                    const base64 = await convertirImagenABase64(url)
                    console.log('URL después de convertir:', base64?.substring(0, 50))
                    return { url: base64 }
                })
            )
            return { ...collection, items: items.filter(Boolean) }
        })
    )

    const rawSign = props.row.legalization.signature
    sign.value = {
        contractor: rawSign?.contractor
            ? await convertirImagenABase64(rawSign.contractor)
            : null,
        publicWorker: rawSign?.publicWorker
            ? await convertirImagenABase64(rawSign.publicWorker)
            : null,
        supervisor: rawSign?.supervisor
            ? await convertirImagenABase64(rawSign.supervisor)
            : null
    }
    results.value = props.row.results
    contractorName.value = props.row.contract.contractorName
    conclusions.value = props.row.conclusions

    for (let index = 0; index < props.row.activities.length; index++) {
        for (let itemIndex = 0; itemIndex < props.row.activities[index].items.length; itemIndex++) {
            mainActivities.value.push({ data: props.row.activities[index].items[itemIndex].data })
        }
    }

    activities.value = props.row.activities
    isReady.value = true

})

const createdAt = ref('')
const currentUser = ref({})
const paymaster = ref(null)
const contractorName = ref(null)
const tripOrder = ref(null)
const tripStart = ref('')
const tripEnd = ref('')
const activities = ref([])
const mainActivities = ref([])
const tripObjective = ref('')
const place = ref(null)

let mainIndex = 1
function getNumber(index) {
    return mainIndex++
}

let mainIndexOther = 1
function getNumberOther(index) {
    return mainIndexOther++
}

const institute = ref(null)
const regional = ref(null)
const company = ref(null)
const collections = ref([])
const results = ref([])
const conclusions = ref([])

const sign = ref({
    contractor: null,
    publicWorker: null,
    supervisor: null
})


console.log(props.row)
</script>

<style>
/* Nunca borde en el contenedor principal */
.contenedor-principal {
    border: 2px solid black
}
</style>