<template>
    <q-layout view="hHh lpr fFf">
        <q-header style="padding: 3px;background-color: #2e7d32;">
            <q-toolbar>
                <q-btn flat @click="showDrawer = !showDrawer" icon="menu" />
                <q-avatar style="margin-left: 10px;" size="50px">
                    <img src="../assets/Logo-sena-blanco-sin-fondo.png" />
                </q-avatar>
                <q-toolbar-title id="titulo">VILE</q-toolbar-title>

                <!-- ICONO DE NOTIFICACIONES -->
                <NotificationCenter />

                <q-btn flat icon="logout" style="font-size: larger;" @click="confirmLogout = true">
                    <q-tooltip>Cerrar Sesión</q-tooltip>
                </q-btn>
            </q-toolbar>

        </q-header>

        <q-drawer overlay bordered v-model="showDrawer" :width="270">
            <template v-if="user && user.role">

                <!-- Perfil de usuario -->
                <div class="drawer-profile">
                    <q-img src="../assets/sena-icono.png" class="sena-logo" />
                    <div class="user-name">{{ user.name }}</div>
                    <div class="role-label">{{ roleLabel }}</div>
                </div>

                <q-separator />

                <!-- Navegación -->
                <q-list padding class="menu-list">
                    <q-item v-for="(item, index) in items" :key="index" v-ripple clickable class="menu-item"
                        :active="$route.path === item.link" active-class="menu-item-active"
                        @click="goRoute(item); showDrawer = false">
                        <q-item-section avatar>
                            <q-icon :name="item.icon" size="20px" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ item.label }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>

                <!-- Footer del drawer -->
                <div class="drawer-footer">
                    <q-separator />
                    <q-item v-ripple clickable class="logout-item" @click="confirmLogout = true; showDrawer = false">
                        <q-item-section avatar>
                            <q-icon name="logout" size="20px" />
                        </q-item-section>
                        <q-item-section>Cerrar sesión</q-item-section>
                    </q-item>
                </div>

            </template>
        </q-drawer>

        <q-dialog v-model="confirmLogout" persistent>
            <q-card style="min-width: 350px">
                <q-card-section class="row items-center">
                    <q-icon name="warning" color="orange" size="32px" />
                    <span class="q-ml-sm text-h6">Cerrar sesión</span>
                </q-card-section>

                <q-card-section>
                    ¿Estás seguro de que deseas cerrar sesión?
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cancelar" color="primary" v-close-popup />
                    <q-btn flat label="Cerrar sesión" color="negative" @click="logout" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-page-container>
            <router-view />
        </q-page-container>


    </q-layout>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from '../stores/user.js'
import { showNotify } from '../components/notify.js'
import NotificationCenter from '../pages/NotificationCenter.vue'
import { useNotificationStore } from '../stores/notificationStore.js'


const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const userStore = useUserStore()

const notificationStore = useNotificationStore()
const confirmLogout = ref(false)
const showDrawer = ref(false)
const user = ref(null)
const items = ref([])

// Cargar usuario síncronamente
const storedUser = $q.localStorage.getItem('user')
user.value = storedUser

const userInitials = computed(() => {
    if (!user.value?.name) return '?'
    return user.value.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('')
})

const roleMap = {
    supervisor: 'Supervisor',
    administrator: 'Administrador',
    paymaster: 'Ordenador'
}

const roleLabel = computed(() => {
    if (!user.value?.role) return ''
    const roleData = user.value.role.data
    if (roleData !== 'user') {
        return user.value.role.label || roleMap[roleData] || roleData
    }
    const staffData = user.value.staffType?.data
    return staffData === 'contractor' ? 'Contratista' : 'Funcionario'
})

onBeforeMount(async () => {
    // Verificar que el usuario exista
    if (!user.value || !user.value.role) {
        router.replace('/')
        return
    }

    const { role } = user.value

    try {
        if (role.data == 'user') {
            const { data } = await userStore.getUserParams(user.value.id)

            // Actualizar el usuario con los datos completos
            user.value = { ...user.value, staffType: data.staffType }

            if (data.staffType.data == 'contractor') {
                items.value = [
                    { label: 'Home', link: '/layout/home', icon: 'house' },
                    { label: 'Perfil', link: '/layout/perfil', icon: 'person' },
                    { label: 'Crear Agenda', link: '/layout/agenda/contratista/crear', icon: 'fa-solid fa-calendar' },
                    { label: 'Crear Legalización', link: '/layout/agenda/legalizacion', icon: 'fa-solid fa-signature' },
                    { label: 'Mis Agendas', link: '/layout/agenda/officialsschedules', icon: 'fa-solid fa-clipboard' },
                    { label: 'Mis Legalizaciones', link: '/layout/agenda/legalizationofficials', icon: 'fa-solid fa-clipboard' }
                ]
            } else {
                items.value = [
                    { label: 'Home', link: '/layout/home', icon: 'house' },
                    { label: 'Perfil', link: '/layout/perfil', icon: 'person' },
                    { label: 'Crear Agenda', link: '/layout/agenda/funcionario/crear', icon: 'fa-solid fa-calendar' },
                    { label: 'Crear Legalización', link: '/layout/agenda/legalizacion', icon: 'fa-solid fa-signature' },
                    { label: 'Histórico', link: '/layout/agenda/historico', icon: 'fa-solid fa-clipboard' }
                ]
            }
        } else if (role.data == 'supervisor') {
            items.value = [
                { label: 'Home', link: '/layout/home', icon: 'house' },
                { label: 'Perfil', link: '/layout/perfil', icon: 'person' },
                { label: 'Solicitudes', link: '/layout/agenda/solicitudes', icon: 'fa-solid fa-person-circle-question' },
                { label: 'Solicitudes Legalización Contratista', link: '/layout/agenda/legalizacion', icon: 'fa-solid fa-file-contract' },
                { label: 'Crear Agenda', link: '/layout/agenda/funcionario/crear', icon: 'fa-solid fa-calendar' },
                { label: 'Crear Legalización', link: '/layout/agenda/funcionario/legalizacion', index: true, icon: 'fa-solid fa-signature' },
                { label: 'Mis Agendas', link: '/layout/agenda/officialsschedules', icon: 'fa-solid fa-calendar-check' },
                { label: 'Mis Legalizaciones', link: '/layout/agenda/legalizationofficials', icon: 'fa-solid fa-file-signature' },
                { label: 'Radicaciones', link: '/layout/agenda/rooting', icon: 'fa-solid fa-clipboard' },
                { label: 'Agendas firmadas', link: '/layout/agenda/firmadas', icon: 'fa-solid fa-clipboard' },
                { label: 'Presupuesto', link: '/#/layout/agenda/dashboard', icon: 'fa-solid fa-clipboard' }
            ]
        } else if (role.data == 'administrator') {
            items.value = [
                { label: 'Home', link: '/layout/home', icon: 'house' },
                { label: 'Perfil', link: '/layout/perfil', icon: 'person' },
                { label: 'Usuarios', link: '/layout/usuario', icon: 'people' },
            ]
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error)
        showNotify('Error al cargar los datos del usuario', 'negative')
        router.replace('/')
    }
})

function logout() {
    confirmLogout.value = false
    goLogin()
}

async function goRoute(item) {
    if (user.value?.role?.data == 'supervisor' && (item.link == '/layout/agenda/legalizacion' || item.link == '/layout/agenda/funcionario/legalizacion')) {
        if (item.index) {
            $q.localStorage.set('new', true)
        } else {
            if ($q.localStorage.has('new')) {
                $q.localStorage.remove('new')
            }
        }
        await router.replace('/')
    } else {
        if ($q.localStorage.has('new')) {
            $q.localStorage.remove('new')
        }
    }
    router.push(item.link)
}

function goLogin() {
    $q.localStorage.set('lastSessionTime', new Date().toISOString())
    $q.localStorage.remove('token')
    $q.localStorage.remove('user')
    notificationStore.$reset()
    router.replace({ path: '/' })
    showNotify('Se cerró la sesión', 'positive', 'check_circle')
}
</script>

<style scoped>
/* ── Perfil ── */
.drawer-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px 20px;
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
}

.sena-logo {
    width: 70px;
    height: 70px;
    margin-bottom: 14px;
}


.user-name {
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    color: #212121;
    margin-bottom: 4px;
    line-height: 1.3;
}

.role-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #2e7d32;
    background: #e8f5e9;
    padding: 2px 10px;
    border-radius: 12px;
}

/* ── Menú ── */
.menu-list {
    flex: 1;
}

.menu-item {
    border-radius: 8px;
    margin: 2px 8px;
    color: #37474f;
    font-weight: 500;
    transition: background-color 0.2s ease;
    min-height: 44px;
}

.menu-item:hover {
    background-color: #e8f5e9;
    color: #2e7d32;
}

.menu-item-active {
    background-color: #e8f5e9 !important;
    color: #2e7d32 !important;
    font-weight: 600;
}

/* ── Footer ── */
.drawer-footer {
    padding-bottom: 8px;
}

.logout-item {
    border-radius: 8px;
    margin: 4px 8px;
    color: #c62828;
    font-weight: 500;
    min-height: 44px;
}

.logout-item:hover {
    background-color: #ffebee;
}
</style>