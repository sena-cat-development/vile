<template>
    <q-page class="page-bg q-pa-lg">

        <!-- Encabezado de página -->
        <div class="page-header q-mb-lg">
            <div class="row items-center q-gutter-sm">
                <q-icon name="fa-solid fa-users" size="28px" color="primary" />
                <div>
                    <div class="text-h5 text-weight-bold text-grey-9">Gestión de Usuarios</div>
                    <div class="text-caption text-grey-6">Administra los usuarios del sistema</div>
                </div>
            </div>
        </div>

        <!-- Tarjeta principal con la tabla -->
        <q-card flat bordered class="table-card">
            <q-card-section class="q-pa-none">
                <q-table :loading="cargando" :filter="filter" :columns="columns" :rows="rows" row-key="_id" flat
                    :pagination="{ rowsPerPage: 10 }" class="users-table">
                    <!-- Barra superior izquierda -->
                    <template v-slot:top-left>
                        <div class="row q-gutter-sm items-center q-pa-sm flex-wrap">
                            <q-btn @click="showDialog = true; nuevo()" icon="add" color="primary" label="Nuevo Usuario"
                                unelevated class="action-btn" />

                            <q-separator vertical inset />

                            <q-select v-model="selectedTemplate" :options="templateOptions" label="Plantilla"
                                style="min-width: 180px" emit-value map-options dense outlined color="teal" />

                            <q-btn @click="downloadFile" icon="download" color="teal" label="Descargar" unelevated
                                :disable="!selectedTemplate" class="action-btn" />

                            <q-btn color="secondary" icon="upload" label="Importar Excel" unelevated
                                @click="uploadExcelFile" class="action-btn" />

                            <input ref="excelInput" type="file" accept=".xlsx, .xls, .csv" style="display: none"
                                @change="handleFileUpload" />
                        </div>
                    </template>

                    <!-- Barra superior derecha (buscador) -->
                    <template v-slot:top-right>
                        <div class="q-pa-sm">
                            <q-input dense debounce="300" color="primary" v-model="filter"
                                placeholder="Buscar usuario..." outlined style="min-width: 220px">
                                <template v-slot:prepend>
                                    <q-icon name="search" color="grey-6" />
                                </template>
                                <template v-slot:append>
                                    <q-icon v-if="filter" name="close" class="cursor-pointer text-grey-6"
                                        @click="filter = ''" />
                                </template>
                            </q-input>
                        </div>
                    </template>

                    <!-- Celda: Estado -->
                    <template v-slot:body-cell-estado="props">
                        <q-td :props="props">
                            <q-badge :color="props.row.status === 1 ? 'positive' : 'negative'"
                                :label="props.row.status === 1 ? 'Activo' : 'Inactivo'" class="status-badge" />
                        </q-td>
                    </template>

                    <!-- Celda: Acciones -->
                    <template v-slot:body-cell-opciones="props">
                        <q-td :props="props">
                            <div class="row no-wrap justify-center q-gutter-xs">
                                <q-btn flat round dense icon="fa-solid fa-pen-to-square" color="orange-7" size="sm"
                                    @click="abrirEditar(props.row)">
                                    <q-tooltip>Editar Usuario</q-tooltip>
                                </q-btn>

                                <q-btn v-if="props.row.status == 0" flat round dense icon="fa-solid fa-check"
                                    color="positive" size="sm" @click="editarEstado(props.row)">
                                    <q-tooltip>Activar Usuario</q-tooltip>
                                </q-btn>

                                <q-btn v-else flat round dense icon="fa-solid fa-ban" color="negative" size="sm"
                                    @click="editarEstado(props.row)">
                                    <q-tooltip>Desactivar Usuario</q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>
                    </template>

                    <!-- Estado de carga -->
                    <template v-slot:loading>
                        <q-inner-loading showing color="primary" />
                    </template>
                </q-table>
            </q-card-section>
        </q-card>

        <!-- Dialog crear/editar usuario -->
        <q-dialog v-model="showDialog" persistent>
            <q-card class="dialog-card">

                <!-- Encabezado del dialog -->
                <q-card-section :class="['dialog-header row items-center', bd === 0 ? 'dialog-header--edit' : '']">
                    <q-icon :name="bd === 0 ? 'fa-solid fa-user-pen' : 'fa-solid fa-user-plus'" size="22px"
                        color="white" class="q-mr-sm" />
                    <span class="text-h6 text-white text-weight-medium">
                        {{ bd === 0 ? "Editar Usuario" : "Agregar Usuario" }}
                    </span>
                    <q-space />
                    <q-btn flat round dense icon="close" color="white" v-close-popup />
                </q-card-section>

                <q-card-section class="q-pa-md scroll dialog-body">
                    <div class="row q-col-gutter-sm">

                        <!-- Sección: Rol -->
                        <div class="col-12">
                            <div class="section-label q-mb-xs">Rol y tipo</div>
                        </div>

                        <div class="col-12 col-sm-6">
                            <q-select filled stack-label label="Rol" v-model="role" :options="optionsRole"
                                @update:model-value="() => { staffType = null }" />
                        </div>

                        <div v-if="role !== null && role.index == 3" class="col-12 col-sm-6">
                            <q-select v-model="staffType" :options="staffOptions" filled stack-label
                                label="Tipo Usuario" />
                        </div>

                        <!-- Sección: Datos personales -->
                        <div class="col-12 q-mt-sm">
                            <div class="section-label q-mb-xs">Datos personales</div>
                        </div>

                        <div class="col-12 col-sm-6">
                            <q-input filled stack-label v-model="name" label="Nombre completo">
                                <template v-slot:prepend><q-icon name="person" color="grey-6" /></template>
                            </q-input>
                        </div>

                        <div class="col-12 col-sm-6">
                            <q-input filled stack-label v-model="identification" type="number" label="No. de documento">
                                <template v-slot:prepend><q-icon name="badge" color="grey-6" /></template>
                            </q-input>
                        </div>

                        <div class="col-12 col-sm-6">
                            <q-input filled stack-label v-model="mail" label="Correo electrónico">
                                <template v-slot:prepend><q-icon name="mail" color="grey-6" /></template>
                            </q-input>
                        </div>

                        <div v-if="bd === 1" class="col-12 col-sm-6">
                            <q-input filled stack-label v-model="password" label="Contraseña"
                                :type="showPassword ? 'text' : 'password'">
                                <template v-slot:prepend><q-icon name="lock" color="grey-6" /></template>
                                <template v-slot:append>
                                    <q-icon :name="showPassword ? 'visibility' : 'visibility_off'"
                                        class="cursor-pointer text-grey-6" @click="showPassword = !showPassword" />
                                </template>
                            </q-input>
                        </div>

                        <!-- Sección: Financiero -->
                        <div class="col-12 q-mt-sm">
                            <div class="section-label q-mb-xs">Información financiera</div>
                        </div>

                        <div v-if="role !== null && role.index == 3 && staffType !== null && staffType.index == 0"
                            class="col-12 col-sm-6">
                            <q-input :model-value="formatMiles(budget)"
                                @update:model-value="budget = parseMiles($event)" filled stack-label type="text"
                                inputmode="numeric" label="Presupuesto asignado" prefix="$" />
                        </div>

                        <div class="col-12 col-sm-6">
                            <q-input :model-value="formatMiles(dailyAllowance)"
                                @update:model-value="dailyAllowance = parseMiles($event)" filled stack-label type="text"
                                inputmode="numeric" label="Viático diario" prefix="$" />
                        </div>

                        <div v-if="staffType?.data === 'contractor'" class="col-12 col-sm-6">
                            <q-input :model-value="formatMiles(monthlyFee)"
                                @update:model-value="monthlyFee = parseMiles($event)" filled stack-label type="text"
                                inputmode="numeric" label="Honorarios mensuales" prefix="$" />
                        </div>

                        <!-- Sección: Cargo / Dependencia -->
                        <template
                            v-if="role !== null && role.index !== 3 && role.index !== 1 || staffType !== null && staffType.index == 1 && role.index == 3">
                            <div class="col-12 q-mt-sm">
                                <div class="section-label q-mb-xs">Información laboral</div>
                            </div>
                            <div class="col-12 col-sm-6">
                                <q-input filled stack-label v-model="position" label="Cargo" />
                            </div>
                        </template>

                        <div v-if="role !== null && role.index == 0 || (staffType !== null && staffType.index == 1 && role.index == 3)"
                            class="col-12 col-sm-6">
                            <q-input v-model="branch" filled stack-label label="Dependencia" />
                        </div>

                        <!-- Sección: Contrato (solo contratistas) -->
                        <template v-if="staffType !== null && staffType.index == 0 && role.index == 3">
                            <div class="col-12 q-mt-sm">
                                <div class="section-label q-mb-xs">Información del contrato</div>
                            </div>

                            <div class="col-12 col-sm-6">
                                <q-select v-model="regional" :options="regionalOptions" use-chips filled stack-label
                                    label="Regional"
                                    @update:model-value="async function (value) { await getInstitute(value) }" />
                            </div>

                            <div class="col-12 col-sm-6">
                                <q-select v-model="institute" :options="instituteOptions" use-chips filled stack-label
                                    label="Centro" />
                            </div>

                            <div class="col-12 col-sm-6">
                                <q-input v-model="contractNumber" filled stack-label label="Número de contrato" />
                            </div>

                            <div class="col-12 col-sm-6">
                                <q-input v-model="contractDate.start" filled stack-label label="Fecha inicio contrato"
                                    type="date" />
                            </div>

                            <div class="col-12 col-sm-6">
                                <q-input v-model="contractDate.end" filled stack-label label="Fecha fin contrato"
                                    type="date" />
                            </div>

                            <div class="col-12">
                                <q-input v-model="object" autogrow filled stack-label label="Objeto contractual" />
                            </div>

                            <!-- Supervisor -->
                            <div v-if="supervisorOptions.length != 0" class="col-12 col-sm-6">
                                <q-select v-model="supervisor" label="Supervisor" filled stack-label
                                    :options="supervisorOptions.map((sup) => ({ label: sup.label, value: sup.id }))"
                                    emit-value map-options />
                            </div>
                            <div v-else class="col-12 col-sm-6">
                                <q-select v-model="noSup" disable label="Supervisor" filled stack-label />
                            </div>
                        </template>

                        <!-- Ordenador -->
                        <template v-if="role !== null && role.index !== 2 && role.index !== 1">
                            <div class="col-12 q-mt-sm"
                                v-if="staffType === null || staffType.index !== 0 || role.index !== 3">
                                <div class="section-label q-mb-xs">Asignaciones</div>
                            </div>
                            <div v-if="paymasterOptions.length > 0" class="col-12 col-sm-6">
                                <q-select v-model="paymaster" label="Ordenador del gasto" filled stack-label
                                    :options="paymasterOptions.map((ord) => ({ label: ord.label, value: ord.id }))"
                                    emit-value map-options />
                            </div>
                            <div v-else class="col-12 col-sm-6">
                                <q-select v-model="noOrd" label="Ordenador del gasto" disable filled stack-label />
                            </div>
                        </template>

                        <!-- Firma (solo al editar y si existe) -->
                        <template v-if="bd === 0 && sign">
                            <div class="col-12 q-mt-sm">
                                <div class="section-label q-mb-xs">Firma</div>
                            </div>
                            <div class="col-12">
                                <div class="firma-container">
                                    <q-img :src="sign.url" fit="contain" style="width: 280px; height: 140px;">
                                        <template v-slot:error>
                                            <div class="absolute-full flex flex-center text-grey-5"
                                                style="background-color: #f5f5f5;">
                                                Sin firma
                                            </div>
                                        </template>
                                    </q-img>
                                </div>
                            </div>
                        </template>

                    </div>
                </q-card-section>

                <q-separator />

                <q-card-actions class="q-pa-md justify-end q-gutter-sm">
                    <q-btn flat @click="showDialog = false" color="grey-7" label="Cancelar" icon="close" />
                    <q-btn unelevated color="primary" :loading="loading" @click="bd === 0 ? editUser() : createUser()"
                        label="Guardar cambios" icon="fa-solid fa-floppy-disk" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- FAB recargar -->
        <q-page-sticky position="bottom-right" :offset="[20, 20]">
            <q-btn @click="recargar()" color="primary" fab icon="fa-solid fa-rotate-right" unelevated>
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    Recargar página
                </q-tooltip>
            </q-btn>
        </q-page-sticky>
    </q-page>
</template>

<script setup>

import * as XLSX from 'xlsx'


import { ref, onBeforeMount } from 'vue'

import { useUserStore } from '../stores/user.js'

import { useScheduleStore } from '../stores/schedule.js'

import { showNotify } from '../components/notify.js'

import { useQuasar } from "quasar";

let cargando = ref(false)
let loading = ref(false)
const userStore = useUserStore()
let filter = ref('')
const scheduleStore = useScheduleStore()
let bd = ref("");
const showPassword = ref(false)
const noSup = ref('No hay supervisores disponibles')
const noOrd = ref('No hay ordenadores disponibles')
const budget = ref({
    amount: 0
})
const dailyAllowance = ref(0)

const monthlyFee = ref(0)

function recargar() {
    window.location.reload()
}

function formatMiles(val) {
    if (val === null || val === undefined || val === '' || isNaN(val) || val === 0) return ''
    return Number(val).toLocaleString('es-CO')
}

function parseMiles(val) {
    if (!val) return 0
    return Number(val.toString().replace(/\./g, '').replace(/,/g, '.')) || 0
}




onBeforeMount(
    async () => {
        cargando.value = true

        rows.value = await getUser()

        rows.value.reverse()

        paymasterOptions.value = await getUser({ paymaster: true })

        regionalOptions.value = await getRegional()

        supervisorOptions.value = await getUser({ supervisor: true })

        cargando.value = false

    }
)

async function getInstitute(value) {
    institute.value = null

    instituteOptions.value.splice(0)

    if (value) {
        const { data } = await scheduleStore.getInstitute(value.data)

        for (let index = 0; index < data.length; index++) {
            instituteOptions.value.push({ label: data[index].name, data: data[index]._id })
        }
    }
}

async function getRegional() {
    const regional = []

    const { data } = await scheduleStore.getCounty({
        regional: true
    })

    for (let index = 0; index < data.length; index++) {
        regional.push({ label: data[index].name, data: data[index]._id })
    }

    return regional
}

async function getUser(query = {}) {
    const { data } = await userStore.getUser(query);

    // Verificar si el query especifica un rol
    if (query.paymaster || query.supervisor) {
        const user = [];

        for (let index = 0; index < data.length; index++) {
            // Filtrar según el rol especificado en el query
            if (data[index].status === 1) {
                if (query.paymaster && data[index].role.data === 'paymaster') {
                    user.push({ label: data[index].name, id: data[index]._id });
                }
                if (query.supervisor && data[index].role.data === 'supervisor') {
                    user.push({ label: data[index].name, id: data[index]._id });
                }
            }
        }
        return user;
    }
    return data;
}

async function cleanDialog() {
    id.value = ''
    name.value = ''
    mail.value = ''
    identification.value = ''
    password.value = ''
    role.value = ''
    editOptionRole.value = []

    branch.value = ''
    contractNumber.value = ''
    contractDate.value = {
        start: '',
        end: ''
    }

    staffType.value = ''
    supervisor.value = ''

    institute.value = ''
    regional.value = ''

    object.value = ''

    position.value = ''
    paymaster.value = ''

    budget.value = 0

    monthlyFee.value = 0

    sign.value = null

    rows.value = await getUser()

    rows.value.reverse()

    supervisorOptions.value.splice(0)

    supervisorOptions.value = await getUser({ supervisor: true })

    paymasterOptions.value.splice(0)

    paymasterOptions.value = await getUser({ paymaster: true })
}


function nuevo() {
    bd.value = 1;
    cleanDialog()
}

async function createUser() {
    loading.value = true

    const emailValido = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

    if (!role.value) {
        showNotify('Asigne un rol', 'negative')
    } else if (role.value.index === 3 && !staffType.value) {
        showNotify('Seleccione el tipo de usuario', 'negative')
    } else if (!name.value.trim()) {
        showNotify('Digite el Nombre', 'negative')
    } else if (!mail.value.trim()) {
        showNotify('Digite el correo', 'negative')
    } else if (!emailValido.test(mail.value.trim())) {
        showNotify('El correo no es válido', 'negative')
    } else if (!identification.value) {
        showNotify('Digite la cédula/identificación', 'negative')
    } else if (!password.value.trim()) {
        showNotify('Digite la contraseña', 'negative')
    } else if ((role.value.data === 'paymaster' && !position.value.trim())
        || (role.value.data === 'supervisor' && !position.value.trim())
        || (role.value.index === 3 && staffType.value?.data === 'publicWorker' && !position.value.trim())) {
        showNotify('Digite el cargo', 'negative')
    } else if ((role.value.data === 'supervisor' && !branch.value.trim()) ||
        (role.value.index === 3 && staffType.value?.data === 'publicWorker' && !branch.value.trim())) {
        showNotify('Digite la dependencia', 'negative')
    } else if ((role.value.data === 'supervisor' || staffType.value?.data === 'publicWorker' || staffType.value?.data === 'contractor') && !paymaster.value) {
        showNotify('Seleccione un ordenador del gasto', 'negative')
    } else if ((staffType.value?.data === 'contractor') && !supervisor.value) {
        showNotify('Seleccione un supervisor', 'negative')
    } else if (role.value.index === 3 && staffType.value?.data === 'contractor' && !regional.value) {
        showNotify('Seleccione la regional', 'negative')
    } else if (staffType.value?.data === 'contractor' && !institute.value) {
        showNotify('Seleccione el centro de formación', 'negative')
    } else if (staffType.value?.data === 'contractor' && !contractNumber.value) {
        showNotify('Digite el número de contrato', 'negative')
    } else if (staffType.value?.data === 'contractor' && !contractDate.value.start) {
        showNotify('Seleccione la fecha de inicio', 'negative')
    } else if (staffType.value?.data === 'contractor' && !contractDate.value.end) {
        showNotify('Seleccione la fecha de fin', 'negative')
    } else if (staffType.value?.data === 'contractor' && contractDate.value.end < contractDate.value.start) {
        showNotify('La fecha de fin de contrato debe ser mayor a la fecha de inicio', 'negative')
    } else if (staffType.value?.data === 'contractor' && contractDate.value.start > contractDate.value.end) {
        showNotify('La fecha de inicio de contrato debe ser menor a la fecha de fin', 'negative')
    } else if (staffType.value?.data === 'contractor' && !object.value.trim()) {
        showNotify('Digite el objeto', 'negative')
    } else {
        const body = {
            role: role.value,
            name: name.value,
            mail: mail.value,
            identification: identification.value,
            password: password.value,
            position: position.value,
            branch: branch.value,
            staffType: staffType.value,

            budget: {
                amount: Number(budget.value) || 0
            },

            // ✅ VIÁTICO DIARIO
            dailyAllowance: {
                amount: Number(dailyAllowance.value) || 0
            },

            monthlyFee: {
                amount: Number(monthlyFee.value) || 0
            },
        }


        if (role.value !== null) {
            if (role.value.index !== 2 && role.value.index !== 1) {
                body.paymaster = paymaster.value
            }

            if (role.value.index == 3 && staffType.value !== null && staffType.value.index == 0) {
                body.contract = {
                    number: contractNumber.value,
                    date: contractDate.value
                }
                body.object = object.value
                body.institute = institute.value !== null ? institute.value.data : null,
                    body.regional = regional.value !== null ? regional.value.data : null,
                    body.supervisor = supervisor.value
                body.paymaster = paymaster.value
            }

            console.log('BODY ENVIADO:', JSON.stringify(body, null, 2))
            const { data, status } = await userStore.postUser(body)

            if (status !== 200) {
                showNotify(data.msg, 'negative')
            } else {
                showNotify(data.msg, 'positive', 'check_circle')

                rows.value = await getUser()

                rows.value.reverse()

                paymasterOptions.value = await getUser({ paymaster: true })

                regionalOptions.value = await getRegional()

                supervisorOptions.value = await getUser({ supervisor: true })

                showDialog.value = false
            }
        }

    }
    loading.value = false
}

const $q = useQuasar()

const selectedTemplate = ref(null);
const inputArchivoExcel = ref(null);

const templateOptions = [
    { label: 'Contratista', value: 'Tabla de Usuarios Contratista.xlsx' },
    { label: 'Funcionario', value: 'Tabla de Usuarios Funcionarios.xlsx' },
    { label: 'Administrador', value: 'Tabla de Administrador.xlsx' },
    { label: 'Supervisor', value: 'Tabla de Supervisor.xlsx' },
    { label: 'Ordenador', value: 'Tabla de Ordenador.xlsx' },
];

// Función para descargar plantilla con Blob
const downloadFile = async () => {
    if (!selectedTemplate.value) {
        $q.notify({
            type: 'warning',
            message: '⚠️ Debes seleccionar una plantilla antes de continuar.',
            position: 'top',
        });
        return;
    }

    const fileName = selectedTemplate.value;
    const fileUrl = `/${fileName}`;

    try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error(`No se encontró el archivo (${response.status})`);
        }

        // Convertir a Blob para mantener formato binario
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        $q.notify({
            type: 'positive',
            message: `✅ Descarga iniciada: ${fileName}`,
            position: 'top',
        });
    } catch (error) {
        console.error('❌ Error:', error);
        $q.notify({
            type: 'negative',
            message: '❌ No se pudo descargar la plantilla',
            caption: error.message,
            position: 'top',
        });
    }
};

async function editarEstado(x) {
    try {
        if (x.status === 1) {
            x.status = 0;
        } else {
            x.status = 1;
        }
        await userStore.cambiarEstado(x._id, x.status);
        $q.notify({
            message: "Estado editado exitosamente",
            color: "positive",
            type: 'positive',
            position: "bottom",
            timeout: 3000,
        });
    } catch (error) {
        console.log(error);
    }
}

function abrirEditar(data) {
    bd.value = 0
    id.value = data._id
    name.value = data.name
    sign.value = data.sign?.url ? { url: `http://localhost:3000${data.sign.url}` } : null
    mail.value = data.mail
    identification.value = data.identification
    role.value = optionsRole.value[data.role.index]
    position.value = data.position || ''
    budget.value = data.budget?.amount || 0
    dailyAllowance.value = data.dailyAllowance?.amount || 0
    monthlyFee.value = data.monthlyFee?.amount || 0

    if (data.role.index === 1) {
        editOptionRole.value = [
            { label: 'Administrador', data: 'administrator', index: 1 }
        ]
    } else if (data.role.index === 0) {
        paymaster.value = data.paymaster?._id || null
        branch.value = data.branch || ''
        editOptionRole.value = [
            { label: 'Supervisor', data: 'supervisor', index: 0 },
            { label: 'Usuario', data: 'user', index: 3 }
        ]
    } else if (data.role.index === 2) {
        editOptionRole.value = [
            { label: 'Ordenador', data: 'paymaster', index: 2 }
        ]
    } else if (data.role.index === 3 && data.staffType?.data === "publicWorker") {
        staffType.value = staffOptions.value[data.staffType.index]
        position.value = data.position || ''
        branch.value = data.branch || ''
        paymaster.value = data.paymaster?._id || null
        editOptionRole.value = [
            { label: 'Ordenador', data: 'paymaster', index: 2 },
            { label: 'Usuario', data: 'user', index: 3 }
        ]
    } else if (data.role.index === 3 && data.staffType?.data === "contractor") {
        staffType.value = staffOptions.value[data.staffType.index]
        regional.value = data.regional ? { label: data.regional.name, data: data.regional._id } : null
        institute.value = data.institute ? { label: data.institute.name, data: data.institute._id } : null
        contractNumber.value = data.contract?.number || ''
        contractDate.value.start = data.contract?.date?.start ? data.contract.date.start.substring(0, 10) : ''
        contractDate.value.end = data.contract?.date?.end ? data.contract.date.end.substring(0, 10) : ''
        object.value = data.object || ''
        paymaster.value = data.paymaster?._id || null
        supervisor.value = data.supervisor?._id || null
        editOptionRole.value = [
            { label: 'Supervisor', data: 'supervisor', index: 0 },
            { label: 'Usuario', data: 'user', index: 3 }
        ]
    }

    showDialog.value = true
}


async function editUser() {
    loading.value = true

    const emailValido = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

    if (!role.value) {
        showNotify('Asigne un rol', 'negative')
    } else if (!name.value.trim()) {
        showNotify('Digite el Nombre', 'negative')
    } else if (!mail.value.trim()) {
        showNotify('Digite el correo', 'negative')
    } else if (budget.value < 0) {
        showNotify('El presupuesto no puede ser negativo', 'negative')
    } else if (!emailValido.test(mail.value.trim())) {
        showNotify('El correo no es válido', 'negative')
    } else if (!identification.value) {
        showNotify('Digite la cédula/identificación', 'negative')
    } else if ((role.value.data === 'paymaster' && !position.value.trim())
        || (role.value.data === 'supervisor' && !position.value.trim())
        || (role.value.index === 3 && staffType.value.data === 'publicWorker' && !position.value.trim())) {
        showNotify('Digite el cargo', 'negative')
    } else if ((role.value.data === 'supervisor' && !branch.value.trim()) ||
        (role.value.index === 3 && staffType.value?.data === 'publicWorker' && !branch.value.trim())) {
        showNotify('Digite la dependencia', 'negative')
    } else if (role.value.index === 3 && staffType.value?.data === 'contractor' && !regional.value) {
        showNotify('Seleccione la regional', 'negative')
    } else if (role.value.index === 3 && staffType.value?.data === 'contractor' && !institute.value) {
        showNotify('Seleccione el centro de formación', 'negative')
    } else if (role.value.index === 3 && staffType.value?.data === 'contractor' && !contractNumber.value) {
        showNotify('Digite el número de contrato', 'negative')
    } else if (role.value.index === 3 && staffType.value?.data === 'contractor' && contractDate.value.end < contractDate.value.start) {
        showNotify('La fecha de fin de contrato debe ser mayor a la fecha de inicio', 'negative')
    } else if (role.value.index === 3 && staffType.value?.data === 'contractor' && contractDate.value.start > contractDate.value.end) {
        showNotify('La fecha de inicio de contrato debe ser menor a la fecha de fin', 'negative')
    } else if (role.value.index === 3 && staffType.value?.data === 'contractor' && !object.value.trim()) {
        showNotify('Digite el objeto', 'negative')
    } else {
        const body = {
            role: role.value,
            name: name.value,
            mail: mail.value,
            identification: identification.value,
            position: position.value,
            branch: branch.value,
            staffType: staffType.value,
            budget: {
                amount: Number(budget.value) || 0
            },
            dailyAllowance: {
                amount: Number(dailyAllowance.value) || 0
            },

            monthlyFee: {
                amount: Number(monthlyFee.value) || 0
            },

        }

        if (role.value !== null) {
            if (role.value.index !== 2 && role.value.index !== 1) {
                body.paymaster = paymaster.value
            }

            if (role.value.index === 3 && staffType.value?.data === 'contractor') {
                body.contract = {
                    number: contractNumber.value,
                    date: contractDate.value
                }
                body.object = object.value
                body.institute = institute.value !== null ? institute.value.data : null,
                    body.regional = regional.value !== null ? regional.value.data : null,
                    body.supervisor = supervisor.value
                body.paymaster = paymaster.value
            }
        }

        const { data, status } = await userStore.putUser(body, id.value)

        if (status !== 200) {
            showNotify(data.msg, 'negative')
        } else {
            showNotify(data.msg, 'positive', 'check_circle')

            rows.value = await getUser()

            rows.value.reverse()

            paymasterOptions.value = await getUser({ paymaster: true })

            regionalOptions.value = await getRegional()

            supervisorOptions.value = await getUser({ supervisor: true })

            showDialog.value = false

        }
    }
    loading.value = false
}

const columns = ref([
    {
        name: 'name',
        label: 'Usuario',
        align: 'center',
        field: 'name',
        sortable: true
    },

    {
        name: 'mail',
        label: 'Correo Electrónico',
        align: 'center',
        field: 'mail',
        sortable: true
    },

    {
        name: 'identification',
        label: 'Documento',
        align: 'center',
        field: 'identification',
        sortable: true
    },

    {
        name: 'role',
        label: 'Rol',
        align: 'center',
        field: row => row.role,
        format: (val, row) => optionsRole.value[val.index].label,
        sortable: true
    },

    {
        name: 'position',
        label: 'Cargo',
        align: 'center',
        field: row => row.position || '-',
        sortable: true
    },
    {
        name: 'estado',
        label: 'Estado',
        align: 'center',
        sortable: true
    },
    {
        name: 'opciones',
        label: 'Acciones',
        align: 'center'
    }
])

const rows = ref([])

const branch = ref(null)

// dialog
const showDialog = ref(false)

const id = ref(null)

const optionsRole = ref([
    { label: 'Supervisor', data: 'supervisor', index: 0 },
    { label: 'Administrador', data: 'administrator', index: 1 },
    { label: 'Ordenador', data: 'paymaster', index: 2 },
    { label: 'Usuario', data: 'user', index: 3 }
])

const editOptionRole = ref([])

const staffOptions = ref([
    { label: 'Contratista', data: 'contractor', index: 0 },
    { label: 'Funcionario', data: 'publicWorker', index: 1 }
])

const staffType = ref(null)

const identification = ref(null)

const name = ref(null)

const mail = ref(null)

const password = ref(null)

const role = ref(null)

const institute = ref(null)

const instituteOptions = ref([])

const regional = ref(null)

const regionalOptions = ref([])

const position = ref(null)

const contractNumber = ref(null)

const contractDate = ref({
    start: '',
    end: ''
})

const object = ref(null)

const supervisor = ref(null)

const supervisorOptions = ref([])

const paymaster = ref(null)

const paymasterOptions = ref([])

const sign = ref(null)


const excelInput = ref(null)

function uploadExcelFile() {
    excelInput.value.click()
}

async function handleFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    try {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)
        const cleanData = jsonData.map(obj => {
            const cleaned = {}
            for (const key in obj) {
                cleaned[key.trim()] = obj[key]
            }
            return cleaned
        })
        await createUsersFromExcel(cleanData)
    } catch (error) {
        console.error('Error leyendo el archivo Excel:', error)
        showNotify('Error al leer el archivo Excel', 'negative')
    }
}

// ============================================================
// FUNCIÓN CORREGIDA: createUsersFromExcel
// Reemplaza completamente la función existente en tu componente
// ============================================================

// ─── HELPER: normalizar texto para comparación (quita tildes, espacios extra, minúsculas)
function normalizar(str) {
    return (str || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

// ─── HELPER: convertir fecha serial de XLSX.js a YYYY-MM-DD
// XLSX.js convierte celdas de tipo fecha a número serial automáticamente
function toISO(val) {
    if (!val) return ''
    if (typeof val === 'number') {
        const d = new Date(Math.round((val - 25569) * 86400 * 1000))
        const yyyy = d.getUTCFullYear()
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
        const dd = String(d.getUTCDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }
    // Si viene como string DD-MM-AAAA → convertir a YYYY-MM-DD
    const s = val.toString().trim()
    const parts = s.split('-')
    if (parts.length === 3 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return s
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────
async function createUsersFromExcel(users) {
    if (!Array.isArray(users) || users.length === 0) {
        showNotify('El archivo no contiene datos válidos', 'negative')
        return
    }

    loading.value = true
    let successCount = 0
    let hasErrors = false
    const createdUserNames = []

    for (const u of users) {
        const currentUserName = u['Nombre']?.toString().trim() || 'Usuario Desconocido'

        try {
            // ── 1. Buscar IDs por nombre (normalizado) en las listas cargadas ────────

            const paymasterName = u['Ordenador']?.toString().trim() || ''
            const paymasterMatch = paymasterOptions.value.find(
                p => normalizar(p.label) === normalizar(paymasterName)
            )
            const paymasterId = paymasterMatch?.id || null

            const supervisorName = u['Supervisor']?.toString().trim() || ''
            const supervisorMatch = supervisorOptions.value.find(
                s => normalizar(s.label) === normalizar(supervisorName)
            )
            const supervisorId = supervisorMatch?.id || null

            const regionalName = u['Regional']?.toString().trim() || ''
            const regionalMatch = regionalOptions.value.find(
                r => normalizar(r.label) === normalizar(regionalName)
            )
            const regionalId = regionalMatch?.data || null

            // Centro: buscar en los centros de la regional encontrada
            let instituteId = null
            if (regionalId) {
                const { data: centros } = await scheduleStore.getInstitute(regionalId)
                const centroName = u['Centro']?.toString().trim() || ''
                const centroMatch = centros.find(
                    c => normalizar(c.name) === normalizar(centroName)
                )
                instituteId = centroMatch?._id || null
            }

            // ── 2. Fechas: XLSX.js convierte fechas a serial numérico ────────────────
            const fechaInicio = toISO(u['Fecha Inicio Contrato'])
            const fechaFin = toISO(u['Fecha Fin Contrato'])

            // ── 3. Rol y tipo de usuario ─────────────────────────────────────────────
            const rolLabel = u['Rol']?.toString().trim() || 'Usuario'
            const rolMatch = optionsRole.value.find(
                r => normalizar(r.label) === normalizar(rolLabel)
            ) || optionsRole.value[3]

            const tipoLabel = u['Tipo Uusario']?.toString().trim() || 'Contratista'
            const tipoMatch = staffOptions.value.find(
                s => normalizar(s.label) === normalizar(tipoLabel)
            ) || staffOptions.value[0]

            // ── 4. Construir body ─────────────────────────────────────────────────────
            const body = {
                name: currentUserName,
                mail: u['Correo Electronico']?.toString().trim() || '',
                identification: u['No. De documento']?.toString().trim() || '',
                password: u['Contraseña']?.toString() || '123456',
                role: rolMatch,
                staffType: tipoMatch,
                position: u['Cargo']?.toString().trim() || '',
                branch: u['Dependencia']?.toString().trim() || '',

                budget: {
                    amount: Number(u['Presupuesto']?.toString().replace(/[^\d.-]/g, '')) || 0
                },

                dailyAllowance: {
                    amount: Number(u['Viático Diario']?.toString().replace(/[^\d.-]/g, '')) || 0
                },

                monthlyFee: {
                    amount: Number(u['Honorarios Mensuales']?.toString().replace(/[^\d.-]/g, '')) || 0
                },

                contract: {
                    number: u['Número Contrato']?.toString().trim() || '',
                    date: {
                        start: fechaInicio,
                        end: fechaFin
                    }
                },

                object: u['Objeto Contractual']?.toString().trim() || '',
                regional: regionalId,
                institute: instituteId,
                supervisor: supervisorId,
                paymaster: paymasterId,
            }

            // ── 5. Limpiar campos vacíos/null ─────────────────────────────────────────
            const fieldsToClean = ['position', 'branch', 'regional', 'institute', 'supervisor', 'paymaster']
            fieldsToClean.forEach(key => {
                if (body[key] === '' || body[key] === null || body[key] === undefined) {
                    delete body[key]
                }
            })

            if (body.contract?.number === '') delete body.contract
            if (body.object === '') delete body.object

            // ── 6. Advertencias de referencias no encontradas ─────────────────────────
            if (paymasterName && !paymasterId) {
                showNotify(`⚠️ Ordenador no encontrado: "${paymasterName}" — usuario: ${currentUserName}`, 'warning')
            }
            if (supervisorName && !supervisorId) {
                showNotify(`⚠️ Supervisor no encontrado: "${supervisorName}" — usuario: ${currentUserName}`, 'warning')
            }
            if (regionalName && !regionalId) {
                showNotify(`⚠️ Regional no encontrada: "${regionalName}" — usuario: ${currentUserName}`, 'warning')
            }
            if (u['Centro'] && !instituteId) {
                showNotify(`⚠️ Centro no encontrado: "${u['Centro']}" — usuario: ${currentUserName}`, 'warning')
            }

            // ── 7. Enviar al backend ──────────────────────────────────────────────────
            const { data, status } = await userStore.postUser(body)

            if (status === 200) {
                successCount++
                createdUserNames.push(currentUserName)
            } else {
                showNotify(`Error creando usuario ${currentUserName}: ${data.msg}`, 'negative')
                hasErrors = true
            }

        } catch (err) {
            console.error(err)
            showNotify(`Error de red o desconocido al crear a ${currentUserName}.`, 'negative')
            hasErrors = true
        }
    }

    // ── 8. Refrescar tabla ────────────────────────────────────────────────────────
    rows.value = await getUser()
    rows.value.reverse()
    loading.value = false

    // ── 9. Notificación final ─────────────────────────────────────────────────────
    const totalAttempts = users.length
    const errorCount = totalAttempts - successCount

    if (successCount > 0) {
        let msg = `✅ Se crearon ${successCount} de ${totalAttempts} usuarios.`
        if (successCount <= 5) msg += ` Usuarios: ${createdUserNames.join(', ')}.`
        else msg += ` Primeros: ${createdUserNames.slice(0, 3).join(', ')} y ${successCount - 3} más.`
        showNotify(msg, 'positive', 'check_circle')
        if (hasErrors) {
            showNotify(`⚠️ ${errorCount} usuarios fallaron. Ver notificaciones para detalles.`, 'warning')
        }
    } else if (hasErrors) {
        showNotify('Proceso finalizado. Falló la creación de todos los usuarios.', 'negative')
    } else {
        showNotify('No se creó ningún usuario. El archivo estaba vacío o sin datos válidos.', 'warning')
    }
}


</script>

<style scoped>
.page-bg {
    background-color: #f4f6f9;
    min-height: 100vh;
}

.page-header {
    padding: 4px 0 8px;
}

.table-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.users-table {
    border-radius: 12px;
}

.users-table :deep(thead tr th) {
    background-color: #f0f4ff;
    color: #374151;
    font-weight: 700;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 2px solid #e0e7ff;
}

.users-table :deep(tbody tr:hover) {
    background-color: #f8faff;
    transition: background-color 0.15s ease;
}

.users-table :deep(tbody tr td) {
    color: #374151;
    font-size: 0.875rem;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.action-btn {
    border-radius: 8px;
    font-weight: 600;
}

/* Dialog */
.dialog-card {
    width: 720px;
    max-width: 95vw;
    border-radius: 16px;
    overflow: hidden;
}

.dialog-header {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    padding: 16px 20px;
}

.dialog-header--edit {
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
}

.dialog-body {
    max-height: 65vh;
}

.section-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
}

.firma-container {
    background-color: #f5f5f5;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px;
    display: inline-block;
}
</style>