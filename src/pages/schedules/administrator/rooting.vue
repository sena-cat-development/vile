    <template>
        <q-page class="q-pa-md">

            <div class="text-h4 text-center q-mb-md">
                Control De Radicaciones
            </div>

            <!-- 🔍 FILTROS -->
            <div class="row items-center q-col-gutter-md q-mb-md">

                <!-- Buscar por nombre -->
                <div class="col-12 col-md-6">
                    <q-input v-model="filters.name" label="Buscar por nombre" outlined dense clearable />
                </div>

                <!-- Botones -->
                <div class="col-12 col-md-6">
                    <div class="row justify-end items-center q-gutter-sm">

                        <q-btn color="primary" label="Ir a Radicar" icon="launch" @click="irARadicar" />

                        <q-btn color="teal" label="Descargar Todas Las Comisiones" icon="folder_zip"
                            :loading="descargandoTodas" @click="descargarTodasComisiones" />

                        <q-btn color="primary" label="Exportar Todas Las Radicaciones" icon="file_download"
                            @click="exportarExcel" />

                    </div>
                </div>

            </div>


            <!-- 📋 TABLA PRINCIPAL (USUARIOS ÚNICOS) -->
            <q-table title="Usuarios con Agendas" :rows="filteredUsers" :columns="columns" row-key="userId" flat
                bordered :loading="loading">
                <template v-slot:body-cell-totalAgendas="props">
                    <q-td align="center">
                        <q-badge color="primary" outline>
                            {{ props.row.totalAgendas }}
                        </q-badge>
                    </q-td>
                </template>

                <template v-slot:body-cell-pendientes="props">
                    <q-td align="center">
                        <q-badge :color="props.row.pendientes > 0 ? 'orange' : 'green'" outline>
                            {{ props.row.pendientes }}
                        </q-badge>
                    </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                    <q-td align="center" class="q-gutter-sm">

                        <!-- Ver agendas -->
                        <q-btn color="primary" icon="visibility" size="sm" round
                            @click="verLegalizacionesUsuario(props.row)">
                            <q-tooltip>Ver agendas</q-tooltip>
                        </q-btn>

                        <!-- Exportar solo este usuario -->
                        <q-btn color="green" icon="file_download" size="sm" round
                            @click="exportarExcelUsuario(props.row)">
                            <q-tooltip>Exportar legalizaciones en excel del contratista</q-tooltip>
                        </q-btn>

                        <!-- Descargar carpetas ZIP del usuario -->
                        <q-btn color="teal" icon="folder_zip" size="sm" round
                            :loading="descargandoUsuario === props.row.userId"
                            @click="descargarComisionesUsuario(props.row)">
                            <q-tooltip>Descargar comisiones del contratista</q-tooltip>
                        </q-btn>

                    </q-td>
                </template>


            </q-table>

            <!-- 🪟 DIALOG -->
            <q-dialog v-model="dialogLegalizacion" persistent>
                <q-card style="width: 90vw; max-width: 1200px;">

                    <q-bar>
                        <div class="text-h6">
                            Legalizaciones - {{ usuarioSeleccionado?.name }}
                        </div>
                        <q-space />
                        <q-btn dense flat icon="close" v-close-popup />
                    </q-bar>

                    <q-card-section v-if="loadingLegalizacion" class="text-center q-pa-lg">
                        <q-spinner size="40px" />
                    </q-card-section>

                    <q-card-section v-else>

                        <!-- 🔍 FILTRO TRIP ORDER -->
                        <div class="q-mb-md">
                            <q-input v-model="filterTripOrderDialog" label="Número De Legalización" outlined dense
                                clearable />
                        </div>

                        <!-- 📋 TABLA LEGALIZACIONES -->
                        <q-table title="Agendas del usuario" :rows="agendasUsuarioFiltradas"
                            :columns="columnsLegalizacion" row-key="_id" flat bordered>
                            <!-- 🔹 ESTADO DE RADICACIÓN -->
                            <template v-slot:body-cell-estadoRadicacion="props">
                                <q-td align="center">
                                    <q-badge
                                        :color="getLastRadication(props.row)?.status === 'RADICADO' ? 'green' : 'orange'"
                                        outline>
                                        {{ getLastRadication(props.row)?.status || 'NO RADICADO' }}
                                    </q-badge>
                                </q-td>
                            </template>

                            <!-- 🔹 NÚMERO DE RADICACIÓN -->
                            <template v-slot:body-cell-numeroRadicacion="props">
                                <q-td align="center">
                                    <div class="row items-center no-wrap q-gutter-sm justify-center">

                                        <!-- ✅ Si EXISTE número -->
                                        <span v-if="getLastRadication(props.row)?.radicationNumber"
                                            class="text-weight-medium">
                                            {{ getLastRadication(props.row).radicationNumber }}
                                        </span>

                                        <!-- ⚠️ Si NO existe número -->
                                        <span v-else class="text-grey-6 text-italic">
                                            No asignado
                                        </span>

                                        <!-- ➕ Agregar número -->
                                        <q-btn v-if="!getLastRadication(props.row)?.radicationNumber" size="sm" flat
                                            icon="add" color="primary" @click="abrirDialogRadicacion(props.row)">
                                            <q-tooltip>Agregar número de radicación</q-tooltip>
                                        </q-btn>

                                        <!-- ✏️ Editar número -->
                                        <q-btn v-if="getLastRadication(props.row)?.radicationNumber" size="sm" flat
                                            icon="edit" color="primary" @click="abrirDialogRadicacion(props.row)">
                                            <q-tooltip>Editar número de radicación</q-tooltip>
                                        </q-btn>
                                    </div>
                                </q-td>
                            </template>



                            <!-- 🔹 VER DETALLE + IR A RADICAR -->
                            <template v-slot:body-cell-ver="props">
                                <q-td align="center">
                                    <div class="row items-center no-wrap q-gutter-sm justify-center">

                                        <!-- Botón ver detalle -->
                                        <q-btn icon="description" size="sm" color="primary" flat round
                                            @click="verDocumentos(props.row)">
                                            <q-tooltip>Ver documentos del contratista</q-tooltip>
                                        </q-btn>

                                        <q-btn icon="download" size="sm" color="green" flat round
                                            @click="descargarPdfLimpio(props.row)" />


                                        <!-- Botón ir a radicar -->
                                        <q-btn icon="search" size="sm" color="secondary" flat round
                                            @click="consultarARadicar(props.row)">
                                            <q-tooltip>Consultar Radicación</q-tooltip>
                                        </q-btn>

                                    </div>
                                </q-td>
                            </template>
                        </q-table>


                        <!-- 📄 DETALLE LEGALIZACIÓN -->
                        <div v-if="agendaSeleccionada && agendaSeleccionada._id" class="q-mt-md">
                            <q-separator class="q-my-md" />
                            <div class="text-h6 q-mb-md">Detalle de la Agenda</div>

                            <!-- ⚠️ ALERTA DE FIRMAS FALTANTES -->
                            <q-banner
                                v-if="!previewError && (!agendaSeleccionada.signature?.contractor || !agendaSeleccionada.signature?.supervisor)"
                                class="bg-orange-2 text-orange-9 q-mb-md" rounded>
                                <template v-slot:avatar>
                                    <q-icon name="warning" color="orange" size="md" />
                                </template>
                                <div class="text-subtitle2 text-weight-medium">Firmas pendientes</div>
                                <div class="text-body2">
                                    <span v-if="!agendaSeleccionada.signature?.contractor">• Falta firma del
                                        contratista</span>
                                    <br
                                        v-if="!agendaSeleccionada.signature?.contractor && !agendaSeleccionada.signature?.supervisor">
                                    <span v-if="!agendaSeleccionada.signature?.supervisor">• Falta firma del
                                        supervisor</span>
                                </div>
                            </q-banner>

                            <!-- ✅ ALERTA DE FIRMAS COMPLETAS -->
                            <q-banner v-else-if="!previewError" class="bg-green-2 text-green-9 q-mb-md" rounded>
                                <template v-slot:avatar>
                                    <q-icon name="check_circle" color="green" size="md" />
                                </template>
                                <div class="text-subtitle2 text-weight-medium">Firmas completas</div>
                                <div class="text-body2">
                                    Todas las firmas requeridas están presentes
                                </div>
                            </q-banner>

                            <!-- Componente Preview con manejo de errores -->
                            <div v-if="previewError" class="q-pa-md bg-red-2 text-red-9 rounded-borders">
                                <q-icon name="error" size="md" class="q-mr-sm" />
                                Error al cargar el detalle de la agenda. Por favor, intente nuevamente.
                            </div>
                            <LegalizationDetail v-else :key="agendaSeleccionada._id" :row="agendaSeleccionada"
                                @vue:error="previewError = true" />

                        </div>

                    </q-card-section>

                </q-card>
            </q-dialog>

            <q-dialog v-model="dialogRadicacion">
                <q-card style="width:400px">

                    <q-bar>
                        <div class="text-h6">Radicación</div>
                        <q-space />
                        <q-btn dense flat icon="close" v-close-popup />
                    </q-bar>

                    <q-card-section>
                        <q-input v-model="numeroRadicacion" label="Número de radicación" outlined />
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn flat label="Cancelar" v-close-popup />
                        <q-btn color="primary" label="Guardar" @click="guardarRadicacion" />
                    </q-card-actions>

                </q-card>
            </q-dialog>

            <q-dialog v-model="dialogDocs">
                <q-card style="width: 95vw; max-width: 1100px">

                    <q-bar>
                        <div class="text-h6">
                            Documentos del contratista
                        </div>
                        <q-space />
                        <q-btn dense flat icon="close" v-close-popup />
                    </q-bar>

                    <q-card-section>

                        <div v-if="!pdfUrl" class="text-center text-grey">
                            No hay documentos adjuntos
                        </div>

                        <q-card-section>

                            <!-- FORMATO LEGALIZACIÓN -->
                            <div v-if="agendaDocs">
                                <LegalizationDetail :row="agendaDocs" />
                            </div>

                            <!-- DOCUMENTOS PDF -->
                            <div v-for="(doc, index) in archivosDocs" :key="index" class="q-mt-md">

                                <iframe :src="doc.url" style="width:100%; height:600px; border:none;" />

                            </div>

                        </q-card-section>
                    </q-card-section>

                </q-card>
            </q-dialog>



        </q-page>
    </template>

<script setup>
import { ref, computed, onMounted, onErrorCaptured, nextTick } from 'vue'
import { useScheduleStore } from '../../../stores/schedule'
import LegalizationDetail from '../administrator/Preview.vue'
import { PDFDocument } from 'pdf-lib'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'

const scheduleStore = useScheduleStore()

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

const previewKey = ref(0)
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

const verDocumentos = (agenda) => {

  agendaDocs.value = agenda

  const docs = agenda.legalization?.documents

  const archivos = [
    ...(docs?.autorizacionPago || []),
    ...(docs?.compromisoPresupuestal || []),
    ...(docs?.asistenciaFormacion || []),
    ...(docs?.tiquetes || []),
    ...(docs?.interveredal || [])
  ]

  archivosDocs.value = archivos.map(doc => {

    const url = doc.url.startsWith('http')
      ? doc.url
      : `${import.meta.env.VITE_API_URL}${doc.url}`

    return {
      ...doc,
      url
    }
  })

  dialogDocs.value = true
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

        // 🔹 SOLO agendas firmadas por supervisor
        rows.value = schedules.filter(
            s => s.status?.index === 6
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
        const cedula = agenda.contract?.cedula || agenda.contract?.contractorCedula || agenda.user?.cedula || 'SIN_CED'

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
        const { status, data } = await scheduleStore.addRadication(
            agendaRadicacion.value._id,
            {
                status: 'RADICADO',
                radicationNumber: numeroRadicacion.value
            }
        )

        if (status === 200 || status === 201) {
            // Actualizar la agenda en el arreglo local
            const agendaIndex = agendasUsuario.value.findIndex(
                a => a._id === agendaRadicacion.value._id
            )

            if (agendaIndex !== -1) {
                // Crear nueva radicación
                const newRadication = {
                    status: 'RADICADO',
                    radicationNumber: numeroRadicacion.value,
                    createdAt: new Date().toISOString()
                }

                // Si no existe el array, crearlo
                if (!agendasUsuario.value[agendaIndex].radications) {
                    agendasUsuario.value[agendaIndex].radications = []
                }

                // Agregar la nueva radicación
                agendasUsuario.value[agendaIndex].radications.push(newRadication)
            }

            // Cerrar dialog y recargar datos completos
            dialogRadicacion.value = false
            numeroRadicacion.value = ''
            agendaRadicacion.value = null

            await loadSchedules()
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