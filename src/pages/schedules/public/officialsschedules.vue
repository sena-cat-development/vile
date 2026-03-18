<template>
    <div class="q-pa-md">
        <h5 class="q-mb-md text-center">
         Agendas De {{ titleUser }}
        </h5>
        <q-table :rows="tableRows" :columns="columns" row-key="_id" flat bordered
            no-data-label="No hay agendas firmadas">
            <template #body-cell-status="props">
                <q-td :props="props" class="text-center">
                    <q-badge color="green" outline>
                        {{ props.row.status.data }}
                    </q-badge>
                </q-td>
            </template>

            <template #body-cell-actions="props">
                <q-td :props="props">
                    <div class="row justify-center q-gutter-sm">
                        <q-btn icon="visibility" color="blue" dense @click="openPreview(props.row)">
                            <q-tooltip>Ver agenda</q-tooltip>
                        </q-btn>

                        <q-btn v-if="props.row.status?.index < 3 && props.row.typeSchedule !== 'contractor'"
                            icon="verified" color="orange" dense @click="legalizeOne(props.row)">
                            <q-tooltip>Legalizar agenda</q-tooltip>
                        </q-btn>

                    </div>
                </q-td>
            </template>
        </q-table>

        <!-- 🔵 MODAL PARA PREVISUALIZAR AGENDA -->
        <q-dialog v-model="showPreview" maximized>
            <q-card style="width: 900px; max-width: 95vw; height: 90vh;">
                <q-card-section>
                    <div class="text-h6">Vista previa de la Agenda</div>
                </q-card-section>
                <component :is="previewComponent" v-if="selectedSchedule" :row="selectedSchedule" />
                <q-card-section></q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cerrar" color="primary" v-close-popup />
                </q-card-actions>
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
import * as XLSX from 'xlsx'

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
    { name: 'tripStart', label: 'Inicio', field: row => new Date(row.tripStart).toLocaleDateString('es-CO'), align: 'center' },
    { name: 'tripEnd', label: 'Fin', field: row => new Date(row.tripEnd).toLocaleDateString('es-CO'), align: 'center' },
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

const legalizeOne = async (item) => {
    try {
        await scheduleStore.putSchedule(
            {
                status: {
                    index: 3,
                    data: "Agenda legalizada por Administrador",
                    number: 3
                }
            },
            item._id
        )
        $q.notify({ type: 'positive', message: 'Agenda legalizada' })
        loadSchedules()
    } catch (err) {
        $q.notify({ type: 'negative', message: 'Error al legalizar' })
    }
}

const legalizeAll = async () => {
    try {
        for (const item of signedSchedules.value) {
            await scheduleStore.putSchedule(
                {
                    status: {
                        index: 3,
                        data: "Agenda firmada por Supervisor",
                        number: 3
                    }
                },
                item._id
            )
        }
        $q.notify({ type: 'positive', message: 'Todas las agendas fueron legalizadas' })
        loadSchedules()
    } catch (err) {
        $q.notify({ type: 'negative', message: 'Error al legalizar agendas' })
    }
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
        const pdf = new jsPDF('p', 'mm', 'a4')

        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        // Calcular dimensiones de la imagen
        const imgWidth = pageWidth
        const imgHeight = (canvas.height * pageWidth) / canvas.width

        // Si la imagen es más alta que una página, dividirla en múltiples páginas
        let heightLeft = imgHeight
        let position = 0

        // Primera página
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        // Agregar páginas adicionales si es necesario
        while (heightLeft > 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
        }

        pdf.save(`Agenda-${item._id}.pdf`)

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

const downloadAllPdf = async () => {
    if (!signedSchedules.value.length) return

    try {
        console.log('🚀 Iniciando descarga de todos los PDFs')

        const pdf = new jsPDF('p', 'mm', 'a4')
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        isPdfRendering.value = true
        let isFirstAgenda = true

        for (let i = 0; i < signedSchedules.value.length; i++) {
            const item = signedSchedules.value[i]
            console.log(`📄 Procesando ${i + 1}/${signedSchedules.value.length}:`, item._id)

            selectedSchedule.value = item
            await nextTick()
            await new Promise(resolve => setTimeout(resolve, 500))

            const element = await waitForPreviewEl()
            if (!element) {
                console.warn(`⚠️ Saltando agenda ${item._id} - elemento no válido`)
                continue
            }

            await waitForImages(element)
            await new Promise(resolve => setTimeout(resolve, 300))

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                allowTaint: true,
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            })

            const imgData = canvas.toDataURL('image/png')
            const imgWidth = pageWidth
            const imgHeight = (canvas.height * pageWidth) / canvas.width

            let heightLeft = imgHeight
            let position = 0

            // Si no es la primera agenda, agregar nueva página
            if (!isFirstAgenda) {
                pdf.addPage()
            }
            isFirstAgenda = false

            // Primera página de esta agenda
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight

            // Agregar páginas adicionales si es necesario
            while (heightLeft > 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }
        }

        pdf.save('Todas-las-agendas.pdf')
        console.log('✅ Todos los PDFs generados')
        $q.notify({ type: 'positive', message: 'PDFs generados exitosamente' })

    } catch (error) {
        console.error('❌ Error al generar PDFs:', error)
        $q.notify({ type: 'negative', message: 'Error al generar los PDFs: ' + error.message })
    } finally {
        isPdfRendering.value = false
        selectedSchedule.value = null
    }
}

const downloadExcel = () => {
    // 🔹 Convertimos la data a un formato limpio
    const data = signedSchedules.value.map(item => ({
        'No. Comisión': item.tripOrder,
        'Lugar': item.places?.[0]?.data || '',
        'Inicio': new Date(item.tripStart).toLocaleDateString('es-CO'),
        'Fin': new Date(item.tripEnd).toLocaleDateString('es-CO'),
        'Estado': item.status?.data || ''
    }))

    // 🔹 Crear hoja
    const worksheet = XLSX.utils.json_to_sheet(data)

    // 🔹 Rango de la tabla
    const range = XLSX.utils.decode_range(worksheet['!ref'])

    // 🔹 Aplicar estilos (centrado)
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
            if (!worksheet[cellAddress]) continue

            worksheet[cellAddress].s = {
                alignment: {
                    horizontal: 'center',
                    vertical: 'center'
                }
            }
        }
    }

    // 🔹 Ancho automático de columnas
    worksheet['!cols'] = Object.keys(data[0]).map(() => ({ wch: 22 }))

    // 🔹 Activar filtros (fila de encabezados)
    worksheet['!autofilter'] = {
        ref: worksheet['!ref']
    }

    // 🔹 Crear libro
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agendas')

    // 🔹 Descargar
    XLSX.writeFile(workbook, 'Agendas-firmadas.xlsx')
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


onMounted(loadSchedules)
</script>
