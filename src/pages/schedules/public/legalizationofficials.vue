<template>
    <div class="q-pa-md">
        <h5 class="q-mb-md text-center">
            Legalizaciones De {{ titleUser }}
        </h5>
    
        <q-table :rows="myLegalizations" :columns="columns" row-key="_id" flat bordered
            no-data-label="No tienes legalizaciones firmadas">

            <!-- Estado -->
            <template #body-cell-status="props">
                <q-td :props="props" class="text-center">
                    <q-badge color="green" outline>
                        {{ props.row.status.data }}
                    </q-badge>
                </q-td>
            </template>

            <!-- Acciones -->
            <template #body-cell-actions="props">
                <q-td :props="props" class="text-center">
                    <div class="row justify-center q-gutter-sm">
                                        <q-btn color="blue" icon="visibility" dense @click="openPreview(props.row)">
                            <q-tooltip>Ver Legalizacion</q-tooltip>
                        </q-btn>

                        <q-btn color="green" icon="download" dense @click="downloadOnePdf(props.row)">
                            <q-tooltip>Descargar PDF</q-tooltip>
                        </q-btn>

                    </div>
                </q-td>
            </template>
        </q-table>

        <!-- Modal de detalles -->
        <q-dialog v-model="showDetails" persistent>
            <q-card style="min-width: 700px;">
                <q-card-section>
                    <div class="text-h6">Detalles de la Legalización</div>
                </q-card-section>

                <q-card-section>
                    <pre>{{ selected }}</pre>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cerrar" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Vista de la Agenda (Preview) -->
        <q-dialog v-model="showPreview" maximized>
            <q-card style="width: 900px; max-width: 95vw; height: 90vh;">
                <q-card-section>
                    <div class="text-h6">Vista previa de la Agenda</div>
                </q-card-section>

                <q-card-section class="q-pa-none" style="height: 75vh; overflow-y: auto;">
                    <PreviewAgendaContratista v-if="selectedPreview && isContractor" :row="selectedPreview" />
                    <PreviewAgendaFuncionario v-else-if="selectedPreview" :row="selectedPreview" />
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cerrar" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

<!-- 🔵 RENDER OCULTO PARA GENERAR PDFs SIN ABRIR MODAL -->
<div id="pdf-hidden-container"
     style="position: fixed; top: -9999px; left: -9999px; pointer-events: none; width: 800px; background: white; z-index: -1;">

    <!-- ✅ SOLO LA AGENDA - esta sí se captura con html2canvas -->
    <div id="pdf-agenda-content">
        <PreviewAgendaContratista
            v-if="selectedSchedule && isPdfRendering && isContractor"
            :row="selectedSchedule"
            :isPdfRendering="isPdfRendering"
        />
        <PreviewAgendaFuncionario
            v-if="selectedSchedule && isPdfRendering && !isContractor"
            :row="selectedSchedule"
            :isPdfRendering="isPdfRendering"
        />
    </div>

</div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useScheduleStore } from '../../../stores/schedule'
import { useUserStore } from '../../../stores/user'
import { useQuasar } from 'quasar'
import { jwtDecode } from "jwt-decode"
import PreviewAgendaFuncionario from '../public/previewL.vue'
import PreviewAgendaContratista from '../administrator/Preview.vue'

import { PDFDocument } from 'pdf-lib'
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const isContractor = computed(() =>
    currentUser.value?.staffType?.data?.toLowerCase() === 'contractor' &&
    currentUser.value?.role?.data !== 'supervisor'
)

const scheduleStore = useScheduleStore()
const userStore = useUserStore()
const $q = useQuasar()

const showPreview = ref(false)
const selectedPreview = ref(null)
const schedules = ref([])
const showDetails = ref(false)
const selected = ref(null)



// Para generación de PDF
const selectedSchedule = ref(null)
const isPdfRendering = ref(false)

const columns = [
    { name: 'tripOrder', label: 'No. Comisión', field: 'tripOrder', align: 'center', sortable: true },
    { name: 'place', label: 'Lugar', field: row => row.places?.[0]?.data ?? row.place ?? '', align: 'center' },
    { name: 'tripStart', label: 'Inicio', field: row => new Date(row.tripStart).toLocaleDateString('es-CO'), align: 'center' },
    { name: 'tripEnd', label: 'Fin', field: row => new Date(row.tripEnd).toLocaleDateString('es-CO'), align: 'center' },
    { name: 'status', label: 'Estado', field: row => row.status.data, align: 'center' },
    { name: 'actions', label: 'Acciones', align: 'center' }
]

const currentUser = computed(() => userStore.user)

const myLegalizations = computed(() => {
    const userId = currentUser.value?.id?.toString()

    if (!userId) return []

    return schedules.value.filter(s => {
        const statusIndex = s.status?.index

        // 🔵 SOLO mostrar legalizaciones firmadas o listas para legalizar
        if (![2, 4, 5, 6].includes(statusIndex)) return false

        // 🔵 CONTRATISTA
        if (s.typeSchedule === 'contractor') {
            return s.contractor?.toString() === userId
        }

        // 🔵 FUNCIONARIO
        if (s.typeSchedule === 'official') {
            return s.publicWorker?.toString() === userId
        }

        return false
    })
})


const openPreview = (row) => {
    selectedPreview.value = row
    showPreview.value = true
}

const loadSchedules = async () => {
    const { data } = await scheduleStore.getSchedule()
    schedules.value = data || []
}

// ========================================
// 🔥 FUNCIONES PARA GENERAR PDF
// ========================================
const waitForPreviewEl = async () => {
    let tries = 0
    while (tries < 50) {
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 300))

        const container = document.getElementById('pdf-agenda-content') // ✅ solo la agenda

        if (container && container.scrollHeight > 100 && container.children.length > 0) {
            console.log('✅ Contenedor listo con altura:', container.scrollHeight)
            return container
        }
        tries++
    }
    console.error('❌ Contenedor vacío')
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
                    resolve()
                }, 5000)

                img.onload = () => {
                    clearTimeout(timeout)
                    console.log(`✅ Imagen ${index + 1} cargada`)
                    resolve()
                }

                img.onerror = () => {
                    clearTimeout(timeout)
                    console.warn(`⚠️ Error cargando imagen ${index + 1}`)
                    resolve()
                }
            }
        })
    })

    await Promise.all(promises)
    console.log('✅ Todas las imágenes procesadas')
}

const downloadOnePdf = async (item) => {
    try {
        $q.notify({ type: 'info', message: 'Generando PDF, espere...' })
        console.log('🚀 Iniciando descarga de PDF para:', item._id)

        isPdfRendering.value = true
        selectedSchedule.value = item

        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 1000))

        const element = await waitForPreviewEl()
        if (!element) {
            $q.notify({ type: 'negative', message: 'No se pudo generar el PDF' })
            isPdfRendering.value = false
            return
        }

        await waitForImages(element)
        await new Promise(resolve => setTimeout(resolve, 300))

        // ==============================
        // 1️⃣ CONFIGURACIÓN BASE
        // ==============================
        const margin = 10
        const logoHeight = 15
        const footerHeight = 8
        const jsPdf = new jsPDF('p', 'mm', 'a4')
        const pageWidth = jsPdf.internal.pageSize.getWidth()
        const pageHeight = jsPdf.internal.pageSize.getHeight()
        const contentWidth = pageWidth - margin * 2
        const usableHeight = pageHeight - margin * 2 - logoHeight - footerHeight - 4
        const API = import.meta.env.VITE_API_URL

        // ==============================
        // 2️⃣ CARGAR LOGO
        // ==============================
        let logoBase64 = null
        try {
            const logoUrl = new URL('../../../assets/sena-icono-nuevo.png', import.meta.url).href
            const logoRes = await fetch(logoUrl)
            const logoBlob = await logoRes.blob()
            logoBase64 = await new Promise(r => {
                const reader = new FileReader()
                reader.onload = () => r(reader.result)
                reader.readAsDataURL(logoBlob)
            })
        } catch (e) {
            console.warn('⚠️ No se pudo cargar el logo:', e)
        }

        // ==============================
        // 3️⃣ FUNCIÓN LOGO + PIE
        // ==============================
        const addLogoAndFooter = () => {
            // Logo centrado arriba
            if (logoBase64) {
                jsPdf.addImage(logoBase64, 'PNG', (pageWidth - 20) / 2, margin, 20, logoHeight)
            }
            // Línea debajo del logo
            jsPdf.setDrawColor(0)
            jsPdf.line(margin, margin + logoHeight + 2, pageWidth - margin, margin + logoHeight + 2)

            // Pie de página
            jsPdf.setFontSize(8)
            jsPdf.setTextColor(100)
            jsPdf.text('GTH-F-087 V.02', pageWidth / 2, pageHeight - margin, { align: 'center' })
            jsPdf.setTextColor(0)
            jsPdf.setFontSize(10)
        }

        // ==============================
        // 4️⃣ CAPTURAR TODO COMO UNA IMAGEN
        // ==============================
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: element.scrollWidth,
            height: element.scrollHeight,
            imageTimeout: 10000,
            onclone: async (clonedDoc) => {
                const container = clonedDoc.getElementById('pdf-agenda-content')
                if (container) {
                    container.style.position = 'relative'
                    container.style.top = '0'
                    container.style.left = '0'
                    container.style.opacity = '1'
                }
                const imgs = container ? container.querySelectorAll('img') : []
                await Promise.all([...imgs].map(async (img) => {
                    const src = img.getAttribute('src')
                    if (!src || src.startsWith('data:') || src.includes('/src/assets/')) return
                    try {
                        const fullUrl = src.startsWith('http')
                            ? src.replace(/^https?:\/\/[^/]+/, API)
                            : `${API}${encodeURI(src)}`
                        const res = await fetch(fullUrl)
                        const blob = await res.blob()
                        img.src = await new Promise(r => {
                            const reader = new FileReader()
                            reader.onload = () => r(reader.result)
                            reader.readAsDataURL(blob)
                        })
                    } catch (e) {
                        console.warn('⚠️ No se pudo convertir imagen:', src)
                    }
                }))
            }
        })

        // ==============================
        // 5️⃣ CALCULAR PUNTOS DE CORTE ENTRE BLOQUES
        // ==============================
        const blockIds = [
            'block-header', 'block-titulo', 'block-ciudad-fecha', 'block-presentado',
            'block-orden-viaje', 'block-lugar', 'block-objetivo', 'block-actividades',
            'block-resultados', 'block-evidencias', 'block-compromisos',
            'block-conclusiones', 'block-contratista', 'block-supervisor'
        ]

        const containerRect = element.getBoundingClientRect()
        const blockBreakPoints = []

        for (const id of blockIds) {
            const el = element.querySelector(`#${id}`)
            if (el) {
                const rect = el.getBoundingClientRect()
                const bottomY = rect.bottom - containerRect.top
                blockBreakPoints.push(bottomY)
            }
        }

        // ==============================
        // 6️⃣ ARMAR PDF RESPETANDO BLOQUES
        // ==============================
        const totalImgHeight = canvas.height
        const totalImgWidth = canvas.width
        const scale = contentWidth / (totalImgWidth / 2)
        const usableHeightPx = (usableHeight / scale) * 2

        addLogoAndFooter()

        let sliceStartPx = 0
        const contentStartY = margin + logoHeight + 2

        while (sliceStartPx < totalImgHeight) {
            let sliceEndPx = sliceStartPx + usableHeightPx

            if (sliceEndPx >= totalImgHeight) {
                sliceEndPx = totalImgHeight
            } else {
                let bestBreak = sliceEndPx
                for (const breakPt of blockBreakPoints) {
                    const breakPx = breakPt * 2
                    if (breakPx > sliceStartPx && breakPx <= sliceEndPx) {
                        bestBreak = breakPx
                    }
                }
                sliceEndPx = bestBreak
            }

            const sliceCanvas = document.createElement('canvas')
            const sliceHeightPx = sliceEndPx - sliceStartPx
            sliceCanvas.width = totalImgWidth
            sliceCanvas.height = sliceHeightPx
            sliceCanvas.getContext('2d').drawImage(
                canvas,
                0, sliceStartPx,
                totalImgWidth, sliceHeightPx,
                0, 0,
                totalImgWidth, sliceHeightPx
            )

            const sliceImgData = sliceCanvas.toDataURL('image/png')
            const sliceHeightMm = sliceHeightPx / 2 * scale

            // Agregar imagen del contenido
            jsPdf.addImage(sliceImgData, 'PNG', margin, contentStartY, contentWidth, sliceHeightMm)

            // ✅ Líneas laterales exactas al contenido
            jsPdf.setDrawColor(0)
            jsPdf.line(margin, contentStartY, margin, contentStartY + sliceHeightMm)
            jsPdf.line(pageWidth - margin, contentStartY, pageWidth - margin, contentStartY + sliceHeightMm)

            // ✅ Línea inferior solo en la última página o entre páginas
            jsPdf.line(margin, contentStartY + sliceHeightMm, pageWidth - margin, contentStartY + sliceHeightMm)

            sliceStartPx = sliceEndPx

            if (sliceStartPx < totalImgHeight) {
                jsPdf.addPage()
                addLogoAndFooter()
            }
        }

        const agendaBytes = jsPdf.output('arraybuffer')

        // ==============================
        // 7️⃣ COMBINAR CON DOCUMENTOS
        // ==============================
        const mergedPdf = await PDFDocument.create()

        const addDocUrl = async (url) => {
            try {
                const fullUrl = url.startsWith('http') ? url : `${API}${encodeURI(url)}`
                const response = await fetch(fullUrl)
                const docBytes = await response.arrayBuffer()
                const ext = url.toLowerCase().split('.').pop()

                if (ext === 'pdf') {
                    const docPdf = await PDFDocument.load(docBytes)
                    const pages = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices())
                    pages.forEach(p => mergedPdf.addPage(p))
                } else {
                    const imgBlob = new Blob([docBytes])
                    const imgBitmap = await createImageBitmap(imgBlob)
                    const offscreen = document.createElement('canvas')
                    offscreen.width = imgBitmap.width
                    offscreen.height = imgBitmap.height
                    offscreen.getContext('2d').drawImage(imgBitmap, 0, 0)
                    const pngBase64 = offscreen.toDataURL('image/png').split(',')[1]
                    const embeddedImg = await mergedPdf.embedPng(
                        Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0))
                    )
                    const page = mergedPdf.addPage([595, 842])
                    const { width, height } = embeddedImg.scale(1)
                    const scale = Math.min(575 / width, 822 / height)
                    page.drawImage(embeddedImg, {
                        x: (595 - width * scale) / 2,
                        y: (842 - height * scale) / 2,
                        width: width * scale,
                        height: height * scale
                    })
                }
            } catch (err) {
                console.warn('⚠️ Error agregando documento:', url, err)
            }
        }

        const docs = item.legalization?.documents

        // 1. Autorización de Pago
        if (docs?.autorizacionPago?.[0]?.url) await addDocUrl(docs.autorizacionPago[0].url)

        // 2. Reintegros
        if (docs?.reintegros?.[0]?.url) await addDocUrl(docs.reintegros[0].url)

        // 3. Agenda (Preview)
        const agendaPdf = await PDFDocument.load(agendaBytes)
        const agendaPages = await mergedPdf.copyPages(agendaPdf, agendaPdf.getPageIndices())
        agendaPages.forEach(p => mergedPdf.addPage(p))

        // 3. Asistencia de Formación
        if (docs?.asistenciaFormacion?.[0]?.url) await addDocUrl(docs.asistenciaFormacion[0].url)

        // 4. Tiquetes
        for (const t of (docs?.tiquetes || [])) {
            if (t?.url) await addDocUrl(t.url)
        }

        // 5. Reintegros
        if (docs?.compromisoPresupuestal?.[0]?.url) await addDocUrl(docs.compromisoPresupuestal[0].url)

        // 6. Interveredal
        if (docs?.interveredal?.[0]?.url) await addDocUrl(docs.interveredal[0].url)

        // ==============================
        // 8️⃣ DESCARGAR
        // ==============================
        const finalBytes = await mergedPdf.save()
        const blob = new Blob([finalBytes], { type: 'application/pdf' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `Legalizacion-${item.tripOrder || item._id}.pdf`
        link.click()
        URL.revokeObjectURL(link.href)

        $q.notify({ type: 'positive', message: 'PDF generado exitosamente' })

    } catch (error) {
        console.error('❌ Error al generar PDF:', error)
        $q.notify({ type: 'negative', message: 'Error al generar el PDF: ' + error.message })
    } finally {
        isPdfRendering.value = false
        selectedSchedule.value = null
    }
}




// ========================================
// 🔥 FIN FUNCIONES PDF
// ========================================

onMounted(async () => {
    const token = localStorage.getItem("token")

    if (token) {
        const decode = jwtDecode(token)
        userStore.user = decode
    }

    if (!userStore.user?.id) {
        console.warn("⚠ Usuario no autenticado")
        return
    }

    const { data } = await userStore.getUserParams(userStore.user.id)
    userStore.user = {
        ...data,
        id: data._id
    }

    await loadSchedules()

    console.log("Usuario Final:", userStore.user)
    console.log("Legalizaciones:", myLegalizations.value)
})

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

watch(
    () => userStore.user,
    (newUser) => {
        console.log("Usuario actualizado:", newUser)
        if (newUser?.id && schedules.value.length > 0) {
            console.log("📊 Mis legalizaciones filtradas:", myLegalizations.value)
        }
    },
    { immediate: true }
)
</script>