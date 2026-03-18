<template>
    <div>
        <h4 style="text-align: center;">Recuperación de contraseña</h4>
        <div style="display: grid;place-items: center;" class="q-pa-md row items-start q-gutter-md">
            <q-card white bordered id="card">
                <q-card-section class="q-gutter-md">
                    <p>Digite su nueva contraseña (debe contener mínimo 8 caracteres):</p>
                    <q-input filled v-model="contrasena1" color="primary" label="Nueva Contraseña*"
                        :type="isPwd ? 'password' : 'text'">
                        <template v-slot:append>
                            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                @click="isPwd = !isPwd" />
                        </template>
                    </q-input>

                    <q-input filled v-model="contrasena2" color="primary" label="Confirmar Contraseña*"
                        :type="isPwd2 ? 'password' : 'text'">
                        <template v-slot:append>
                            <q-icon :name="isPwd2 ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                @click="isPwd2 = !isPwd2" />
                        </template>
                    </q-input>
                </q-card-section>

                <q-card-actions align="center">
                    <div class="row">
                        <q-btn @click="cambioContrasena()" :loading="loading" label="Aceptar" color="primary" />
                    </div>
                </q-card-actions>
            </q-card>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user.js'
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

let isPwd = ref(true)
let isPwd2 = ref(true)

let contrasena1 = ref('')
let contrasena2 = ref('')
let loading = ref(false)
const router = useRouter();
const userStore = useUserStore()
const $q = useQuasar()

async function cambioContrasena() {
    const recuperacion = router.currentRoute.value.query.reset;
    loading.value = true
    if (contrasena1.value === "" || contrasena2.value === "") {
        $q.notify({
            message: "Complete todos los campos",
            color: "negative",
            icon: "warning",
            position: "top",
            timeout: 3000,
        });
    } else if (
        contrasena1.value !== contrasena2.value ||
        contrasena2.value !== contrasena1.value
    ) {
        $q.notify({
            message: "Las contraseñas no coinciden",
            color: "negative",
            icon: "warning",
            position: "top",
            timeout: 3000,
        });
    } else {
        try {
            if (!recuperacion) {
                $q.notify({
                    message: "Token de restablecimiento no disponible",
                    color: "negative",
                    icon: "warning",
                    position: "top",
                    timeout: 3000,
                });
            }
            let envio = await userStore.nuevaContrasena(
                contrasena2.value,
                recuperacion
            );
            $q.notify({
                message: envio.data.msg,
                color: "positive",
                icon: "check_circle",
                position: "bottom",
                timeout: 3000,
            });
            router.push("/")
        } catch (error) {
            if (error.response && error.response.data.errors) {

                const fallo = error.response.data.errors[0].msg

                $q.notify({
                    message: fallo,
                    color: 'negative',
                    icon: 'warning',
                    position: 'top',
                    timeout: 3000
                })
            }
            else {
                $q.notify({
                    message: error.response.data.msg,
                    color: "negative",
                    icon: "warning",
                    position: "top",
                    timeout: 3000,
                });
            }
            console.log(error);
        }
    }
    loading.value = false
}


</script>   