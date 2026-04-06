    <template>
        <q-page class="q-pa-md bg-grey-1">

            <!-- ═══ ENCABEZADO ═══ -->
            <div class="row items-center q-mb-lg">
                <div class="col">
                    <div class="row items-center q-gutter-sm">
                        <q-icon name="assignment" size="2rem" color="primary" />
                        <div>
                            <div class="text-h5 text-weight-bold text-grey-9">Control de Radicaciones</div>
                            <div class="text-caption text-grey-6">Gestión y seguimiento de Legalizaciones radicadas</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ═══ PANEL DE FILTROS Y ACCIONES ═══ -->
            <q-card flat bordered class="q-mb-md">
                <q-card-section class="q-pa-md">
                    <div class="row items-center q-col-gutter-md">

                        <!-- Buscar por nombre -->
                        <div class="col-12 col-md-4">
                            <q-input v-model="filters.name" label="Buscar por nombre" outlined dense clearable
                                bg-color="white">
                                <template v-slot:prepend>
                                    <q-icon name="search" color="grey-6" />
                                </template>
                            </q-input>
                        </div>

                        <!-- Acciones principales -->
                        <div class="col-12 col-md-8">
                            <div class="row justify-end items-center q-gutter-sm">

                                <q-btn unelevated color="indigo-6" label="Ir a Radicar" icon="launch"
                                    @click="irARadicar" />

                                <q-btn unelevated color="teal-7" label="Descargar Comisiones" icon="folder_zip"
                                    :loading="descargandoTodas" @click="descargarTodasComisiones" />

                                <q-btn unelevated color="green-7" label="Exportar Excel" icon="file_download"
                                    @click="exportarExcel" />

                            </div>
                        </div>

                    </div>
                </q-card-section>
            </q-card>

            <!-- ═══ TABLA PRINCIPAL ═══ -->
            <q-card flat bordered>
                <q-table title="Contratistas con Legalizaciones" :rows="filteredUsers" :columns="columns"
                    row-key="userId" flat :loading="loading" :rows-per-page-options="[10, 20, 50]"
                    class="radicaciones-table">
                    <template v-slot:top-title>
                        <div class="row items-center q-gutter-sm">
                            <q-icon name="people" color="primary" />
                            <span class="text-subtitle1 text-weight-medium">Contratistas con Legalizaciones</span>
                            <q-badge color="primary" rounded class="q-ml-xs">{{ filteredUsers.length }}</q-badge>
                        </div>
                    </template>

                    <template v-slot:body-cell-totalAgendas="props">
                        <q-td align="center">
                            <q-chip dense color="primary" text-color="white" icon="event" size="sm">
                                {{ props.row.totalAgendas }}
                            </q-chip>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-pendientes="props">
                        <q-td align="center">
                            <q-chip dense :color="props.row.pendientes > 0 ? 'orange-7' : 'green-7'" text-color="white"
                                :icon="props.row.pendientes > 0 ? 'hourglass_empty' : 'check_circle'" size="sm">
                                {{ props.row.pendientes }}
                            </q-chip>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                        <q-td align="center">
                            <div class="row justify-center items-center q-gutter-xs">

                                <q-btn unelevated color="primary" icon="visibility" size="sm" round
                                    @click="verLegalizacionesUsuario(props.row)">
                                    <q-tooltip>Ver Legalizaciones</q-tooltip>
                                </q-btn>

                                <q-btn unelevated color="green-7" icon="file_download" size="sm" round
                                    @click="exportarExcelUsuario(props.row)">
                                    <q-tooltip>Exportar Excel del contratista</q-tooltip>
                                </q-btn>

                                <q-btn unelevated color="teal-7" icon="folder_zip" size="sm" round
                                    :loading="descargandoUsuario === props.row.userId"
                                    @click="descargarComisionesUsuario(props.row)">
                                    <q-tooltip>Descargar comisiones ZIP</q-tooltip>
                                </q-btn>

                            </div>
                        </q-td>
                    </template>

                </q-table>
            </q-card>

            <!-- ═══ DIALOG: LEGALIZACIONES DEL USUARIO ═══ -->
            <q-dialog v-model="dialogLegalizacion" persistent transition-show="slide-up" transition-hide="slide-down">
                <q-card style="width: 92vw; max-width: 1100px; max-height: 90vh">

                    <q-toolbar class="bg-primary text-white">
                        <q-icon name="assignment_ind" size="sm" class="q-mr-sm" />
                        <q-toolbar-title>
                            <span class="text-weight-medium">Legalizaciones de:</span>
                            <span class="q-ml-xs">{{ usuarioSeleccionado?.name }}</span>
                        </q-toolbar-title>
                        <q-btn dense flat round icon="close" v-close-popup />
                    </q-toolbar>

                    <!-- Loading -->
                    <div v-if="loadingLegalizacion" class="flex flex-center q-pa-xl">
                        <div class="text-center">
                            <q-spinner color="primary" size="50px" />
                            <div class="text-grey-6 q-mt-md">Cargando Legalizaciones...</div>
                        </div>
                    </div>

                    <div v-else class="q-pa-md">

                        <!-- Filtro -->
                        <q-card flat bordered class="q-mb-md">
                            <q-card-section class="q-pa-sm">
                                <q-input v-model="filterTripOrderDialog" label="Filtrar por N° de Legalización" outlined
                                    dense clearable bg-color="white">
                                    <template v-slot:prepend>
                                        <q-icon name="filter_list" color="grey-6" />
                                    </template>
                                </q-input>
                            </q-card-section>
                        </q-card>

                        <!-- Tabla de agendas -->
                        <q-card flat bordered class="q-mb-md">
                            <q-table title="Legalizaciones del contratista" :rows="agendasUsuarioFiltradas"
                                :columns="columnsLegalizacion" row-key="_id" flat :rows-per-page-options="[10, 20, 50]">
                                <template v-slot:top-title>
                                    <div class="row items-center q-gutter-sm">
                                        <q-icon name="list_alt" color="primary" />
                                        <span class="text-subtitle1 text-weight-medium">Legalizaciones del Contratista</span>
                                        <q-badge color="primary" rounded>{{ agendasUsuarioFiltradas.length }}</q-badge>
                                    </div>
                                </template>

                                <!-- Estado de radicación -->
                                <template v-slot:body-cell-estadoRadicacion="props">
                                    <q-td align="center">
                                        <q-chip dense
                                            :color="getLastRadication(props.row)?.status === 'RADICADO' ? 'green-7' : 'orange-7'"
                                            text-color="white"
                                            :icon="getLastRadication(props.row)?.status === 'RADICADO' ? 'check_circle' : 'hourglass_empty'"
                                            size="sm">
                                            {{ getLastRadication(props.row)?.status || 'NO RADICADO' }}
                                        </q-chip>
                                    </q-td>
                                </template>

                                <!-- Número de radicación -->
                                <template v-slot:body-cell-numeroRadicacion="props">
                                    <q-td align="center">
                                        <div class="row items-center no-wrap q-gutter-xs justify-center">

                                            <span v-if="getLastRadication(props.row)?.radicationNumber"
                                                class="text-weight-medium text-primary">
                                                {{ getLastRadication(props.row).radicationNumber }}
                                            </span>
                                            <span v-else class="text-grey-5 text-caption text-italic">
                                                Sin número
                                            </span>

                                            <q-btn v-if="!getLastRadication(props.row)?.radicationNumber" size="xs" flat
                                                round icon="add_circle" color="primary"
                                                @click="abrirDialogRadicacion(props.row)">
                                                <q-tooltip>Agregar número</q-tooltip>
                                            </q-btn>

                                            <q-btn v-else size="xs" flat round icon="edit" color="grey-6"
                                                @click="abrirDialogRadicacion(props.row)">
                                                <q-tooltip>Editar número</q-tooltip>
                                            </q-btn>

                                        </div>
                                    </q-td>
                                </template>

                                <!-- Acciones -->
                                <template v-slot:body-cell-ver="props">
                                    <q-td align="center">
                                        <div class="row justify-center items-center q-gutter-xs">

                                            <q-btn icon="description" size="sm" color="primary" flat round
                                                @click="verDocumentos(props.row)">
                                                <q-tooltip>Ver documentos</q-tooltip>
                                            </q-btn>

                                            <q-btn icon="download" size="sm" color="green-7" flat round
                                                @click="descargarPdfLimpio(props.row)">
                                                <q-tooltip>Descargar PDF</q-tooltip>
                                            </q-btn>

                                            <q-btn icon="search" size="sm" color="secondary" flat round
                                                @click="consultarARadicar(props.row)">
                                                <q-tooltip>Consultar Radicación</q-tooltip>
                                            </q-btn>

                                        </div>
                                    </q-td>
                                </template>

                            </q-table>
                        </q-card>

                        <!-- Detalle de agenda seleccionada -->
                        <div v-if="agendaSeleccionada && agendaSeleccionada._id">
                            <q-separator class="q-my-md" />

                            <div class="row items-center q-mb-md q-gutter-sm">
                                <q-icon name="preview" color="primary" />
                                <span class="text-subtitle1 text-weight-medium text-grey-8">Detalle de la Legalizacion</span>
                            </div>

                            <!-- Alerta firmas faltantes -->
                            <q-banner
                                v-if="!previewError && (!agendaSeleccionada.signature?.contractor || !agendaSeleccionada.signature?.supervisor)"
                                class="bg-orange-1 text-orange-9 q-mb-md rounded-borders" rounded>
                                <template v-slot:avatar>
                                    <q-icon name="warning" color="orange-7" size="md" />
                                </template>
                                <div class="text-subtitle2 text-weight-medium">Firmas pendientes</div>
                                <div class="text-body2 q-mt-xs">
                                    <div v-if="!agendaSeleccionada.signature?.contractor">• Falta firma del contratista
                                    </div>
                                    <div v-if="!agendaSeleccionada.signature?.supervisor">• Falta firma del supervisor
                                    </div>
                                </div>
                            </q-banner>

                            <!-- Alerta firmas completas -->
                            <q-banner v-else-if="!previewError" class="bg-green-1 text-green-9 q-mb-md rounded-borders"
                                rounded>
                                <template v-slot:avatar>
                                    <q-icon name="check_circle" color="green-7" size="md" />
                                </template>
                                <div class="text-subtitle2 text-weight-medium">Firmas completas</div>
                                <div class="text-body2 q-mt-xs">Todas las firmas requeridas están presentes.</div>
                            </q-banner>

                            <!-- Error preview -->
                            <div v-if="previewError"
                                class="q-pa-md bg-red-1 text-red-9 rounded-borders row items-center q-gutter-sm">
                                <q-icon name="error" size="md" color="red-7" />
                                <span>Error al cargar el detalle. Por favor, intente nuevamente.</span>
                            </div>
                            <LegalizationDetail v-else :key="agendaSeleccionada._id" :row="agendaSeleccionada"
                                @vue:error="previewError = true" />

                        </div>

                    </div>

                </q-card>
            </q-dialog>

            <!-- ═══ DIALOG: AGREGAR / EDITAR NÚMERO DE RADICACIÓN ═══ -->
            <q-dialog v-model="dialogRadicacion">
                <q-card style="width: 420px; max-width: 95vw">

                    <q-toolbar class="bg-primary text-white">
                        <q-icon name="tag" size="sm" class="q-mr-sm" />
                        <q-toolbar-title>Número de Radicación</q-toolbar-title>
                        <q-btn dense flat round icon="close" v-close-popup />
                    </q-toolbar>

                    <q-card-section class="q-pt-md">
                        <q-input v-model="numeroRadicacion" label="Ingrese el número de radicación" outlined autofocus>
                            <template v-slot:prepend>
                                <q-icon name="pin" color="grey-6" />
                            </template>
                        </q-input>
                    </q-card-section>

                    <q-separator />

                    <q-card-actions align="right" class="q-pa-md">
                        <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
                        <q-btn unelevated color="primary" label="Guardar" icon="save" @click="guardarRadicacion" />
                    </q-card-actions>

                </q-card>
            </q-dialog>

            <!-- ═══ DIALOG: DOCUMENTOS DEL CONTRATISTA ═══ -->
            <q-dialog v-model="dialogDocs" transition-show="slide-up" transition-hide="slide-down">
                <q-card style="width: 92vw; max-width: 1100px; max-height: 90vh">

                    <q-toolbar class="bg-primary text-white">
                        <q-icon name="folder_open" size="sm" class="q-mr-sm" />
                        <q-toolbar-title>Documentos del Contratista</q-toolbar-title>
                        <q-btn dense flat round icon="close" v-close-popup />
                    </q-toolbar>

                    <q-card-section class="q-pa-md">

                        <div v-if="!pdfUrl && !archivosDocs.length && !agendaDocs" class="flex flex-center q-pa-xl">
                            <div class="text-center text-grey-5">
                                <q-icon name="folder_off" size="4rem" />
                                <div class="q-mt-sm text-subtitle1">No hay documentos adjuntos</div>
                            </div>
                        </div>

                        <div v-if="agendaDocs" class="q-mb-md">
                            <LegalizationDetail :row="agendaDocs" />
                        </div>

                        <div v-for="(doc, index) in archivosDocs" :key="index" class="q-mt-md">
                            <q-card flat bordered>
                                <q-card-section class="q-pa-sm bg-grey-2">
                                    <div class="row items-center q-gutter-xs">
                                        <q-icon name="picture_as_pdf" color="red-7" />
                                        <span class="text-caption text-grey-7">Documento {{ index + 1 }}</span>
                                    </div>
                                </q-card-section>
                                <iframe :src="doc.url" style="width:100%; height:600px; border:none;" />
                            </q-card>
                        </div>

                    </q-card-section>

                </q-card>
            </q-dialog>

        </q-page>
    </template>

<script setup>
import { ref, computed, onMounted, onErrorCaptured } from 'vue'
import { useScheduleStore } from '../../../stores/schedule'
import LegalizationDetail from '../administrator/Preview.vue'
import { PDFDocument } from 'pdf-lib'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { LocalStorage } from 'quasar'

const scheduleStore = useScheduleStore()

const fetchWithAuth = async (url) => {
    const token = LocalStorage.getItem('token')
    const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`
    const res = await fetch(fullUrl, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    if (!res.ok) throw new Error(`Error ${res.status} cargando ${fullUrl}`)
    const blob = await res.blob()
    return URL.createObjectURL(blob)
}

const agendaDocs = ref(null)
const archivosDocs = ref([])
onErrorCaptured(() => {
    previewError.value = true
    return false
})

/* =====================
STATES
===================== */
const rows = ref([])
const loading = ref(false)

const dialogLegalizacion = ref(false)
const loadingLegalizacion = ref(false)

const usuarioSeleccionado = ref(null)
const agendasUsuario = ref([])
const agendaSeleccionada = ref(null)
const filterTripOrderDialog = ref('')
const previewError = ref(false)

const descargandoTodas = ref(false)
const descargandoUsuario = ref(null)

const dialogRadicacion = ref(false)
const agendaRadicacion = ref(null)
const numeroRadicacion = ref('')


const abrirDialogRadicacion = (agenda) => {
    agendaRadicacion.value = agenda

    const last = getLastRadication(agenda)
    numeroRadicacion.value = last?.radicationNumber || ''

    dialogRadicacion.value = true
}


const pdfUrl = ref(null)
const dialogDocs = ref(false)

const verDocumentos = async (agenda) => {
    agendaDocs.value = agenda
    archivosDocs.value = []
    dialogDocs.value = true

    const docs = agenda.legalization?.documents
    const archivos = [
        ...(docs?.autorizacionPago || []),
        ...(docs?.compromisoPresupuestal || []),
        ...(docs?.asistenciaFormacion || []),
        ...(docs?.tiquetes || []),
        ...(docs?.interveredal || [])
    ]

    archivosDocs.value = await Promise.all(
        archivos.map(async (doc) => {
            try {
                const blobUrl = await fetchWithAuth(doc.url)
                return { ...doc, url: blobUrl }
            } catch {
                const url = doc.url.startsWith('http') ? doc.url : `${import.meta.env.VITE_API_URL}${doc.url}`
                return { ...doc, url }
            }
        })
    )
}




/* =====================
FILTROS
===================== */
const filters = ref({
    name: '',
    tripOrder: ''
})

/* =====================
COLUMNAS PRINCIPAL
===================== */
const columns = [
    { name: 'name', label: 'Nombre', field: 'name', align: 'center', sortable: true },
    { name: 'totalAgendas', label: 'Total Agendas', field: 'totalAgendas', align: 'center', sortable: true },
    { name: 'actions', label: 'Acciones', align: 'center' }
]

/* =====================

COLUMNAS LEGALIZACIÓN
===================== */
const columnsLegalizacion = [
    { name: 'tripOrder', label: 'N° De Legalización', field: row => row.tripOrder || 'No asignado', align: 'left' },
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
    },

    { name: 'estadoRadicacion', label: 'Estado Radicación', field: row => row, align: 'center' },
    { name: 'numeroRadicacion', label: 'N° Radicación', field: row => row, align: 'center' },
    { name: 'ver', label: 'Acciones', align: 'center' }
]



/* =====================
DATA
===================== */
const loadSchedules = async () => {
    loading.value = true

    try {
        const { data } = await scheduleStore.getSchedule()

        let schedules = []

        if (Array.isArray(data)) {
            schedules = data
        } else if (data?.schedules) {
            schedules = data.schedules
        } else if (data?.data) {
            schedules = data.data
        }

        // 🔹 Agendas desde "Legalización firmada por Supervisor" (index >= 6)
        rows.value = schedules.filter(
            s => s.status?.index >= 6
        )

        console.log('📊 Total agendas cargadas:', rows.value.length)

    } catch (error) {
        console.error('❌ Error cargando agendas:', error)
        rows.value = []
    } finally {
        loading.value = false
    }
}

/* =====================
AGRUPAR POR USUARIO
===================== */
const groupedByUser = computed(() => {
    const userMap = new Map()

    rows.value.forEach(agenda => {
        // El userId está en 'contractor', no en 'user'
        const userId = agenda.contractor || agenda.user?._id || agenda.userId

        if (!userId) {
            console.warn('⚠️ Agenda sin userId:', agenda._id)
            return
        }

        // El nombre está en contract.contractorName
        const userName = agenda.contract?.contractorName ||
            agenda.contract?.publicName ||
            agenda.user?.name ||
            'Usuario sin nombre'

        if (!userMap.has(userId)) {
            userMap.set(userId, {
                userId,
                name: userName,
                agendas: [],
                totalAgendas: 0,
                pendientes: 0,
                firstDate: null,
                lastDate: null
            })
        }

        const user = userMap.get(userId)
        user.agendas.push(agenda)
        user.totalAgendas++

        // Verificar si está legalizada (status.index === 4 significa "Legalizado por Administrador")
        const isLegalized = agenda.legalization?.createdAt ||
            agenda.status?.index === 4 ||
            agenda.status?.data?.includes('Legalizado')

        if (!isLegalized) {
            user.pendientes++
        }

        // Las fechas están en tripStart y tripEnd
        const tripStart = agenda.tripStart?.slice(0, 10)
        if (tripStart) {
            if (!user.firstDate || tripStart < user.firstDate) {
                user.firstDate = tripStart
            }
            if (!user.lastDate || tripStart > user.lastDate) {
                user.lastDate = tripStart
            }
        }
    })

    console.log('✅ Usuarios agrupados:', Array.from(userMap.values()))
    return Array.from(userMap.values())
})

/* =====================
FILTRADO
===================== */
const filteredUsers = computed(() => {
    return groupedByUser.value.filter(user => {
        const nameMatch = !filters.value.name ||
            user.name.toLowerCase().includes(filters.value.name.toLowerCase())

        const tripOrderMatch = !filters.value.tripOrder ||
            user.agendas.some(agenda =>
                agenda.tripOrder?.toLowerCase().includes(filters.value.tripOrder.toLowerCase())
            )

        return nameMatch && tripOrderMatch
    })
})

/* =====================
FILTRADO DIALOG
===================== */
const agendasUsuarioFiltradas = computed(() => {
    if (!filterTripOrderDialog.value) {
        return agendasUsuario.value
    }

    return agendasUsuario.value.filter(agenda =>
        agenda.tripOrder?.toLowerCase().includes(filterTripOrderDialog.value.toLowerCase())
    )
})

/* =====================
VER LEGALIZACIONES
===================== */
const verLegalizacionesUsuario = (user) => {
    dialogLegalizacion.value = true
    loadingLegalizacion.value = true
    agendaSeleccionada.value = null  // Reset primero
    previewError.value = false       // Reset error
    filterTripOrderDialog.value = ''

    usuarioSeleccionado.value = {
        name: user.name
    }

    agendasUsuario.value = user.agendas
    loadingLegalizacion.value = false
}
const mergePdfs = async (archivos) => {
    const mergedPdf = await PDFDocument.create()

    for (const file of archivos) {
        const fileUrl = file.url.startsWith("http")
            ? file.url
            : `${import.meta.env.VITE_API_URL}${file.url}`

        const response = await fetch(fileUrl)
        if (!response.ok) {
            console.warn("No se pudo descargar:", fileUrl)
            continue
        }

        const bytes = await response.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
    }

    return mergedPdf
}

const descargarBlob = (bytes, fileName) => {
    const blob = new Blob([bytes], { type: "application/pdf" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    link.click()
}

const descargarPdfLimpio = async (agenda) => {
    try {
        const docs = agenda.legalization?.documents

        if (!docs) {
            console.warn("No hay documentos")
            return
        }

        const comision = agenda.tripOrder || 'SIN_COM'
        const cedula = agenda.contract?.identification || agenda.contract?.cedula || agenda.contract?.contractorCedula || agenda.user?.cedula || 'SIN_CED'

        // — Archivo 1: Autorización de Pago (obligatorio) —
        const archivosAutorizacion = [...(docs.autorizacionPago || [])]

        if (archivosAutorizacion.length > 0) {
            const pdf1 = await mergePdfs(archivosAutorizacion)
            descargarBlob(await pdf1.save(), `AUTORIZACION_COM${comision}_${cedula}.pdf`)
        } else {
            console.warn("No hay archivos de Autorización de Pago")
        }

        // — Archivo 2: Comprobante de Gasto (tiquetes obligatorio + reintegros + interveredal si existen) —
        const archivosComprobante = [
            ...(docs.tiquetes || []),
            ...(docs.reintegros || []),
            ...(docs.interveredal || [])
        ]

        if (archivosComprobante.length > 0) {
            const pdf2 = await mergePdfs(archivosComprobante)
            descargarBlob(await pdf2.save(), `COMPROBANTE DE GASTO.pdf`)
        } else {
            console.warn("No hay archivos para Comprobante de Gasto")
        }

    } catch (error) {
        console.error("Error generando PDFs:", error)
    }
}

const guardarRadicacion = async () => {
    if (!numeroRadicacion.value) return

    try {
        const lastRadication = getLastRadication(agendaRadicacion.value)
        const esEdicion = !!lastRadication?._id

        const { status } = esEdicion
            ? await scheduleStore.updateRadication(
                agendaRadicacion.value._id,
                lastRadication._id,
                { radicationNumber: numeroRadicacion.value }
              )
            : await scheduleStore.addRadication(
                agendaRadicacion.value._id,
                { radicationNumber: numeroRadicacion.value }
              )

        if (status === 200 || status === 201) {
            const agendaIndex = agendasUsuario.value.findIndex(
                a => a._id === agendaRadicacion.value._id
            )

            if (agendaIndex !== -1) {
                if (!agendasUsuario.value[agendaIndex].radications) {
                    agendasUsuario.value[agendaIndex].radications = []
                }

                if (esEdicion) {
                    // Actualizar la última radicación en lugar de agregar una nueva
                    const idx = agendasUsuario.value[agendaIndex].radications.length - 1
                    agendasUsuario.value[agendaIndex].radications[idx].radicationNumber = numeroRadicacion.value
                } else {
                    agendasUsuario.value[agendaIndex].radications.push({
                        radicationNumber: numeroRadicacion.value,
                        status: 'RADICADO',
                        createdAt: new Date().toISOString()
                    })
                }
            }

            dialogRadicacion.value = false
            numeroRadicacion.value = ''
            agendaRadicacion.value = null
        }
    } catch (error) {
        console.error('❌ Error guardando radicación:', error)
    }
}

const getLastRadication = (agenda) => {
    if (!agenda?.radications || agenda.radications.length === 0) return null
    return agenda.radications[agenda.radications.length - 1]
}

const irARadicar = () => {
    // Aquí pones la URL a la que quieres ir
    const url = 'https://oficinavirtualderadicacion.sena.edu.co/oficinavirtual/radicar.waformularioradicar.aspx'

    // Abrir en nueva pestaña
    window.open(url, '_blank')
}

const consultarARadicar = () => {
    // Aquí pones la URL a la que quieres ir
    const url = 'https://oficinavirtualderadicacion.sena.edu.co/oficinavirtual/consulta.wapantallaconsulta.aspx'

    // Abrir en nueva pestaña
    window.open(url, '_blank')
}


const exportarExcel = () => {
    // 🔹 Combinar todas las agendas
    let todasLegalizaciones = rows.value.flatMap(u => {
        return (u.agendas || [u]).map(a => ({
            'Usuario': a.contract?.contractorName || a.user?.name || 'Sin Nombre',
            'N° Legalización': a.tripOrder,
            'Fecha': a.tripStart ? new Date(a.tripStart) : null, // <-- objeto Date
            'Estado Radicación': getLastRadication(a)?.status || 'NO RADICADO',
            'N° Radicación': getLastRadication(a)?.radicationNumber || ''
        }))
    })

    // 🔹 Ordenar por Usuario A-Z
    todasLegalizaciones.sort((a, b) => a.Usuario.localeCompare(b.Usuario))

    // 🔹 Crear libro y hoja
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(todasLegalizaciones, { origin: 'A1' })

    // 🔹 Añadir filtro automático
    ws['!autofilter'] = { ref: `A1:E${todasLegalizaciones.length + 1}` }

    // 🔹 Ancho de columnas
    ws['!cols'] = [
        { wch: 25 }, // Usuario
        { wch: 20 }, // N° Legalización
        { wch: 15 }, // Fecha
        { wch: 20 }, // Estado Radicación
        { wch: 20 }  // N° Radicación
    ]

    // 🔹 Bordes
    Object.keys(ws).forEach(cell => {
        if (cell[0] === '!') return
        if (!ws[cell].s) ws[cell].s = {}
        ws[cell].s.border = {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
        }

        // 🔹 Formato de fecha para la columna C (Fecha)
        if (ws[cell].v instanceof Date) {
            ws[cell].t = 'd'           // tipo Date
            ws[cell].z = 'mm/dd/yyyy'  // formato visible
        }
    })

    // 🔹 Añadir hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Legalizaciones')

    // 🔹 Guardar archivo
    XLSX.writeFile(wb, 'Legalizaciones_Completas.xlsx')
}

const exportarExcelUsuario = (user) => {
    if (!user?.agendas || user.agendas.length === 0) return

    const data = user.agendas.map(a => ({
        'Usuario': user.name,
        'N° Legalización': a.tripOrder || 'No asignado',
        'Fecha Inicio': a.tripStart ? new Date(a.tripStart) : null,
        'Fecha Fin': a.tripEnd ? new Date(a.tripEnd) : null,
        'Estado Radicación': getLastRadication(a)?.status || 'NO RADICADO',
        'N° Radicación': getLastRadication(a)?.radicationNumber || ''
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // Filtro automático
    ws['!autofilter'] = { ref: `A1:F${data.length + 1}` }

    // Ancho de columnas
    ws['!cols'] = [
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 }
    ]

    // Formato de fechas
    Object.keys(ws).forEach(cell => {
        if (cell[0] === '!') return
        if (ws[cell].v instanceof Date) {
            ws[cell].t = 'd'
            ws[cell].z = 'mm/dd/yyyy'
        }
    })

    XLSX.utils.book_append_sheet(wb, ws, 'Agendas Usuario')

    const fileName = `Agendas_${user.name.replace(/\s+/g, '_')}.xlsx`
    XLSX.writeFile(wb, fileName)
}

const agregarComisionAZip = async (agenda, carpetaPadre) => {
    const docs = agenda.legalization?.documents
    if (!docs) return

    const comision = agenda.tripOrder || 'SIN_COM'
    const cedula = agenda.contract?.cedula || agenda.contract?.contractorCedula || agenda.user?.cedula || 'SIN_CED'
    const carpetaComision = carpetaPadre.folder(comision)

    // Archivo 1: Autorización de Pago
    const archivosAutorizacion = [...(docs.autorizacionPago || [])]
    if (archivosAutorizacion.length > 0) {
        const pdf1 = await mergePdfs(archivosAutorizacion)
        carpetaComision.file(`AUTORIZACION_COM${comision}_${cedula}.pdf`, await pdf1.save())
    }

    // Archivo 2: Comprobante de Gasto
    const archivosComprobante = [
        ...(docs.tiquetes || []),
        ...(docs.reintegros || []),
        ...(docs.interveredal || [])
    ]
    if (archivosComprobante.length > 0) {
        const pdf2 = await mergePdfs(archivosComprobante)
        carpetaComision.file('COMPROBANTE DE GASTO.pdf', await pdf2.save())
    }
}

const descargarComisionesUsuario = async (user) => {
    if (!user?.agendas?.length) return
    descargandoUsuario.value = user.userId
    try {
        const zip = new JSZip()
        const carpetaUsuario = zip.folder(user.name)

        for (const agenda of user.agendas) {
            await agregarComisionAZip(agenda, carpetaUsuario)
        }

        const blob = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${user.name}.zip`
        link.click()
    } catch (error) {
        console.error('Error generando ZIP usuario:', error)
    } finally {
        descargandoUsuario.value = null
    }
}

const descargarTodasComisiones = async () => {
    descargandoTodas.value = true
    try {
        const zip = new JSZip()

        for (const user of groupedByUser.value) {
            if (!user?.agendas?.length) continue
            const carpetaUsuario = zip.folder(user.name)
            for (const agenda of user.agendas) {
                await agregarComisionAZip(agenda, carpetaUsuario)
            }
        }

        const blob = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'Todas_Las_Comisiones.zip'
        link.click()
    } catch (error) {
        console.error('Error generando ZIP total:', error)
    } finally {
        descargandoTodas.value = false
    }
}

onMounted(loadSchedules)
</script>