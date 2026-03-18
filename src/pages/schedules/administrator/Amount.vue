<template>
    <q-page class="q-pa-md">
        <div class="text-h5 q-mb-md text-center">CONTROL DE VALORES</div>

        <!-- Cards by type -->
        <div class="row q-col-gutter-md justify-center">
            <div class="col-12 col-sm-6 col-md-4" v-for="card in cards" :key="card.type">
                <q-card class="nav-card cursor-pointer" :class="`bg-${card.color}`" @click="openDialog(card.type)">
                    <q-card-section class="text-center text-white q-py-lg">
                        <q-icon :name="card.icon" size="56px" class="q-mb-sm" />
                        <div class="text-h6 text-weight-bold">{{ card.label }}</div>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <!-- Dialog -->
        <q-dialog v-model="dialog">
            <q-card style="width: 900px; max-width: 95vw">
                <q-card-section class="row items-center">
                    <div class="text-h6">{{ dialogTitle }}</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <q-table :rows="rows" :columns="columns" row-key="_id" :filter="filter"
                        :filter-method="customFilter" flat bordered>

                        <!-- 🔍 BUSCADOR A LA IZQUIERDA -->
                        <template v-slot:top-left>
                            <q-input dense outlined debounce="300" v-model="filter"
                                placeholder="Buscar por nombre, valor o dependencia" clearable style="width: 280px">
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>
                        </template>

                        <!-- ➕ BOTÓN A LA DERECHA -->
                        <template v-slot:top-right>
                            <q-btn label="Agregar" color="primary" @click="openForm" />
                        </template>

                        <!-- ✏️ ACCIONES -->
                        <template v-slot:body-cell-actions="props">
                            <q-td align="center">
                                <q-btn dense flat icon="edit" color="primary" @click="editRow(props.row)" />
                            </q-td>
                        </template>

                    </q-table>

                </q-card-section>

                <q-separator />

                <q-card-actions align="right">
                    <q-btn flat label="Close" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>

    <q-dialog v-model="formDialog" persistent>
        <q-card style="min-width: 400px">
            <q-card-section>
                <div class="text-h6">
                    {{ isEdit ? 'Editar Monto' : 'Agregar Monto' }}
                </div>
            </q-card-section>

            <q-card-section class="q-gutter-md">
                <q-input v-model="form.name" label="Nombre" outlined />
                <q-input v-model.number="form.amount" label="Valor" type="number" outlined />
                <q-input v-model="form.dependency" label="Dependencia" outlined />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancelar" v-close-popup />
                <q-btn color="primary" label="Guardar" @click="saveForm" />
            </q-card-actions>
        </q-card>
    </q-dialog>

</template>

<script setup>
import { ref, computed, } from 'vue'
import { Notify } from 'quasar'
import { useAmountStore } from '../../../stores/Amount.js'

const amountStore = useAmountStore()

const dialog = ref(false)
const currentType = ref(null)

const formDialog = ref(false)
const isEdit = ref(false)

const form = ref({
    _id: null,
    name: '',
    amount: null,
    dependency: '',
    type: ''
})

const filter = ref('')



/* ===============================
   CARDS
================================ */
const cards = [
    { type: 'aerea', label: 'VIA - AÉREA', icon: 'flight', color: 'green-7' },
    { type: 'terrestres', label: 'VIA - TERRESTRE', icon: 'directions_car', color: 'green-7' },
    { type: 'cdp', label: 'CDP', icon: 'account_balance', color: 'green-7' }
]

/* ===============================
   TABLA
================================ */
const columns = [
    { name: 'name', label: 'Nombre', field: 'name', align: 'center' },
    { name: 'amount', label: 'Valor', field: 'amount', align: 'center' },
    { name: 'dependency', label: 'Dependencia', field: 'dependency', align: 'center' },
    { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]


/* ===============================
   FILTRADO POR TIPO
================================ */
const rows = computed(() =>
    amountStore.amounts.filter(a => a.type === currentType.value)
)

const dialogTitle = computed(() => {
    const found = cards.find(c => c.type === currentType.value)
    return found ? found.label : ''
})

/* ===============================
   ACTIONS
================================ */
const openDialog = async (type) => {
    currentType.value = type
    dialog.value = true

    // 🔥 Carga desde backend filtrando por tipo
    await amountStore.fetchAmounts(type)
}


/* ===============================
   FUNCIONES
================================ */
const openForm = () => {
    isEdit.value = false
    form.value = {
        _id: null,
        name: '',
        amount: null,
        dependency: '',
        type: currentType.value
    }

    formDialog.value = true

    Notify.create({
        color: 'info',
        message: 'Completa la información del monto'
    })
}


const editRow = (row) => {
    isEdit.value = true
    form.value = { ...row }
    formDialog.value = true

    Notify.create({
        color: 'warning',
        message: 'Editando monto'
    })
}


const saveForm = async () => {
    try {
        if (isEdit.value) {
            await amountStore.updateAmount(form.value._id, form.value)

            Notify.create({
                type: 'positive',
                message: 'Monto actualizado correctamente'
            })
        } else {
            await amountStore.createAmount(form.value)

            Notify.create({
                type: 'positive',
                message: 'Monto creado correctamente'
            })
        }

        formDialog.value = false
        await amountStore.fetchAmounts(currentType.value)

    } catch (error) {
        Notify.create({
            type: 'negative',
            message:
                error?.response?.data?.message ||
                'Ocurrió un error al guardar el monto'
        })
    }
}

const customFilter = (rows, terms) => {
    const search = terms.toLowerCase()

    return rows.filter(row =>
        row.name?.toLowerCase().includes(search) ||
        row.dependency?.toLowerCase().includes(search) ||
        String(row.amount).includes(search)
    )
}


</script>

<style scoped>
.nav-card {
    transition: transform 0.2s, box-shadow 0.2s;
    border-radius: 12px;
}

.nav-card:hover {
    transform: scale(1.04);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
</style>
