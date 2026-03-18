<template>
    <q-page class="q-pa-md">
        <div class="text-h4 text-center q-mb-md">Histórico</div>
        <div class="row justify-center q-pt-md">
            <div class="col-8 q-mt-md" style="width: 90%;">
                <q-table :loading="cargando" class="my-sticky-header-table" :columns="columns" :rows="rows">
                    <template v-slot:body-cell-route="props">
                        <td :props="props">
                            <div class="row">
                                <div class="col-12">
                                    <p v-text="`Ida: ${props.row.route.go[0].data} - ${props.row.route.go[props.row.route.go.length - 1].data}`"
                                        class="q-my-none text-center" />
                                </div>
                                <div class="col-12">
                                    <p v-text="`Regreso: ${props.row.route.return[0].data} - ${props.row.route.return[props.row.route.return.length - 1].data}`"
                                        class="q-my-none text-center" />
                                </div>
                            </div>
                        </td>
                    </template>
                    <template v-slot:body-cell-place="props">
                        <td :props="props">
                            <p v-if="props.row.place !== null" class="q-my-none text-center" v-text="props.row.place" />
                            <p v-if="props.row.places && props.row.places.length !== 0"
                                v-text="props.row.places[0].data" class="q-my-none text-center" />
                            <div v-else class="row justify-center">
                                <div class="col-12">
                                    <p class="q-my-none text-center" v-text="props.row.regional" />
                                </div>
                                <div class="col-10">
                                    <p class="q-my-none text-center" v-text="props.row.institute" />
                                </div>
                            </div>
                        </td>
                    </template>

                    <template v-slot:body-cell-company="props">
                        <td :props="props">
                            <p v-if="props.row.company && props.row.company.length !== 0" v-text="props.row.company"
                                class="q-my-none text-center" />
                            <p v-else-if="props.row.institutes && props.row.institutes.length !== 0"
                                v-text="props.row.institutes[0].data" class="q-my-none text-center" />
                            <p v-else class="q-my-none text-center">-</p>
                        </td>
                    </template>

                    <template v-slot:body-cell-tripDate="props">
                        <td :props="props">
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
                        </td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                        <td class="text-center">
                            <q-btn color="primary" icon="fa-solid fa-eye" dense round @click="verFormato(props.row)">
                                <q-tooltip>Ver formato</q-tooltip>
                            </q-btn>
                        </td>
                    </template>





                </q-table>
            </div>
        </div>

        <q-dialog v-model="showFormato" persistent>
            <q-card style="min-width: 70vw; max-width: 90vw;">
                <q-card-section class="row items-center">
                    <div class="text-h6">Legalización</div>
                    <q-space />

                    <!-- BOTÓN PDF -->
                    <q-btn v-if="agendaSeleccionada" icon="picture_as_pdf" color="red" flat dense @click="descargarPDF">
                        <q-tooltip>Descargar PDF</q-tooltip>
                    </q-btn>

                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>


                <q-separator />

                <q-card-section v-show="agendaSeleccionada">
                    <div id="formato-pdf">
                        <component :is="previewComponent" v-if="previewComponent" :row="agendaSeleccionada" />
                    </div>
                </q-card-section>


            </q-card>
        </q-dialog>

        <q-page-sticky position="bottom-right" :offset="[20, 20]">
            <q-btn @click="recargar()" color="primary" fab icon="fa-solid fa-rotate-right">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    Recargar página
                </q-tooltip>
            </q-btn>
        </q-page-sticky>
    </q-page>
</template>

<script setup>

import { ref, onBeforeMount, nextTick, computed } from 'vue'

import { useQuasar, } from 'quasar'

import { useScheduleStore } from '../../stores/schedule.js'

import { useUserStore } from '../../stores/user.js'

import PreviewLegalizacionAdmin from '../schedules/administrator/Preview.vue'
import PreviewAgendaFuncionario from '../schedules/public/Preview.vue'

import html2canvas from 'html2canvas'

import { jsPDF } from "jspdf";

const previewComponent = computed(() => {
    if (!currentUser.value) return null

    // 🧑‍💼 CONTRATISTA
    if (currentUser.value.staffType?.data === 'contractor') {
        return PreviewLegalizacionAdmin
    }

    // 👨‍💼 FUNCIONARIO (commission)
    return PreviewAgendaFuncionario
})

const $q = useQuasar()

const scheduleStore = useScheduleStore()

const userStore = useUserStore()

let cargando = ref(false)

function recargar() {
    window.location.reload()
}
onBeforeMount(async function () {

    const user = $q.localStorage.getItem('user')

    currentUser.value = await getUser(user.id)

    cargando.value = true

    // ✅ AQUÍ VA EL IF DEL SUPERVISOR
    if (user.role.data === 'supervisor') {

        // ➕ agregar columna acciones
        columns.value.push({
            name: 'actions',
            label: 'Acciones',
            align: 'center'
        })

        const { data } = await scheduleStore.getScheduleParams(user.id, {
            supervisor: true,
            historical: true
        })

        rows.value = data

    } else if (user.role.data === 'user') {

        if (currentUser.value.staffType.data === 'contractor') {

            const { data } = await scheduleStore.getScheduleParams(user.id, {
                contractor: true,
                historical: true
            })

            rows.value = data

        } else {

            const { data } = await scheduleStore.getSchedule({
                publicWorker: user.id
            })

            rows.value = data.filter(
                agenda =>
                    agenda.status?.number === 1 &&
                    agenda.status?.data === 'Agenda firmada por Funcionario'
            )



            console.log(
                data.map(a => ({
                    id: a._id,
                    status: a.status
                }))
            )

        }
    }

    cargando.value = false
})


async function getUser(id) {
    const { data } = await userStore.getUserParams(id)

    return data
}

const currentUser = ref(null)

const columns = ref([
    {
        name: 'route',
        label: 'Ruta',
        align: 'center',
        style: 'width: 300px'
    },
    {
        name: 'place',
        label: 'Lugar Desplazamiento',
        align: 'center'
    },
    {
        name: 'company',
        label: 'Entidad o Empresa',
        align: 'center'
    },
    {
        name: 'tripDate',
        label: 'Fecha Desplazamiento',
        align: 'center'
    },
    {
        name: 'status',
        label: 'Estado',
        align: 'center',
        field: row => row.status.data
    },
    {
        name: 'actions',
        label: 'Acciones',
        align: 'center'
    }
])




const rows = ref([])

const showFormato = ref(false)
const agendaSeleccionada = ref(null)

function verFormato(row) {
    console.log('Agenda seleccionada:', row)
    agendaSeleccionada.value = row
    showFormato.value = true
}

const descargarPDF = async () => {
    await nextTick()

    const element = document.getElementById('formato-pdf')
    if (!element) return

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')

    const margin = 5
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgHeight = (canvas.height * pageWidth) / canvas.width

    let heightLeft = imgHeight
    let position = margin

    pdf.addImage(imgData, 'PNG', margin, position, pageWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
        pdf.addPage()
        position = heightLeft - imgHeight + margin
        pdf.addImage(imgData, 'PNG', margin, position, pageWidth, imgHeight)
        heightLeft -= pageHeight
    }

    pdf.save(`legalizacion-${agendaSeleccionada.value._id}.pdf`)
}


</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  max-height: 73vh

  .q-table__top,
  .q-table__bottom,

  thead tr:first-child th
    /* bg color is important for th; just specify one */

  thead tr th
    position: sticky
    z-index: 1
    background-color: white
    font-weight: bold
    font-size: 13px /* Font size for table headers */
    text-align: center /* Center-align text in table headers */

  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
    cursor: pointer
</style>
