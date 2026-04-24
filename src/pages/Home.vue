<template>
    <q-page class="dashboard-page">

        <!-- ── HEADER ── -->
        <div class="page-header">
            <div class="header-left">
                <h4 class="welcome-title">Panel de Control</h4>
                <span class="header-date">{{ headerDateLabel }}</span>
            </div>
        </div>

        <!-- ── PANEL DE ANÁLISIS ── -->
        <div class="analytics-panel" v-if="isSupervisor || dataUser === 0 || dataUser === 1">

            <!-- Tabs selector -->
            <div class="chart-tabs">
                <button v-if="isSupervisor"
                    class="chart-tab"
                    :class="{ 'chart-tab-active': selectedChart === 'radicaciones' }"
                    @click="selectedChart = 'radicaciones'">
                    <q-icon name="bar_chart" size="17px" />
                    <span>Radicaciones</span>
                </button>
                <button v-if="isSupervisor"
                    class="chart-tab"
                    :class="{ 'chart-tab-active': selectedChart === 'presupuesto' }"
                    @click="selectedChart = 'presupuesto'">
                    <q-icon name="paid" size="17px" />
                    <span>Presupuesto</span>
                </button>
                <button
                    class="chart-tab"
                    :class="{ 'chart-tab-active': selectedChart === 'mis-agendas' }"
                    @click="selectedChart = 'mis-agendas'">
                    <q-icon name="calendar_today" size="17px" />
                    <span>Mis Agendas</span>
                </button>
                <button
                    class="chart-tab"
                    :class="{ 'chart-tab-active': selectedChart === 'mis-legalizaciones' }"
                    @click="selectedChart = 'mis-legalizaciones'">
                    <q-icon name="description" size="17px" />
                    <span>Mis Legalizaciones</span>
                </button>
            </div>

            <!-- Stats + Gráfica -->
            <div class="analytics-body">

                <!-- Tarjetas contextuales -->
                <div class="analytics-stats">
                    <template v-if="selectedChart === 'radicaciones'">
                        <div class="astat astat-blue">
                            <q-icon name="assignment" size="26px" />
                            <div class="astat-num">{{ allSchedules.length }}</div>
                            <div class="astat-lbl">Total</div>
                        </div>
                        <div class="astat astat-green">
                            <q-icon name="check_circle" size="26px" />
                            <div class="astat-num">{{ estadisticasAgendas.completadas }}</div>
                            <div class="astat-lbl">Completadas</div>
                        </div>
                        <div class="astat astat-purple">
                            <q-icon name="pending" size="26px" />
                            <div class="astat-num">{{ estadisticasAgendas.pendientes }}</div>
                            <div class="astat-lbl">Pendientes</div>
                        </div>
                        <div class="astat astat-red">
                            <q-icon name="cancel" size="26px" />
                            <div class="astat-num">{{ estadisticasAgendas.canceladas }}</div>
                            <div class="astat-lbl">Canceladas</div>
                        </div>
                    </template>

                    <template v-else-if="selectedChart === 'presupuesto'">
                        <div class="astat astat-blue">
                            <q-icon name="account_balance_wallet" size="26px" />
                            <div class="astat-num astat-num-sm">
                                <q-spinner-dots v-if="loadingPresupuesto" size="18px" color="white" />
                                <span v-else>${{ presupuestoConsumido.toLocaleString('es-CO') }}</span>
                            </div>
                            <div class="astat-lbl">Consumido</div>
                        </div>
                        <div class="astat astat-green">
                            <q-icon name="assignment" size="26px" />
                            <div class="astat-num">{{ allSchedules.length }}</div>
                            <div class="astat-lbl">Agendas</div>
                        </div>
                        <div class="astat astat-purple">
                            <q-icon name="check_circle" size="26px" />
                            <div class="astat-num">{{ estadisticasAgendas.completadas }}</div>
                            <div class="astat-lbl">Completadas</div>
                        </div>
                        <div class="astat astat-red">
                            <q-icon name="cancel" size="26px" />
                            <div class="astat-num">{{ estadisticasAgendas.canceladas }}</div>
                            <div class="astat-lbl">Canceladas</div>
                        </div>
                    </template>

                    <template v-else-if="selectedChart === 'mis-agendas'">
                        <div class="astat astat-green">
                            <q-icon name="task_alt" size="26px" />
                            <div class="astat-num">{{ estadisticasPersonales.agendasRealizadas }}</div>
                            <div class="astat-lbl">Realizadas</div>
                        </div>
                        <div class="astat astat-orange">
                            <q-icon name="schedule" size="26px" />
                            <div class="astat-num">{{ estadisticasPersonales.agendasPendientes }}</div>
                            <div class="astat-lbl">Pendientes</div>
                        </div>
                        <div class="astat astat-red">
                            <q-icon name="event_busy" size="26px" />
                            <div class="astat-num">{{ estadisticasPersonales.agendasRechazadas }}</div>
                            <div class="astat-lbl">Rechazadas</div>
                        </div>
                    </template>

                    <template v-else-if="selectedChart === 'mis-legalizaciones'">
                        <div class="astat astat-green">
                            <q-icon name="check_circle" size="26px" />
                            <div class="astat-num">{{ estadisticasPersonales.legalizacionesAprobadas }}</div>
                            <div class="astat-lbl">Aprobadas</div>
                        </div>
                        <div class="astat astat-orange">
                            <q-icon name="pending_actions" size="26px" />
                            <div class="astat-num">{{ estadisticasPersonales.legalizacionesPendientes }}</div>
                            <div class="astat-lbl">Pendientes</div>
                        </div>
                        <div class="astat astat-red">
                            <q-icon name="cancel" size="26px" />
                            <div class="astat-num">{{ estadisticasPersonales.legalizacionesRechazadas }}</div>
                            <div class="astat-lbl">Rechazadas</div>
                        </div>
                    </template>
                </div>

                <!-- Área de gráfica (v-show para mantener canvas en DOM) -->
                <div class="analytics-chart-area">

                    <q-card v-show="selectedChart === 'radicaciones'" ref="radicacionesCardRef" class="chart-card" flat>
                        <div class="chart-header">
                            <h6 class="chart-title">
                                Radicaciones
                                <span class="text-caption text-grey-7">({{ totalRadicacionesMes(allSchedules) }} este mes)</span>
                            </h6>
                            <div class="chart-controls">
                                <q-select v-model="viewMode" :options="[{ label: 'Por mes', value: 'month' }, { label: 'Todo el año', value: 'year' }]"
                                    emit-value map-options dense outlined class="control-select" />
                                <q-select v-if="viewMode === 'month'" v-model="selectedMonth" :options="monthOptions"
                                    emit-value map-options dense outlined class="control-select" />
                            </div>
                        </div>
                        <div class="chart-body chart-body-radicaciones">
                            <canvas ref="radicacionesChart"></canvas>
                        </div>
                    </q-card>

                    <q-card v-show="selectedChart === 'presupuesto'" ref="presupuestoCardRef" class="chart-card" flat>
                        <div class="chart-header">
                            <h6 class="chart-title">
                                Presupuesto
                                <q-icon name="info_outline" size="16px" color="grey-7" class="q-ml-xs cursor-pointer">
                                    <q-tooltip class="bg-grey-9 text-body2" max-width="300px">
                                        • Viáticos: (días - 0.5) × viático diario
                                        <br>• Extras: Gastos adicionales de observaciones
                                    </q-tooltip>
                                </q-icon>
                            </h6>
                            <div class="chart-controls">
                                <q-select v-model="viewModePresupuesto" :options="[{ label: 'Por mes', value: 'month' }, { label: 'Todo el año', value: 'year' }]"
                                    emit-value map-options dense outlined class="control-select" />
                                <q-select v-if="viewModePresupuesto === 'month'" v-model="selectedMonthPresupuesto"
                                    :options="monthOptions" emit-value map-options dense outlined class="control-select" />
                            </div>
                        </div>
                        <div class="chart-body chart-body-presupuesto">
                            <canvas ref="cdpCanvas"></canvas>
                        </div>
                    </q-card>

                    <q-card v-show="selectedChart === 'mis-agendas'" class="chart-card" flat>
                        <div class="chart-header">
                            <h6 class="chart-title">
                                <q-icon name="calendar_today" size="17px" class="q-mr-xs" />
                                Mis Agendas
                                <span class="text-caption text-grey-7">({{ new Date().getFullYear() }})</span>
                            </h6>
                            <div class="chart-controls">
                                <q-select v-model="viewMode" :options="[{ label: 'Por mes', value: 'month' }, { label: 'Todo el año', value: 'year' }]"
                                    emit-value map-options dense outlined class="control-select" />
                                <q-select v-if="viewMode === 'month'" v-model="selectedMonth" :options="monthOptions"
                                    emit-value map-options dense outlined class="control-select" />
                            </div>
                        </div>
                        <div class="chart-body chart-body-personal">
                            <canvas ref="agendasMesChart"></canvas>
                        </div>
                    </q-card>

                    <q-card v-show="selectedChart === 'mis-legalizaciones'" class="chart-card" flat>
                        <div class="chart-header">
                            <h6 class="chart-title">
                                <q-icon name="description" size="17px" class="q-mr-xs" />
                                Mis Legalizaciones
                                <span class="text-caption text-grey-7">({{ new Date().getFullYear() }})</span>
                            </h6>
                            <div class="chart-controls">
                                <q-select v-model="viewModeLegal" :options="[{ label: 'Por mes', value: 'month' }, { label: 'Todo el año', value: 'year' }]"
                                    emit-value map-options dense outlined class="control-select" />
                                <q-select v-if="viewModeLegal === 'month'" v-model="selectedMonthLegal" :options="monthOptions"
                                    emit-value map-options dense outlined class="control-select" />
                            </div>
                        </div>
                        <div class="chart-body chart-body-personal">
                            <canvas ref="legalizacionesPersonalChart"></canvas>
                        </div>
                    </q-card>

                </div>
            </div>
        </div>

        <!-- ── PANEL ADMIN: GESTIÓN DE USUARIOS ── -->
        <div class="analytics-panel admin-users-panel" v-if="isAdmin">

            <!-- Tabs selector -->
            <div class="chart-tabs">
                <button class="chart-tab"
                    :class="{ 'chart-tab-active': selectedAdminChart === 'roles' }"
                    @click="selectedAdminChart = 'roles'">
                    <q-icon name="pie_chart" size="17px" />
                    <span>Por Rol</span>
                </button>
                <button class="chart-tab"
                    :class="{ 'chart-tab-active': selectedAdminChart === 'estado' }"
                    @click="selectedAdminChart = 'estado'">
                    <q-icon name="toggle_on" size="17px" />
                    <span>Estado</span>
                </button>
                <div class="chart-tabs-spacer"></div>
                <q-btn flat dense icon="refresh" size="sm" color="green-7" @click="cargarUsuariosAdmin">
                    <q-tooltip>Recargar usuarios</q-tooltip>
                </q-btn>
            </div>

            <!-- Stats + Gráfica -->
            <div class="analytics-body">

                <!-- Stats -->
                <div class="analytics-stats">
                    <div class="astat astat-blue">
                        <q-icon name="group" size="26px" />
                        <div class="astat-num">
                            <q-spinner-dots v-if="loadingUsuarios" size="18px" color="white" />
                            <span v-else>{{ statsUsuarios.total }}</span>
                        </div>
                        <div class="astat-lbl">Total</div>
                    </div>
                    <div class="astat astat-green">
                        <q-icon name="how_to_reg" size="26px" />
                        <div class="astat-num">{{ statsUsuarios.activos }}</div>
                        <div class="astat-lbl">Activos</div>
                    </div>
                    <div class="astat astat-red">
                        <q-icon name="person_off" size="26px" />
                        <div class="astat-num">{{ statsUsuarios.inactivos }}</div>
                        <div class="astat-lbl">Inactivos</div>
                    </div>
                    <div class="astat astat-purple">
                        <q-icon name="badge" size="26px" />
                        <div class="astat-num">{{ statsUsuarios.contratistas }}</div>
                        <div class="astat-lbl">Contratistas</div>
                    </div>
                </div>

                <!-- Área de gráfica -->
                <div class="analytics-chart-area">

                    <q-card v-show="selectedAdminChart === 'roles'" class="chart-card" flat>
                        <div class="chart-header">
                            <h6 class="chart-title">
                                <q-icon name="pie_chart" size="17px" class="q-mr-xs" />
                                Distribución por Rol
                            </h6>
                            <div class="chart-controls">
                                <router-link to="usuario" style="text-decoration:none">
                                    <q-btn unelevated dense icon="add" label="Nuevo usuario" color="green-7" size="sm" />
                                </router-link>
                            </div>
                        </div>
                        <div class="chart-body admin-chart-body">
                            <canvas ref="rolesAdminCanvas"></canvas>
                        </div>
                    </q-card>

                    <q-card v-show="selectedAdminChart === 'estado'" class="chart-card" flat>
                        <div class="chart-header">
                            <h6 class="chart-title">
                                <q-icon name="toggle_on" size="17px" class="q-mr-xs" />
                                Activos vs Inactivos por Rol
                            </h6>
                            <div class="chart-controls">
                                <router-link to="usuario" style="text-decoration:none">
                                    <q-btn unelevated dense icon="manage_accounts" label="Gestionar" color="green-7" size="sm" />
                                </router-link>
                            </div>
                        </div>
                        <div class="chart-body admin-chart-body">
                            <canvas ref="estadoAdminCanvas"></canvas>
                        </div>
                    </q-card>

                </div>
            </div>
        </div>

        <!-- ── Acciones ── -->
        <div class="card-container" :style="{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }">
            <!-- Perfil (todos) -->
            <q-card class="dashboard-card featured-card" flat>
                <router-link to="perfil" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="person" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Perfil</h6>
                            <p class="card-subtitle">Gestiona tu información</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Crear agenda (contratista) -->
            <q-card v-if="dataUser === 0 && role !== 'Ordenador' && !isSupervisor" class="dashboard-card featured-card" flat>
                <router-link to="agenda/contratista/crear" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="calendar_month" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Nueva Agenda</h6>
                            <p class="card-subtitle">Crea y corrige tus agendas</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Crear agenda (funcionario / supervisor) -->
            <q-card v-if="dataUser === 1 || isSupervisor" class="dashboard-card featured-card" flat>
                <router-link to="agenda/funcionario/crear" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="event" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Nueva Agenda</h6>
                            <p class="card-subtitle">Crea y gestiona</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Legalizaciones (todos menos Ordenador y admin) -->
            <q-card v-if="role !== 'Ordenador' && !isAdmin" class="dashboard-card featured-card" flat>
                <router-link to="agenda/legalizacion" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="description" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Legalizaciones</h6>
                            <p class="card-subtitle">Revisa y aprueba</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Mis Agendas (personal) -->
            <q-card v-if="dataUser === 0 || dataUser === 1 || isSupervisor" class="dashboard-card featured-card" flat>
                <router-link :to="{ name: 'officialsschedules' }" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="checklist" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Mis Agendas</h6>
                            <p class="card-subtitle">Visualiza tus agendas</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Mis Legalizaciones (personal) -->
            <q-card v-if="dataUser === 0 || dataUser === 1 || isSupervisor" class="dashboard-card featured-card" flat>
                <router-link :to="{ name: 'legalizationofficials' }" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="assignment_turned_in" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Mis Legalizaciones</h6>
                            <p class="card-subtitle">Legalizaciones personales</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Solicitudes (supervisor/ordenador) -->
            <q-card v-if="isSupervisor || role === 'Ordenador'" class="dashboard-card featured-card" flat>
                <router-link to="agenda/solicitudes" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="request_page" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Solicitudes</h6>
                            <p class="card-subtitle">Revisa solicitudes</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Firmadas (supervisor) -->
            <q-card v-if="isSupervisor" class="dashboard-card featured-card" flat>
                <router-link to="agenda/firmadas" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="task_alt" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Firmadas</h6>
                            <p class="card-subtitle">Agendas completadas</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Radicaciones (supervisor) -->
            <q-card v-if="isSupervisor" class="dashboard-card featured-card" flat>
                <router-link :to="{ name: 'rooting' }" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="folder_open" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Radicaciones</h6>
                            <p class="card-subtitle">Control de radicaciones</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Presupuesto (supervisor) -->
            <q-card v-if="isSupervisor" class="dashboard-card featured-card" flat>
                <router-link to="agenda/dashboard" class="card-link">
                    <div class="card-overlay featured-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="dashboard" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Presupuesto</h6>
                            <p class="card-subtitle">Control presupuestal</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Usuarios (admin) -->
            <q-card v-if="isAdmin" class="dashboard-card featured-card" flat>
                <router-link to="usuario" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="group" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Usuarios</h6>
                            <p class="card-subtitle">Gestiona usuarios</p>
                        </div>
                    </div>
                </router-link>
            </q-card>

            <!-- Valores (admin) -->
            <q-card v-if="isAdmin" class="dashboard-card featured-card" flat>
                <router-link :to="{ name: 'Amount' }" class="card-link">
                    <div class="card-overlay"></div>
                    <div class="card-content">
                        <div class="icon-wrapper featured">
                            <q-icon name="attach_money" size="42px" color="white" />
                        </div>
                        <div class="card-info">
                            <h6 class="card-title">Valores</h6>
                            <p class="card-subtitle">Control de valores</p>
                        </div>
                    </div>
                </router-link>
            </q-card>
        </div>

    </q-page>
</template>

<script setup>
import { ref, onBeforeMount, onMounted, nextTick, watch, onBeforeUnmount, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from '../stores/user.js'
import { Chart, registerables } from 'chart.js'
import { useScheduleStore } from '../stores/schedule'

Chart.register(...registerables)


const cdpCanvas = ref(null)
let cdpChart = null


const scheduleStore = useScheduleStore()
const userStore = useUserStore()

const allSchedules = ref([])
const usersData = ref({})

// ── Admin: gestión de usuarios ──────────────────────────────────────────────
const allUsers = ref([])
const selectedAdminChart = ref('roles')
const loadingUsuarios = ref(false)
const rolesAdminCanvas = ref(null)
const estadoAdminCanvas = ref(null)
let rolesAdminChart = null
let estadoAdminChart = null

const ROLE_LABELS = {
    administrator: 'Administrador',
    supervisor: 'Supervisor',
    paymaster: 'Ordenador',
    official: 'Funcionario',
    contractor: 'Contratista',
}

const statsUsuarios = computed(() => {
    const users = allUsers.value
    return {
        total: users.length,
        activos: users.filter(u => u.status === 1).length,
        inactivos: users.filter(u => u.status === 0).length,
        contratistas: users.filter(u =>
            u.staffType?.data === 'contractor' || u.role?.data === 'contractor'
        ).length,
    }
})

const getRoleLabel = (user) => {
    const staff = user.staffType?.data || ''
    const rolData = user.role?.data || user.role || ''
    if (staff === 'contractor') return 'Contratista'
    if (staff === 'official' || staff === 'publicWorker') return 'Funcionario'
    return ROLE_LABELS[rolData] || rolData || 'Sin rol'
}

const cargarUsuariosAdmin = async () => {
    loadingUsuarios.value = true
    try {
        const { data } = await userStore.getUser()
        allUsers.value = Array.isArray(data) ? data : []
        await nextTick()
        crearGraficaRolesAdmin()
        crearGraficaEstadoAdmin()
    } catch (e) {
        console.error('Error cargando usuarios admin:', e)
    } finally {
        loadingUsuarios.value = false
    }
}

const crearGraficaRolesAdmin = () => {
    const canvas = rolesAdminCanvas.value
    if (!canvas) return
    if (rolesAdminChart) rolesAdminChart.destroy()

    const roleCount = {}
    allUsers.value.forEach(u => {
        const label = getRoleLabel(u)
        roleCount[label] = (roleCount[label] || 0) + 1
    })

    const labels = Object.keys(roleCount)
    const counts = Object.values(roleCount)
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

    rolesAdminChart = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: counts,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: ${ctx.parsed} usuarios`
                    }
                }
            }
        }
    })
}

const crearGraficaEstadoAdmin = () => {
    const canvas = estadoAdminCanvas.value
    if (!canvas) return
    if (estadoAdminChart) estadoAdminChart.destroy()

    const roles = {}
    allUsers.value.forEach(u => {
        const label = getRoleLabel(u)
        if (!roles[label]) roles[label] = { activos: 0, inactivos: 0 }
        if (u.status === 1) roles[label].activos++
        else roles[label].inactivos++
    })

    const labels = Object.keys(roles)
    estadoAdminChart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Activos', data: labels.map(l => roles[l].activos), backgroundColor: '#22c55e' },
                { label: 'Inactivos', data: labels.map(l => roles[l].inactivos), backgroundColor: '#ef4444' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: { label: ctx => `${ctx.parsed.y} usuarios` }
                }
            }
        }
    })
}
// ────────────────────────────────────────────────────────────────────────────

const isAdmin = computed(() => role.value === 'administrator')
const isSupervisor = computed(() => role.value === 'supervisor')

const cardCount = computed(() => {
  let n = 1 // Perfil siempre visible
  if (dataUser.value === 0 && role.value !== 'Ordenador' && !isSupervisor.value) n++
  if (dataUser.value === 1 || isSupervisor.value) n++
  if (role.value !== 'Ordenador') n++
  if (dataUser.value === 0 || dataUser.value === 1 || isSupervisor.value) n += 2
  if (isSupervisor.value || isAdmin.value || role.value === 'Ordenador') n++
  if (isSupervisor.value) n += 3
  if (isAdmin.value) n += 2
  return n
})

const gridCols = computed(() => {
  const n = cardCount.value
  if (n <= 4) return n
  for (let c = Math.min(n, 6); c >= 4; c--) {
    if (n % c === 0) return c
  }
  let best = 4, bestFill = 0
  for (let c = 4; c <= Math.min(n, 6); c++) {
    const fill = n % c === 0 ? 1 : (n % c) / c
    if (fill > bestFill) { bestFill = fill; best = c }
  }
  return best
})

const headerDateLabel = computed(() => {
    return new Date().toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
})

const selectedChart = ref('mis-agendas')

// Filtros para gráfica de legalizaciones
const filtroTiempoLegalizaciones = ref('todo') // 'mes' | 'año' | 'todo'
const añoSeleccionadoLegalizaciones = ref(new Date().getFullYear())
const mesSeleccionadoLegalizaciones = ref(new Date().getMonth())

const viewModeLegal = ref('month')
const selectedMonthLegal = ref(new Date().getMonth())

const viewModeAgenda = ref('month')
const selectedMonthAgenda = ref(new Date().getMonth())

const agendasSupervisor = computed(() => {
  if (!isSupervisor.value) return allSchedules.value

  return allSchedules.value.filter(a =>
    sonIguales(
      a?.supervisor?.id || a?.supervisor?._id,
      currentUser.value?.id
    )
  )
})


const normalizar = (txt) =>
    txt
        ?.toLowerCase()
        ?.normalize('NFD')
        ?.replace(/[\u0300-\u036f]/g, '')
        ?.trim()

const obtenerEstadoAgenda = (agenda) => {
    const estado = normalizar(agenda?.status?.data)

    if (!estado) return 'pendiente'

    // 1️⃣ Si ya pasó a legalización o radicado → agenda realizada SIEMPRE
    if (
        estado.includes('legaliz') ||
        estado.includes('radic') ||
        estado.includes('supervisor') ||
        estado.includes('administrador')
    ) {
        return 'realizada'
    }

    // 2️⃣ Rechazo SOLO si es rechazo de agenda (antes de legalización)
    if (estado.includes('rechaz')) return 'rechazada'

    // 3️⃣ Lo demás pendiente
    return 'pendiente'
}

const obtenerEstadoLegalizacion = (agenda) => {
    const index = agenda?.status?.index
    if (index === undefined || index === null || index < 2) return null

    if (index >= 5) return 'aprobada'

    const estado = normalizar(agenda?.status?.data)
    if (estado?.includes('rechaz')) return 'rechazada'

    return 'pendiente'
}



const sonIguales = (id1, id2) => {
    if (!id1 || !id2) return false
    return String(id1).trim() === String(id2).trim()
}

// Versión corregida de isAgendaDelUsuario
const isAgendaDelUsuario = (agenda) => {
    if (!currentUser.value?.id) return false
    const uid = currentUser.value.id
    return (
        sonIguales(agenda.contractor, uid) ||
        sonIguales(agenda.contractor?._id, uid) ||
        sonIguales(agenda.official, uid) ||
        sonIguales(agenda.official?._id, uid) ||
        sonIguales(agenda.publicWorker, uid) ||
        sonIguales(agenda.publicWorker?._id, uid)
    )
}



// Computed para estadísticas de agendas
const estadisticasAgendas = computed(() => {
    const completadas = allSchedules.value.filter(a =>
        a.status === 'completada' || a.status === 'aprobada' || a.status === 'firmada'
    ).length

    const pendientes = allSchedules.value.filter(a =>
        a.status === 'Enviada al Administrador' || a.status === 'en proceso' || a.status === 'revision'
    ).length

    const canceladas = allSchedules.value.filter(a =>
        a.status === 'cancelada' || a.status === 'rechazada'
    ).length

    return {
        completadas,
        pendientes,
        canceladas
    }
})

// Computed para presupuesto total consumido
const presupuestoConsumido = ref(0)
const loadingPresupuesto = ref(false)

const calcularPresupuestoTotal = async () => {
    loadingPresupuesto.value = true
    let total = 0
    try {
        const now = new Date()

        // Filtrar agendas según el modo de vista
        let agendasFiltradas = allSchedules.value

        if (viewModePresupuesto.value === 'month') {
            // Solo agendas del mes seleccionado
            agendasFiltradas = allSchedules.value.filter(agenda => {
                if (!agenda.createdAt) return false
                const date = new Date(agenda.createdAt)
                return date.getFullYear() === now.getFullYear() &&
                    date.getMonth() === selectedMonthPresupuesto.value
            })
        } else {
            // Solo agendas del año actual
            agendasFiltradas = allSchedules.value.filter(agenda => {
                if (!agenda.createdAt) return false
                const date = new Date(agenda.createdAt)
                return date.getFullYear() === now.getFullYear()
            })
        }

        console.log(`📅 Calculando presupuesto para ${agendasFiltradas.length} agendas`)

        for (const agenda of agendasFiltradas) {
            const agendaTotal = await getAgendaTotal(agenda)
            total += agendaTotal
        }
        presupuestoConsumido.value = total
    } finally {
        loadingPresupuesto.value = false
    }
    return total
}

// 🧮 FUNCIONES DE CÁLCULO REAL DE AGENDAS
const calcularDiasAgenda = (agenda) => {
    const start = new Date(agenda.tripStart)
    const end = new Date(agenda.tripEnd)
    const diffTime = end - start
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const calcularFactor = (dias) => {
    return dias - 0.5
}

const calcularTotalAgenda = (agenda, dailyAllowance = 0) => {
    const dias = calcularDiasAgenda(agenda)
    const factor = calcularFactor(dias)

    const viaticos = factor * dailyAllowance

    const observaciones = (agenda.observations || []).reduce(
        (acc, o) => acc + (Number(o.amount) || 0),
        0
    )

    return viaticos + observaciones
}

const getAgendaTotal = async (agenda) => {
    if (!agenda.contractor) return 0

    // Obtener viático diario del usuario si no lo tenemos en caché
    if (!usersData.value[agenda.contractor]) {
        try {
            const userResp = await userStore.getUserParams(agenda.contractor)
            const dailyAllowance = userResp?.data?.dailyAllowance?.amount ?? 0
            usersData.value[agenda.contractor] = { dailyAllowance }
        } catch (error) {
            console.error('Error obteniendo datos de usuario:', error)
            usersData.value[agenda.contractor] = { dailyAllowance: 0 }
        }
    }

    return calcularTotalAgenda(agenda, usersData.value[agenda.contractor].dailyAllowance)
}

const generateColorByIndex = (index) => {
    const hue = (index * 67) % 360
    return {
        border: `hsl(${hue}, 70%, 45%)`,
        bg: `hsla(${hue}, 70%, 45%, 0.25)`
    }
}



const getGastosPorCDP = async (agendas, year, month) => {
    const diasMes = new Date(year, month + 1, 0).getDate()
    const cdpMap = {}
    let totalSumado = 0

    console.log(`🔍 Procesando ${agendas.length} agendas para ${year}-${month + 1}`)

    for (const agenda of agendas) {
        if (!agenda.createdAt) continue

        const date = new Date(agenda.createdAt)
        if (date.getFullYear() !== year || date.getMonth() !== month) continue

        const dia = date.getDate() - 1

        // Calcular el total REAL de la agenda (viáticos + extras)
        const totalAgenda = await getAgendaTotal(agenda)

        console.log(`📋 Agenda ${agenda.number || agenda._id}: $${totalAgenda.toLocaleString('es-CO')}`)

        if (totalAgenda === 0) continue

        totalSumado += totalAgenda

        // Calcular viáticos de la agenda SIEMPRE
        const dias = calcularDiasAgenda(agenda)
        const factor = calcularFactor(dias)
        const userData = usersData.value[agenda.contractor]
        const viaticos = factor * (userData?.dailyAllowance || 0)

        console.log(`  ↳ Viáticos: $${viaticos.toLocaleString('es-CO')} (${dias} días, factor ${factor})`)

        // Calcular total de extras
        const totalExtras = (agenda.observations || []).reduce(
            (acc, obs) => acc + (Number(obs.amount) || 0),
            0
        )
        console.log(`  ↳ Extras: $${totalExtras.toLocaleString('es-CO')}`)

        // Si tiene observaciones con CDP
        if (Array.isArray(agenda.observations) && agenda.observations.length > 0) {
            // Obtener todos los CDPs únicos
            const cdpsUnicos = [...new Set(
                agenda.observations
                    .filter(obs => obs.cdp && obs.cdpName)
                    .map(obs => `${obs.cdp} - ${obs.cdpName}`)
            )]

            console.log(`  ↳ CDPs únicos: ${cdpsUnicos.length}`, cdpsUnicos)

            // Si hay CDPs definidos
            if (cdpsUnicos.length > 0) {
                // Distribuir viáticos equitativamente entre todos los CDPs ÚNICOS
                const viaticoPorCDP = viaticos / cdpsUnicos.length

                console.log(`  ↳ Viático por CDP: $${viaticoPorCDP.toLocaleString('es-CO')}`)

                // Primero, distribuir los viáticos a cada CDP único (solo una vez)
                cdpsUnicos.forEach(cdpKey => {
                    if (!cdpMap[cdpKey]) {
                        cdpMap[cdpKey] = Array(diasMes).fill(0)
                    }
                    cdpMap[cdpKey][dia] += viaticoPorCDP
                    console.log(`  ↳ Agregando ${viaticoPorCDP.toLocaleString('es-CO')} de viáticos a ${cdpKey}`)
                })

                // Luego, sumar los extras de cada observación
                agenda.observations.forEach(obs => {
                    if (!obs.cdp || !obs.cdpName) return

                    const cdpKey = `${obs.cdp} - ${obs.cdpName}`
                    const montoExtra = Number(obs.amount) || 0

                    if (montoExtra > 0) {
                        if (!cdpMap[cdpKey]) {
                            cdpMap[cdpKey] = Array(diasMes).fill(0)
                        }
                        cdpMap[cdpKey][dia] += montoExtra
                        console.log(`  ↳ Agregando $${montoExtra.toLocaleString('es-CO')} de extras a ${cdpKey}`)
                    }
                })

                const totalEnGrafica = cdpsUnicos.reduce((sum, cdpKey) => {
                    return sum + (cdpMap[cdpKey]?.[dia] || 0)
                }, 0)

                const diferencia = totalAgenda - totalEnGrafica

                if (Math.abs(diferencia) > 0.01) {
                    const primerCDP = cdpsUnicos[0]
                    cdpMap[primerCDP][dia] += diferencia
                    console.log(`  ↳ ⚖️ Ajuste de $${diferencia.toLocaleString('es-CO')} aplicado a ${primerCDP}`)
                }
                // ✨ FIN DEL BLOQUE NUEVO ✨

            } else {
                // Tiene observaciones pero sin CDP definido
                const cdpKey = 'Viáticos - Sin CDP asignado'
                if (!cdpMap[cdpKey]) {
                    cdpMap[cdpKey] = Array(diasMes).fill(0)
                }
                cdpMap[cdpKey][dia] += totalAgenda
                console.log(`  ↳ Agregando $${totalAgenda.toLocaleString('es-CO')} a Sin CDP (tiene observaciones sin CDP)`)
            }
        } else {
            // Si NO tiene observaciones, todo va a "Sin CDP"
            const cdpKey = 'Viáticos - Sin CDP asignado'
            if (!cdpMap[cdpKey]) {
                cdpMap[cdpKey] = Array(diasMes).fill(0)
            }
            cdpMap[cdpKey][dia] += totalAgenda
            console.log(`  ↳ Agregando $${totalAgenda.toLocaleString('es-CO')} a Sin CDP (sin observaciones)`)
        }
    }

    console.log(`✅ Total sumado directamente: $${totalSumado.toLocaleString('es-CO')}`)

    return {
        labels: Array.from({ length: diasMes }, (_, i) => i + 1),
        datasets: cdpMap
    }
}


const getGastosPorCDPAnual = async (agendas, year) => {
    const cdpMap = {}

    for (const agenda of agendas) {
        if (!agenda.createdAt) continue

        const date = new Date(agenda.createdAt)
        if (date.getFullYear() !== year) continue

        const mes = date.getMonth()

        // Calcular el total REAL de la agenda (viáticos + extras)
        const totalAgenda = await getAgendaTotal(agenda)

        if (totalAgenda === 0) continue

        // Calcular viáticos de la agenda SIEMPRE
        const dias = calcularDiasAgenda(agenda)
        const factor = calcularFactor(dias)
        const userData = usersData.value[agenda.contractor]
        const viaticos = factor * (userData?.dailyAllowance || 0)

        // Si tiene observaciones con CDP
        if (Array.isArray(agenda.observations) && agenda.observations.length > 0) {
            // Obtener todos los CDPs únicos
            const cdpsUnicos = [...new Set(
                agenda.observations
                    .filter(obs => obs.cdp && obs.cdpName)
                    .map(obs => `${obs.cdp} - ${obs.cdpName}`)
            )]

            // Si hay CDPs definidos
            if (cdpsUnicos.length > 0) {
                // Distribuir viáticos equitativamente entre todos los CDPs ÚNICOS
                const viaticoPorCDP = viaticos / cdpsUnicos.length

                // Primero, distribuir los viáticos a cada CDP único (solo una vez)
                cdpsUnicos.forEach(cdpKey => {
                    if (!cdpMap[cdpKey]) {
                        cdpMap[cdpKey] = Array(12).fill(0)
                    }
                    cdpMap[cdpKey][mes] += viaticoPorCDP
                })

                // Luego, sumar los extras de cada observación
                agenda.observations.forEach(obs => {
                    if (!obs.cdp || !obs.cdpName) return

                    const cdpKey = `${obs.cdp} - ${obs.cdpName}`
                    const montoExtra = Number(obs.amount) || 0

                    if (montoExtra > 0) {
                        if (!cdpMap[cdpKey]) {
                            cdpMap[cdpKey] = Array(12).fill(0)
                        }
                        cdpMap[cdpKey][mes] += montoExtra
                    }
                })
            } else {
                // Tiene observaciones pero sin CDP definido
                const cdpKey = 'Viáticos - Sin CDP asignado'
                if (!cdpMap[cdpKey]) {
                    cdpMap[cdpKey] = Array(12).fill(0)
                }
                cdpMap[cdpKey][mes] += totalAgenda
            }
        } else {
            // Si NO tiene observaciones, todo va a "Sin CDP"
            const cdpKey = 'Viáticos - Sin CDP asignado'
            if (!cdpMap[cdpKey]) {
                cdpMap[cdpKey] = Array(12).fill(0)
            }
            cdpMap[cdpKey][mes] += totalAgenda
        }
    }

    return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: cdpMap
    }
}



const viewMode = ref('month')
const selectedMonth = ref(new Date().getMonth())
const viewModePresupuesto = ref('month')
const selectedMonthPresupuesto = ref(new Date().getMonth())

let radicacionesChartInstance = null

const monthOptions = [
    { label: 'Enero', value: 0 },
    { label: 'Febrero', value: 1 },
    { label: 'Marzo', value: 2 },
    { label: 'Abril', value: 3 },
    { label: 'Mayo', value: 4 },
    { label: 'Junio', value: 5 },
    { label: 'Julio', value: 6 },
    { label: 'Agosto', value: 7 },
    { label: 'Septiembre', value: 8 },
    { label: 'Octubre', value: 9 },
    { label: 'Noviembre', value: 10 },
    { label: 'Diciembre', value: 11 }
]


const getFechasRadicadas = (schedules) => {
    const fechas = []

    schedules.forEach(agenda => {
        if (!Array.isArray(agenda.radications)) return

        agenda.radications.forEach(rad => {
            if (rad.status?.toUpperCase() === 'RADICADO' && rad.date) {
                fechas.push(new Date(rad.date))
            }
        })
    })

    return fechas
}

const getRadicacionesPorDia = (schedules, year, month) => {
    const diasMes = new Date(year, month + 1, 0).getDate()
    const data = Array(diasMes).fill(0)

    getFechasRadicadas(schedules).forEach(date => {
        if (date.getFullYear() === year && date.getMonth() === month) {
            data[date.getDate() - 1]++
        }
    })

    return {
        labels: Array.from({ length: diasMes }, (_, i) => i + 1),
        data
    }
}

const getRadicacionesPorMes = (schedules, year) => {
    const data = Array(12).fill(0)

    getFechasRadicadas(schedules).forEach(date => {
        if (date.getFullYear() === year) {
            data[date.getMonth()]++
        }
    })

    return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        data
    }
}




const totalRadicacionesMes = (schedules) => {
    return getRadicacionesMesActual(schedules).reduce((a, b) => a + b, 0)
}


const getRadicacionesMesActual = (schedules) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const ranges = [0, 0, 0, 0, 0, 0, 0]

    schedules.forEach(agenda => {
        if (!Array.isArray(agenda.radications)) return

        agenda.radications.forEach(rad => {
            if (
                !rad.status ||
                rad.status.toUpperCase().trim() !== 'RADICADO' ||
                !rad.date
            ) return

            const date = new Date(rad.date)

            if (date.getFullYear() === year && date.getMonth() === month) {
                const day = date.getDate()

                if (day <= 4) ranges[0]++
                else if (day <= 8) ranges[1]++
                else if (day <= 12) ranges[2]++
                else if (day <= 16) ranges[3]++
                else if (day <= 20) ranges[4]++
                else if (day <= 24) ranges[5]++
                else ranges[6]++
            }
        })
    })

    return ranges
}



Chart.register(...registerables)

const $q = useQuasar()
const role = ref(null)
const currentUser = ref(null)
const dataUser = ref(null)
const user = ref(null)
const radicacionesChart = ref(null)
const radicacionesCardRef = ref(null)
const presupuestoCardRef = ref(null)

const triggerChartAnimation = (cardRef) => {
    if (!cardRef || (!cardRef.$el && !cardRef.classList)) return
    const el = cardRef.$el || cardRef

    el.classList.add('updating')
    setTimeout(() => {
        el.classList.remove('updating')
    }, 600)
}

// NUEVAS FUNCIONALIDADES PARA USUARIOS NO ADMIN

// Referencias para gráficas personales
const legalizacionesPersonalChart = ref(null)
const agendasMesChart = ref(null)

let legalizacionesChart = null
let agendasChart = null


// Estadísticas personales
const estadisticasPersonales = ref({
    // AGENDAS
    totalAgendas: 0,
    agendasPendientes: 0,
    agendasRealizadas: 0,
    agendasRechazadas: 0,

    // LEGALIZACIONES
    legalizacionesPendientes: 0,
    legalizacionesAprobadas: 0,
    legalizacionesRechazadas: 0,

    // OTROS
    presupuestoConsumido: 0,
    diasTrabajados: 0
})

//Calcula las estadísticas personales del usuario
const calcularEstadisticasPersonales = async () => {
    console.log('🔄 Calculando estadísticas personales...')

    if (!currentUser.value?.id) return

    const misAgendas = allSchedules.value.filter(isAgendaDelUsuario)

    // =========================
    // AGENDAS
    // =========================
    estadisticasPersonales.value.totalAgendas = misAgendas.length

    estadisticasPersonales.value.agendasPendientes =
        misAgendas.filter(a => obtenerEstadoAgenda(a) === 'pendiente').length

    estadisticasPersonales.value.agendasRealizadas =
        misAgendas.filter(a => obtenerEstadoAgenda(a) === 'realizada').length

    estadisticasPersonales.value.agendasRechazadas =
        misAgendas.filter(a => obtenerEstadoAgenda(a) === 'rechazada').length


    // =========================
    // LEGALIZACIONES
    // =========================
    estadisticasPersonales.value.legalizacionesPendientes =
        misAgendas.filter(a => obtenerEstadoLegalizacion(a) === 'pendiente').length

    estadisticasPersonales.value.legalizacionesAprobadas =
        misAgendas.filter(a => obtenerEstadoLegalizacion(a) === 'aprobada').length

    estadisticasPersonales.value.legalizacionesRechazadas =
        misAgendas.filter(a => obtenerEstadoLegalizacion(a) === 'rechazada').length


    // =========================
    // PRESUPUESTO (solo aprobadas)
    // =========================
    let totalPresupuesto = 0

    for (const agenda of misAgendas.filter(a =>
        obtenerEstadoLegalizacion(a) === 'aprobada'
    )) {
        totalPresupuesto += await getAgendaTotal(agenda)
    }

    estadisticasPersonales.value.presupuestoConsumido = totalPresupuesto


    // =========================
    // DÍAS TRABAJADOS
    // =========================
    estadisticasPersonales.value.diasTrabajados =
        misAgendas.reduce((t, a) => t + calcularDiasAgenda(a), 0)

    console.log('✅ Estadísticas calculadas:', estadisticasPersonales.value)
}


/**
 * Crea todas las gráficas personales
 */
const crearGraficasPersonales = async () => {
    console.log('🎨 Creando gráficas personales...')

    // Esperar a que los elementos estén disponibles
    await nextTick()

    if (!legalizacionesPersonalChart.value) {
        console.warn('⚠️ Canvas de legalizaciones no disponible')
    } else {
        crearGraficaLegalizaciones()
    }

    if (!agendasMesChart.value) {
        console.warn('⚠️ Canvas de agendas no disponible')
    } else {
        crearGraficaAgendasMes()
    }
}

/**
 * Gráfica control de radicaciones
 */
const crearGraficaLegalizaciones = () => {
    const canvas = legalizacionesPersonalChart.value
    if (!canvas || !currentUser.value?.id) return

    if (legalizacionesChart) legalizacionesChart.destroy()

    const añoActual = new Date().getFullYear()

    // 🔎 Solo agendas del usuario EN PROCESO DE LEGALIZACIÓN
    const misLegalizaciones = allSchedules.value.filter(a => {
        if (!isAgendaDelUsuario(a)) return false

        const estado = obtenerEstadoLegalizacion(a)
        return estado === 'aprobada' || estado === 'pendiente' || estado === 'rechazada'
    })

    // 📅 Filtrar por tiempo
    let agendasFiltradas = []

    if (viewModeLegal.value === 'month') {
        agendasFiltradas = misLegalizaciones.filter(a => {
            if (!a.createdAt) return false
            const f = new Date(a.createdAt)
            return f.getFullYear() === añoActual &&
                f.getMonth() === selectedMonthLegal.value
        })
    } else {
        agendasFiltradas = misLegalizaciones.filter(a => {
            if (!a.createdAt) return false
            return new Date(a.createdAt).getFullYear() === añoActual
        })
    }

    // 📊 Variables de gráfica
    let labels = []
    let realizadas = []
    let pendientes = []
    let rechazadas = []

    if (viewModeLegal.value === 'month') {
        const diasMes = new Date(añoActual, selectedMonthLegal.value + 1, 0).getDate()

        labels = Array.from({ length: diasMes }, (_, i) => i + 1)
        realizadas = Array(diasMes).fill(0)
        pendientes = Array(diasMes).fill(0)
        rechazadas = Array(diasMes).fill(0)

        agendasFiltradas.forEach(a => {
            const dia = new Date(a.createdAt).getDate() - 1
            const estado = obtenerEstadoLegalizacion(a)

            if (estado === 'aprobada') realizadas[dia]++
            else if (estado === 'pendiente') pendientes[dia]++
            else if (estado === 'rechazada') rechazadas[dia]++
        })
    } else {
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        realizadas = Array(12).fill(0)
        pendientes = Array(12).fill(0)
        rechazadas = Array(12).fill(0)

        agendasFiltradas.forEach(a => {
            const mes = new Date(a.createdAt).getMonth()
            const estado = obtenerEstadoLegalizacion(a)

            if (estado === 'aprobada') realizadas[mes]++
            else if (estado === 'pendiente') pendientes[mes]++
            else if (estado === 'rechazada') rechazadas[mes]++
        })
    }

    const ctx = canvas.getContext('2d')

    legalizacionesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Realizadas', data: realizadas, backgroundColor: '#22c55e' },
                { label: 'Pendientes', data: pendientes, backgroundColor: '#facc15' },
                { label: 'Rechazadas', data: rechazadas, backgroundColor: '#ef4444' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } }
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.parsed.y} legalizaciones`
                    }
                }
            }
        }
    })
}





/**
 * Gráfica de barras: Agendas por mes
 */
const crearGraficaAgendasMes = () => {
    const canvas = agendasMesChart.value
    if (!canvas || !currentUser.value?.id) return

    if (agendasChart) agendasChart.destroy()

    const misAgendas = allSchedules.value.filter(isAgendaDelUsuario)

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const year = new Date().getFullYear()

    let labels = []
    let realizadas = []
    let pendientes = []
    let rechazadas = []

    if (viewModeAgenda.value === 'month') {
        const diasMes = new Date(year, selectedMonthAgenda.value + 1, 0).getDate()

        labels = Array.from({ length: diasMes }, (_, i) => i + 1)
        realizadas = Array(diasMes).fill(0)
        pendientes = Array(diasMes).fill(0)
        rechazadas = Array(diasMes).fill(0)

        misAgendas.forEach(agenda => {
            if (!agenda.createdAt) return
            const f = new Date(agenda.createdAt)

            if (f.getFullYear() === year && f.getMonth() === selectedMonthAgenda.value) {
                const dia = f.getDate() - 1
                const estado = obtenerEstadoAgenda(agenda)

                if (estado === 'realizada') realizadas[dia]++
                else if (estado === 'pendiente') pendientes[dia]++
                else if (estado === 'rechazada') rechazadas[dia]++
            }
        })
    } else {
        labels = meses
        realizadas = Array(12).fill(0)
        pendientes = Array(12).fill(0)
        rechazadas = Array(12).fill(0)

        misAgendas.forEach(agenda => {
            if (!agenda.createdAt) return
            const f = new Date(agenda.createdAt)

            if (f.getFullYear() === year) {
                const mes = f.getMonth()
                const estado = obtenerEstadoAgenda(agenda)

                if (estado === 'realizada') realizadas[mes]++
                else if (estado === 'pendiente') pendientes[mes]++
                else if (estado === 'rechazada') rechazadas[mes]++
            }
        })
    }

    const ctx = canvas.getContext('2d')

    agendasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Realizadas', data: realizadas, backgroundColor: '#22c55e' },
                { label: 'Pendientes', data: pendientes, backgroundColor: '#facc15' },
                { label: 'Rechazadas', data: rechazadas, backgroundColor: '#ef4444' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } }
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.parsed.y} agendas`
                    }
                }
            }
        }
    })
}




// ========================================
// FIN DE NUEVAS FUNCIONALIDADES
// ========================================

onBeforeMount(async () => {
    console.log('🔵 onBeforeMount iniciado')

    currentUser.value = $q.localStorage.getItem('user')
    console.log('👤 Usuario obtenido del localStorage:', currentUser.value)

    if (!currentUser.value) {
        console.error('❌ No hay usuario en localStorage')
        return
    }

    // Manejo robusto del rol
    if (currentUser.value.role) {
        if (typeof currentUser.value.role === 'object' && currentUser.value.role.data) {
            role.value = currentUser.value.role.data
        } else if (typeof currentUser.value.role === 'string') {
            role.value = currentUser.value.role
        } else {
            role.value = currentUser.value.role
        }
    } else {
        console.error('❌ No se pudo determinar el rol del usuario')
        console.error('📋 Estructura del usuario:', JSON.stringify(currentUser.value, null, 2))
        return
    }

    console.log('✅ Rol detectado:', role.value)
    console.log('✅ Tipo de rol:', typeof role.value)

    // Selección de gráfica por defecto según rol
    if (role.value === 'supervisor') {
        selectedChart.value = 'radicaciones'
    } else {
        selectedChart.value = 'mis-agendas'
    }

    try {
        const response = await userStore.getUserParams(currentUser.value.id)
        user.value = response
        dataUser.value = response?.data?.staffType?.index ?? null

        console.log('✅ Parámetros de usuario cargados')
        console.log('📊 staffType:', dataUser.value) // ✅ Log mejorado

        // ✅ El watcher de dataUser detectará este cambio y creará las gráficas

    } catch (error) {
        console.error('❌ Error al obtener parámetros del usuario:', error)
        dataUser.value = null
    }
})


onMounted(async () => {
    console.log('🟢 onMounted iniciado')
    console.log('📊 Rol actual:', role.value)
    console.log('📊 Tipo de rol:', typeof role.value)

    // ✅ Validar que role.value exista antes de comparar
    if (!role.value) {
        console.error('❌ No hay rol definido en onMounted')
        return
    }

    // ✅ Comparación más flexible del rol
    const esAdministrador =
        role.value === 'Administrador' ||
        role.value?.toLowerCase() === 'administrador' ||
        (typeof role.value === 'object' && role.value.data === 'Administrador')

    console.log('🔍 ¿Es administrador?', esAdministrador)

    if (isSupervisor.value) {
        console.log('✅ Usuario es Administrador, cargando datos...')
        try {
            const { data } = await scheduleStore.getSchedule()
            console.log('📦 Datos recibidos del store:', data)

            if (Array.isArray(data)) {
                allSchedules.value = data
            } else if (data?.schedules) {
                allSchedules.value = data.schedules
            } else if (data?.data) {
                allSchedules.value = data.data
            } else {
                allSchedules.value = []
            }

            console.log(`✅ ${allSchedules.value.length} agendas cargadas`)

            // Calcular presupuesto total consumido
            await calcularPresupuestoTotal()
            console.log('✅ Presupuesto calculado')

            await nextTick()
            console.log('✅ nextTick completado, inicializando gráficas...')

            initCharts()
            console.log('✅ Gráfica de radicaciones inicializada')

            await renderCDPLineChart()
            console.log('✅ Gráfica de presupuesto inicializada')

            await calcularEstadisticasPersonales()
            await nextTick()
            await crearGraficasPersonales()
            console.log('✅ Gráficas personales del supervisor inicializadas')

        } catch (error) {
            console.error('❌ Error al cargar datos del administrador:', error)
            console.error('📋 Stack trace:', error.stack)
        }
    } else {
        console.log('ℹ️ Usuario no es administrador, rol:', role.value)

        // Cargar agendas para usuarios no admin
        try {
            const { data } = await scheduleStore.getSchedule()

            if (Array.isArray(data)) {
                allSchedules.value = data
            } else if (data?.schedules) {
                allSchedules.value = data.schedules
            } else if (data?.data) {
                allSchedules.value = data.data
            } else {
                allSchedules.value = []
            }

            console.log(`✅ ${allSchedules.value.length} agendas cargadas para usuario`)

            // ✅ NO intentar crear gráficas aquí - el watcher lo hará cuando dataUser esté listo
            console.log('⏳ Esperando a que dataUser se cargue (viene de onBeforeMount)...')

        } catch (error) {
            console.error('❌ Error al cargar datos del usuario:', error)
        }
    }

    // Cargar usuarios si es admin
    if (isAdmin.value) {
        await cargarUsuariosAdmin()
    }
})


const initCharts = () => {
    console.log('📈 Inicializando gráfica de radicaciones...')

    // Gráfica de Radicaciones
    if (!radicacionesChart.value) {
        console.error('❌ Elemento canvas no disponible')
        return
    }

    // 🔥 destruir gráfica anterior
    if (radicacionesChartInstance) {
        radicacionesChartInstance.destroy()
    }

const now = new Date()
let chartData

const agendasRadicaciones = isSupervisor.value
    ? agendasSupervisor.value
    : allSchedules.value

if (viewMode.value === 'month') {
    if (typeof selectedMonth.value !== 'number') {
        console.error('❌ selectedMonth no es un número')
        return
    }

    chartData = getRadicacionesPorDia(
        agendasRadicaciones,
        now.getFullYear(),
        selectedMonth.value
    )

} else {
    chartData = getRadicacionesPorMes(
        agendasRadicaciones,
        now.getFullYear()
    )
}


    console.log('📊 Datos de la gráfica:', chartData)

    radicacionesChartInstance = new Chart(radicacionesChart.value, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Radicaciones',
                data: chartData.data,
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.15)',
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart',
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default') {
                        delay = context.dataIndex * 30;
                    }
                    return delay;
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.parsed.y} radicaciones`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    }
                }
            }
        }
    })

    console.log('✅ Gráfica de radicaciones creada')
}

const renderCDPLineChart = async () => {
    console.log('💰 Inicializando gráfica de presupuesto...')

    if (!cdpCanvas.value) {
        console.error('❌ Elemento canvas CDP no disponible')
        return
    }


    if (cdpChart) cdpChart.destroy()

    const now = new Date()
let result
const year = now.getFullYear()
const month = selectedMonthPresupuesto.value


const agendasCDP = isSupervisor.value
    ? agendasSupervisor.value
    : allSchedules.value

if (viewModePresupuesto.value === 'month') {
    if (typeof selectedMonthPresupuesto.value !== 'number') {
        console.error('❌ selectedMonthPresupuesto no es un número')
        return
    }

    result = await getGastosPorCDP(
        agendasCDP,
        year,
        month
    )

} else {
    result = await getGastosPorCDPAnual(
        agendasCDP,
        now.getFullYear()
    )
}


    console.log('📊 Datos CDP:', result)

    const datasets = Object.entries(result.datasets).map(
        ([cdpName, data], index) => {
            const color = generateColorByIndex(index)
            return {
                label: cdpName,
                data,
                borderColor: color.border,
                backgroundColor: color.bg,
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2
            }
        }
    )

    cdpChart = new Chart(cdpCanvas.value, {
        type: 'line',
        data: {
            labels: result.labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart',
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default') {
                        delay = (context.dataIndex * 30) + (context.datasetIndex * 100);
                    }
                    return delay;
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    padding: 12,
                    callbacks: {
                        title: (items) => {
                            return viewModePresupuesto.value === 'month'
                                ? `Día ${items[0].label}`
                                : items[0].label;
                        },
                        label: ctx => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('es-CO')}`
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `$${value.toLocaleString('es-CO')}`,
                        stepSize: 1,
                        precision: 0
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    })

    console.log('✅ Gráfica de presupuesto creada')
}


onBeforeUnmount(() => {
    if (radicacionesChartInstance) radicacionesChartInstance.destroy()
    if (cdpChart) cdpChart.destroy()
    if (rolesAdminChart) rolesAdminChart.destroy()
    if (estadoAdminChart) estadoAdminChart.destroy()
})



watch([viewMode, selectedMonth], async () => {
    initCharts()
    await nextTick()
    triggerChartAnimation(radicacionesCardRef.value)
})

watch([viewModeLegal, selectedMonthLegal], async () => {
    await nextTick()
    crearGraficaLegalizaciones()
})


watch([viewModePresupuesto, selectedMonthPresupuesto], async () => {
    await nextTick()
    triggerChartAnimation(presupuestoCardRef.value)
    await renderCDPLineChart()
    await calcularPresupuestoTotal()

})
// Watcher para detectar cuando dataUser está listo
watch(
    () => dataUser.value,
    async (newValue, oldValue) => {
        console.log('🔄 dataUser cambió:', { oldValue, newValue })

        // Solo actuar cuando cambia de null a un valor válido
        if (oldValue === null && newValue !== null) {
            console.log('✅ dataUser cargado, verificando condiciones...')

            // Validar que sea contractor o official
            if (newValue !== 0 && newValue !== 1) {
                console.log('ℹ️ Usuario no es contractor ni official, dataUser:', newValue)
                return
            }

            // Validar que haya agendas
            if (allSchedules.value.length === 0) {
                console.warn('⚠️ dataUser listo pero aún no hay agendas')
                return
            }

            // Validar que no sea admin
            if (isSupervisor.value) {
                console.log('ℹ️ Usuario admin, saltando gráficas personales')
                return
            }

            console.log('🎨 Todas las condiciones cumplidas, creando gráficas...')

            try {
                await calcularEstadisticasPersonales()
                await nextTick()
                await crearGraficasPersonales()
            } catch (error) {
                console.error('❌ Error al crear gráficas personales:', error)
            }
        }
    },
    { immediate: false }
)

// Watcher para cambios en las agendas (solo si dataUser ya está cargado)
watch(
    () => allSchedules.value.length,
    async (schedulesCount) => {
        console.log('🔄 Agendas actualizadas:', schedulesCount)

        // Solo actualizar si dataUser ya está definido
        if (dataUser.value === null) {
            console.log('⏳ Esperando a que dataUser se cargue...')
            return
        }

        if (schedulesCount === 0) {
            console.warn('⚠️ Sin agendas')
            return
        }

        if (!isSupervisor.value && dataUser.value !== 0 && dataUser.value !== 1) {
            console.log('ℹ️ Usuario no es contractor ni official')
            return
        }

        console.log('🔄 Actualizando gráficas personales...')

        try {
            await calcularEstadisticasPersonales()
            await nextTick()
            await crearGraficasPersonales()
        } catch (error) {
            console.error('❌ Error al actualizar gráficas:', error)
        }
    },
    { immediate: false }
)

// Agregar después de los otros watchers
watch([filtroTiempoLegalizaciones, añoSeleccionadoLegalizaciones, mesSeleccionadoLegalizaciones], () => {
    if (!isSupervisor.value && dataUser.value !== null) {
        crearGraficaLegalizaciones()
    }
})

// Resize del chart activo al cambiar de tab (canvas con v-show necesita redibujarse)
watch(selectedChart, async (val) => {
    await nextTick()
    if (val === 'radicaciones' && radicacionesChartInstance) radicacionesChartInstance.resize()
    else if (val === 'presupuesto' && cdpChart) cdpChart.resize()
    else if (val === 'mis-agendas' && agendasChart) agendasChart.resize()
    else if (val === 'mis-legalizaciones' && legalizacionesChart) legalizacionesChart.resize()
})

// Resize gráficas admin al cambiar tab
watch(selectedAdminChart, async (val) => {
    await nextTick()
    if (val === 'roles' && rolesAdminChart) rolesAdminChart.resize()
    else if (val === 'estado' && estadoAdminChart) estadoAdminChart.resize()
})
</script>

<style scoped>
/* Página principal */
.dashboard-page {
    background: linear-gradient(180deg, #f8fdf9 0%, #ffffff 100%);
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Header mejorado */
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
}

.header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.welcome-title {
    font-weight: 800;
    color: #1b5e20;
    margin: 0;
    letter-spacing: 0.5px;
    font-size: 1.5rem;
    text-transform: capitalize;
}

.header-date {
    font-size: 0.78rem;
    color: #4caf50;
    font-weight: 500;
    text-transform: capitalize;
    margin: 0;
}

/* Secciones de navegación */
.nav-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.section-label {
    display: flex;
    align-items: center;
    font-size: 0.72rem;
    font-weight: 700;
    color: #388e3c;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 0 4px;
    position: relative;
}

.section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, #a5d6a7 0%, transparent 100%);
    margin-left: 10px;
}

/* (stat-card legacy removed — use .astat in analytics-panel) */
.stat-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

/* ========================================
   CONTENEDOR DE GRÁFICAS ADMIN - ACTUALIZADO
======================================== */
.charts-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    width: 100%;
    padding: 1rem;
}

.chart-card {
    background: white;
    border-radius: 14px;
    border: 1px solid #16a34a;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 380px;
    max-height: 450px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    transition: all 0.3s ease;
}

.chart-card:hover {
    box-shadow: 0 6px 16px rgba(22, 163, 74, 0.35);
    transform: translateY(-2px);
}

/* Animación de actualización de gráficas */
@keyframes chartRefresh {
    0% {
        opacity: 0.7;
        transform: scale(0.98);
    }

    50% {
        opacity: 0.85;
        transform: scale(0.99);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.chart-card.updating {
    animation: chartRefresh 0.6s ease-out;
}

/* Header de gráficas admin */
.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #e0e0e0;
    gap: 1rem;
    flex-wrap: wrap;
    min-height: 70px;
}

.chart-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.chart-title .text-caption {
    font-size: 0.75rem;
    margin-left: 0.25rem;
}

.chart-title .q-icon {
    font-size: 18px !important;
    color: #16a34a;
}

.chart-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.control-select {
    min-width: 110px;
    max-width: 140px;
}

.control-select :deep(.q-field__control) {
    background: #f1f8f4;
    border-color: #66bb6a;
    color: #1b5e20;
    min-height: 32px;
    font-size: 0.75rem;
}

.control-select :deep(.q-field__native) {
    padding: 4px 8px;
}

/* Cuerpo de las gráficas admin */
.chart-body,
.chart-body-radicaciones,
.chart-body-presupuesto,
.admin-chart-body {
    padding: 1rem;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.chart-body canvas,
.chart-body-radicaciones canvas,
.chart-body-presupuesto canvas,
.admin-chart-body canvas {
    max-width: 100% !important;
    max-height: 280px !important;
    height: auto !important;
    transition: opacity 0.3s ease-in-out;
}

/* Spacer en tabs admin para empujar botón refresh a la derecha */
.chart-tabs-spacer {
    flex: 1;
}

/* Contenedor de tarjetas */
.card-container {
    display: grid;
    gap: 10px;
}

/* Scrollbar personalizado */
.card-container::-webkit-scrollbar {
    width: 6px;
}

.card-container::-webkit-scrollbar-track {
    background: #f1f8f4;
    border-radius: 10px;
}

.card-container::-webkit-scrollbar-thumb {
    background: #66bb6a;
    border-radius: 10px;
}

/* Tarjetas del dashboard - MEJORADAS Y MÁS GRANDES */
.dashboard-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e8f5e9;
    overflow: visible;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(27, 94, 32, 0.1);
    height: fit-content;
    position: relative;
}

.dashboard-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(27, 94, 32, 0.2);
    border-color: #66bb6a;
}

.featured-card {
    background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);
    border: 2px solid #4caf50;
}

.featured-card:hover {
    border-color: #2e7d32;
}

.card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 6px;
    height: 100%;
    background: linear-gradient(180deg, #66bb6a 0%, #4caf50 100%);
    opacity: 0.6;
    transition: all 0.3s ease;
    z-index: 1;
    pointer-events: none;
    border-radius: 16px 0 0 16px;
}

.featured-overlay {
    background: linear-gradient(180deg, #2e7d32 0%, #1b5e20 100%);
}

.dashboard-card:hover .card-overlay {
    width: 8px;
    opacity: 1;
}

.card-link {
    text-decoration: none;
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 16px;
}

.card-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 14px 16px;
    gap: 12px;
    text-align: left;
    position: relative;
    z-index: 2;
}

.icon-wrapper {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-wrapper .q-icon {
    font-size: 24px !important;
}

.icon-wrapper.featured {
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
}

.dashboard-card:hover .icon-wrapper {
    transform: scale(1.1) rotate(4deg);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.5);
}

.card-info {
    flex: 1;
    min-width: 0;
    transition: transform 0.4s ease;
}

.dashboard-card:hover .card-info {
    transform: translateX(2px);
}

.card-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1b5e20;
    margin: 0 0 2px 0;
    letter-spacing: 0.2px;
    text-transform: uppercase;
    line-height: 1.3;
    transition: color 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dashboard-card:hover .card-title {
    color: #2e7d32;
}

.card-subtitle {
    font-size: 0.72rem;
    color: #66bb6a;
    margin: 0;
    font-weight: 500;
    line-height: 1.3;
    opacity: 0.9;
    transition: opacity 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dashboard-card:hover .card-subtitle {
    opacity: 1;
}


/* Animación de entrada más suave */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(15px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dashboard-card,
.stat-card,
.chart-card {
    animation: fadeInUp 0.4s ease-out;
}

/* Delay escalonado para las tarjetas */
.dashboard-card:nth-child(1) {
    animation-delay: 0.05s;
}

.dashboard-card:nth-child(2) {
    animation-delay: 0.1s;
}

.dashboard-card:nth-child(3) {
    animation-delay: 0.15s;
}

.dashboard-card:nth-child(4) {
    animation-delay: 0.2s;
}

.dashboard-card:nth-child(5) {
    animation-delay: 0.25s;
}

.dashboard-card:nth-child(6) {
    animation-delay: 0.3s;
}

/* ========================================
   RESPONSIVE - GRÁFICAS
======================================== */
@media (min-width: 1200px) {
    .chart-card canvas,
    .chart-body-radicaciones canvas,
    .chart-body-presupuesto canvas {
        max-height: 300px !important;
    }
}

/* Tablets verticales */
@media (min-width: 768px) and (max-width: 1023px) {
    .chart-body,
    .chart-body-radicaciones,
    .chart-body-presupuesto {
        padding: 1.5rem;
    }

    .chart-card canvas,
    .chart-body-radicaciones canvas,
    .chart-body-presupuesto canvas {
        max-height: 320px !important;
    }
}

/* Móviles */
@media (max-width: 767px) {
    .chart-body,
    .chart-body-radicaciones,
    .chart-body-presupuesto {
        padding: 1rem;
    }

    .chart-card canvas,
    .chart-body-radicaciones canvas,
    .chart-body-presupuesto canvas {
        max-height: 280px !important;
    }
}

/* Tarjetas en tablet */
@media (max-width: 1024px) {
    .card-container {
        grid-template-columns: repeat(3, 1fr) !important;
    }
}

/* Tarjetas en móvil - 2 columnas */
@media (max-width: 600px) {
    .card-container {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px;
    }

    .card-content {
        padding: 10px 10px;
        gap: 8px;
    }

    .card-title {
        font-size: 0.78rem;
        white-space: normal;
    }

    .card-subtitle {
        font-size: 0.67rem;
        white-space: normal;
    }

    .icon-wrapper {
        width: 40px;
        height: 40px;
    }
}

/* Móviles muy pequeños - 1 columna */
@media (max-width: 360px) {
    .card-container {
        grid-template-columns: repeat(1, 1fr) !important;
    }
}

/* Móviles pequeños */
@media (max-width: 480px) {
    .chart-body,
    .chart-body-radicaciones,
    .chart-body-presupuesto {
        padding: 0.75rem;
    }

    .chart-card canvas,
    .chart-body-radicaciones canvas,
    .chart-body-presupuesto canvas {
        max-height: 250px !important;
    }

    .chart-header {
        flex-direction: column;
        align-items: flex-start;
        padding: 0.875rem 1rem;
        min-height: auto;
    }

    .chart-title {
        font-size: 0.9rem;
        width: 100%;
    }

    .chart-controls {
        width: 100%;
    }

    .control-select {
        flex: 1;
        min-width: 100px;
    }

    .welcome-title {
        font-size: 1.2rem;
        letter-spacing: 0.5px;
    }
}

/* Móviles extra pequeños */
@media (max-width: 360px) {
    .welcome-title {
        font-size: 1.1rem;
    }
}

/* ========================================
   PANEL DE ANÁLISIS
======================================== */
.analytics-panel {
    background: white;
    border-radius: 16px;
    border: 1px solid #e8f5e9;
    box-shadow: 0 4px 16px rgba(27, 94, 32, 0.08);
    overflow: hidden;
}

/* Tabs */
.chart-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #e8f5e9;
    background: #f8fdf9;
    overflow-x: auto;
    scrollbar-width: none;
}

.chart-tabs::-webkit-scrollbar {
    display: none;
}

.chart-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 18px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #6b7280;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
}

.chart-tab:hover {
    color: #16a34a;
    background: rgba(22, 163, 74, 0.05);
}

.chart-tab-active {
    color: #16a34a;
    border-bottom-color: #16a34a;
    background: white;
}

/* Cuerpo: stats + gráfica */
.analytics-body {
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* Tarjetas de estadísticas contextuales */
.analytics-stats {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #f0f0f0;
}

.astat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 16px 10px;
    color: white;
    text-align: center;
    transition: opacity 0.2s ease;
}

.astat + .astat {
    border-left: 1px solid rgba(255,255,255,0.2);
}

.astat-blue   { background: linear-gradient(135deg, #42a5f5, #1e88e5); }
.astat-green  { background: linear-gradient(135deg, #66bb6a, #43a047); }
.astat-purple { background: linear-gradient(135deg, #ab47bc, #8e24aa); }
.astat-orange { background: linear-gradient(135deg, #ffa726, #fb8c00); }
.astat-red    { background: linear-gradient(135deg, #ef5350, #e53935); }

.astat-num {
    font-size: 1.8rem;
    font-weight: 800;
    line-height: 1;
}

.astat-num-sm {
    font-size: 1rem;
    font-weight: 700;
}

.astat-lbl {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    opacity: 0.92;
}

/* Área de gráfica */
.analytics-chart-area {
    padding: 0;
    position: relative;
}

.analytics-chart-area .chart-card {
    border: none;
    border-radius: 0;
    box-shadow: none;
    min-height: 340px;
    max-height: 420px;
}

/* Responsive del panel */
@media (max-width: 600px) {
    .chart-tab {
        padding: 10px 12px;
        font-size: 0.74rem;
    }

    .chart-tab span {
        display: none;
    }

    .analytics-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0;
    }

    .astat + .astat {
        border-left: none;
    }

    .astat:nth-child(odd) {
        border-right: 1px solid rgba(255,255,255,0.2);
    }

    .astat:nth-child(n+3) {
        border-top: 1px solid rgba(255,255,255,0.2);
    }

    .astat-num {
        font-size: 1.4rem;
    }

    .astat-lbl {
        font-size: 0.6rem;
    }

    .astat {
        padding: 14px 8px;
    }
}
</style>
