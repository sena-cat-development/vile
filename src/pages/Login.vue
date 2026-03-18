<template>
    <q-layout view="hHh lpr fFf">
        <q-page-container>
            <q-page class="login-bg flex flex-center">
                <div class="login-wrapper">
                    <q-card class="login-card" flat bordered>

                        <!-- Header verde -->
                        <div class="login-header">
                            <div class="login-header-accent" />
                            <p class="login-brand">VILE</p>
                            <p class="login-brand-sub">Viaticos y Legalizaciones</p>
                        </div>

                        <!-- Logo + título -->
                        <q-card-section class="logo-section">
                            <div class="logo-wrapper">
                                <q-img src="../assets/sena-icono-nuevo.png" fit="contain"
                                    style="width: 90px; height: 90px;" />
                            </div>
                            <p class="login-title">Iniciar Sesión</p>
                            <p class="login-subtitle">Ingresa tus credenciales para continuar</p>
                        </q-card-section>

                        <q-separator color="green-2" />

                        <!-- Formulario -->
                        <q-form @submit.prevent="goHome">
                            <q-card-section class="q-px-lg q-pt-lg q-pb-sm">
                                <q-input v-model="identification" outlined stack-label label="Número de documento"
                                    type="number" color="green-8" label-color="green-8" class="login-input">
                                    <template v-slot:prepend>
                                        <q-icon name="badge" color="green-7" />
                                    </template>
                                </q-input>

                                <q-input v-model="password" outlined stack-label label="Contraseña"
                                    :type="showPassword ? 'text' : 'password'" color="green-8" label-color="green-8"
                                    class="login-input q-mt-md">
                                    <template v-slot:prepend>
                                        <q-icon name="lock" color="green-7" />
                                    </template>
                                    <template v-slot:append>
                                        <q-icon :name="showPassword ? 'visibility' : 'visibility_off'"
                                            class="cursor-pointer" color="grey-6"
                                            @click="showPassword = !showPassword" />
                                    </template>
                                </q-input>
                            </q-card-section>

                            <q-card-section class="q-px-lg q-pb-md q-pt-sm">
                                <q-btn type="submit" :loading="loading" label="Iniciar Sesión"
                                    class="login-btn full-width" unelevated size="md" icon-right="arrow_forward" />
                            </q-card-section>
                        </q-form>

                        <!-- Olvidé contraseña -->
                        <div class="forgot-section">
                            <span id="olvidar" @click="openModal">¿Olvidó su contraseña?</span>
                        </div>

                    </q-card>
                </div>
            </q-page>
        </q-page-container>

        <q-footer class="login-footer">
            <p class="q-my-none footer-text">VILE — SENA 2024 &copy; Todos los derechos reservados</p>
        </q-footer>

        <!-- Modal restablecer contraseña -->
        <q-dialog v-model="modalVisible" persistent>
            <q-card class="modal-card">
                <q-card-section class="row items-center q-pb-none">
                    <q-icon name="lock_reset" color="green-8" size="sm" class="q-mr-sm" />
                    <span class="text-h6 text-weight-medium">Restablecer Contraseña</span>
                    <q-space />
                    <q-btn icon="close" color="negative" flat round dense v-close-popup />
                </q-card-section>

                <q-separator class="q-mt-sm" color="green-3" />

                <q-card-section class="q-pt-md">
                    <p class="text-body2 text-grey-7 q-mb-md">
                        Ingrese la dirección de correo electrónico registrada para comenzar el proceso de recuperación.
                    </p>
                    <q-input outlined dense v-model="mail" label="Correo electrónico" type="email" color="green-8"
                        label-color="green-8">
                        <template v-slot:prepend>
                            <q-icon name="email" color="green-7" />
                        </template>
                    </q-input>
                </q-card-section>

                <q-card-actions align="right" class="q-px-md q-pb-md">
                    <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
                    <q-btn label="Enviar Correo" :loading="cargando" color="green-8" unelevated icon="send"
                        @click="envioCorreo" />
                </q-card-actions>
            </q-card>
        </q-dialog>

    </q-layout>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { showNotify } from '../components/notify.js'
import { useQuasar } from 'quasar'

const router = useRouter()
const userStore = useUserStore()
const $q = useQuasar()

const identification = ref('')
const password = ref('')
let mail = ref('')
const showPassword = ref(false)
let loading = ref(false)
let cargando = ref(false)
const modalVisible = ref(false)

function openModal() {
    modalVisible.value = true
}

async function goHome() {
    loading.value = true
    if (identification.value === '') {
        showNotify('Digite el documento', 'negative')
        loading.value = false
        return
    }

    if (!password.value.trim()) {
        showNotify('Digite la Contraseña', 'negative')
        loading.value = false
        return
    }

    try {
        const { data, status } = await userStore.login(identification.value, password.value)

        if (status !== 200) {
            showNotify(data.msg, 'negative')
            loading.value = false
            return
        }

        // ✅ El usuario ya está guardado en el store y localStorage por la función login()
        console.log('✅ Login exitoso, usuario:', data.user)

        // ✅ Verificar que el usuario esté en localStorage
        const verificacion = $q.localStorage.getItem('user')
        console.log('🔍 Verificación en localStorage:', verificacion)

        if (!verificacion || !verificacion.role) {
            console.error('❌ Error: El usuario no está completo en localStorage')
            showNotify('Error al guardar sesión', 'negative')
            loading.value = false
            return
        }

        // ✅ Notificar éxito ANTES de navegar
        showNotify('Inicio de sesión exitoso', 'positive', 'check_circle')

        // ✅ Marcar que es un login real (no recarga)
        sessionStorage.setItem('justLoggedIn', '1')

        // ✅ Pequeña pausa para asegurar que todo se guardó
        await new Promise(resolve => setTimeout(resolve, 50))

        // ✅ Navegar a la ruta correcta
        await router.push('/layout/home')

    } catch (error) {
        console.error('❌ Error en login:', error)
        showNotify('Error al iniciar sesión', 'negative')
    } finally {
        loading.value = false
    }
}

// Resto de tu código sin cambios...
function validarHayCorreo() {
    const emailValido = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!mail.value.trim()) {
        $q.notify({
            message: 'Debe proporcionar el correo',
            color: 'negative',
            icon: 'warning',
            position: 'top',
            timeout: 3000
        })
    } else if (!emailValido.test(mail.value.trim())) {
        $q.notify({
            message: 'Digite un correo válido',
            color: 'negative',
            icon: 'warning',
            position: 'top',
            timeout: 3000
        })
    } else {
        return true
    }
}

async function envioCorreo() {
    if (validarHayCorreo() === true) {
        cargando.value = true
        try {
            let envio = await userStore.envioCorreo(mail.value)
            $q.notify({
                message: envio.data.msg,
                color: "positive",
                type: 'positive',
                position: 'bottom',
                timeout: 4500
            })
            modalVisible.value = false
            mail.value = ''
        } catch (error) {
            if (error.response && error.response.data.errors) {
                const faltaCorreo = error.response.data.errors[0].msg
                $q.notify({
                    message: faltaCorreo,
                    color: 'negative',
                    icon: 'warning',
                    position: 'top',
                    timeout: 3000
                })
            } else {
                $q.notify({
                    message: error.response.data,
                    color: 'negative',
                    icon: 'warning',
                    position: 'top',
                    timeout: 3000
                })
            }
        }
        cargando.value = false
    }
}
</script>

<style scoped>
/* Fondo con gradiente verde oscuro */
.login-bg {
    background: white;
    min-height: 100vh;
}

/* Contenedor centrado */
.login-wrapper {
    width: 420px;
    padding: 16px;
}

/* Card principal */
.login-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
}

/* Header de la card */
.login-header {
    background: rgb(46, 125, 50);
    padding: 28px 24px 20px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.login-header-accent {
    position: absolute;
    top: -30px;
    right: -30px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
}

.login-brand {
    margin: 0;
    font-size: 36px;
    font-weight: 800;
    color: white;
    letter-spacing: 6px;
    line-height: 1;
}

.login-brand-sub {
    margin: 6px 0 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 2px;
    text-transform: uppercase;
}

/* Logo y título */
.logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 24px 16px;
    background: #fff;
}

.logo-wrapper {
    width: 88px;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
}

.login-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1b5e20;
    letter-spacing: 0.5px;
}

.login-subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: #757575;
}

/* Inputs */
.login-input {
    border-radius: 8px;
}

/* Botón principal */
.login-btn {
    background-color: rgb(46, 125, 50);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 10px 0;
    transition: background-color 0.2s ease;
}

.login-btn:hover {
    background-color: #1b5e20;
}

/* Sección olvidé contraseña */
.forgot-section {
    text-align: center;
    padding: 10px 24px 22px;
    background: #fff;
}

#olvidar {
    cursor: pointer;
    color: rgb(5, 13, 255);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.3px;
    transition: opacity 0.2s;
}

#olvidar:hover {
    text-decoration: underline;
    opacity: 0.8;
}

/* Footer */
.login-footer {
    background-color: rgb(224, 224, 224);
    text-align: center;
}

.footer-text {
    font-size: 13px;
    color: #424242;
    padding: 14px 0;
    font-weight: 500;
}

/* Modal */
.modal-card {
    width: 420px;
    max-width: 95vw;
    border-radius: 12px;
    overflow: hidden;
}

/* Responsive */
@media screen and (max-width: 600px) {
    .login-wrapper {
        width: 100%;
        padding: 12px;
    }

    .login-card {
        border-radius: 12px;
    }
}
</style>