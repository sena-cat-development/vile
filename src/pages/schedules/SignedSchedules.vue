<template>
    <q-page class="q-pa-md">

        <!-- TÍTULO -->
        <div class="text-h4 text-center q-mb-md text-green">
            Agendas Firmadas
        </div>

        <!-- TABLA PRINCIPAL DE USUARIOS -->
        <div class="row justify-center">
            <div class="col-12 col-md-10">

                <q-input dense debounce="300" v-model="filter" placeholder="Buscar por nombre o entidad"
                    class="q-mb-md">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>

                <q-table :rows="usersRows" :columns="userColumns" :filter="filter" row-key="userId" :loading="loading"
                    flat bordered class="shadow-2 rounded-borders">

                    <template v-slot:top-right>
                        <q-btn color="green" icon="refresh" label="Recargar" @click="fetchSignedSchedules" />
                    </template>

                    <!-- NOMBRE -->
                    <template v-slot:body-cell-name="props">
                        <q-td :props="props" class="text-center">
                            {{ props.row.name }}
                        </q-td>
                    </template>

                    <!-- ENTIDAD -->
                    <template v-slot:body-cell-company="props">
                        <q-td :props="props" class="text-center">
                            {{ props.row.company || '-' }}
                        </q-td>
                    </template>

                    <!-- TOTAL DE AGENDAS -->
                    <template v-slot:body-cell-total="props">
                        <q-td :props="props" class="text-center">
                            <q-badge color="green" :label="props.row.agendas.length" />
                        </q-td>
                    </template>

                    <!-- ACCIONES -->
                    <template v-slot:body-cell-actions="props">
                        <q-td :props="props" class="text-center">
                            <q-btn dense round icon="visibility" color="green" @click="openAgendasDialog(props.row)">
                                <q-tooltip>Ver agendas</q-tooltip>
                            </q-btn>
                        </q-td>
                    </template>

                </q-table>
            </div>
        </div>

        <!-- DIALOG: AGENDAS DEL USUARIO -->
        <q-dialog v-model="showAgendasDialog">
            <q-card style="min-width: 800px; max-width: 90vw; max-height: 80vh;" class="column">

                <q-card-section class="row items-center bg-green text-white">
                    <div class="text-h6">
                        Agendas de {{ selectedUser?.name }}
                    </div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section class="col q-pa-md scroll">

                    <q-table :rows="selectedUser?.agendas || []" :columns="agendaColumns" row-key="_id" flat bordered
                        class="shadow-2 rounded-borders">

                        <!-- ENTIDAD -->
                        <template v-slot:body-cell-company="props">
                            <q-td :props="props" class="text-center">
                                {{ props.row.company || props.row.contract?.institute || '-' }}
                            </q-td>
                        </template>

                        <!-- FECHA -->
                        <template v-slot:body-cell-tripDate="props">
                            <q-td :props="props" class="text-center">
                                {{ formatDate(props.row.tripStart) }} - {{ formatDate(props.row.tripEnd) }}
                            </q-td>
                        </template>

                        <!-- ESTADO -->
                        <template v-slot:body-cell-status="props">
                            <q-td :props="props" class="text-center">
                                <q-badge :color="getStatusColor(props.row.status?.index)"
                                    :label="props.row.status?.data || 'Sin estado'" />
                            </q-td>
                        </template>

                        <!-- ACCIONES -->
                        <template v-slot:body-cell-actions="props">
                            <q-td :props="props" class="text-center">

                                <!-- VER -->
                                <q-btn dense round icon="visibility" color="green" @click="handleView(props.row)">
                                    <q-tooltip>Ver agenda</q-tooltip>
                                </q-btn>

                                <!-- DESCARGAR -->
                                <q-btn dense round icon="download" color="primary" class="q-ml-sm"
                                    @click="handleDownload(props.row)">
                                    <q-tooltip>Descargar PDF</q-tooltip>
                                </q-btn>

                                <!-- ELIMINAR -->
                                <q-btn dense round icon="delete" color="negative" class="q-ml-sm"
                                    @click="confirmDelete(props.row)">
                                    <q-tooltip>Eliminar agenda</q-tooltip>
                                </q-btn>

                            </q-td>
                        </template>

                    </q-table>

                </q-card-section>

            </q-card>
        </q-dialog>

        <!-- DIALOG: VER DOCUMENTO FIRMADO -->

        <q-dialog v-model="showDialog" maximized>
            <q-card style="width: 900px; max-width: 95vw; height: 90vh;">
                <q-card-section class="row items-center bg-green text-white q-pa-sm">
                    <div class="text-h6 q-ml-md">Agenda Firmada</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section class="col q-pa-md scroll">
                    <Preview v-if="selectedRow?.typeSchedule === 'contractor'" :row="selectedRow" />
                    <OtherPreview v-else :row="selectedRow" />
                </q-card-section>

            </q-card>
        </q-dialog>

        <!-- DIALOG: CONFIRMACIÓN ELIMINAR AGENDA -->
        <q-dialog v-model="showDeleteDialog" persistent>
            <q-card style="min-width: 400px">
                <q-card-section class="row items-center bg-negative text-white">
                    <q-icon name="warning" size="md" class="q-mr-sm" />
                    <div class="text-h6">Eliminar Agenda</div>
                </q-card-section>

                <q-card-section>
                    <p class="text-body1">¿Está seguro que desea eliminar esta agenda? Esta acción no se puede deshacer.</p>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" color="grey" v-close-popup />
                    <q-btn label="Eliminar" color="negative" icon="delete" :loading="loading" @click="handleDelete" />
                </q-card-actions>
            </q-card>
        </q-dialog>

    </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useScheduleStore } from '../../stores/schedule.js'
import { showNotify } from '../../components/notify.js'
import { useUserStore } from '../../stores/user.js'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// PREVIEWS EXISTENTES
import Preview from './contractor/Preview.vue'
import OtherPreview from './administrator/Preview.vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)

const scheduleStore = useScheduleStore()

const rows = ref([])
const filter = ref('')
const loading = ref(false)

const showDialog = ref(false)
const selectedRow = ref(null)

const showAgendasDialog = ref(false)
const selectedUser = ref(null)

const showDeleteDialog = ref(false)
const agendaToDelete = ref(null)

// COLUMNAS TABLA PRINCIPAL (USUARIOS)
const userColumns = [
    { name: 'name', label: 'Usuario', align: 'center', sortable: true },
    { name: 'company', label: 'Entidad', align: 'center', sortable: true },
    { name: 'total', label: 'Total Agendas', align: 'center', sortable: true },
    { name: 'actions', label: 'Acciones', align: 'center' }
]

// COLUMNAS TABLA DE AGENDAS
const agendaColumns = [
    { name: 'company', label: 'Entidad', align: 'center', sortable: true },
    { name: 'tripDate', label: 'Fecha', align: 'center', sortable: true },
    { name: 'status', label: 'Estado', align: 'center', sortable: true },
    { name: 'actions', label: 'Acciones', align: 'center' }
]

// AGRUPAR AGENDAS POR USUARIO
const usersRows = computed(() => {
    const map = {}

    rows.value.forEach(schedule => {

        // ✅ ID REAL DEL USUARIO
        const userId = schedule.contractor

        if (!userId) {
            console.warn('Agenda sin contractor:', schedule)
            return
        }

        // ✅ NOMBRE REAL
        const userName = schedule.contract?.contractorName || 'Sin nombre'

        if (!map[userId]) {
            map[userId] = {
                userId,
                name: userName,
                company: schedule.company || schedule.institute || '-',
                agendas: []
            }
        }

        map[userId].agendas.push(schedule)
    })

    return Object.values(map)
})


function formatDate(date) {
    if (!date) return '-'
    const d = new Date(date)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

function getStatusColor(statusIndex) {
    if (statusIndex === 2) return 'orange'
    if (statusIndex === 3) return 'green'
    return 'grey'
}

function openAgendasDialog(user) {
    selectedUser.value = user
    showAgendasDialog.value = true
}

// TRAER AGENDAS FIRMADAS
async function fetchSignedSchedules() {
    loading.value = true
    const BASE_URL = import.meta.env.VITE_API_URL

    try {
        const response = await scheduleStore.getSchedule({ minStatusIndex: 2 })
        const data = response?.data || []

        // 👈 Corregir URLs de firma si vienen sin dominio
        rows.value = data.map(schedule => {
            if (schedule.signature?.supervisor?.startsWith('/uploads/')) {
                schedule.signature.supervisor = `${BASE_URL}${schedule.signature.supervisor}`
            }
            return schedule
        })

    } catch (err) {
        console.error(err)
        showNotify('Error cargando agendas firmadas', 'negative')
    } finally {
        loading.value = false
    }
}

// VER DOCUMENTO
function handleView(schedule) {
    selectedRow.value = schedule
    showDialog.value = true
}

// DESCARGAR DOCUMENTO FIRMADO (PDF MULTIPÁGINA)
async function handleDownload(schedule) {
    try {
        // 1. Mostrar preview
        selectedRow.value = schedule
        showDialog.value = true

        // 2. Esperar render completo
        await new Promise(resolve => setTimeout(resolve, 800))

        // 3. Obtener elemento
        const element = document.getElementById('element')
        if (!element) {
            showNotify('No se pudo generar el PDF', 'negative')
            return
        }

        // 4. HTML → Canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            scrollY: -window.scrollY
        })

        const imgData = canvas.toDataURL('image/png')

        // 5. Configuración PDF con márgenes
        const pdf = new jsPDF('p', 'mm', 'a4')

        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        const marginX = 12  // márgenes laterales (mm)
        const marginY = 14  // márgenes superior e inferior (mm)

        const contentWidth = pageWidth - marginX * 2
        const contentHeight = (canvas.height * contentWidth) / canvas.width

        // Área útil por página
        const usableHeight = pageHeight - marginY * 2

        let heightLeft = contentHeight
        let yOffset = marginY

        // 6. Primera página
        pdf.addImage(imgData, 'PNG', marginX, yOffset, contentWidth, contentHeight)
        heightLeft -= usableHeight

        // 7. Páginas adicionales
        while (heightLeft > 0) {
            yOffset = marginY - (contentHeight - heightLeft)
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', marginX, yOffset, contentWidth, contentHeight)
            heightLeft -= usableHeight
        }

        // 8. Nombre del archivo: días_mes_nombre
        const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
        const start = schedule.tripStart ? new Date(schedule.tripStart) : null
        const end = schedule.tripEnd ? new Date(schedule.tripEnd) : null
        let days = ''
        let mesNombre = ''
        if (start && end) {
            const daysList = []
            const cur = new Date(start)
            while (cur <= end) {
                daysList.push(cur.getDate())
                cur.setDate(cur.getDate() + 1)
            }
            days = daysList.join('-')
            mesNombre = meses[start.getMonth()]
        }
        const personName = (schedule.contract?.contractorName || 'sin-nombre')
            .trim()
            .replace(/\s+/g, '_')
        const fileName = `${days}_${mesNombre}_${personName}.pdf`

        pdf.save(fileName)
    } catch (error) {
        console.error(error)
        showNotify('Error generando el PDF', 'negative')
    } finally {
        showDialog.value = false
    }
}

function confirmDelete(row) {
    agendaToDelete.value = row
    showDeleteDialog.value = true
}

async function handleDelete() {
    if (!agendaToDelete.value) return

    try {
        await scheduleStore.deleteSchedule(agendaToDelete.value._id)
        showNotify('Agenda eliminada', 'positive', 'delete')
        showDeleteDialog.value = false
        await fetchSignedSchedules()
        if (selectedUser.value) {
            const updated = usersRows.value.find(u => u.userId === selectedUser.value.userId)
            if (updated) selectedUser.value = updated
            else showAgendasDialog.value = false
        }
    } catch (error) {
        console.error(error)
        showNotify('Error eliminando la agenda', 'negative')
    }
}

onMounted(fetchSignedSchedules)
</script>

<style scoped>
.q-table thead tr th {
    background-color: #4caf50;
    color: white;
    font-weight: bold;
}

.q-table tbody tr td {
    background-color: #f9f9f9;
    color: #333;
}

.q-table tbody tr:hover td {
    background-color: #e8f5e9;
}

.q-btn {
    font-weight: bold;
}
</style>