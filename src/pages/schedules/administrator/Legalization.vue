<template>
    <q-page class="q-pa-md">
        <div class="text-h4 text-center q-mb-md">Legalización</div>
        <div class="row justify-center q-pt-md">
            <div v-if="!showPreview" class="col-8 q-mt-md" style="width: 90%;">
                <!-- TABLA MIA -->
                <q-table class="my-sticky-header-table" :loading="cargando" :rows="rows" :columns="columns"
                    row-key="_id" :filter="filter">

                    <template v-slot:body-cell-opciones="props">
                        <q-td :props="props">
                            <q-icon @click="function () {
                                row = props.row
                                if (
                                    user?.role?.data == 'user' &&
                                    props.row.status &&
                                    [2, 3, 4].includes(props.row.status.index)
                                ) {
                                    cargarDatosPrevios(props.row)   // ✅ carga datos si fue rechazada
                                    showDialog = true
                                } else {
                                    if (user?.role?.data == 'administrator' && props.row.typeSchedule == 'commission') {
                                        showOther = true
                                    }
                                    showPreview = true
                                }
                            }" name="fa-solid fa-eye" size="20px" color="blue">
                                <q-tooltip>Ver y Firmar</q-tooltip>
                            </q-icon>
                        </q-td>
                    </template>

                    <template v-slot:top-right>
                        <q-input dense debounce="300" color="primary" v-model="filter" placeholder="Buscar">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>

                    <template v-slot:body-cell-name="props">
                        <q-td :props="props"
                            v-if="user?.role?.data !== 'user' && props.row.typeSchedule == 'contractor'">
                            <p v-text="props.row.contract.contractorName" class="q-my-none text-center" />
                        </q-td>
                        <q-td v-if="user?.role?.data == 'administrator' && props.row.typeSchedule == 'commission'"
                            :props="props">
                            <p v-text="props.row.contract.publicName" class="q-my-none text-center" />
                        </q-td>
                    </template>

                    <template v-slot:body-cell-typeSchedule="props">
                        <q-td :props="props">
                            <p v-if="[5, 6].includes(Number(props.row.status?.index))">
                                {{ props.row.typeSchedule === 'contractor' ? 'Contratista' : 'Funcionario' }}
                            </p>
                            <p v-else>-</p>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-route="props">
                        <q-td :props="props">
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
                        </q-td>
                    </template>

                    <template v-slot:body-cell-place="props">
                        <q-td :props="props">
                            <p v-if="props.row.place && props.row.place !== null" v-text="props.row.place || '-'"
                                class="q-my-none text-center" />
                            <div v-else class="row justify-center">
                                <div class="col-12">
                                    <p v-text="props.row.regional" class="q-my-none text-center" />
                                </div>
                                <div class="col-10">
                                    <p v-text="props.row.institute" class="q-my-none text-center" />
                                </div>
                            </div>
                            <p v-if="props.row.places && props.row.places.length !== 0 ? props.row.places[0] : ''"
                                v-text="props.row.places[0].data" class="q-my-none text-center" />
                        </q-td>
                    </template>

                    <template v-slot:body-cell-tripDate="props">
                        <q-td :props="props">
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
                        </q-td>
                    </template>

                    <template v-slot:body-cell-company="props">
                        <q-td key="company" :props="props">
                            <p v-if="props.row.company" v-text="props.row.company" class="q-my-none text-center" />
                            <p v-else-if="props.row.institutes && props.row.institutes.length !== 0"
                                v-text="props.row.institutes[0].data" class="q-my-none text-center" />
                            <p v-else class="q-my-none text-center">-</p>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-estado="props">
                        <q-td :props="props">
                            <span :class="{ 'text-red': props.row.status.data === 'Legalización Rechazada' }">
                                {{ props.row.status.data === 'Legalización Rechazada' ? 'Rechazada' :
                                    'Pendienteporcrear' }}
                            </span>
                        </q-td>
                    </template>

                </q-table>
                <!-- FIN TABLA MIA -->
            </div>

            <div v-show="showPreview" class="justify-end start q-mb-md" style="font-size: 12px;">
                <q-btn @click="descargarFormatoPDF" label="Descargar como PDF" icon="download"
                    class="bg-blue text-white" />
            </div>

            <div v-if="showPreview" class="col-8 justify-end flex q-mb-md">
                <q-btn @click="function () {
                    if (user?.role?.data == 'user' || row.typeSchedule == 'commission' && user?.role?.data !== 'administrator') {
                        showPreview = false
                        showOther = false
                        showDialog = true
                    } else {
                        showPreview = false
                        showOther = false
                    }
                }" label="Atrás" icon="fa-solid fa-arrow-left" color="negative" />
            </div>

            <div class="col-12" />

            <div v-if="showPreview">
                <div id="invoice" ref="invoice" style="margin: 0 auto;">
                    <!-- Contratista -->
                    <PreviewContratista v-if="!showOther && (
                        (user?.role?.data === 'user' && currentUser?.staffType?.data === 'contractor') ||
                        (user?.role?.data === 'supervisor' && row?.typeSchedule === 'contractor')
                    )" :row="row" />

                    <!-- Funcionario público -->
                    <PreviewFuncionario v-if="!showOther && !(
                        (user?.role?.data === 'user' && currentUser?.staffType?.data === 'contractor') ||
                        (user?.role?.data === 'supervisor' && row?.typeSchedule === 'contractor')
                    )" :row="row" />

                    <OtherPreview v-if="showOther" :row="row" />
                </div>
            </div>

            <div v-if="showPreview && user?.role?.data !== 'user' && user?.role?.data !== 'administrator' && row.typeSchedule !== 'commission'"
                class="col-8 q-my-md">
                <div v-if="!showReject" class="row justify-around">
                    <q-btn @click="justification = null; showReject = true" :disable='loading' icon="fa-solid fa-xmark"
                        color="negative" label="Rechazar" />
                    <q-btn @click="getSign()" :loading="loading" :disable='loading' icon="fa-solid fa-signature"
                        class="bg-primary text-white" label="Firmar" />
                </div>

                <div v-show="showReject" class="row">
                    <div class="col-12">
                        <q-input v-model="justification" filled autogrow stack-label label="Justificación" />
                    </div>
                    <div class="col-12 justify-around flex q-mt-md">
                        <q-btn @click="justification = null; showReject = false" :disable="loading" label="Cancelar"
                            color="negative" />
                        <q-btn @click="postReject()" :loading="loading" :disable="loading" label="Enviar"
                            class="bg-primary text-white" />
                    </div>
                </div>
            </div>

            <q-dialog v-model="showDialog" persistent>
                <q-card style="width: 700px; max-width: 95vw;">
                    <q-card-section class="justify-between flex bg-primary">
                        <p v-text="'Crear Legalización'" class="q-my-none text-white" style="font-size: 25px;" />
                        <q-btn @click="getPreview()" label="Vista Previa" icon="fa-solid fa-eye"
                            class="bg-white text-primary" />
                    </q-card-section>

                    <q-space />

                    <q-card-section v-if="row.status.index === 4 && row.status.justification">
                        <div class="row justify-center">
                            <div class="col-10 text-white">
                                <q-banner rounded class="bg-red">
                                    <template v-slot:default="scope">
                                        <div class="row">
                                            <div class="col-12">
                                                <p class="q-my-none items-center flex" style="font-size: 18px;">
                                                    <q-icon name="error_outline" size="24px" />Legalización Rechazada
                                                </p>
                                            </div>
                                            <div class="col-12">
                                                <p v-text="row.status.justification" class="q-my-none q-pa-sm" />
                                            </div>
                                        </div>
                                    </template>
                                </q-banner>
                            </div>
                        </div>
                    </q-card-section>

                    <q-card-section>
                        <div class="row">

                            <!-- Número de comisión para todos -->
                            <div class="col-12 q-mb-md">
                                <p class="q-my-none text-primary" style="font-size: 18px;">Número de Comisión</p>
                                <q-input v-model="tripOrder" label="Número de Comisión" filled dense required />
                            </div>

                            <div v-if="currentUser.staffType && currentUser.staffType.data == 'contractor'"
                                class="col-12">
                                <p class="q-my-none text-primary" style="font-size: 18px;">Resultados</p>
                            </div>

                            <div v-if="currentUser.staffType && currentUser.staffType.data == 'contractor'"
                                class="col-12">
                                <template v-for="(element, index) in results">
                                    <div class="row q-mt-sm">
                                        <div class="col-10 q-px-sm">
                                            <q-input v-model="element.data" filled stack-label autogrow
                                                label="Resultado" />
                                        </div>
                                        <div v-if="index !== 0" class="col-2 items-center flex">
                                            <q-btn @click="results.splice(index, 1)" dense label="Eliminar"
                                                color="negative" />
                                        </div>
                                        <div v-else class="col-2" />
                                    </div>
                                </template>
                                <div class="row justify-end q-mt-sm q-pr-md">
                                    <q-btn @click="results.push({})" label="+" sixe="sm" class="bg-primary text-white"
                                        style="font-size: 14px;" />
                                </div>
                            </div>

                            <!-- ===== EVIDENCIAS O SOPORTES (lógica original sin cambios) ===== -->
                            <div class="col-12 q-mt-md">
                                <p class="q-my-none text-primary" style="font-size: 18px;">Evidencias o Soportes</p>
                            </div>

                            <div class="col-12">
                                <div v-for="(element, index) in collections" class="row q-mt-md">
                                    <div class="col-10">
                                        <div class="row">
                                            <div class="col-12 q-pa-sm">
                                                <q-input v-model="element.name" filled stack-label label="Nombre" />
                                            </div>
                                            <div class="col-12 q-px-sm">
                                                <q-file :model-value="null" multiple filled stack-label label="Archivos"
                                                    accept="image/*"
                                                    @update:model-value="files => addFiles(index, files)">
                                                    <template v-slot:default>
                                                        <div v-if="element.items && element.items.length > 0"
                                                            class="row q-gutter-xs justify-start" @click.stop>
                                                            <q-chip v-for="(file, fi) in element.items" :key="fi" dense
                                                                removable icon="image" color="blue-1"
                                                                text-color="primary"
                                                                @remove="element.items.splice(fi, 1)">
                                                                {{ file?.name ?? (file?.url ? file.url.split('/').pop()
                                                                    : 'imagen') }}
                                                            </q-chip>
                                                        </div>
                                                        <div v-else
                                                            class="column items-center justify-center text-grey-4 full-width q-py-sm"
                                                            style="pointer-events: none;">
                                                            <q-icon name="add_photo_alternate" size="30px" />
                                                            <span style="font-size: 11px;" class="q-mt-xs">Haz clic para
                                                                agregar imágenes</span>
                                                        </div>
                                                    </template>
                                                </q-file>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="index !== 0" class="col-2 items-center flex">
                                        <q-btn @click="collections.splice(index, 1)" dense label="Eliminar"
                                            color="negative" />
                                    </div>
                                    <div v-else class="col-2"></div>
                                </div>

                                <div class="row justify-end q-mt-sm q-pr-md">
                                    <q-btn @click="collections.push({ name: '', items: [], keys: [] })" label="+"
                                        size="sm" class="bg-primary text-white" style="font-size: 14px;" />
                                </div>
                            </div>

                            <!-- ===== DOCUMENTOS DE SOPORTE ESPECÍFICOS (NUEVO) ===== -->
                            <div class="col-12 q-mt-lg">
                                <p class="q-my-none text-primary" style="font-size: 18px; font-weight: bold;">
                                    Documentos de Soporte
                                </p>
                                <q-separator class="q-mt-sm q-mb-md" />
                            </div>

                            <!-- 1. Autorización, Reconocimiento y Ordenación de Pago -->
                            <div class="col-12 q-mb-md">
                                <div class="row items-center q-pa-sm rounded-borders"
                                    style="background: #f5f5f5; border-left: 4px solid #19D27F;">
                                    <div class="col-12 q-mb-sm">
                                        <p class="q-my-none text-weight-bold" style="font-size: 14px; color: #19D254;">
                                            <q-icon name="description" size="18px" class="q-mr-xs" />
                                            1. Documento de Autorización, Reconocimiento y Ordenación de Pago
                                        </p>
                                    </div>
                                    <div class="col-12">
                                        <q-file v-model="soportes.autorizacionPago" filled dense label="Seleccionar PDF"
                                            clearable accept="application/pdf">
                                            <template v-slot:prepend>
                                                <q-icon name="picture_as_pdf" color="red" />
                                            </template>
                                            <template v-slot:append v-if="soportes.autorizacionPago">
                                                <q-icon name="check_circle" color="positive" />
                                            </template>
                                        </q-file>
                                    </div>
                                    <div v-if="soportes.autorizacionPago" class="col-12 q-mt-xs">
                                        <q-chip dense icon="insert_drive_file" color="blue-1" text-color="primary">
                                            {{ soportes.autorizacionPago.name }}
                                        </q-chip>
                                    </div>
                                </div>
                            </div>

                            <!-- 2. Compromiso Presupuestal -->
                            <div v-if="currentUser.staffType && currentUser.staffType.data == 'contractor'"
                                class="col-12 q-mb-md">
                                <div class="row items-center q-pa-sm rounded-borders"
                                    style="background: #f5f5f5; border-left: 4px solid #19D27F;">
                                    <div class="col-12 q-mb-sm">
                                        <p class="q-my-none text-weight-bold" style="font-size: 14px; color: #19D254;">
                                            <q-icon name="description" size="18px" class="q-mr-xs" />
                                            2. Compromiso Presupuestal
                                        </p>
                                    </div>
                                    <div class="col-12">
                                        <q-file v-model="soportes.compromisoPresupuestal" filled dense clearable
                                            label="Seleccionar PDF" accept="application/pdf">
                                            <template v-slot:prepend>
                                                <q-icon name="picture_as_pdf" color="red" />
                                            </template>
                                            <template v-slot:append v-if="soportes.compromisoPresupuestal">
                                                <q-icon name="check_circle" color="positive" />
                                            </template>
                                        </q-file>
                                    </div>
                                    <div v-if="soportes.compromisoPresupuestal" class="col-12 q-mt-xs">
                                        <q-chip dense icon="insert_drive_file" color="blue-1" text-color="primary">
                                            {{ soportes.compromisoPresupuestal.name }}
                                        </q-chip>
                                    </div>
                                </div>
                            </div>

                            <!-- 3. Asistencia de Formación -->
                            <div v-if="currentUser.staffType && currentUser.staffType.data == 'contractor'"
                                class="col-12 q-mb-md">
                                <div class="row items-center q-pa-sm rounded-borders"
                                    style="background: #f5f5f5; border-left: 4px solid #19D27F;">
                                    <div class="col-12 q-mb-sm">
                                        <p class="q-my-none text-weight-bold" style="font-size: 14px; color: #19D254;">
                                            <q-icon name="co_present" size="18px" class="q-mr-xs" />
                                            3. Asistencia de Formación
                                        </p>
                                    </div>
                                    <div class="col-12">
                                        <q-file v-model="soportes.asistenciaFormacion" filled dense clearable
                                            label="Seleccionar PDF" accept="application/pdf">
                                            <template v-slot:prepend>
                                                <q-icon name="picture_as_pdf" color="red" />
                                            </template>
                                            <template v-slot:append v-if="soportes.asistenciaFormacion">
                                                <q-icon name="check_circle" color="positive" />
                                            </template>
                                        </q-file>
                                    </div>
                                    <div v-if="soportes.asistenciaFormacion" class="col-12 q-mt-xs">
                                        <q-chip dense icon="insert_drive_file" color="blue-1" text-color="primary">
                                            {{ soportes.asistenciaFormacion.name }}
                                        </q-chip>
                                    </div>
                                </div>
                            </div>

                            <!-- 4. Tiquetes del Viaje -->
                            <div class="col-12 q-mb-md">
                                <div class="row items-center q-pa-sm rounded-borders"
                                    style="background: #f5f5f5; border-left: 4px solid #19D27F;">
                                    <div class="col-12 q-mb-sm">
                                        <p class="q-my-none text-weight-bold" style="font-size: 14px; color: #19D254;">
                                            <q-icon name="flight" size="18px" class="q-mr-xs" />
                                            4. Tiquetes del Viaje
                                        </p>
                                    </div>
                                    <div class="col-12">
                                        <q-file :model-value="soportes.tiquetes.length ? soportes.tiquetes : null"
                                            multiple filled dense clearable label="Seleccionar PDFs"
                                            accept="application/pdf" @update:model-value="files => {
                                                if (!files || (Array.isArray(files) && files.length === 0)) {
                                                    soportes.tiquetes = []
                                                } else {
                                                    const arr = Array.isArray(files) ? files : [files]
                                                    const nombres = soportes.tiquetes.map(f => f.name)
                                                    const nuevos = arr.filter(f => !nombres.includes(f.name))
                                                    soportes.tiquetes = [...soportes.tiquetes, ...nuevos]
                                                }
                                            }">
                                            <template v-slot:prepend>
                                                <q-icon name="picture_as_pdf" color="red" />
                                            </template>
                                        </q-file>
                                    </div>
                                    <div v-if="soportes.tiquetes.length > 0" class="col-12 q-mt-xs row q-gutter-xs">
                                        <q-chip v-for="(file, i) in soportes.tiquetes" :key="i" dense removable
                                            @remove="soportes.tiquetes = soportes.tiquetes.filter((_, idx) => idx !== i)"
                                            icon="picture_as_pdf" color="blue-1" text-color="primary">
                                            {{ file.name }}
                                        </q-chip>
                                    </div>
                                </div>
                            </div>

                            <!-- 5. Reintegros (Opcional) -->
                            <div class="col-12 q-mt-md">
                                <q-toggle v-model="mostrarReintegros" label="Agregar Reintegros (Opcional)"
                                    color="primary" />
                            </div>
                            <div v-if="mostrarReintegros" class="col-12 q-mb-md">
                                <div class="row items-center q-pa-sm rounded-borders"
                                    style="background: #f5f5f5; border-left: 4px solid #19D27F;">
                                    <div class="col-12 q-mb-sm">
                                        <p class="q-my-none text-weight-bold" style="font-size: 14px; color: #19D254;">
                                            <q-icon name="description" size="18px" class="q-mr-xs" />
                                            5. Reintegros
                                        </p>
                                    </div>
                                    <div class="col-12">
                                        <q-file v-model="soportes.reintegros" filled dense clearable
                                            label="Seleccionar PDF" accept="application/pdf">
                                            <template v-slot:prepend>
                                                <q-icon name="picture_as_pdf" color="red" />
                                            </template>
                                            <template v-slot:append v-if="soportes.reintegros">
                                                <q-icon name="check_circle" color="positive" />
                                            </template>
                                        </q-file>
                                    </div>
                                    <div v-if="soportes.reintegros" class="col-12 q-mt-xs">
                                        <q-chip dense icon="insert_drive_file" color="blue-1" text-color="primary">
                                            {{ soportes.reintegros.name }}
                                        </q-chip>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12 q-mt-sm">
                                <q-toggle v-model="mostrarInterveredal" label="Agregar Formato Interveredal (Opcional)"
                                    color="primary" />
                            </div>

                            <!-- 5. Formato intervereal-->
                            <div v-if="mostrarInterveredal" class="col-12 q-mb-md">
                                <div class="row items-center q-pa-sm rounded-borders"
                                    style="background: #f5f5f5; border-left: 4px solid #19D27F;">
                                    <div class="col-12 q-mb-sm">
                                        <p class="q-my-none text-weight-bold" style="font-size: 14px; color: #19D254;">
                                            <q-icon name="description" size="18px" class="q-mr-xs" />
                                            6. COMPROBANTE LEGALIZACION GASTOS TRANSPORTE INFORMAL - CONTRATISTAS
                                        </p>
                                    </div>
                                    <div class="col-12">
                                        <q-file v-model="soportes.interveredal" filled dense label="Seleccionar PDF"
                                            accept="application/pdf">
                                            <template v-slot:prepend>
                                                <q-icon name="picture_as_pdf" color="red" />
                                            </template>
                                            <template v-slot:append v-if="soportes.interveredal">
                                                <q-icon name="check_circle" color="positive" />
                                            </template>
                                        </q-file>
                                    </div>
                                    <div v-if="soportes.interveredal" class="col-12 q-mt-xs">
                                        <q-chip dense icon="insert_drive_file" color="blue-1" text-color="primary">
                                            {{ soportes.interveredal.name }}
                                        </q-chip>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- Conclusiones (sin cambios) -->
                        <div class="col-12 q-mt-md">
                            <p class="q-my-none text-primary" style="font-size: 18px;">Conclusiones</p>
                        </div>

                        <div class="col-12">
                            <template v-for="(element, index) in conclusions">
                                <div class="row q-mt-sm">
                                    <div class="col-10 q-px-sm">
                                        <q-input type="textarea" rows="3" v-model="element.data" filled stack-label
                                            label="Conclusión" />
                                    </div>
                                    <div v-if="index !== 0" class="col-2 items-center flex">
                                        <q-btn @click="conclusions.splice(index, 1)" dense label="Eliminar"
                                            color="negative" />
                                    </div>
                                </div>
                            </template>

                            <div class="row justify-end q-pr-md q-mt-sm">
                                <q-btn @click="conclusions.push({})" label="+" size="sm" class="bg-primary text-white"
                                    style="font-size: 14px;" />
                            </div>
                        </div>

                        <!-- Firma (sin cambios) -->
                        <div class="col-12 q-mt-md">
                            <p class="q-my-none text-primary" style="font-size: 18px;">Firma</p>
                        </div>

                        <div class="col-12 q-mt-sm">
                            <div class="row justify-center">
                                <div class="col-10" style="background-color: whitesmoke;">
                                    <p class="q-my-none q-pl-md q-pt-sm" style="font-size: 12px; color: grey;">Firma:
                                    </p>
                                </div>
                                <div class="col-10 q-pl-sm q-py-sm" style="background-color: whitesmoke;">
                                    <q-img v-if="sign.contractor || sign.publicWorker" fit="contain"
                                        :src="currentUser.staffType && currentUser.staffType.data == 'contractor' ? sign.contractor : sign.publicWorker"
                                        style="width: 200px; height: 80px;" />
                                    <p v-else class="q-my-none q-pl-xs" style="font-size: 12px; color: #aaa;">Sin firma
                                        cargada</p>
                                </div>
                                <div v-if="currentUser.staffType?.data === 'contractor'" class="col-10 q-pb-sm q-pr-sm"
                                    style="background-color: whitesmoke;">
                                    <q-file :model-value="signFile.contractor" filled dense clearable accept="image/*"
                                        label="Seleccionar imagen de firma" :disable="sign.contractor !== null"
                                        @update:model-value="onSignFileSelected">
                                        <template v-slot:prepend>
                                            <q-icon name="fa-solid fa-signature" />
                                        </template>
                                    </q-file>
                                </div>
                            </div>
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-actions class="justify-around">
                        <q-btn @click="cleanDialog(); yaFirmo = false" :disable="loading" label="Cerrar"
                            icon="fa-solid fa-xmark" color="negative" />
                        <q-btn @click="postLegalization()" icon="fa-solid fa-floppy-disk" :loading="loading"
                            :disable="yaFirmo === false" label="Guardar" class="bg-primary text-white" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </div>

        <q-page-sticky position="bottom-right" :offset="[20, 20]">
            <q-btn @click="recargar()" color="primary" fab icon="fa-solid fa-rotate-right">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    Recargar página
                </q-tooltip>
            </q-btn>
        </q-page-sticky>

        <div v-if="
            showPreview &&
            user?.role?.data?.toLowerCase() === 'supervisor' &&
            row?.legalization?.documents
        " class="col-12 q-mt-lg">
            <q-card class="q-pa-lg bg-grey-1">

                <div class="text-h6 text-primary q-mb-lg">
                    Documentos Enviados por el Contratista
                </div>

                <div class="row q-col-gutter-md">

                    <div v-for="file in allDocuments" :key="file._id || file.url" class="col-12 col-sm-6 col-md-3">
                        <q-card bordered flat class="q-hoverable full-height">

                            <q-card-section class="text-center">

                                <!-- Imagen -->
                                <template v-if="esImagen(getFileUrl(file))">
                                    <q-img :src="getFileUrl(file)" style="height:140px;border-radius:8px" fit="cover" />
                                </template>

                                <!-- PDF -->
                                <template v-else>
                                    <div class="flex flex-center" style="height:140px;">
                                        <q-icon name="picture_as_pdf" size="60px" color="red" />
                                    </div>
                                </template>

                                <!-- Nombre -->
                                <div class="text-body2 q-mt-sm ellipsis text-weight-medium">
                                    {{ file.public_id || 'Documento' }}
                                </div>

                                <!-- Tipo -->
                                <div class="text-caption text-primary">
                                    {{ formatearTitulo(file.tipo) }}
                                </div>

                            </q-card-section>

                            <q-separator />

                            <q-card-actions align="around">
                                <q-btn flat dense color="primary" icon="visibility" label="Ver"
                                    @click="abrirPreview(file)" />
                            </q-card-actions>

                        </q-card>
                    </div>

                </div>

            </q-card>
        </div>


        <q-dialog v-model="previewDialog" transition-show="scale" transition-hide="scale">
            <q-card style="
      width: 80vw;
      max-width: 1000px;
      height: 85vh;
      border-radius: 14px;
    ">

                <!-- Barra superior -->
                <q-bar class="bg-primary text-white">
                    <div class="ellipsis">
                        {{ previewTitle }}
                    </div>
                    <q-space />
                    <q-btn dense flat icon="close" v-close-popup />
                </q-bar>

                <!-- Contenido -->
                <q-card-section class="q-pa-none">
                    <div style="
          width: 100%;
          height: calc(85vh - 40px);
          overflow: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f5f5f5;
          padding: 20px;
        ">

                        <!-- Imagen -->
                        <img v-if="esImagen(previewUrl)" :src="previewUrl"
                            style="max-width: 100%; max-height: 100%; object-fit: contain" />

                        <!-- PDF -->
                        <iframe v-else :src="previewUrl" style="
            width: 100%;
            height: 100%;
            border: none;
            background: white;
            border-radius: 8px;
          " />

                    </div>
                </q-card-section>

            </q-card>
        </q-dialog>

    </q-page>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { useQuasar } from 'quasar'
import { showNotify } from '../../../components/notify.js'
import { useScheduleStore } from '../../../stores/schedule.js'
import { useUserStore } from '../../../stores/user.js'
import html2pdf from 'html2pdf.js'

import PreviewContratista from './Preview.vue'
import PreviewFuncionario from '../public/previewL.vue'


const allDocuments = computed(() => {
    const docs = row.value?.legalization?.documents
    if (!docs) return []

    const files = []

    Object.values(docs).forEach(value => {

        if (!value) return

        if (Array.isArray(value)) {
            value.forEach(file => {
                if (file?.url) {
                    files.push(file)
                }
            })
        }

        else if (typeof value === "object") {
            if (value.url) {
                files.push(value)
            }
        }

    })

    return files
})


let cargando = ref(false)
const loading = ref(false)
const invoice = ref(null)
const tripOrder = ref('')

// ===== NUEVO: Soportes específicos =====
const soportes = ref({
    reintegros: null,
    compromisoPresupuestal: null,
    autorizacionPago: null,
    asistenciaFormacion: null,
    interveredal: null,
    tiquetes: []
})
const documentosPrevios = ref({
    reintegros: null,
    compromisoPresupuestal: null,
    autorizacionPago: null,
    asistenciaFormacion: null,
    interveredal: null,
    tiquetes: []
})

// El usuario activa manualmente el formato interveredal
const mostrarInterveredal = ref(false)
const mostrarReintegros = ref(false)
// ===== FIN NUEVO =====

function recargar() {
    window.location.reload()
}

async function descargarFormatoPDF() {
    const notif = $q.notify({
        type: 'ongoing',
        message: 'Generando PDF...'
    })

    try {
        const elemento = invoice.value

        const logoBase64 = await fetch('/src/assets/sena-icono-nuevo.png')
            .then(r => r.blob())
            .then(blob => new Promise(resolve => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.readAsDataURL(blob)
            }))

        const opciones = {
            margin: [20, 10, 20, 10],
            filename: 'formatoLegalización.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                scrollY: -window.scrollY,
                logging: false
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            },
            pagebreak: {
                mode: ['css', 'legacy']
            }
        }

        const pdf = await html2pdf()
            .set(opciones)
            .from(elemento)
            .toPdf()
            .get('pdf')

        const totalPaginas = pdf.internal.getNumberOfPages()
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        for (let i = 1; i <= totalPaginas; i++) {
            pdf.setPage(i)

            pdf.addImage(logoBase64, 'PNG', (pageWidth / 2) - 7.5, 3, 15, 15)

            pdf.setFontSize(9)
            pdf.text('GTH-F-087 V.01', pageWidth / 2, pageHeight - 5, { align: 'center' })

            pdf.setDrawColor(0, 0, 0)
            pdf.setLineWidth(0.6)

            const topContentY = 20
            const bottomContentY = pageHeight - 20

            if (i > 1) pdf.line(10, topContentY, pageWidth - 10, topContentY)
            if (i < totalPaginas) pdf.line(10, bottomContentY, pageWidth - 10, bottomContentY)
        }

        pdf.save('formatoLegalización.pdf')

        notif({
            type: 'positive',
            message: 'Formato en PDF descargado',
            timeout: 1300
        })

    } catch (error) {
        console.error(error)
        notif({
            type: 'negative',
            message: 'Error al generar el PDF',
            timeout: 1300
        })
    }
}

onBeforeMount(function () {
    initData()
})

async function initData() {
    user.value = $q.localStorage.getItem('user')
    currentUser.value = await getUser(user.value.id)

    cargando.value = true

    if (user.value.role.data == 'user') {
        if (currentUser.value.staffType && currentUser.value.staffType.data == 'contractor') {
            const { data } = await scheduleStore.getSchedule()
            console.log("TODAS LAS AGENDAS:", data)
            console.log("MI USER:", currentUser.value._id)
            console.log("AGENDAS:", data)

            rows.value = data.filter(schedule => {
                console.log("Comparando:", schedule.contractor, currentUser.value._id)
                return (
                    schedule.contractor === currentUser.value._id &&
                    schedule.status &&
                    [2, 3, 4].includes(schedule.status.index)  // ✅ firmadas por supervisor, pendientes y rechazadas
                )
            })

            if (!columns.value.some(col => col.name === 'estado')) {
                columns.value.splice(4, 0, {
                    name: 'estado',
                    label: 'Estado',
                    align: 'center'
                })
            }
        } else {
            const { data } = await scheduleStore.getSchedule()
            rows.value = data.filter(schedule =>
                schedule.publicWorker === currentUser.value._id &&
                schedule.status &&
                [2, 3, 4].includes(schedule.status.index)
            )
        }
    }

    if (user.value.role.data == 'supervisor') {
        const { data } = await scheduleStore.getScheduleParams(user.value.id, {
            supervisor: true,
            legalization: true
        })

        rows.value = data.filter(schedule =>
            schedule.status?.index === 5
        )

        if (!columns.value.some(col => col.name === 'name')) {
            columns.value.unshift({
                name: 'name',
                label: 'Nombres y Apellidos',
                align: 'center'
            })
        }
    }

    if (user.value.role.data == 'administrator') {
        const { data } = await scheduleStore.getSchedule({
            legalization: true
        })

        if (!columns.value.some(col => col.name === 'name')) {
            columns.value.unshift(
                { name: 'name', label: 'Nombres y Apellidos', align: 'center' },
                { name: 'typeSchedule', label: 'Tipo de Agenda', align: 'center' }
            )
        }

        rows.value = data.filter(schedule =>
            schedule.status?.index < 6
        )

        rows.value.reverse()
    }

    cargando.value = false
}

async function getUser(id) {
    const { data } = await userStore.getUserParams(id)
    return data
}

const collectionsOriginal = ref([])


function getPreview() {
    console.log('staffType:', currentUser.value?.staffType?.data)
    console.log('role:', currentUser.value?.role?.data)

    // ✅ Siempre guardar los Files originales ANTES de convertir a blob URLs
    collectionsOriginal.value = collections.value.map(col => ({
        ...col,
        items: [...(col.items || [])]
    }))

    const documentosTemporales = {
        reintegros: soportes.value.reintegros
            ? [{ url: URL.createObjectURL(soportes.value.reintegros) }]
            : null,

        compromisoPresupuestal: soportes.value.compromisoPresupuestal
            ? [{ url: URL.createObjectURL(soportes.value.compromisoPresupuestal) }]
            : null,

        autorizacionPago: soportes.value.autorizacionPago
            ? [{ url: URL.createObjectURL(soportes.value.autorizacionPago) }]
            : null,

        asistenciaFormacion: soportes.value.asistenciaFormacion
            ? [{ url: URL.createObjectURL(soportes.value.asistenciaFormacion) }]
            : null,

        interveredal: soportes.value.interveredal
            ? [{ url: URL.createObjectURL(soportes.value.interveredal) }]
            : null,

        tiquetes: (soportes.value.tiquetes || []).map(file => ({
            url: URL.createObjectURL(file)
        }))
    }

    row.value = {
        ...row.value,
        collections: collections.value.map(col => ({
            ...col,
            items: (col.items || []).map(file => {
                if (file instanceof File) {
                    return { url: URL.createObjectURL(file) }
                }
                return file?.url ? file : { url: String(file) }
            })
        })),
        conclusions: [...conclusions.value],
        results: [...results.value],
        tripOrder: tripOrder.value,
        legalization: {
            ...row.value.legalization,
            signature: { ...sign.value },
            documents: {
                ...row.value?.legalization?.documents,
                ...documentosTemporales
            }
        }

    }

    if (
        currentUser.value?.staffType?.data !== 'contractor' &&
        currentUser.value?.role?.data !== 'user' &&
        currentUser.value?.role?.data !== 'supervisor'
    ) {
        showOther.value = true
    }

    showDialog.value = false
    showPreview.value = true
}

async function getSchedule() {
    const { data } = await scheduleStore.getScheduleParams(user.value.id, {
        supervisor: true,
        legalization: true
    })
    return data
}

const $q = useQuasar()
const user = ref(null)
const currentUser = ref(null)
const scheduleStore = useScheduleStore()
const userStore = useUserStore()
const showPreview = ref(false)
const showOther = ref(false)
const showReject = ref(false)
const rows = ref([])
let filter = ref('')
const row = ref(null)
let yaFirmo = ref(false)

// ===== PREVIEW PROFESIONAL =====
const previewDialog = ref(false)
const previewUrl = ref('')
const previewTitle = ref('')


import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

const abrirPreview = async (file) => {
    const url = getFileUrl(file)

    // Si es imagen no necesitas axios
    if (esImagen(url)) {
        previewUrl.value = url
        previewTitle.value = file.public_id || 'Vista previa'
        previewDialog.value = true
        return
    }

    // Si es PDF
    try {
        const token = $q.localStorage.getItem('token')

        const response = await axios.get(url, {
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const blob = new Blob([response.data], { type: 'application/pdf' })
        previewUrl.value = URL.createObjectURL(blob)
        previewTitle.value = file.public_id || 'Vista previa'
        previewDialog.value = true

    } catch (error) {
        console.error(error)
    }
}

function esImagen(url) {
    return /\.(jpg|jpeg|png|webp)$/i.test(url)
}

function getFileUrl(file) {
    if (!file?.url) return ''

    return file.url.startsWith('http')
        ? file.url
        : `${BASE_URL}${file.url}`
}


function formatearTitulo(key) {
    const nombres = {
        reintegros: 'Reintegros',
        compromisoPresupuestal: 'Compromiso Presupuestal',
        autorizacionPago: 'Autorización de Pago',
        asistenciaFormacion: 'Asistencia Formación',
        tiquetes: 'Tiquetes',
        interveredal: 'Interveredal'
    }

    return nombres[key] || key
}


const columns = ref([
    { name: 'route', label: 'Ruta', align: 'center', style: 'width: 300px' },
    { name: 'place', field: "regional", label: 'Lugar Desplazamiento', align: 'center' },
    { name: 'company', label: 'Entidad o Empresa', align: 'center', field: "company" },
    { name: 'tripDate', label: 'Fecha Desplazamiento', align: 'center' },
    { name: 'opciones', field: 'opciones', label: 'Acciones', align: 'center' }
])

function validarFormulario() {
    const esContratista = currentUser.value?.staffType?.data === 'contractor'
    const errores = []

    if (!tripOrder.value?.trim()) {
        errores.push('El número de comisión es obligatorio.')
    }

    if (esContratista && !results.value.some(r => r.data?.trim())) {
        errores.push('Debe ingresar al menos un resultado.')
    }

    const tieneAutorizacion = soportes.value.autorizacionPago instanceof File
        || documentosPrevios.value.autorizacionPago?.length > 0
    if (!tieneAutorizacion) {
        errores.push('El documento de Autorización de Pago es obligatorio.')
    }

    const tieneAsistencia = soportes.value.asistenciaFormacion instanceof File
        || documentosPrevios.value.asistenciaFormacion?.length > 0
    if (esContratista && !tieneAsistencia) {
        errores.push('El documento de Asistencia de Formación es obligatorio.')
    }

    const tieneTiquetes = soportes.value.tiquetes.length > 0
        || documentosPrevios.value.tiquetes?.length > 0
    if (!tieneTiquetes) {
        errores.push('Debe adjuntar al menos un tiquete del viaje.')
    }

    if (!conclusions.value.some(c => c.data?.trim())) {
        errores.push('Debe ingresar al menos una conclusión.')
    }

    if (errores.length > 0) {
        errores.forEach(msg => showNotify(msg, 'negative', 'warning'))
        return false
    }

    return true
}

async function postLegalization() {
    if (!validarFormulario()) return

    loading.value = true

    // Si no pasó por getPreview(), usar collections directamente
    if (collectionsOriginal.value.length === 0) {
        collectionsOriginal.value = collections.value.map(col => ({
            ...col,
            items: [...(col.items || [])]
        }))
    }

    const formData = new FormData()

    collectionsOriginal.value.forEach(col => { col.keys = [] })

    collectionsOriginal.value.forEach((collection, i) => {
        ; (collection.items || []).forEach((file, j) => {
            if (file instanceof File) {
                const key = `file_${i}_${j}`
                formData.append(key, file)
                collection.keys.push(key)
            }
        })
    })

    if (soportes.value.reintegros instanceof File)
        formData.append('reintegros', soportes.value.reintegros)
    if (soportes.value.compromisoPresupuestal instanceof File)
        formData.append('compromisoPresupuestal', soportes.value.compromisoPresupuestal)
    if (soportes.value.autorizacionPago instanceof File)
        formData.append('autorizacionPago', soportes.value.autorizacionPago)
    if (soportes.value.asistenciaFormacion instanceof File)
        formData.append('asistenciaFormacion', soportes.value.asistenciaFormacion)
    if (soportes.value.interveredal instanceof File)
        formData.append('interveredal', soportes.value.interveredal)

            ; (soportes.value.tiquetes || []).forEach((file) => {
                if (file instanceof File) formData.append('tiquetes', file)
            })

    if (signFile.value.contractor instanceof File)
        formData.append('signatureContractor', signFile.value.contractor)
    if (signFile.value.publicWorker instanceof File)
        formData.append('signaturePublicWorker', signFile.value.publicWorker)

    // Enviar metadata de collections al backend
    const collectionsParaBackend = collectionsOriginal.value.map(col => ({
        name: col.name,
        keys: col.keys
    }))
    formData.append('collections', JSON.stringify(collectionsParaBackend))

    // Subir archivos si hay
    let documentosSubidos = null

    const hasFiles = [...formData.keys()].length > 0
    if (hasFiles) {
        const response = await scheduleStore.postLegalization(formData, row.value._id)
        documentosSubidos = response?.data?.legalizationDocuments || null
    }

    const signatureGuardada = {
        contractor: documentosSubidos?.signatureContractor?.[0]?.url ?? sign.value.contractor,
        publicWorker: documentosSubidos?.signaturePublicWorker?.[0]?.url ?? sign.value.publicWorker
    }

    // ✅ Construir payload para el PUT
    const payload = {
        userId: currentUser.value._id,
        tripOrder: tripOrder.value,
        results: results.value,
        conclusions: conclusions.value,
        legalization: {
            signature: signatureGuardada,
            ...(documentosSubidos && { documents: documentosSubidos })
        }
    }

    // ✅ Solo mandar collections en el PUT si NO hubo archivos
    // Si hubo POST, el backend ya guardó los items — no sobreescribir
    if (!hasFiles) {
        payload.collections = collectionsOriginal.value.map(col => ({
            name: col.name,
            items: (col.items || []).filter(f => !(f instanceof File)),
            keys: []
        }))
    }

    if (mostrarInterveredal.value) {
        payload.interveredal = true
    }

    payload.status = currentUser.value.staffType?.data === 'contractor'
        ? {
            data: sign.value.contractor !== null
                ? 'Legalización firmada por Contratista'
                : 'Agenda en Proceso de Legalización',
            index: sign.value.contractor !== null ? 5 : 4,
            number: 2,
            justification: null
        }
        : {
            data: 'Legalización firmada por Supervisor',
            index: 6,
            number: 2,
            justification: null
        }

    await scheduleStore.putLegalization(payload, row.value._id)

    const { data: updated } = await scheduleStore.getScheduleById(row.value._id)
    row.value = updated

    showNotify(
        payload.status.index >= 5 ? 'Legalización firmada' : 'Legalización creada',
        'positive',
        'check_circle'
    )

    await cleanDialog()
}

function onSignFileSelected(file) {
    if (!file) return
    const isContractor = currentUser.value.staffType?.data === 'contractor'
    if (isContractor) {
        signFile.value.contractor = file
        sign.value.contractor = URL.createObjectURL(file)
    } else {
        signFile.value.publicWorker = file
        sign.value.publicWorker = URL.createObjectURL(file)
    }
    yaFirmo.value = true
}

async function getSign() {
    if (user.value.role.data == 'supervisor' && row.value.typeSchedule !== 'commission') {
        loading.value = true

        const { data } = await userStore.getUserParams(user.value.id)

        await scheduleStore.putLegalization({
            status: {
                data: 'Legalización firmada por Supervisor',
                index: 6,
                justification: null,
                number: 1
            },
            legalization: {
                signature: {
                    supervisor: data.sign.url
                }
            }
        }, row.value._id)

        loading.value = false
        rows.value = await getSchedule()
        showNotify('Legalización firmada', 'positive', 'check_circle')
        showPreview.value = false
    }
}

const sign = ref({
    contractor: null,
    publicWorker: null,
    supervisor: null
})

const signFile = ref({
    contractor: null,
    publicWorker: null
})

const showDialog = ref(false)

async function cleanDialog() {
    results.value = [{ data: '' }]
    collections.value = [{ name: '', items: [], keys: [] }]
    conclusions.value = [{ data: '' }]
    sign.value = { contractor: null, publicWorker: null }
    signFile.value = { contractor: null, publicWorker: null }
    tripOrder.value = ''

    collectionsOriginal.value = []

    // ===== NUEVO: limpiar soportes =====
    soportes.value = {
        reintegros: null,
        compromisoPresupuestal: null,
        autorizacionPago: null,
        asistenciaFormacion: null,
        interveredal: null,
        tiquetes: []
    }


    if (currentUser.value && currentUser.value.staffType) {
        const { data } = await scheduleStore.getScheduleParams(
            user.value.id,
            currentUser.value.staffType.data == 'contractor'
                ? { contractor: true, legalization: true }
                : { publicWorker: true, legalization: true }
        )
        // ✅ filtrar igual que en initData
        rows.value = currentUser.value.staffType.data == 'contractor'
            ? data.filter(s => s.contractor === currentUser.value._id && [2, 3, 4].includes(s.status?.index))
            : data
    } else {
        rows.value = await getSchedule()
    }

    loading.value = false
    showDialog.value = false
    row.value = null
}

async function postReject() {
    loading.value = true

    if (!justification.value) {
        showNotify('Proporcione una justificación', 'negative')
    } else {
        await scheduleStore.putLegalization({
            userId: currentUser.value._id,
            status: {
                data: 'Legalización Rechazada',
                index: 4,
                number: 3,
                justification: justification.value ? justification.value : '-'
            },
            legalization: {
                signature: {
                    contractor: null
                }
            }
        }, row.value._id)

        showNotify('Legalización rechazada', 'info', 'info')
        rows.value = await getSchedule()
        loading.value = false
        showPreview.value = false
        justification.value = ''
    }
    loading.value = false
}

function addFiles(index, files) {
    if (!files) return
    const nuevos = Array.isArray(files) ? files : [files]
    const actuales = collections.value[index].items || []
    collections.value[index].items = [...actuales, ...nuevos]
}

const justification = ref(null)
const results = ref([{ data: '' }])
const collections = ref([{ name: '', items: [], keys: [] }])
const conclusions = ref([{ data: '' }])


function cargarDatosPrevios(scheduleRow) {
    // Para funcionario: tomar firma directamente de la agenda
    if (currentUser.value?.staffType?.data !== 'contractor') {
        const firmaAgenda = scheduleRow.signature?.publicWorker
        if (firmaAgenda) {
            sign.value.publicWorker = firmaAgenda
            yaFirmo.value = true
        }
    }

    if (scheduleRow.status?.index === 4) {
        tripOrder.value = scheduleRow.tripOrder || ''
        results.value = scheduleRow.results?.length
            ? scheduleRow.results
            : [{ data: '' }]
        conclusions.value = scheduleRow.conclusions?.length
            ? scheduleRow.conclusions
            : [{ data: '' }]

        // Cargar collections con los items ya guardados (URLs del servidor)
        collections.value = scheduleRow.collections?.length
            ? scheduleRow.collections.map(col => ({
                ...col,
                items: (col.items || []).filter(item => item?.url), // solo los ya subidos
                keys: []
            }))
            : [{ name: '', items: [], keys: [] }]

        // Cargar documentos específicos ya subidos como referencia visual
        const docs = scheduleRow.legalization?.documents || {}

        // Guardar en una ref aparte para mostrarlos en el dialog
        documentosPrevios.value = {
            reintegros: docs.reintegros || null,
            compromisoPresupuestal: docs.compromisoPresupuestal || null,
            autorizacionPago: docs.autorizacionPago || null,
            asistenciaFormacion: docs.asistenciaFormacion || null,
            interveredal: docs.interveredal || null,
            tiquetes: Array.isArray(docs.tiquetes) ? docs.tiquetes : []
        }
    }
}
</script>

<style scoped>
#invoice {
    font-family: Arial, sans-serif;
    word-spacing: 1px;
}
</style>