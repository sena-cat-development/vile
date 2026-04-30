<template>
    <div class="q-pa-lg">
        <h5 class="q-mb-lg text-center text-weight-bold text-grey-8">
            Agendas De {{ titleUser }}
        </h5>

        <q-table :rows="tableRows" :columns="columns" row-key="_id" flat bordered
            no-data-label="No hay agendas firmadas" class="rounded-borders">
            <template #body-cell-status="props">
                <q-td :props="props" class="text-center">
                    <q-badge color="positive" outline>
                        {{ props.row.status.data }}
                    </q-badge>
                </q-td>
            </template>

            <template #body-cell-actions="props">
                <q-td :props="props">
                    <div class="row justify-center q-gutter-sm">
                        <q-btn icon="visibility" color="blue" round dense flat @click="openPreview(props.row)">
                            <q-tooltip>Ver agenda</q-tooltip>
                        </q-btn>
                        <q-btn v-if="props.row.status?.index === 1" icon="delete" color="negative" round dense flat
                            @click="confirmDelete(props.row)">
                            <q-tooltip>Eliminar agenda</q-tooltip>
                        </q-btn>
                    </div>
                </q-td>
            </template>
        </q-table>

        <!-- 🔵 MODAL PARA PREVISUALIZAR AGENDA -->
        <q-dialog v-model="showPreview">
            <q-card class="column no-wrap" style="width: 900px; max-width: 95vw; height: 85vh; background: #f5f5f5;">
                <!-- Header fijo -->
                <q-card-section class="row items-center bg-white" style="flex-shrink: 0;">
                    <div class="text-h6">Vista previa de la Agenda</div>
                    <q-space />
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <!-- Contenido scrollable -->
                <div class="col" style="overflow-y: auto; padding: 16px;">
                    <div style="background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 4px;">
                        <component :is="previewComponent" v-if="selectedSchedule" :row="selectedSchedule" />
                    </div>
                </div>
            </q-card>
        </q-dialog>

        <!-- 🔵 RENDER OCULTO PARA GENERAR PDFs SIN ABRIR MODAL -->
        <div id="pdf-hidden-container" style="position: absolute; left: -9999px; top: -9999px;">
            <component :is="previewComponent" v-if="selectedSchedule && isPdfRendering" :key="selectedSchedule._id"
                :row="selectedSchedule" />

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useScheduleStore } from '../../../stores/schedule.js'
import { useUserStore } from '../../../stores/user.js'

import { useQuasar } from 'quasar'
import PreviewFuncionario from '../public/Preview.vue'
import PreviewContratista from '../contractor/Preview.vue'
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const $q = useQuasar()
const scheduleStore = useScheduleStore()
const userStore = useUserStore()
const userId = computed(() => userStore.user?.id)

const schedules = ref([])
const showPreview = ref(false)
const selectedSchedule = ref(null)
const isPdfRendering = ref(false)
const tableRows = ref([])


const previewComponent = computed(() => {
    if (!selectedSchedule.value) return null

    return selectedSchedule.value.typeSchedule === 'contractor'
        ? PreviewContratista
        : PreviewFuncionario
})


const columns = [
    { name: 'place', label: 'Lugar', field: row => row.places?.[0]?.data ?? row.place ?? '', align: 'center' },
    { name: 'tripStart', label: 'Inicio', field: row => { const [y, m, d] = (row.tripStart || '').slice(0, 10).split('-'); return `${d}/${m}/${y}` }, align: 'center' },
    { name: 'tripEnd', label: 'Fin', field: row => { const [y, m, d] = (row.tripEnd || '').slice(0, 10).split('-'); return `${d}/${m}/${y}` }, align: 'center' },
    { name: 'status', label: 'Estado', field: 'status', align: 'center' },
    { name: 'actions', label: 'Acciones', align: 'center' }
]


const signedSchedules = computed(() =>
    schedules.value.filter(s => {
        const workerId =
            s.publicWorker ||
            s.contractor ||
            s.publicWorker?._id ||
            s.contractor?._id
        return String(workerId) === String(userId.value)
    })
)

const hasPendingLegalizations = computed(() =>
    signedSchedules.value.some(s => s.status?.index === 2)
)

const waitForPreviewEl = async () => {
    let tries = 0

    while (tries < 30) {
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))

        const container = document.getElementById('pdf-hidden-container')
        if (container) {
            const element = container.querySelector('#element')
            if (element) {
                console.log('✅ Elemento encontrado:', element)
                return element
            }
        }

        tries++
    }

    console.error('❌ No se encontró el elemento después de 30 intentos')
    return null
}

const waitForImages = async (el) => {
    if (!el || !(el instanceof Element)) {
        console.warn('Elemento no válido para waitForImages:', el)
        return
    }

    const imgs = el.querySelectorAll('img')
    console.log(`🖼️ Esperando ${imgs.length} imágenes...`)

    if (imgs.length === 0) {
        console.log('✅ No hay imágenes que cargar')
        return
    }

    const promises = [...imgs].map((img, index) => {
        return new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
                console.log(`✅ Imagen ${index + 1} ya cargada`)
                resolve()
            } else {
                console.log(`⏳ Esperando imagen ${index + 1}...`)

                const timeout = setTimeout(() => {
                    console.warn(`⚠️ Timeout para imagen ${index + 1}`)
                    resolve() // Resolvemos de todas formas
                }, 5000) // 5 segundos de timeout por imagen

                img.onload = () => {
                    clearTimeout(timeout)
                    console.log(`✅ Imagen ${index + 1} cargada`)
                    resolve()
                }

                img.onerror = () => {
                    clearTimeout(timeout)
                    console.warn(`⚠️ Error cargando imagen ${index + 1}`)
                    resolve() // Resolvemos igual para continuar
                }
            }
        })
    })

    await Promise.all(promises)
    console.log('✅ Todas las imágenes procesadas')
}

const loadSchedules = async () => {
    const { data } = await scheduleStore.getSchedule()

    schedules.value = data || []

    console.log('📦 Schedules:', schedules.value)
    console.log('USER STORE:', userStore.user)
    console.log('USER ID:', userId.value)

    schedules.value.forEach(s => {
        console.log('schedule worker:', s.publicWorker)
    })
}


const openPreview = (schedule) => {
    selectedSchedule.value = schedule
    showPreview.value = true
}



const downloadOnePdf = async (item) => {
    try {
        console.log('🚀 Iniciando descarga de PDF para:', item._id)

        isPdfRendering.value = true
        selectedSchedule.value = item

        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 500))

        const element = await waitForPreviewEl()

        if (!element) {
            $q.notify({ type: 'negative', message: 'No se pudo generar el PDF' })
            isPdfRendering.value = false
            return
        }

        await waitForImages(element)
        await new Promise(resolve => setTimeout(resolve, 300))

        console.log('📸 Generando canvas...')
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        })

        console.log('📄 Creando PDF...')
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'letter')

        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        // Márgenes en mm
        const margin = 15
        const maxWidth = pageWidth - margin * 2
        const maxHeight = pageHeight - margin * 2

        // Escalar para que quepa siempre en una sola hoja
        const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height)
        const imgWidth = canvas.width * ratio
        const imgHeight = canvas.height * ratio

        // Centrar horizontalmente y verticalmente
        const x = margin + (maxWidth - imgWidth) / 2
        const y = margin + (maxHeight - imgHeight) / 2

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const start = new Date(item.tripStart)
        const end = new Date(item.tripEnd)
        const diaInicio = String(start.getUTCDate()).padStart(2, '0')
        const mesInicio = meses[start.getUTCMonth()]
        const diaFin = String(end.getUTCDate()).padStart(2, '0')
        const mesFin = meses[end.getUTCMonth()]
        const nombre = (userStore.user?.name || 'Agenda').replace(/\s+/g, '_')

        const fechas = (diaInicio === diaFin && mesInicio === mesFin)
            ? `${diaInicio}-${mesInicio}`
            : `${diaInicio}-${mesInicio}_al_${diaFin}-${mesFin}`

        pdf.save(`Agenda_${fechas}_${nombre}.pdf`)

        console.log('✅ PDF descargado exitosamente')
        $q.notify({ type: 'positive', message: 'PDF generado exitosamente' })

    } catch (error) {
        console.error('❌ Error al generar PDF:', error)
        $q.notify({ type: 'negative', message: 'Error al generar el PDF: ' + error.message })
    } finally {
        isPdfRendering.value = false
        selectedSchedule.value = null
    }
}

const titleUser = computed(() => {
    const user = userStore.user
    if (!user) return 'funcionario'

    return (
        user.name ||
        user.staffType?.data ||
        user.role?.data ||
        'N/A'
    )
})



watch(signedSchedules, (val) => {
    tableRows.value = val
}, { immediate: true })


async function confirmDelete(row) {
    $q.dialog({
        title: 'Eliminar agenda',
        message: '¿Está seguro de que desea eliminar esta agenda? Esta acción no se puede deshacer.',
        ok: { label: 'Eliminar', color: 'negative', icon: 'delete' },
        cancel: { label: 'Cancelar', color: 'primary', flat: true },
        persistent: true
    }).onOk(async () => {
        const { status } = await scheduleStore.deleteSchedule(row._id)
        if (status === 200) {
            $q.notify({ type: 'positive', message: 'Agenda eliminada exitosamente' })
            await loadSchedules()
        } else {
            $q.notify({ type: 'negative', message: 'Error al eliminar la agenda' })
        }
    })
}

onMounted(loadSchedules)
</script>
