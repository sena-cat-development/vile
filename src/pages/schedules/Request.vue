<template>
    <q-page class="q-pa-md">
        <div class="text-h4 text-center q-mb-md">Solicitudes</div>
        <div v-if="!showPreview" class="row justify-center q-pt-md">
            <div class="col-8 q-mt-md" style="width: 90%;">

                <!-- FILTROS -->
                <q-card flat bordered class="q-pa-sm q-mb-md">
                    <div class="row q-gutter-sm items-end">
                        <q-input dense v-model="filter" placeholder="Buscar..." class="col" clearable>
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>

                        <q-select dense v-model="typeFilter" :options="typeOptions" label="Tipo de agenda"
                            emit-value map-options clearable style="min-width: 170px" />

                        <q-input dense v-model="dateFrom" type="date" label="Desde"
                            style="min-width: 150px" clearable />

                        <q-input dense v-model="dateTo" type="date" label="Hasta"
                            style="min-width: 150px" clearable />

                        <q-btn flat dense icon="filter_alt_off" label="Limpiar filtros"
                            color="grey" @click="clearFilters" />
                    </div>
                </q-card>

                <!-- TABLA MIA -->
                <q-table :loading="cargando" class="my-sticky-header-table" :columns="columns"
                    :rows="filteredRows" row-key="_id">

                    <template v-slot:body-cell-opciones="props">
                        <q-td :props="props">
                            <q-icon name="fa-solid fa-eye" size="20px" color="blue" class="cursor-pointer"
                                @click="openViewDialog(props)">
                                <q-tooltip>Ver y Firmar</q-tooltip>
                            </q-icon>

                        </q-td>
                    </template>


                    <template v-slot:top-left>
                        <q-btn v-if="user?.role?.data === 'supervisor' && rows.length" label="Firmar todas"
                            icon="fa-solid fa-signature" color="primary" :loading="loading"
                            @click="confirmarFirmaTodas = true" />
                    </template>


                    <template v-slot:body-cell-name="props">
                        <q-td :props="props">
                            <div class="row">
                                <div v-if="props.row.typeSchedule == 'contractor'" class="col-12">
                                    <p v-text="props.row.contract.contractorName" class="q-my-none text-center" />
                                </div>

                                <div class="col-12">
                                    <p v-text="props.row.contract.publicName" class="q-my-none text-center" />
                                </div>
                            </div>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-typeSchedule="props">
                        <q-td :props="props">
                            <p v-if="props.row.typeSchedule == 'contractor'" class="q-my-none text-center">
                                Contratista</p>
                            <p v-else class="q-my-none text-center">Funcionario</p>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-route="props">
                        <q-td :props="props">
                            <div class="row text-center">

                                <div class="col-12">
                                    <p class="q-my-none">
                                        Ida:
                                        {{
                                            props.row.route?.go?.length
                                                ? `${props.row.route.go[0]?.data || '-'} - ${props.row.route.go.at(-1)?.data ||
                                                '-'}`
                                                : 'Sin ruta'
                                        }}
                                    </p>
                                </div>

                                <div class="col-12">
                                    <p class="q-my-none">
                                        Regreso:
                                        {{
                                            props.row.route?.return?.length
                                                ? `${props.row.route.return[0]?.data || '-'} -
                                        ${props.row.route.return.at(-1)?.data || '-'}`
                                                : 'Sin ruta'
                                        }}
                                    </p>
                                </div>

                            </div>
                        </q-td>
                    </template>


                    <template v-slot:body-cell-place="props">
                        <q-td :props="props">
                            <p v-if="props.row.place && props.row.place !== null" v-text="props.row.place"
                                class="q-my-none text-center" />
                            <p v-else-if="props.row.places && props.row.places.length !== 0"
                                v-text="props.row.places[0].data" class="q-my-none text-center" />
                            <div v-else class="row">
                                <div class="col-12">
                                    <p v-text="props.row.regional || '-'" class="q-my-none text-center" />
                                </div>
                                <div class="col-12">
                                    <p v-text="props.row.institute" class="q-my-none text-center" />
                                </div>
                            </div>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-company="props">
                        <q-td :props="props">
                            <p v-if="props.row.company" v-text="props.row.company" class="q-my-none text-center" />
                            <p v-else-if="props.row.institutes && props.row.institutes.length !== 0"
                                v-text="props.row.institutes[0].data" class="q-my-none text-center" />
                            <p v-else class="q-my-none text-center">-</p>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-tripDate="props">
                        <q-td :props="props">
                            <div class="row">
                                <div class="col-12">
                                    <p v-text="`Inicio: ${props.row.tripStart.slice(8, 10)}/${props.row.tripStart.slice(5, 7)}/${props.row.tripStart.slice(0, 4)}`"
                                        class="q-my-none text-center" />
                                </div>

                                <div class="col-12">
                                    <p v-text="`Fin: ${props.row.tripEnd.slice(8, 10)}/${props.row.tripEnd.slice(5, 7)}/${props.row.tripEnd.slice(0, 4)}`"
                                        class="q-my-none text-center" />
                                </div>
                            </div>
                        </q-td>
                    </template>

                </q-table>
            </div>
        </div>
        <div v-else class="row justify-center q-my-md">

            <div class="q-mb-md">

                <!-- ACCIONES PRINCIPALES -->
                <div class="row justify-between items-center q-gutter-sm">

                    <!-- VOLVER -->
                    <q-btn icon="fa-solid fa-arrow-left" label="Atrás" class="bg-primary text-white"
                        @click="row = null; showOther = false; showPreview = false" />

                    <!-- DESCARGAR PDF -->
                    <q-btn v-show="showPreview" icon="download" label="Descargar PDF" class="bg-blue text-white"
                        @click="descargarFormatoPDF" />

                </div>

                <!-- ACCIONES ADMINISTRADOR -->
                <div v-if="user.role.data === 'administrator' && row?.status?.index === 3" class="q-mt-lg">
                    <q-card flat bordered class="q-pa-md">

                        <div class="text-subtitle2 text-center q-mb-md">
                            Acciones del Administrador
                        </div>

                        <q-input v-model="tripOrder" label="Número de Orden de Viaje" filled dense required
                            class="q-mb-md" />

                        <div class="row justify-center">
                            <q-btn label="Legalizar" icon="check" color="green" @click="updateSchedule(row._id)" />
                        </div>

                    </q-card>
                </div>

                <!-- ACCIONES SUPERVISOR -->
                <div v-if="
                    user.role.data === 'supervisor' &&
                    !row.signature?.supervisor &&
                    row.status.index < 2
                " class="row justify-center q-mt-lg">
                    <q-btn label="Editar agenda" icon="edit" color="warning" @click="goToEditSchedule" />
                </div>

            </div>




            <div class="col-12" />

            <template v-if="!showAttachedFileContent">
                <div style="width:65%; background:#f0f0f0; padding:32px; border-radius:6px; box-shadow:0 2px 12px rgba(0,0,0,0.15);">
                    <div id="invoice" ref="invoice">
                        <Preview v-if="!showOther" :row="row" />
                        <OtherPreview v-else :row="row" />
                    </div>
                </div>
            </template>

            <template v-else-if="
                showAttachedFileContent &&
                attachedFileUrl &&
                user.role.data === 'administrator' &&
                row?.status?.index === 3
            ">
                <div class="col-8 q-mt-md" style="width:65%;">
                    <q-card class="q-pa-md">
                        <q-card-section class="text-h6 text-center">
                            📄 Documento Adjunto
                        </q-card-section>

                        <q-card-section>
                            <div class="text-center">

                                <!-- PDF -->
                                <template
                                    v-if="attachedFileUrl.toLowerCase().includes('.pdf') || attachedFileUrl.startsWith('blob:')">
                                    <iframe :src="attachedFileUrl" width="100%" height="600px" style="border:none;" />
                                </template>

                                <!-- IMAGEN -->
                                <template v-else-if="
                                    attachedFileUrl.match(/\.(jpeg|jpg|gif|png)$/) ||
                                    attachedFileUrl.includes('res.cloudinary.com')
                                ">
                                    <img :src="attachedFileUrl" style="max-width:100%; border:1px solid #ccc;" />
                                </template>

                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </template>



            <div class="col-12" />

            <div v-if="!showReject" class="col-6 q-mt-md">
                <div v-if="user.role.data == 'supervisor' || user.role.data == 'paymaster'" class="row">
                    <div class="col-12 justify-around flex">
                        <q-btn @click="showReject = !showReject" label="Rechazar" icon="fa-solid fa-xmark"
                            color="negative" />

                        <q-btn @click="getSign()" label="Firmar" icon="fa-solid fa-signature"
                            class="bg-primary text-white" :loading="loading" />

                    </div>

                </div>
            </div>

            <div v-if="showReject" class="col-6 q-mt-md">
                <div class="row">
                    <div class="col-12 q-pa-sm">
                        <q-input filled autogrow stack-label v-model="justification" label="Justificación" />
                    </div>
                    <div class="col-12 justify-around flex q-mt-sm">
                        <q-btn @click="justification = null; showReject = false" label="Cancelar" color="negative" />
                        <q-btn @click="updateSchedule(row._id)" label="Enviar" :loading="loading"
                            class="bg-primary text-white" />
                    </div>
                </div>
            </div>

        </div>
        <q-page-sticky v-if="!showPreview" position="bottom-right" :offset="[20, 20]">
            <q-btn @click="recargar()" color="primary" fab icon="fa-solid fa-rotate-right">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    Recargar página
                </q-tooltip>
            </q-btn>
        </q-page-sticky>
    </q-page>



    <q-dialog v-model="confirmarFirmaTodas" persistent>
        <q-card style="min-width: 420px">

            <q-card-section class="row items-center">
                <q-icon name="warning" color="warning" size="md" class="q-mr-sm" />
                <div class="text-h6">Confirmar firma masiva</div>
            </q-card-section>

            <q-card-section>
                ¿Estás seguro de que deseas <strong>firmar todas las agendas</strong>?
                <br><br>
                Se firmarán <strong>{{ rows.length }}</strong> agendas y
                <strong>esta acción no se puede deshacer</strong>.
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancelar" color="grey" v-close-popup />
                <q-btn label="Sí, firmar todas" color="primary" :loading="loading" @click="firmarTodasConfirmado" />
            </q-card-actions>

        </q-card>
    </q-dialog>
</template>

<script setup>

import { ref, computed, onBeforeMount, nextTick } from 'vue'
import { useScheduleStore } from '../../stores/schedule.js'
import { showNotify } from '../../components/notify.js'
import { useUserStore } from '../../stores/user.js'
import { useQuasar } from 'quasar'
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { useRouter, useRoute } from 'vue-router'



import Preview from './contractor/Preview.vue'

import OtherPreview from './public/Preview.vue'

const scheduleStore = useScheduleStore()
const userStore = useUserStore()
const routeQuery = useRoute()

const $q = useQuasar()

const router = useRouter()

let cargando = ref(false)

let loading = ref(false)

const invoice = ref(null)

const fileAttached = ref(false) // Para controlar la visibilidad del botón 'Enviar'

const attachedFileUrl = ref(null) // Para la previsualización del archivo

const showAttachedFileContent = ref(false)

const uploadedFile = ref(null)



function openViewDialog(props) {
    row.value = props.row
    showPreview.value = true

    // Determinar qué preview usar
    showOther.value = props.row.typeSchedule !== 'contractor'
}




// Variables reactivas
const attachedFileViewUrl = ref(null);
const attachedFileDownloadUrl = ref(null);
const downloaded = ref(false);

const confirmarFirmaTodas = ref(false)

async function firmarTodasConfirmado() {
    confirmarFirmaTodas.value = false
    await firmarTodas()
}


// ----------------------------------------
// Renderiza el invoice a canvas y retorna { canvas, doc }
// ----------------------------------------
async function renderInvoiceToPage() {
    const invoiceElement = invoice.value
    const originalWidth = invoiceElement.style.width
    const originalMaxWidth = invoiceElement.style.maxWidth

    // Fijar ancho exacto de página carta para captura limpia
    invoiceElement.style.width = '816px'
    invoiceElement.style.maxWidth = '816px'

    const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000
    })

    invoiceElement.style.width = originalWidth
    invoiceElement.style.maxWidth = originalMaxWidth

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
    const pageW = doc.internal.pageSize.getWidth()   // 612pt
    const pageH = doc.internal.pageSize.getHeight()  // 792pt

    const margin = 20 // pt de margen en todos los lados
    const maxW = pageW - margin * 2
    const maxH = pageH - margin * 2

    const imgAspect = canvas.height / canvas.width
    let drawW = maxW
    let drawH = drawW * imgAspect

    // Si excede la página, escalar para que entre completo
    if (drawH > maxH) {
        drawH = maxH
        drawW = drawH / imgAspect
    }

    const x = (pageW - drawW) / 2
    const y = (pageH - drawH) / 2
    doc.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', x, y, drawW, drawH)

    return doc
}

// ----------------------------------------
// Genera el nombre del archivo con días-mes-nombre
// ----------------------------------------
function generarNombrePDF() {
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
    const r = row.value
    const diaInicio = r?.tripStart?.slice(8, 10) || '00'
    const diaFin = r?.tripEnd?.slice(8, 10) || '00'
    const dias = diaInicio === diaFin ? diaInicio : `${diaInicio}-${diaFin}`
    const mesIdx = r?.tripStart ? parseInt(r.tripStart.slice(5, 7)) - 1 : 0
    const mes = meses[mesIdx] || 'mes'
    const nombre = (r?.typeSchedule === 'contractor'
        ? r?.contract?.contractorName
        : r?.contract?.publicName) || 'sin-nombre'
    const nombreLimpio = nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim().replace(/\s+/g, '_')
    return `${dias}-${mes}-${nombreLimpio}.pdf`
}

// ----------------------------------------
// Descarga PDF sin subir (para auto-descarga tras firma)
// ----------------------------------------
async function downloadPDF() {
    if (!invoice.value) return
    const doc = await renderInvoiceToPage()
    doc.save(generarNombrePDF())
}

// ----------------------------------------
// Generar PDF con jsPDF y subir a Cloudinary
// ----------------------------------------
async function descargarFormatoPDF() {
    if (!invoice.value) {
        showNotify('No hay contenido visible', 'negative')
        return
    }

    const fileName = generarNombrePDF()
    const doc = await renderInvoiceToPage()
    doc.save(fileName)
    downloaded.value = true

    try {
        const pdfBlob = doc.output('blob')
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })

        const res = await scheduleStore.uploadDocument(pdfFile, row.value._id, user.value.id)

        if (res.status === 200 && res.data?.url) {
            attachedFileViewUrl.value = res.data.url
            attachedFileDownloadUrl.value = res.data.url
            showNotify('PDF subido correctamente', 'positive')
        } else {
            showNotify('El servidor no devolvió la URL del archivo', 'warning')
        }
    } catch (err) {
        console.error('❌ Error subiendo PDF:', err)
        showNotify('Error al subir el PDF', 'negative')
    }
}


onBeforeMount(async () => {
    user.value = $q.localStorage.getItem('user')
    console.log('👤 USER ID:', user.value.id)
console.log('👤 ROLE:', user.value.role.data)
    const role = user.value.role.data

    cargando.value = true
    rows.value = []

    try {
        if (role === 'supervisor') {
            const allSchedules = await getSchedule({
                supervisor: user.value.id,
                role,
                legalization: true
            })

            rows.value = allSchedules.filter(schedule =>
                schedule.typeSchedule === 'contractor' &&
                schedule.status?.data !== 'Agenda rechazada' &&
                (schedule.status.index < 2 || !schedule.signature?.supervisor)
            )
        }


        else if (role === 'administrator') {
            const allSchedules = await getSchedule({
                role,
                legalization: true
            })

            // 🔹 Administrator: SOLO status index = 3
            rows.value = allSchedules.filter(schedule =>
                schedule.status?.index === 3
            )
        }

        else if (role === 'paymaster') {
            rows.value = await getSchedule({
                paymaster: user.value.id,
                role,
                legalization: true
            })
        }

        const openId = routeQuery.query.open
        if (openId) {
            const target = rows.value.find(r => r._id === openId)
            if (target) {
                row.value = target
                showPreview.value = true
                showOther.value = target.typeSchedule !== 'contractor'
            }
        }

    } catch (error) {
        showNotify('Error al cargar las solicitudes', 'negative')
        console.error(error)
    }

    cargando.value = false
})


// 🔄 RECARGAR DATOS
async function recargar() {
    cargando.value = true
    const role = user.value.role.data

    try {
        if (role === 'supervisor') {
            const allSchedules = await getSchedule({
                supervisor: user.value.id,
                role,
                legalization: true
            })

            rows.value = allSchedules.filter(schedule =>
                schedule.status?.data !== 'Agenda rechazada' &&
                (schedule.status.index < 2 || !schedule.signature?.supervisor)
            )
        }

        else if (role === 'administrator') {
            const allSchedules = await getSchedule({
                role,
                legalization: true
            })

            rows.value = allSchedules.filter(schedule =>
                schedule.status?.index === 3
            )
        }

        else if (role === 'paymaster') {
            rows.value = await getSchedule({
                paymaster: user.value.id,
                role,
                legalization: true
            })
        }

    } catch (error) {
        showNotify('Error al recargar', 'negative')
        console.error(error)
    }

    cargando.value = false
}

async function getSign() {
    if (user.value.role.data !== 'supervisor') {
        showNotify('Solo los supervisores pueden firmar', 'negative')
        return
    }

    if (!row.value) {
        showNotify('No hay agenda seleccionada', 'negative')
        return
    }

    loading.value = true

    try {
        const { data } = await userStore.getUserParams(user.value.id)

        if (!data?.sign?.url) {
            showNotify('No tienes una firma cargada en tu perfil', 'negative')
            return
        }

        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const firmaUrl = `${BASE_URL}${data.sign.url}` // 👈

        if (!row.value.signature) row.value.signature = {}
        row.value.signature.supervisor = firmaUrl

        await scheduleStore.putSchedule(
            {
                userId: user.value.id,
                signature: row.value.signature,
                status: {
                    index: 2,
                    data: 'Agenda firmada por Supervisor',
                    number: (row.value.status?.number || 0) + 1
                }
            },
            row.value._id
        )

        showNotify('Agenda firmada correctamente ✅', 'positive')

        // Esperar a que el DOM se actualice con la firma antes de capturar
        await nextTick()

        // Descargar PDF antes de resetear la vista (el invoice sigue visible)
        await downloadPDF()

        await recargar()
        row.value = null
        showPreview.value = false

    } catch (error) {
        console.error('ERROR FIRMA SUPERVISOR:', error)
        showNotify('Ocurrió un error inesperado al firmar', 'negative')
    } finally {
        loading.value = false
    }
}


async function getSchedule(query = {}) {
    const { data } = await scheduleStore.getSchedule(query)
    return data
}

const user = ref(null)

const rows = ref([])
let filter = ref('')
const typeFilter = ref(null)
const dateFrom = ref('')
const dateTo = ref('')
const row = ref(null)

const typeOptions = [
    { label: 'Contratista', value: 'contractor' },
    { label: 'Funcionario', value: 'other' }
]

const filteredRows = computed(() => {
    let result = rows.value

    if (typeFilter.value) {
        if (typeFilter.value === 'other') {
            result = result.filter(r => r.typeSchedule !== 'contractor')
        } else {
            result = result.filter(r => r.typeSchedule === typeFilter.value)
        }
    }

    if (dateFrom.value) {
        result = result.filter(r => r.tripStart >= dateFrom.value)
    }

    if (dateTo.value) {
        result = result.filter(r => r.tripEnd <= dateTo.value)
    }

    if (filter.value) {
        const q = filter.value.toLowerCase()
        result = result.filter(r => {
            const name = r.typeSchedule === 'contractor'
                ? r.contract?.contractorName
                : r.contract?.publicName
            const place = r.place || r.places?.[0]?.data || r.regional || r.institute || ''
            const company = r.company || r.institutes?.[0]?.data || ''
            const route = [
                r.route?.go?.[0]?.data,
                r.route?.go?.at(-1)?.data,
                r.route?.return?.[0]?.data,
                r.route?.return?.at(-1)?.data
            ].filter(Boolean).join(' ')
            return (
                name?.toLowerCase().includes(q) ||
                place?.toLowerCase().includes(q) ||
                company?.toLowerCase().includes(q) ||
                route?.toLowerCase().includes(q)
            )
        })
    }

    return result
})

function clearFilters() {
    filter.value = ''
    typeFilter.value = null
    dateFrom.value = ''
    dateTo.value = ''
}

const showPreview = ref(false)

const showOther = ref(false)

const columns = ref([
    { name: 'name', label: 'Nombres y Apellidos', align: 'center', sortable: 'true' },
    { name: 'typeSchedule', label: 'Tipo de Agenda', align: 'center', sortable: true },
    { name: 'route', label: 'Ruta', align: 'center', style: 'width: 300px', headerStyle: 'width: 300px;', sortable: true },
    { name: 'place', label: 'Lugar Desplazamiento', align: 'center', sortable: true },
    { name: 'company', label: 'Entidad o Empresa', align: 'center', sortable: true },
    { name: 'tripDate', label: 'Fecha Desplazamiento', align: 'center', sortable: true },
    { name: 'opciones', label: 'Acciones', align: 'center' }
])

async function updateSchedule(id) {
    loading.value = true
    if (showReject.value) {
        if (justification.value === null || !justification.value.trim()) {
            showNotify('Proporcione una justificación', 'negative')
        } else {
            await scheduleStore.putSchedule({
                userId: user.value.id,
                status: {
                    index: 0,
                    data: 'Agenda rechazada',
                    justification: justification.value ? justification.value : '-',
                    number: 1
                },
                signature: {
                    contractor: null,
                    supervisor: null,
                    paymaster: null,
                    publicWorker: null
                }
            }, id)

            if (user.value.role.data == 'supervisor') {
                rows.value = await getSchedule({
                    supervisor: user.value.id
                })
            }

            if (user.value.role.data == 'paymaster') {
                rows.value = await getSchedule({
                    paymaster: user.value.id
                })
            }

            //console.log(user.value._id),

            showReject.value = false

            row.value = null

            showNotify('Agenda Rechazada', 'info', 'info')

            showPreview.value = false

            justification.value = ''
        }
    } // ... dentro de updateSchedule(id) ...
    // ... (código de rechazo) ...
    else {

        // CASO 1: ADMINISTRADOR
        if (user.value.role.data == 'administrator' && !tripOrder.value) {
            showNotify('Digite el número de orden de viaje', 'negative')
        } // CASO ADMINISTRADOR → LEGALIZAR
        else if (
            user.value.role.data === 'administrator' &&
            row.value.status.index === 3
        ) {

            if (!tripOrder.value || !tripOrder.value.trim()) {
                showNotify('Digite el número de orden de viaje', 'negative')
                loading.value = false
                return
            }

            await scheduleStore.putSchedule({
                userId: user.value.id,
                status: {
                    index: 4,
                    data: 'Legalizado por Administrador',
                    justification: '-',
                    number: row.value.status.number + 1
                },
                tripOrder: tripOrder.value
            }, id)

            showNotify('Agenda legalizada correctamente', 'positive', 'check_circle')

            // Refrescar agendas del administrador
            rows.value = rows.value.filter(item => item._id !== id)


            // Limpieza
            row.value = null
            showPreview.value = false
            showOther.value = false
            tripOrder.value = null
        }

        // CASO 2: PAYMASTER CON DOCUMENTO ADJUNTO (¡El que debe ejecutarse al presionar "Enviar"!)

        else if (user.value.role.data === 'paymaster' && fileAttached.value) {
            const file = uploadedFile.value;

            console.log('=== 📋 VALIDACIÓN PREVIA ===');
            console.log('1. File existe:', !!file);
            console.log('2. Es File:', file instanceof File);
            console.log('3. Nombre:', file?.name);
            console.log('4. Tamaño:', file?.size, 'bytes');
            console.log('5. Tipo:', file?.type);
            console.log('6. Schedule ID:', id);
            console.log('7. User ID:', user.value.id);

            if (!file || !(file instanceof File)) {
                console.error('❌ Archivo no válido');
                showNotify('Error: Archivo no válido', 'negative');
                loading.value = false;
                return;
            }

            try {
                console.log('📤 Iniciando subida a Cloudinary...');

                const result = await scheduleStore.uploadDocument(
                    file,
                    id,              // scheduleId
                    user.value.id    // userId
                );

                console.log('📥 Resultado:', result);

                if (result.status === 200) {
                    console.log('✅ Subida exitosa!');
                    console.log('URL Cloudinary:', result.data.url);
                    console.log('Public ID:', result.data.public_id);

                    showNotify('Documento subido exitosamente a Cloudinary', 'positive', 'cloud_done');

                    // 🎯 AHORA actualiza el schedule con la URL del documento
                    await scheduleStore.putSchedule({
                        userId: user.value.id,
                        status: {
                            index: row.value.status.index + 1,
                            data: 'Aprobado por pagador',
                            justification: '-',
                            number: row.value.status.number + 1
                        },
                        signature: {
                            contractor: row.value.signature.contractor,
                            supervisor: row.value.signature.supervisor,
                            paymaster: null,
                            publicWorker: row.value.signature.publicWorker
                        },
                        // Guardar la URL del documento de Cloudinary
                        attachedDocumentUrl: result.data.url,
                        attachedDocumentPublicId: result.data.public_id
                    }, id);

                    // Refrescar la lista
                    rows.value = await getSchedule({
                        paymaster: user.value.id
                    });

                    // Limpiar estado
                    fileAttached.value = false;
                    uploadedFile.value = null;
                    attachedFileUrl.value = null;
                    showAttachedFileContent.value = false;
                    showPreview.value = false;
                    row.value = null;

                    // Resetear input
                    if (fileInput.value) {
                        fileInput.value.value = '';
                    }

                    showNotify('Agenda aprobada y documento guardado', 'positive', 'check_circle');

                } else {
                    console.error('❌ Status no exitoso:', result.status);
                    showNotify(`Error: ${result.data?.msg || 'Error desconocido'}`, 'negative');
                }

            } catch (error) {
                console.error('❌ Error en catch:', error);
                console.error('Error completo:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                showNotify('Error al subir el documento', 'negative');
            } finally {
                loading.value = false;
            }
        }

        // CASO 3: CUALQUIER OTRO APROBADOR SIN ARCHIVO (Supervisor, o Paymaster sin adjuntar)
        else {
            showNotify(`Digite el número ${row.value.typeSchedule == 'contractor' ? 'Orden de Viaje' : 'Comisión de Servicios'}`, 'negative')
            showReject.value = false
        }
    }
    loading.value = false
    // ...
}

const showReject = ref(false)

const justification = ref(null)

const tripOrder = ref(null)

const fileInput = ref(null)


async function firmarTodas() {
    if (user.value.role.data !== 'supervisor') {
        showNotify('Solo los supervisores pueden firmar', 'negative')
        return
    }

    if (!rows.value.length) {
        showNotify('No hay agendas para firmar', 'warning')
        return
    }

    loading.value = true

    try {
        // 1️⃣ Obtener firma del supervisor
        const { data } = await userStore.getUserParams(user.value.id)

        if (!data?.sign?.url) {
            showNotify('No tienes una firma cargada en tu perfil', 'negative')
            return
        }

        const firmaUrl = data.sign.url

        // 2️⃣ Recopilar agendas a firmar antes de modificarlas
        const agendasAFirmar = rows.value.filter(a => !a.signature?.supervisor)

        // 3️⃣ Firmar todas las agendas
        for (const agenda of agendasAFirmar) {
            const signature = {
                ...(agenda.signature || {}),
                supervisor: firmaUrl
            }

            await scheduleStore.putSchedule(
                {
                    userId: user.value.id,
                    signature,
                    status: {
                        index: 2,
                        data: 'Agenda firmada por Supervisor',
                        number: (agenda.status?.number || 0) + 1
                    }
                },
                agenda._id
            )

            // Actualizar firma en la copia local para que Preview la muestre
            agenda.signature = signature
        }

        showNotify('Todas las agendas fueron firmadas correctamente ✅', 'positive')

        // 4️⃣ Descargar PDF de cada agenda firmada
        for (const agenda of agendasAFirmar) {
            row.value = agenda
            showOther.value = agenda.typeSchedule !== 'contractor'
            showPreview.value = true
            await nextTick()
            await downloadPDF()
        }

        // 5️⃣ Resetear vista y refrescar tabla
        row.value = null
        showPreview.value = false
        showOther.value = false
        await recargar()

    } catch (error) {
        console.error('❌ Error firmando todas:', error)
        showNotify('Error al firmar todas las agendas', 'negative')
    } finally {
        loading.value = false
    }
}

function goToEditSchedule() {
    router.push({
        name: 'EditScheduleSupervisor',
        params: { id: row.value._id }
    })
}

function confirmEditAgenda() {
    Dialog.create({
        title: 'Confirmar edición',
        message: `
      <div>
        <p>Vas a editar la agenda con el siguiente número:</p>
        <p style="font-size:16px; font-weight:bold; text-align:center;">
          ${tripOrder || '— Sin número —'}
        </p>
        <p>¿El número es correcto?</p>
      </div>
    `,
        html: true,
        ok: {
            label: 'Sí, es correcto',
            color: 'green',
            icon: 'check'
        },
        cancel: {
            label: 'No, corregir',
            color: 'negative',
            icon: 'edit'
        },
        persistent: true
    })
        .onOk(() => {
            goToEditSchedule()
        })
}

</script>


<style scoped>
#invoice {
    font-family: Arial, sans-serif;
    word-spacing: 1px;
    /* Ajusta el espaciado entre palabras */
}
</style>