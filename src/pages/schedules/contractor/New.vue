<template>
    <q-page class="q-pa-md">
        <div class="text-h4 text-center q-mb-md">Agendas</div>
        <q-banner v-if="presupuestoAgotado" rounded class="bg-negative text-white q-mb-md">
            <template #avatar>
                <q-icon name="block" size="md" />
            </template>
            El presupuesto está <strong>agotado</strong>. No se pueden crear más agendas.
        </q-banner>

        <div class="row justify-center q-pt-md">
            <div v-show="!showPreview" class="col-8 q-mt-md" style="width: 90%;">
                <!-- TABLA MIA -->
                <q-table class="my-sticky-header-table" :loading="cargando" :rows="rows" :columns="columns"
                    row-key="name" :filter="filter">
                    <template v-slot:top-right>
                        <q-input dense debounce="300" color="primary" v-model="filter" placeholder="Buscar">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>

                    <template v-slot:top-left>
                        <div v-show="!showPreview" class="col-10 justify-end flex">
                            <q-btn @click="showDialog = true" icon="add" label="Crear Agenda" color="primary"
                                :disable="presupuestoAgotado">
                                <q-tooltip v-if="presupuestoAgotado">
                                    Presupuesto agotado — no se pueden crear más agendas
                                </q-tooltip>
                            </q-btn>
                        </div>
                    </template>

                    <template v-slot:body-cell-route="props">
                        <q-td :props="props">
                            <div class="row">
                                <div class="col-12">
                                    <p v-if="props.row.route.go.length !== 0"
                                        v-text="`Ida: ${props.row.route.go[0].data} - ${props.row.route.go[props.row.route.go.length - 1].data}`"
                                        class="q-my-none text-center" />
                                </div>

                                <div class="col-12">
                                    <p v-if="props.row.route.return.length !== 0"
                                        v-text="`Regreso: ${props.row.route.return[0].data} - ${props.row.route.return[props.row.route.return.length - 1].data}`"
                                        class="q-my-none text-center" />
                                </div>
                            </div>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-place="props">
                        <q-td :props="props">
                            <p v-if="props.row.place !== null" v-text="props.row.place" class="q-my-none text-center" />
                            <div class="row justify-center">
                                <div class="col-12">
                                    <p v-text="props.row.regional" class="q-my-none text-center" />
                                </div>

                                <div class="col-10">
                                    <p v-text="props.row.institute" class="q-my-none text-center" />
                                </div>
                            </div>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-company="props">
                        <q-td :props="props">
                            <p v-text="props.row.company" class="text-center" />
                        </q-td>
                    </template>

                    <template v-slot:body-cell-tripDate="props">
                        <q-td :props="props">
                            <div class="row">
                                <div class="col-12">
                                    <p v-text="`Ida: ${props.row.tripStart.slice(8, 10)}/${props.row.tripStart.slice(5, 7)}/${props.row.tripStart.slice(0, 4)}`"
                                        class="q-my-none text-center" />
                                </div>

                                <div class="col-12">
                                    <p v-text="`Regreso: ${props.row.tripEnd.slice(8, 10)}/${props.row.tripEnd.slice(5, 7)}/${props.row.tripEnd.slice(0, 4)}`"
                                        class="q-my-none text-center" />
                                </div>
                            </div>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-opciones="props">
                        <q-td :props="props">
                            <q-icon @click="showEdit(props.row)" name="fa-solid fa-eye" size="20px" color="blue">
                                <q-tooltip>
                                    Ver
                                </q-tooltip>
                            </q-icon>
                            <q-btn v-if="props.row.status?.index === 1" icon="delete" color="negative" round dense flat
                                size="sm" class="q-ml-sm" @click="confirmDelete(props.row)">
                                <q-tooltip>Eliminar agenda</q-tooltip>
                            </q-btn>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-estado="props">
                        <q-td :props="props">
                            <span :class="{ 'text-red': props.row.status.data === 'Agenda rechazada' }">Rechazada</span>
                        </q-td>
                    </template>


                </q-table>
            </div>

            <!-- preview -->
            <div v-show="showPreview" class="justify-end start q-mb-md" style="font-size: 12px;">
                <q-btn @click="descargarFormatoPDF" label="Descargar como PDF" icon="download"
                    class="bg-blue text-white" />
            </div>

            <!-- preview -->
            <div v-show="showPreview" class="col-sm-8 col-lg-6 justify-end flex q-mb-md" style="font-size: 12px;">
                <q-btn @click="showPreview = false; showDialog = true" icon="fa-solid fa-arrow-right"
                    label="Continuar Creación" class="bg-green text-white" />
            </div>

            <div v-show="showPreview" class="col-12" />

            <div id="invoice" ref="invoice" style="width:90%">
                <Preview v-if="showPreview == true" :row="row" />

                <div v-show="showPreview" class="col-12" />

            </div>

            <!-- dialog -->
            <q-dialog v-model="showDialog" persistent>
                <q-card style="min-width: min(700px, 95vw); max-width: 85vw; width: 75vw;">
                    <q-card-section class="bg-primary justify-between flex z-top" style="position: sticky; top: 0;">
                        <p v-text="labelDialog" class="q-my-none text-white" style="font-size: 25px;" />
                        <q-btn @click="getPreview()" label="Vista Previa" icon="fa-solid fa-eye"
                            class="bg-white text-primary" />
                    </q-card-section>

                    <q-space />

                    <q-card-section v-if="status !== null && status.index == 0">
                        <div class="row justify-center">
                            <div class="col-10">
                                <q-banner rounded class="bg-red">
                                    <template v-slot:default>
                                        <div class="row">
                                            <div class="col-12">
                                                <p class="q-my-none text-white items-center flex"
                                                    style="font-size: 18px;">
                                                    <q-icon name="error_outline" size="24px" class="text-white" />Agenda
                                                    Rechazada
                                                </p>
                                            </div>

                                            <div class="col-12">
                                                <p v-text="status.justification || '-'"
                                                    class="q-my-none text-white q-pa-sm" />
                                            </div>
                                        </div>
                                    </template>
                                </q-banner>
                            </div>
                        </div>
                    </q-card-section>

                    <q-space />

                    <q-card-section>
                        <div class="row justify-center">
                            <div class="col-12">
                                <p class="q-my-none text-primary form-section-title">Información Desplazamiento</p>
                            </div>

                            <div class="q-pa-md">

                                <div class="q-pa-md">
                                    <div class="text-primary text-bold q-mb-sm" style="font-size: 18px;">
                                        Tipo de Publicación
                                    </div>

                                    <q-select v-model="infoClassification" label="Clasificación de la información"
                                        :options="[
                                            'Pública', 'Pública Clasificada', 'Pública Reservada',]" outlined dense
                                        clearable />
                                </div>

                            </div>
                            <div class="col-12 text-center">
                                <p class="q-my-none text-primary form-section-title text-center"
                                    style="border-left: none; border-bottom: 3px solid currentColor; padding-left: 0; padding-bottom: 4px;">
                                    Ruta de viaje y medios de transporte
                                </p>
                            </div>




                            <div class="row" style="width: 90%;">

                                <div class="col-6" style="padding-right: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <q-card flat bordered class="bg-grey-1 q-pa-sm rounded-borders clickable-card">
                                            <div class="row items-center q-mb-sm q-pl-sm">
                                                <q-icon name="touch_app" color="green-7" size="18px" class="q-mr-xs" />
                                                <span class="text-subtitle2 text-green-8">Ruta de Ida</span>
                                                <q-badge color="green-2" text-color="green-9"
                                                    label="Haz clic para agregar" class="q-ml-sm" />
                                            </div>

                                            <!-- 🔹 Municipios con arrastre -->
                                            <div class="q-gutter-xs q-px-sm q-pb-sm">
                                                <draggable v-model="goRoute" item-key="data" class="row q-col-gutter-sm"
                                                    animation="200">
                                                    <template #item="{ element, index }">
                                                        <div class="col-auto">
                                                            <q-chip removable dense color="green-8" text-color="white"
                                                                icon="location_on" class="cursor-grab"
                                                                @remove="goRoute.splice(index, 1)">
                                                                {{ element.data }}
                                                            </q-chip>
                                                        </div>
                                                    </template>
                                                </draggable>
                                            </div>

                                            <!-- 🔹 Menú para agregar nuevos municipios -->
                                            <q-menu v-model="savegoOption" fit max-width="260px"
                                                transition-show="jump-down" transition-hide="jump-up">
                                                <q-card flat bordered class="q-pa-sm bg-white rounded-borders shadow-2">
                                                    <div class="text-grey-7 text-caption q-mb-xs">
                                                        Selecciona el departamento
                                                    </div> <q-select filled dense use-input stack-label
                                                        v-model="goCounty" :options="gocountyOptions"
                                                        label="Departamento" use-chips emit-value map-options @filter="(val, update) => update(() => {
                                                            gocountyOptions = mainCounty.filter(el =>
                                                                el.label.toLowerCase().includes(val.toLowerCase())
                                                            )
                                                        })" @update:model-value="async value => {
                                                            if (value) {
                                                                maingoCity = await getCity([value]);
                                                                gocityOptions = [...maingoCity];
                                                                goCity = null;
                                                                loadingCity = false;
                                                            } else {
                                                                goCity = null;
                                                                maingoCity = [];
                                                                gocityOptions = [];
                                                            }
                                                        }" prepend-icon="map" class="q-mb-md" />

                                                    <div class="text-grey-7 text-caption q-mb-xs">
                                                        Selecciona los municipios correspondientes
                                                    </div>

                                                    <q-select filled stack-label use-input use-chips multiple
                                                        v-model="goCity" :options="gocityOptions"
                                                        label="Seleccionar Municipio" :loading="loadingCity"
                                                        :disable="!goCounty" @filter="(val, update) => {
                                                            update(() => {
                                                                gocityOptions = maingoCity.filter(el =>
                                                                    el.label.toLowerCase().includes(val.toLowerCase())
                                                                )
                                                            })
                                                        }" style="min-width: 100%; font-size: 14px;"
                                                        popup-content-class="bg-white text-black q-pa-sm"
                                                        input-class="text-green-9" color="green" behavior="menu"
                                                        menu-self="top middle" clearable>
                                                        <template v-slot:prepend>
                                                            <q-icon name="fa-solid fa-city" color="green" />
                                                        </template>
                                                        <template v-slot:no-option>
                                                            <q-item>
                                                                <q-item-section class="text-grey">
                                                                    No se encontraron municipios
                                                                </q-item-section>
                                                            </q-item>
                                                        </template>
                                                    </q-select>

                                                    <div class="text-grey-7 text-caption q-mb-xs">
                                                        Escribe una vereda o una ruta especifica
                                                    </div>
                                                    <q-input filled dense clearable label="Otro destino"
                                                        v-model.trim="goOther" class="q-mb-md"
                                                        prepend-icon="edit_location" />

                                                    <div class="flex justify-end q-mt-md">
                                                        <q-btn color="green" label="Agregar" glossy unelevated push
                                                            icon="check" @click="() => {
                                                                // 1️⃣ Agregar municipios seleccionados primero
                                                                if (goCity.length > 0) {
                                                                    goCity.forEach(city => {
                                                                        goRoute.push({ data: city.label, id: city.data });
                                                                    });
                                                                }

                                                                // 2️⃣ Agregar “otro destino” SIEMPRE al final
                                                                if (goOther?.trim()) {
                                                                    goRoute.push({ data: goOther.trim(), id: null });
                                                                }

                                                                // 3️⃣ Limpiar campos
                                                                goOther = null;
                                                                goCounty = null;
                                                                goCity = [];
                                                                gocityOptions = [];
                                                                maingoCity = [];
                                                                savegoOption = false;
                                                            }" />
                                                    </div>

                                                </q-card>
                                            </q-menu>
                                        </q-card>
                                    </div>

                                    <div class="col-10 q-mt-md">
                                        <q-card flat bordered class="bg-grey-1 q-pa-sm rounded-borders clickable-card">
                                            <div class="row items-center q-mb-sm q-pl-sm">
                                                <q-icon name="touch_app" color="green-7" size="18px" class="q-mr-xs" />
                                                <span class="text-subtitle2 text-green-8">Ruta de Regreso</span>
                                                <q-badge color="green-2" text-color="green-9"
                                                    label="Haz clic para agregar" class="q-ml-sm" />
                                            </div>

                                            <!-- 🔹 Municipios con arrastre -->
                                            <div class="q-gutter-xs q-px-sm q-pb-sm">
                                                <draggable v-model="returnRoute" item-key="data"
                                                    class="row q-col-gutter-sm" animation="200">
                                                    <template #item="{ element, index }">
                                                        <div class="col-auto">
                                                            <q-chip removable dense color="green-8" text-color="white"
                                                                icon="location_on" class="cursor-grab"
                                                                @remove="returnRoute.splice(index, 1)">
                                                                {{ element.data }}
                                                            </q-chip>
                                                        </div>
                                                    </template>
                                                </draggable>
                                            </div>


                                            <!-- 🔹 Menú para agregar nuevos municipios -->
                                            <q-menu v-model="savereturnOption" fit max-width="260px"
                                                transition-show="jump-down" transition-hide="jump-up">
                                                <q-card flat bordered class="q-pa-sm bg-white rounded-borders shadow-2">

                                                    <div class="text-grey-7 text-caption q-mb-xs">
                                                        Selecciona el departamento
                                                    </div>

                                                    <q-select filled dense use-input stack-label v-model="returnCounty"
                                                        :options="returncountyOptions" label="Departamento" use-chips
                                                        emit-value map-options @filter="(val, update) => update(() => {
                                                            returncountyOptions = mainCounty.filter(el =>
                                                                el.label.toLowerCase().includes(val.toLowerCase())
                                                            )
                                                        })" @update:model-value="async value => {
                                                            if (value) {
                                                                mainreturnCity = await getCity([value]);
                                                                returncityOptions = [...mainreturnCity];
                                                                returnCity = null;
                                                                loadingCity = false;
                                                            } else {
                                                                returnCity = null;
                                                                mainreturnCity = [];
                                                                returncityOptions = [];
                                                            }
                                                        }" prepend-icon="map" class="q-mb-md" />

                                                    <div class="text-grey-7 text-caption q-mb-xs">
                                                        Selecciona los municipios correspondientes
                                                    </div>

                                                    <q-select filled stack-label use-input use-chips multiple
                                                        v-model="returnCity" :options="returncityOptions"
                                                        label="Seleccionar Municipio" :loading="loadingCity" @filter="(val, update) => {
                                                            update(() => {
                                                                returncityOptions = mainreturnCity.filter(el =>
                                                                    el.label.toLowerCase().includes(val.toLowerCase())
                                                                )
                                                            })
                                                        }" style="min-width: 100%; font-size: 14px;"
                                                        popup-content-class="bg-white text-black q-pa-sm"
                                                        input-class="text-green-9" color="green" behavior="menu"
                                                        :disable="!returnCounty" menu-self="top middle" clearable>
                                                        <template v-slot:prepend>
                                                            <q-icon name="fa-solid fa-city" color="green" />
                                                        </template>
                                                        <template v-slot:no-option>
                                                            <q-item>
                                                                <q-item-section class="text-grey">
                                                                    No se encontraron municipios
                                                                </q-item-section>
                                                            </q-item>
                                                        </template>
                                                    </q-select>

                                                    <div class="text-grey-7 text-caption q-mb-xs">
                                                        Escribe una verda o una ruta especifica
                                                    </div>

                                                    <q-input filled dense clearable stack-label
                                                        v-model.trim="returnOther" label="Otro destino"
                                                        prepend-icon="edit_location" class="q-mb-md" />

                                                    <div class="flex justify-end q-mt-md">
                                                        <q-btn color="green" label="Agregar" glossy unelevated push
                                                            icon="check" @click="() => {
                                                                if (returnOther?.trim()) {
                                                                    returnRoute.push({ data: returnOther, id: null });
                                                                } else if (returnCity.length > 0) {
                                                                    returnCity.forEach(city => returnRoute.push({ data: city.label, id: city.data }));
                                                                }
                                                                returnOther = null;
                                                                returnCounty = null;
                                                                returnCity = [];
                                                                returncityOptions = [];
                                                                mainreturnCity = [];
                                                                savereturnOption = false;
                                                            }" />
                                                    </div>

                                                </q-card>
                                            </q-menu>
                                        </q-card>
                                    </div>



                                    <div class="col-10 q-mt-md">
                                        <q-select filled dense stack-label use-chips use-input
                                            :disable="place.length !== 0 || loadingCounty" :loading="loadingCounty"
                                            v-model="regional" :options="regionalOptions" color="green"
                                            prepend-icon="location_city" label="Dirección General / Regional"
                                            hint="Si el viaje corresponde a un centro del SENA, diligencie las casillas correspondientes"
                                            persistent-hint @filter="function (val, update) {
                                                update(() => {
                                                    const needle = val.toLowerCase()
                                                    regionalOptions = mainRegional.filter(
                                                        element => element.label.toLowerCase().indexOf(needle) > -1
                                                    )
                                                })
                                            }" @update:model-value="async (value) => {
                                                await getOptions(value)
                                            }" />

                                    </div>
                                </div>

                                <div class="col-6" style="padding-left: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <q-card flat bordered class="bg-grey-1 q-pa-sm rounded-borders clickable-card">
                                            <div class="row items-center q-mb-sm q-pl-sm">
                                                <q-icon name="touch_app" color="green-7" size="18px" class="q-mr-xs" />
                                                <span class="text-subtitle2 text-green-8">Transporte de Ida</span>
                                                <q-badge color="green-2" text-color="green-9"
                                                    label="Haz clic para agregar" class="q-ml-sm" />
                                            </div>

                                            <div class="q-gutter-xs q-px-sm q-pb-sm">
                                                <transition-group name="fade" tag="div" class="row q-col-gutter-sm">
                                                    <div class="col-auto" v-for="(element, index) in goMeanstransport"
                                                        :key="index">
                                                        <q-chip removable dense color="green-8" text-color="white"
                                                            icon="directions_transit"
                                                            @remove="goMeanstransport.splice(index, 1)">
                                                            {{ element.data }}
                                                        </q-chip>
                                                    </div>
                                                </transition-group>
                                            </div>


                                            <q-menu v-model="savegoMeanstransport" fit max-width="260px"
                                                transition-show="jump-down" transition-hide="jump-up">
                                                <q-card flat bordered class="q-pa-sm bg-white rounded-borders shadow-2">

                                                    <q-select filled dense stack-label
                                                        v-model="temporarygoMeanstransport"
                                                        :options="meanstransportOptions" label="Medio de Tranporte"
                                                        class="q-mb-md" prepend-icon="local_shipping" />


                                                    <div class="flex justify-end q-mt-md">
                                                        <q-btn color="green" label="Agregar" glossy unelevated push
                                                            icon="check" @click="() => {
                                                                if (temporarygoMeanstransport !== null) {
                                                                    goMeanstransport.push({ data: temporarygoMeanstransport.label })
                                                                    temporarygoMeanstransport = null
                                                                }
                                                                savegoMeanstransport = false
                                                            }" />
                                                    </div>

                                                </q-card>
                                            </q-menu>
                                        </q-card>
                                    </div>

                                    <div class="col-10 q-mt-md">
                                        <q-card flat bordered class="bg-grey-1 q-pa-sm rounded-borders clickable-card">
                                            <div class="row items-center q-mb-sm q-pl-sm">
                                                <q-icon name="touch_app" color="green-7" size="18px" class="q-mr-xs" />
                                                <span class="text-subtitle2 text-green-8">Transporte de Regreso</span>
                                                <q-badge color="green-2" text-color="green-9"
                                                    label="Haz clic para agregar" class="q-ml-sm" />
                                            </div>

                                            <div class="q-gutter-xs q-px-sm q-pb-sm">
                                                <transition-group name="fade" tag="div" class="row q-col-gutter-sm">
                                                    <div class="col-auto"
                                                        v-for="(element, index) in returnMeanstransport" :key="index">
                                                        <q-chip removable dense color="green-8" text-color="white"
                                                            icon="directions_transit"
                                                            @remove="returnMeanstransport.splice(index, 1)">
                                                            {{ element.data }}
                                                        </q-chip>
                                                    </div>
                                                </transition-group>
                                            </div>


                                            <q-menu v-model="savereturnMeanstransport" fit max-width="260px"
                                                transition-show="jump-down" transition-hide="jump-up">
                                                <q-card flat bordered class="q-pa-sm bg-white rounded-borders shadow-2">

                                                    <q-select filled dense stack-label
                                                        v-model="temporaryreturnMeanstransport"
                                                        :options="meanstransportOptions" label="Medio de Tranporte"
                                                        class="q-mb-md" prepend-icon="local_shipping" />

                                                    <div class="flex justify-end q-mt-md">
                                                        <q-btn color="green" label="Agregar" glossy unelevated push
                                                            icon="check" @click="() => {
                                                                if (temporaryreturnMeanstransport !== null) {
                                                                    returnMeanstransport.push({ data: temporaryreturnMeanstransport.label })
                                                                    temporaryreturnMeanstransport = null
                                                                }
                                                                savereturnMeanstransport = false
                                                            }" />
                                                    </div>

                                                </q-card>
                                            </q-menu>
                                        </q-card>
                                    </div>

                                    <div class="col-10 q-mt-md">
                                        <q-select filled dense stack-label
                                            :disable="place.length !== 0 ? true : false || loadingInstitute"
                                            v-model="institute" :loading="loadingInstitute" :options="instituteOptions"
                                            hint="Si el viaje corresponde a un centro del SENA, diligencie las casillas correspondientes"
                                            label="Dependencia / Centro" color="green" prepend-icon="apartment" />
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 text-center q-mt-md">
                                <p class="q-my-none text-primary form-section-title"
                                    style="border-left: none; border-bottom: 3px solid currentColor; padding-left: 0; padding-bottom: 4px;">
                                    Lugar del viaje
                                </p>
                            </div>
                            <!-- CIUDAD -->
                            <div class="row" style="width: 90%;">
                                <div class="col-12">
                                    <div class="col-10 q-mt-md">
                                        <div class="place-inline-form q-pa-sm"
                                            :class="{ 'place-disabled': regional !== null || loadingCounty }">

                                            <!-- Lugar seleccionado (chip) -->
                                            <div v-if="place.length > 0" class="row q-mb-sm q-gutter-xs">
                                                <q-chip v-for="(element, index) in place" :key="index" removable
                                                    :label="element.data" color="primary" text-color="white"
                                                    icon="location_on" size="md" @remove="place.splice(index, 1)" />
                                            </div>

                                            <div class="row q-col-gutter-sm">
                                                <!-- Departamento -->
                                                <div class="col-6">
                                                    <q-select filled dense stack-label use-input v-model="placeCounty"
                                                        :options="placecountyOptions" label="Departamento"
                                                        :disable="place.length > 0 || otherPlace !== null || regional !== null || loadingCounty"
                                                        color="primary" @filter="(val, update) => {
                                                            update(() => {
                                                                placecountyOptions = mainplaceCounty.filter(el =>
                                                                    el.label.toLowerCase().includes(val.toLowerCase())
                                                                )
                                                            })
                                                        }" @update:model-value="async value => {
                                                            if (value) {
                                                                loadingCity = true
                                                                mainplaceCity = await getCity([value])
                                                                placecityOptions = [...mainplaceCity]
                                                                placeCity = null
                                                                loadingCity = false
                                                            } else {
                                                                placeCity = null
                                                                mainplaceCity = []
                                                                placecityOptions = []
                                                            }
                                                        }">
                                                        <template v-slot:prepend>
                                                            <q-icon name="map" color="primary" size="18px" />
                                                        </template>
                                                    </q-select>
                                                </div>

                                                <!-- Municipio -->
                                                <div class="col-6">
                                                    <q-select filled dense stack-label use-input v-model="placeCity"
                                                        :options="placecityOptions" label="Municipio"
                                                        :disable="place.length > 0 || otherPlace !== null || loadingCity || !placeCounty || regional !== null || loadingCounty"
                                                        :loading="loadingCity" color="primary" @filter="(val, update) => {
                                                            update(() => {
                                                                placecityOptions = mainplaceCity.filter(el =>
                                                                    el.label.toLowerCase().includes(val.toLowerCase())
                                                                )
                                                            })
                                                        }">
                                                        <template v-slot:prepend>
                                                            <q-icon name="location_city" color="primary" size="18px" />
                                                        </template>
                                                    </q-select>
                                                </div>

                                                <!-- Separador -->
                                                <div class="col-12 text-center text-caption text-grey-6 q-my-xs">
                                                    — o escribe un destino personalizado —
                                                </div>

                                                <!-- Otro destino libre -->
                                                <div class="col-12">
                                                    <q-input filled dense stack-label clearable
                                                        v-model.trim="otherPlace"
                                                        label="Otro destino (ciudad, vereda, país...)"
                                                        :disable="place.length > 0 || placeCounty !== null || placeCity !== null || regional !== null || loadingCounty"
                                                        color="primary"
                                                        hint="Escribe aquí si el lugar no aparece en la lista">
                                                        <template v-slot:prepend>
                                                            <q-icon name="edit_location" color="primary" size="18px" />
                                                        </template>
                                                    </q-input>
                                                </div>

                                                <!-- Botón Agregar -->
                                                <div class="col-12 flex justify-end">
                                                    <q-btn label="Agregar lugar" icon="add_location_alt" color="primary"
                                                        unelevated
                                                        :disable="place.length > 0 || (!otherPlace && !placeCity) || regional !== null || loadingCounty"
                                                        @click="() => {
                                                            if (otherPlace) {
                                                                place.splice(0)
                                                                place.push({ data: otherPlace, id: null })
                                                            } else if (placeCity) {
                                                                place.splice(0)
                                                                place.push({ data: placeCity.label, id: placeCity.data })
                                                            }
                                                            otherPlace = null
                                                            placeCounty = null
                                                            placeCity = null
                                                            mainplaceCity = []
                                                            placecityOptions = []
                                                        }" />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>


                            </div>

                            <div class="row" style="width: 90%;">
                                <div class="col-6" style="padding-right: 8px;">
                                    <!-- ENTIDAD O EMPRESA -->
                                    <div class="col-10 q-mt-md">
                                        <q-input filled stack-label v-model="company" label="Entidad o Empresa"
                                            color="primary">
                                            <template v-slot:prepend>
                                                <q-icon name="business" color="primary" />
                                            </template>
                                        </q-input>
                                    </div>
                                </div>
                                <div class="col-6" style="padding-right: 8px;">
                                    <!-- CONTACTO -->
                                    <div class="col-10 q-mt-md">
                                        <q-input filled stack-label v-model="companyContact" label="Contacto"
                                            color="primary">
                                            <template v-slot:prepend>
                                                <q-icon name="person" color="primary" />
                                            </template>
                                        </q-input>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12 text-center q-mt-md">
                                <p class="q-my-none text-primary form-section-title"
                                    style="border-left: none; border-bottom: 3px solid currentColor; padding-left: 0; padding-bottom: 4px;">
                                    Fechas y actividades del desplazamiento
                                </p>
                            </div>

                            <!-- FECHAS -->
                            <!-- FECHAS -->
                            <div class="row" style="width:90%">
                                <div class="col-6" style="padding-right: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <q-input filled stack-label :model-value="formatDateDMY(tripStart)"
                                            label="Fecha Inicio Desplazamiento" readonly color="primary">
                                            <template v-slot:append>
                                                <q-icon name="event" class="cursor-pointer" color="primary">
                                                    <q-popup-proxy cover transition-show="scale"
                                                        transition-hide="scale">

                                                        <!-- 🔥 IMPORTANTE: mantener formato ISO -->
                                                        <q-date v-model="tripStart" mask="YYYY-MM-DD"
                                                            :options="d => d >= isoDate.replace(/-/g, '/')"
                                                            color="primary">
                                                            <div class="row items-center justify-end">
                                                                <q-btn v-close-popup label="Cerrar" color="primary"
                                                                    flat />
                                                            </div>
                                                        </q-date>

                                                    </q-popup-proxy>
                                                </q-icon>
                                            </template>
                                        </q-input>
                                    </div>
                                </div>

                                <div class="col-6" style="padding-left: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <q-input filled stack-label :model-value="formatDateDMY(tripEnd)"
                                            label="Fecha Fin Desplazamiento" readonly color="primary">
                                            <template v-slot:append>
                                                <q-icon name="event" class="cursor-pointer" color="primary">
                                                    <q-popup-proxy cover transition-show="scale"
                                                        transition-hide="scale">

                                                        <!-- 🔥 IMPORTANTE: mantener formato ISO -->
                                                        <q-date v-model="tripEnd" mask="YYYY-MM-DD"
                                                            :options="d => d >= isoDate.replace(/-/g, '/')"
                                                            color="primary">
                                                            <div class="row items-center justify-end">
                                                                <q-btn v-close-popup label="Cerrar" color="primary"
                                                                    flat />
                                                            </div>
                                                        </q-date>

                                                    </q-popup-proxy>
                                                </q-icon>
                                            </template>
                                        </q-input>
                                    </div>
                                </div>
                            </div>

                            <div class="row" style="width:90%">
                                <div class="col-12">
                                    <div class="col-10 q-mt-md">
                                        <q-input filled autogrow stack-label v-model="tripObjective"
                                            label="Objetivo Desplazamiento" color="primary">
                                            <template v-slot:prepend>
                                                <q-icon name="flag" color="primary" />
                                            </template>
                                        </q-input>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <br>

                        <!-- OBLIGACIONES -->

                        <div class="row justify-center">
                            <div class="col-12">
                                <p class="q-my-none text-primary form-section-title">Obligaciones del Contrato</p>
                            </div>

                            <div class="col-12" style="width: 90%;padding-right:8px">
                                <template v-for="(element, index) in duties">
                                    <div class="row">
                                        <div class="col-10 q-pa-sm">
                                            <q-input filled stack-label autogrow v-model="element.data"
                                                label="Obligación" color="primary" />
                                        </div>

                                        <div v-if="index !== 0" class="col-2 items-center flex">
                                            <q-btn @click="duties.splice(index, 1)" dense label="Eliminar"
                                                color="negative" />
                                        </div>

                                        <div v-else class="col-2" />
                                    </div>

                                </template>
                                <div class="row justify-end q-mt-sm q-pr-md">
                                    <q-btn @click="duties.push({})" size="sm" round icon="fa solid fa-plus"
                                        class="bg-primary text-white" style="font-size: 14px;" />
                                </div>
                            </div>
                        </div>

                        <div class="row justify-center">
                            <div class="col-12">
                                <p class="q-my-none text-primary form-section-title">Actividades</p>
                            </div>

                            <div class="col-12">
                                <div v-for="(element, index) in activities" :key="element.date">
                                    <div class="row justify-center">
                                        <div class="col-12">
                                            <p v-text="`Fecha: ${element.date.slice(8)}/${element.date.slice(5, 7)}/${element.date.slice(0, 4)}`"
                                                class="q-my-sm q-ml-lg" />
                                        </div>

                                        <div class="col-12" style="width: 90%">
                                            <template v-for="(item, itemIndex) in element.items" :key="itemIndex">
                                                <div class="row q-pa-sm items-center">

                                                    <!-- Campo Actividad -->
                                                    <div class="col-6">
                                                        <q-input v-model="item.data" label="Actividad" filled
                                                            stack-label autogrow class="q-my-sm text-body1" />
                                                    </div>

                                                    <!-- Hora Inicio -->
                                                    <div class="col-3">
                                                        <q-input v-model="item.startTime" type="time"
                                                            label="Hora inicio" filled stack-label class="text-body1"
                                                            @update:model-value="val => {
                                                                item.startTime = val || null
                                                                if (index === 0 && itemIndex === 0) syncHoursAllDays('startTime')
                                                            }" />
                                                    </div>

                                                    <!-- Hora Fin -->
                                                    <div class="col-3">
                                                        <q-input v-model="item.endTime" type="time" label="Hora fin"
                                                            filled stack-label class="text-body1" @update:model-value="val => {
                                                                item.endTime = val || null
                                                                if (index === 0 && itemIndex === 0) syncHoursAllDays('endTime')
                                                            }" />
                                                    </div>

                                                    <!-- Botón Eliminar -->
                                                    <div class="col-2 flex justify-center">
                                                        <q-btn v-if="itemIndex !== 0"
                                                            @click="element.items.splice(itemIndex, 1)" dense round
                                                            color="negative" icon="delete" class="q-my-sm" />
                                                    </div>
                                                </div>
                                            </template>
                                        </div>

                                        <!-- Botón Agregar actividad -->
                                        <div class="col-12 justify-end flex">
                                            <q-btn :disable="activities.length === 0 || activities[0].date === ''"
                                                @click="element.items.push({ data: '', startTime: '', endTime: '', startPeriod: 'AM', endPeriod: 'AM' })"
                                                icon="add" round color="primary" class="text-white q-mr-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div class="row q-mt-md justify-center">
                            <div class="col-12">
                                <p class="q-my-none text-primary form-section-title">Observaciones</p>
                            </div>

                            <div class="col-12" style="width: 90%; padding-right: 8px">
                                <!-- Checkbox -->

                                <q-checkbox v-model="observations.find(o => o.key === 'air_terminal').enabled"
                                    label="Agregar transporte aéreo" color="primary" class="q-mb-md" />

                                <q-checkbox v-model="observations.find(o => o.key === 'interveral').enabled"
                                    label="Agregar transporte interveredal" color="primary" class="q-mb-md" />

                                <template v-for="element in observations.filter(o => o.enabled)" :key="element.key">
                                    <div class="row items-center q-mb-sm">

                                        <!-- TEXTO -->
                                        <div class="col-8 q-pa-sm">
                                            <q-input :model-value="element.text" filled readonly label="Observación" />
                                        </div>

                                        <!-- SELECT DESDE API -->
                                        <div v-if="element.fromApi" class="col-4 q-pa-sm">
                                            <q-select v-model="element.selected"
                                                :options="element.type === 'aerea' ? airOptions : landOptions"
                                                option-label="name" option-value="amount" emit-value map-options filled
                                                clearable label="Seleccionar valor" @clear="() => {
                                                    element.selected = null
                                                    element.amount = 0
                                                }" @update:model-value="val => { element.amount = val ?? 0 }">
                                                <!-- OPCIONES DEL DROPDOWN -->
                                                <template #option="scope">
                                                    <q-item v-bind="scope.itemProps">
                                                        <q-item-section>
                                                            <q-item-label class="text-weight-medium">
                                                                {{ scope.opt.name }}
                                                            </q-item-label>
                                                            <q-item-label caption>
                                                                💰 Valor: ${{ money.format(scope.opt.amount) }}
                                                            </q-item-label>
                                                            <q-item-label caption v-if="scope.opt.description">
                                                                📄 {{ scope.opt.description }}
                                                            </q-item-label>
                                                        </q-item-section>
                                                    </q-item>
                                                </template>

                                                <!-- VALOR SELECCIONADO (VISUAL) -->
                                                <template #selected-item="scope">
                                                    <div class="column">
                                                        <span class="text-weight-medium">{{ scope.opt.name }}</span>
                                                        <span class="text-caption text-grey">
                                                            ${{ money.format(scope.opt.amount) }}
                                                        </span>
                                                    </div>
                                                </template>
                                            </q-select>

                                        </div>
                                        <!-- INPUT MANUAL -->
                                        <div v-else class="col-4 q-pa-sm">
                                            <q-input :model-value="money.format(element.amount)" prefix="$" filled
                                                label="Valor"
                                                @update:model-value="val => element.amount = Number(val.replace(/\./g, ''))" />
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <div class="row q-mt-md">
                            <div class="col-12">
                                <p class="q-my-none text-primary form-section-title">CDP</p>
                            </div>

                            <div class="col-6 q-pa-sm">
                                <q-select v-model="cdp.selected" :options="cdpOptions" option-label="name" filled
                                    label="CDP">

                                    <!-- OPCIONES -->
                                    <template #option="scope">
                                        <q-item v-bind="scope.itemProps">
                                            <q-item-section>
                                                <!-- Nombre -->
                                                <q-item-label class="text-weight-bold">
                                                    {{ scope.opt.code }} {{ scope.opt.name }}
                                                </q-item-label>

                                                <!-- Dependency -->
                                                <q-item-label caption class="text-primary">
                                                    🏛 Dependencia: {{ scope.opt.dependency }}
                                                </q-item-label>

                                                <!-- Valor -->
                                                <q-item-label caption>
                                                    #️⃣ Codigo: {{ (scope.opt.amount) }}
                                                </q-item-label>


                                                <!-- Descripción -->
                                                <q-item-label caption v-if="scope.opt.description">
                                                    📄 {{ scope.opt.description }}
                                                </q-item-label>
                                            </q-item-section>
                                        </q-item>
                                    </template>

                                    <!-- SELECCIONADO -->
                                    <template #selected-item="scope">
                                        <div class="column">
                                            <span class="text-weight-bold">
                                                {{ scope.opt.code }} - {{ scope.opt.name }}
                                            </span>
                                            <span class="text-caption">
                                                🏛 {{ scope.opt.dependency }}
                                            </span>
                                            <span class="text-caption text-grey">
                                                ${{ (scope.opt.amount) }}
                                            </span>

                                        </div>
                                    </template>
                                </q-select>

                            </div>
                        </div>




                        <div class="row q-mt-md justify-center">
                            <div class="col-12">
                                <p class="q-my-none text-primary form-section-title">Firma</p>
                            </div>

                            <div class="col-10 q-mt-sm" style="width: 90%;padding-right:8px">
                                <div class="row" style="background-color: whitesmoke;">
                                    <div class="col-12">
                                        <p class="q-my-none q-pl-sm q-pt-sm" style="font-size: 12px; color: grey;">Firma
                                            Contratista
                                        </p>
                                    </div>

                                    <div class="col-12 q-pl-sm q-py-sm">
                                        <q-img v-if="sign.contractor" :src="sign.contractor" fit="contain"
                                            style="width: 200px; height: 80px; border: 1px solid #e0e0e0; border-radius: 4px;" />
                                        <div v-else class="row items-center justify-center"
                                            style="width: 200px; height: 80px; border: 1.5px dashed #bdbdbd; border-radius: 4px; background: #f5f5f5;">
                                            <q-icon name="image" color="grey-5" size="32px" />
                                        </div>
                                    </div>
                                    <div class="col-12 justify-end flex q-pb-sm q-pr-sm q-gutter-xs">
                                        <input ref="signFileInput" type="file" accept="image/*" style="display:none"
                                            @change="onSignFileChange" />
                                        <q-btn @click="signFileInput.click()" icon="upload" label="Subir Firma"
                                            class="bg-primary text-white" />
                                        <q-btn v-if="sign.contractor" @click="sign.contractor = null; yaFirmo = false"
                                            icon="close" label="Quitar" flat color="negative" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-actions class="justify-around">
                        <q-btn @click="cleanDialog()" label="Cerrar" v-close-popup icon="fa-solid fa-xmark"
                            color="negative" />
                        <q-btn @click="confirmarGuardar()" icon="fa-solid fa-floppy-disk" label="Guardar"
                            class="bg-primary text-white" :disable="yaFirmo === false" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <q-dialog v-model="confirm" persistent>
                <q-card>
                    <q-card-section class="q-gutter-md text-center">
                        <q-img src="../../../assets/advertencia.png" fit="contain" style="height: 70px; width: 70px;" />
                        <p style="font-size: 18px;font-weight: bold;">¿Está seguro de que desea crear la agenda?</p>
                        <p style="font-size: 15px;">No podrá modificarla después, puedes visualizar tu agenda en el
                            boton de
                            <b>VISTA PREVIA</b>
                        </p>
                    </q-card-section>

                    <q-card-actions class="flex-center" align="right">
                        <q-btn label="Cancelar" color="negative" icon="fa-solid fa-xmark" @click="confirm = false" />
                        <q-btn label="Sí, crearla" icon="check" color="primary"
                            @click="id !== null ? updateSchedule() : createSchedule()" :loading="loading" />
                    </q-card-actions><br />
                </q-card>
            </q-dialog>
        </div>
        <q-page-sticky v-if="!showPreview" position="bottom-right" :offset="[20, 20]">
            <q-btn @click="recargar()" color="primary" fab icon="fa-solid fa-rotate-right">
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    Recargar página
                </q-tooltip>
            </q-btn>
        </q-page-sticky>
    </q-page>
</template>

<script setup>
import { ref, computed, onBeforeMount, onMounted, reactive, nextTick } from 'vue'

import draggable from 'vuedraggable'


import { date, useQuasar } from 'quasar'

import { useScheduleStore } from '../../../stores/schedule.js'

import { showNotify } from '../../../components/notify.js'

import Preview from './Preview.vue'

import { useUserStore } from '../../../stores/user'

import { useAmountStore } from '../../../stores/Amount.js'

import { useMoneyStore } from '../../../stores/money.js'

import { jsPDF } from "jspdf";

const money = useMoneyStore()


const amountStore = useAmountStore()

const $q = useQuasar()

const scheduleStore = useScheduleStore()

const userStore = useUserStore()

let cargando = ref(false)

let yaFirmo = ref(false)

let loading = ref(false)

const fechaActual = new Date()

const isoDate = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(fechaActual.getDate()).padStart(2, '0')}`

const invoice = ref(null)

let confirm = ref(false)


const cdp = reactive({
    selected: null,
    amount: null
})


const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const encoded = encodeURI(path);
    return `${import.meta.env.VITE_API_URL}${encoded}`;
}


onMounted(async () => {
    await amountStore.fetchAmounts()
})

const airOptions = computed(() =>
    amountStore.amounts.filter(a => a.type === 'aerea')
)

const landOptions = computed(() =>
    amountStore.amounts.filter(a => a.type === 'terrestres')
)

const cdpOptions = computed(() =>
    amountStore.amounts.filter(a => a.type === 'cdp')
)

/* 💰 CONTROL DE PRESUPUESTO */
const schedulesPresupuesto = ref([])

const dailyAllowanceAmount = computed(() => currentUser.value?.dailyAllowance?.amount ?? 0)
const budgetInicial = computed(() => currentUser.value?.budget?.amount ?? 0)

const consumidoTotal = computed(() => {
    if (!dailyAllowanceAmount.value) return 0
    return schedulesPresupuesto.value.reduce((acc, s) => {
        const start = new Date(s.tripStart)
        const end = new Date(s.tripEnd)
        const dias = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
        const factor = dias - 0.5
        const viaticos = factor * dailyAllowanceAmount.value
        const extras = (s.observations || []).reduce((a, o) => a + (Number(o.amount) || 0), 0)
        return acc + viaticos + extras
    }, 0)
})

const presupuestoAgotado = computed(() => {
    if (!budgetInicial.value) return false
    return consumidoTotal.value >= budgetInicial.value
})



function recargar() {
    window.location.reload()
}

function confirmarGuardar() {
    confirm.value = true
};

import html2canvas from 'html2canvas'

async function descargarFormatoPDF() {

    const notif = $q.notify({
        type: 'ongoing',
        message: 'Generando PDF...'
    });

    const element = invoice.value;

    // 🔥 Activar modo carta
    element.classList.add('export-mode');

    await nextTick(); // importante en Vue

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter'
    });

    const pageWidth = 612;
    const marginTop = 40;
    const marginLeft = 20;

    const imgWidth = pageWidth - (marginLeft * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(
        imgData,
        'PNG',
        marginLeft,
        marginTop,
        imgWidth,
        imgHeight
    );

    pdf.save('formatoContratista.pdf');

    // 🔥 Quitar modo carta
    element.classList.remove('export-mode');

    notif({
        type: 'positive',
        message: 'Formato en PDF descargado',
        timeout: 1300
    });
}


async function getCounty(query = {}) {
    const { data, status } = await scheduleStore.getCounty(query)

    const county = []

    for (let index = 0; index < data.length; index++) {
        county.push({ data: data[index]._id, label: data[index].name })
    }

    return county
}

async function getCity(value) {
    loadingCity.value = true

    console.log(value)
    const { data, status } = await scheduleStore.getCity(value[0].data)

    const city = []

    for (let index = 0; index < data.length; index++) {
        city.push({ data: data[index]._id, label: data[index].name })
    }

    return city
}

async function getCurrentUser(id) {
    const { data } = await userStore.getUserParams(id)

    console.log(data)

    return data
}

const currentUser = ref(null)

async function getSchedule(id, query = {}) {
    const { data } = await scheduleStore.getScheduleParams(id, query)

    return data
}


onBeforeMount(
    async () => {
        cargando.value = true

        gocountyOptions.value = await getCounty()
        returncountyOptions.value = await getCounty()

        mainCounty.value = await getCounty()

        regionalOptions.value = await getCounty({ regional: true })

        mainRegional.value = await getCounty({ regional: true })

        placecountyOptions.value = await getCounty()

        mainplaceCounty.value = await getCounty()

        loadingCounty.value = false

        const user = $q.localStorage.getItem('user')

        rows.value = await getSchedule(user.id, { contractor: true })

        console.log(user)

        cargando.value = true
        if (user.role.data == 'user') {
            currentUser.value = await getCurrentUser(user.id)

            console.log(currentUser.value)

            currentUser.value.role = 'user'

            contractor.value = currentUser.value.name

            identification.value = currentUser.value.identification

            //identification.value.label = optionsIdentification.value[identification.value.index].label

            contract.value = currentUser.value.contract

            object.value = currentUser.value.object

            currentInstitute.value = currentUser.value.institute

            currentRegional.value = currentUser.value.regional

            supervisor.value.id = currentUser.value.supervisor._id

            supervisor.value.name = currentUser.value.supervisor.name

            supervisor.value.position = currentUser.value.supervisor.position

            paymaster.value.id = currentUser.value.paymaster._id

            paymaster.value.name = currentUser.value.paymaster.name

            paymaster.value.position = currentUser.value.paymaster.position

            const { data: agendas } = await scheduleStore.getSchedule({ contractor: currentUser.value._id })
            schedulesPresupuesto.value = agendas || []
        }
        cargando.value = false

    })

watch(
    () => cdp.selected,
    (val) => {
        if (!val) return

        const inter = observations.value.find(
            o => o.key === 'intermunicipal'
        )
        if (!inter) return

        inter.cdp = val.amount
        inter.cdpName = val.name
    }
)


// table
const columns = ref([
    { name: 'route', label: 'Ruta', align: 'center', style: 'width: 300px' },
    { name: 'place', label: 'Lugar Desplazamiento', align: 'center' },
    { name: 'company', label: 'Entidad o Empresa', align: 'center' },
    { name: 'tripDate', label: 'Fecha Desplazamiento', align: 'center' },
    { name: 'estado', label: 'Estado', align: 'center' },
    { name: 'opciones', label: 'Acciones', align: 'center' }
])

const rows = ref([])

const id = ref(null)

function showEdit(row) {
    // Mantener la misma referencia reactiva para no romper el v-model
    if (Array.isArray(row.activities)) {
        activities.value = row.activities.map(activity => ({
            date: activity.date || '',
            items: (activity.items || []).map(item => ({
                data: item.data || '',
                startTime: item.startTime || '',
                endTime: item.endTime || '',
                startPeriod: item.startPeriod || 'AM',
                endPeriod: item.endPeriod || 'AM'
            }))
        }))
    } else {
        activities.value = [{
            date: '',
            items: [{ data: '', startTime: '', endTime: '', startPeriod: 'AM', endPeriod: 'AM' }]
        }]
    }

    infoClassification.value = row.infoClassification || null;
    labelDialog.value = 'Editar Agenda'
    createdAt.value = row.createdAt
    goRoute.value = row.route.go
    status.value = row.status
    returnRoute.value = row.route.return
    goMeanstransport.value = row.meanstransport.go
    returnMeanstransport.value = row.meanstransport.return
    regional.value = row.regional ? { label: row.regional } : null
    institute.value = row.institute ? { label: row.institute } : null
    place.value = row.place ? [{ data: row.place }] : []
    company.value = row.company
    companyContact.value = row.companyContact
    isEditing.value = true
    tripStart.value = row.tripStart.slice(0, 10)
    tripEnd.value = row.tripEnd.slice(0, 10)
    isEditing.value = false
    tripObjective.value = row.tripObjective
    duties.value = row.duties
    observations.value = restoreObservations(row.observations)
    id.value = row._id

    // Restaurar CDP seleccionado
    const interObs = (row.observations || []).find(o => o.key === 'intermunicipal')
    if (interObs?.cdp != null) {
        cdp.selected = cdpOptions.value.find(o => o.amount === interObs.cdp) ?? null
    } else {
        cdp.selected = null
    }

    console.log('🟢 ACTIVITIES ASIGNADAS:', JSON.stringify(activities.value, null, 2))
    console.log(activities.value, row)


    showDialog.value = true
}

async function cleanDialog() {
    isEditing.value = false

    createdAt.value = ''

    status.value = null

    sign.value.contractor = null

    goRoute.value = []

    returnRoute.value = []

    goMeanstransport.value = []

    returnMeanstransport.value = []

    regional.value = null

    institute.value = null

    place.value.splice(0)

    company.value = ''

    companyContact.value = ''

    tripStart.value = ''

    tripEnd.value = ''

    tripObjective.value = ''

    duties.value = [{}]

    observations.value = defaultObservations()

    activities.value = [{
        date: '',
        items: [{ data: '', startTime: '', endTime: '', startPeriod: 'AM', endPeriod: 'AM' }]
    }]

    rows.value = await getSchedule(currentUser.value._id, { contractor: true })

    id.value = null

    showDialog.value = false

    yaFirmo.value = false

    labelDialog.value = 'Crear Agenda'
}


const showDialog = ref(false)

const labelDialog = ref('Crear Agenda')

function getPreview() {
    row.value = {
        contractor: currentUser.value._id,
        contract: {
            date: contract.value.date,
            number: contract.value.number,
            contractorName: contractor.value,
            object: object.value,
            regional: currentRegional.value.name,
            institute: currentInstitute.value.name
        },
        route: {
            go: goRoute.value,
            return: returnRoute.value
        },
        meanstransport: {
            go: goMeanstransport.value,
            return: returnMeanstransport.value
        },
        regional: regional.value !== null ? regional.value.label : null,
        institute: institute.value !== null ? institute.value.label : null,
        place: place.value.length !== 0 ? place.value[0].data : null,
        company: company.value,
        companyContact: companyContact.value,
        tripStart: tripStart.value,
        tripEnd: tripEnd.value,
        tripObjective: tripObjective.value,
        duties: duties.value,
        observations: observations.value,
        infoClassification: infoClassification.value,
        activities: activities.value,
        supervisor: supervisor.value,
        paymaster: paymaster.value,
        signature: {
            contractor: sign.value.contractor !== null ? sign.value.contractor : null
        },
        createdAt: createdAt.value
    }

    showDialog.value = false

    showPreview.value = true
}

const showPreview = ref(false)

const row = ref({})

const sign = ref({
    contractor: null
})

const createdAt = ref('')

const status = ref(null)
let filter = ref('')
const contractor = ref(null)


//const optionsIdentification = ref([{ label: 'Cédula de Ciudadanía', data: 'C.C.' }, { label: 'Cédula de Extranjero', data: 'C.E.' }])

const identification = ref({})

const contract = ref({})

const object = ref('')

const currentRegional = ref('')

const currentInstitute = ref('')

const supervisor = ref({})

const paymaster = ref({})

const mainCounty = ref([])

const gocountyOptions = ref([])

const gocityOptions = ref([])

const savegoOption = ref(false)

const goOther = ref(null)

const goCounty = ref(null)

const goCity = ref(null)

const goRoute = ref([])

const maingoCity = ref([])

const returncountyOptions = ref([])

const returncityOptions = ref([])

const savereturnOption = ref(false)

const returnOther = ref(null)

const returnCounty = ref(null)

const returnCity = ref(null)

const returnRoute = ref([])

// 🔄 Sincroniza automáticamente la ruta de regreso como la inversa de la de ida
import { watch } from 'vue' // (ya lo tienes importado arriba)
// 🔄 Sincroniza automáticamente la ruta de regreso como la inversa de la de ida
watch(
    goRoute,
    (newValue) => {
        if (Array.isArray(newValue) && newValue.length > 0) {
            // Clona e invierte la ruta de ida para generar la de regreso
            returnRoute.value = [...newValue].reverse()
        } else {
            returnRoute.value = []
        }
    },
    { deep: true } // 👈 importante: observa los cambios internos del array
)

watch(goRoute, (newValue) => {
    if (Array.isArray(newValue) && newValue.length > 0) {
        // Clona e invierte la ruta de ida para generar la de regreso
        returnRoute.value = [...newValue].reverse()
    } else {
        returnRoute.value = []
    }
})


const mainreturnCity = ref([])

const meanstransportOptions = ref([{ data: 0, label: 'Aéreo' }, { data: 1, label: 'Terrestre' }, { data: 2, label: 'Fluvial' }])

const goMeanstransport = ref([])

const temporarygoMeanstransport = ref(null)

const savegoMeanstransport = ref(null)

const returnMeanstransport = ref([])

const temporaryreturnMeanstransport = ref(null)

const savereturnMeanstransport = ref(false)


const loadingCounty = ref(true)

const loadingCity = ref(false)


const mainRegional = ref([])

const regional = ref(null)

const regionalOptions = ref([])

const institute = ref(null)

const loadingInstitute = ref(false)

const instituteOptions = ref([])

// 🔄 Sincroniza los medios de transporte de regreso con los de ida
watch(
    goMeanstransport,
    (newValue) => {
        if (Array.isArray(newValue) && newValue.length > 0) {
            // Clona el arreglo para evitar referencias compartidas
            returnMeanstransport.value = [...newValue]
        } else {
            returnMeanstransport.value = []
        }
    },
    { deep: true } // 👈 observa los cambios dentro del arreglo
)


async function getOptions(value) {
    loadingInstitute.value = true
    if (value) {
        const { data } = await scheduleStore.getInstitute(value.data)

        institute.value = ''

        instituteOptions.value.splice(0)

        for (let index = 0; index < data.length; index++) {
            instituteOptions.value.push({ label: data[index].name, data: data[index]._id })
        }
    } else {
        instituteOptions.value.splice(0)
        institute.value = ''
    }
    loadingInstitute.value = false
}

const place = ref([])

const placecountyOptions = ref([])

const placecityOptions = ref([])

const otherPlace = ref(null)

const placeCounty = ref(null)

const placeCity = ref(null)

const mainplaceCounty = ref([])

const mainplaceCity = ref([])

const company = ref(null)

const companyContact = ref(null)

const tripStart = ref('')

const tripEnd = ref('')

const tripObjective = ref(null)

const duties = ref([{}])

const activities = ref([])

const infoClassification = ref(null)

const isEditing = ref(false)

watch([tripStart, tripEnd], () => {
    if (isEditing.value) return

    if (!tripStart.value || !tripEnd.value) {
        activities.value = []
        return
    }

    const today = date.formatDate(Date.now(), 'YYYY-MM-DD')

    if (tripStart.value > tripEnd.value || tripStart.value < today) {
        showNotify('Fecha Desplazamiento incorrecta.', 'negative')
        activities.value = []
        return
    }

    const start = new Date(tripStart.value)
    const end = new Date(tripEnd.value)
    const totalDays = date.getDateDiff(end, start, 'days') + 1

    const existing = [...activities.value]

    activities.value = []

    for (let i = 0; i < totalDays; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)

        const dateStr = d.toISOString().slice(0, 10)

        const oldDay = existing.find(a => a.date === dateStr)

        activities.value.push(
            oldDay || {
                date: dateStr,
                items: [{ data: '', startTime: '', endTime: '', startPeriod: 'AM', endPeriod: 'AM' }]
            }
        )
    }
})


const observations = ref(defaultObservations())



function defaultObservations() {
    return [
        {
            key: 'air_terminal',
            text: 'Se liquidan gastos de transporte entre terminales aéreas por valor de',
            amount: 0,
            enabled: false,
            fromApi: false,
            type: 'aerea',
            selected: null
        },
        {
            key: 'land_terminal',
            text: 'Se liquidan gastos de transporte entre terminales terrestres por valor de',
            amount: 0,
            enabled: true,
            fromApi: true,
            type: 'terrestres',
            selected: null
        },
        {
            key: 'intermunicipal',
            text: 'Se liquidan gastos de transporte intermunicipal por valor de',
            amount: 0,
            enabled: true,
            fromApi: false
        },
        {
            key: 'interveral',
            text: 'Se liquidan gastos de transporte interveredal por valor de',
            amount: 0,
            enabled: false,
            fromApi: false
        }
    ]
}

// Combina los datos del servidor con los defaults para preservar campos
// exclusivos del frontend (fromApi, type, text) que el servidor puede no devolver
function restoreObservations(serverObs) {
    const defaults = defaultObservations()
    return defaults.map(def => {
        const saved = (serverObs || []).find(o => o.key === def.key)
        if (!saved) return def
        return {
            ...saved,
            fromApi: def.fromApi,
            type: def.type,
            text: def.text
        }
    })
}




const signFileInput = ref(null)

function onSignFileChange(event) {
    const file = event.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
        showNotify('Solo se permiten imágenes', 'negative')
        return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
        sign.value.contractor = e.target.result
        yaFirmo.value = true
        showNotify('Firma cargada correctamente', 'positive', 'check_circle')
    }
    reader.readAsDataURL(file)
    event.target.value = ''
}


function formatDateDMY(dateStr) {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
}


async function createSchedule() {
    loading.value = true

    if (!currentUser.value) {
        showNotify('Error: usuario no cargado, recarga la página', 'negative')
        loading.value = false
        return
    }

    if (goRoute.value.length === 0) {
        showNotify('Falta ruta de ida', 'negative')

    } else if (goMeanstransport.value.length === 0) {
        showNotify('Faltan medios de transporte de ida', 'negative')

    } else if (returnRoute.value.length === 0) {
        showNotify('Falta ruta de regreso', 'negative')

    } else if (returnMeanstransport.value.length === 0) {
        showNotify('Falta medios de transporte de regreso', 'negative')

    } else if (!regional.value && place.value.length === 0) {
        showNotify('Falta Dirección General / Regional', 'negative')

    } else if (!institute.value && place.value.length === 0) {
        showNotify('Falta Dependencia / Centro', 'negative')

    } else if (!regional.value && place.value.length === 0) {
        showNotify('Falta Ciudad o País desplazamiento', 'negative')

    } else if (company.value === null || !company.value.trim()) {
        showNotify('Digite la entidad o empresa', 'negative')

    } else if (companyContact.value === null || !companyContact.value.trim()) {
        showNotify('Digite el contacto', 'negative')

    } else if (!tripStart.value) {
        showNotify('Seleccione la fecha de inicio del desplazamiento', 'negative')

    } else if (!tripEnd.value) {
        showNotify('Seleccione la fecha de fin del desplazamiento', 'negative')

    } else if (tripStart.value < isoDate) {
        showNotify('La fecha de inicio no puede ser anterior al día de hoy', 'negative')

    } else if (tripEnd.value < isoDate) {
        showNotify('La fecha de fin no puede ser anterior al día de hoy', 'negative')

    } else if (tripObjective.value === null || !tripObjective.value.trim()) {
        showNotify('Digite el objetivo del viaje/desplazamiento', 'negative')

    } else if (duties.value.length === 0) {
        showNotify('No hay obligaciones', 'negative')

    } else if (observations.value.length === 0) {
        showNotify('No hay observaciones', 'negative')

    } else if (!infoClassification.value) {
        showNotify('Seleccione la clasificación de la información', 'negative')

    } else if (!activities.value || activities.value.length === 0) {
        showNotify('Debe agregar al menos una actividad', 'negative')

    } else {
        // 🔎 VALIDAR ACTIVIDADES Y HORAS
        for (let i = 0; i < activities.value.length; i++) {
            const activityDay = activities.value[i]

            if (!activityDay.date) {
                showNotify(`Falta la fecha en la actividad #${i + 1}`, 'negative')
                loading.value = false
                return
            }

            if (!activityDay.items || activityDay.items.length === 0) {
                showNotify(
                    `Debe agregar actividades en la fecha ${formatDateDMY(activityDay.date)}`,
                    'negative'
                )
                loading.value = false
                return
            }

            for (let j = 0; j < activityDay.items.length; j++) {
                const item = activityDay.items[j]

                if (!item.data || !item.data.trim()) {
                    showNotify(
                        `Falta la descripción en una actividad (${formatDateDMY(activityDay.date)})`,
                        'negative'
                    )
                    loading.value = false
                    return
                }

                if (!item.startTime) {
                    showNotify(
                        `Falta la hora de inicio en una actividad (${formatDateDMY(activityDay.date)})`,
                        'negative'
                    )
                    loading.value = false
                    return
                }

                if (!item.endTime) {
                    showNotify(
                        `Falta la hora de fin en una actividad (${formatDateDMY(activityDay.date)})`,
                        'negative'
                    )
                    loading.value = false
                    return
                }
            }
        }

        // ✅ TODO OK → ENVÍO AL BACKEND
        const { data, status } = await scheduleStore.postSchedule({
            contractor: currentUser.value._id,
            userId: currentUser.value._id,

            contract: {
                mail: currentUser.value.mail,
                number: contract.value.number,
                date: contract.value.date,
                contractorName: contractor.value,
                identification: currentUser.value.identification,
                object: object.value,
                regional: currentRegional.value.name,
                institute: currentInstitute.value.name
            },

            route: {
                go: goRoute.value,
                return: returnRoute.value
            },

            meanstransport: {
                go: goMeanstransport.value,
                return: returnMeanstransport.value
            },

            regional: regional.value !== null ? regional.value.label : null,
            institute: institute.value !== null ? institute.value.label : null,
            place: place.value.length !== 0 ? place.value[0].data : null,

            company: company.value,
            companyContact: companyContact.value,
            tripStart: tripStart.value,
            tripEnd: tripEnd.value,
            tripObjective: tripObjective.value,

            duties: duties.value,
            observations: observations.value,

            activities: activities.value.map(a => ({
                date: a.date,
                items: a.items.map(i => ({
                    data: i.data,
                    startTime: i.startTime || null,
                    endTime: i.endTime || null,
                    startPeriod: i.startPeriod || 'AM',
                    endPeriod: i.endPeriod || 'AM'
                }))
            })),

            infoClassification: infoClassification.value,

            supervisor: supervisor.value,
            paymaster: paymaster.value,

            signature: {
                contractor: sign.value.contractor !== null ? sign.value.contractor : null
            },

            status: {
                index: sign.value.contractor !== null ? 1 : null,
                data:
                    sign.value.contractor !== null
                        ? 'Agenda firmada por Contratista'
                        : 'Agenda Contratista creada',
                number: 1
            }
        })

        if (status !== 200) {
            showNotify(data.msg, 'negative')
        } else {
            showNotify(
                'Agenda Creada, pendiente por aprobación del supervisor',
                'positive',
                'check_circle'
            )
            await cleanDialog()
            confirm.value = false
        }
    }

    loading.value = false
}



async function updateSchedule() {
    loading.value = true
    if (goRoute.value.length === 0) {
        showNotify('Falta ruta de ida', 'negative')
    } else if (goMeanstransport.value.length === 0) {
        showNotify('Faltan medios de transporte de ida', 'negative')
    } else if (returnRoute.value.length === 0) {
        showNotify('Falta ruta de regreso', 'negative')
    } else if (returnMeanstransport.value.length === 0) {
        showNotify('Falta medios de transporte de regreso', 'negative')
    } else if (!regional.value && place.value.length === 0) {
        showNotify('Falta Dirección General / Regional', 'negative')
    } else if (!institute.value && place.value.length === 0) {
        showNotify('Falta Dependencia / Centro', 'negative')
    } else if (!regional.value && place.value.length === 0) {
        showNotify('Falta Ciudad o País desplazamiento', 'negative')
    } else if (company.value === null || !company.value.trim()) {
        showNotify('Digite la entidad o empresa', 'negative')
    } else if (companyContact.value === null || !companyContact.value.trim()) {
        showNotify('Digite el contacto', 'negative')
    } else if (!tripStart.value) {
        showNotify('Seleccione la fecha de inicio del desplazamiento', 'negative')
    } else if (!tripEnd.value) {
        showNotify('Seleccione la fecha de fin del desplazamiento', 'negative')
    } else if (tripObjective.value === null || !tripObjective.value.trim()) {
        showNotify('Digite el objetivo del viaje/desplazamiento', 'negative')
    } else if (duties.value.length === 0) {
        showNotify('No hay obligaciones', 'negative')
    } else if (observations.value.length === 0) {
        showNotify('No hay observaciones', 'negative')
    } else {
        await scheduleStore.putSchedule({
            userId: currentUser.value._id,
            route: {
                go: goRoute.value,
                return: returnRoute.value
            },
            meanstransport: {
                go: goMeanstransport.value,
                return: returnMeanstransport.value
            },
            regional: regional.value !== null ? regional.value.label : null,
            institute: institute.value !== null ? institute.value.label : null,
            place: place.value.length !== 0 ? place.value[0].data : null,
            company: company.value,
            companyContact: companyContact.value,
            tripStart: tripStart.value,
            tripEnd: tripEnd.value,
            tripObjective: tripObjective.value,
            duties: duties.value,
            observations: observations.value,
            activities: activities.value.map(a => ({
                date: a.date,
                items: a.items.map(i => ({
                    data: i.data,
                    startTime: i.startTime || null,
                    endTime: i.endTime || null,
                    startPeriod: i.startPeriod || 'AM',
                    endPeriod: i.endPeriod || 'AM'
                }))
            })),
            signature: {
                contractor: sign.value.contractor !== null ? sign.value.contractor : null
            },
            status: {
                index: sign.value.contractor !== null ? 1 : null,
                data: sign.value.contractor !== null ? 'Agenda firmada por Contratista' : 'Agenda Contratista creada',
                justification: null,
                number: 1
            },
            createdAt: Date.now()
        }, id.value)

        showNotify('Agenda modificada y enviada correctamente', 'positive', 'check_circle')

        confirm.value = false

        await cleanDialog()
    }
    loading.value = false

}
async function confirmDelete(row) {
    $q.dialog({
        title: 'Eliminar agenda',
        message: '¿Está seguro de que desea eliminar esta agenda? Esta acción no se puede deshacer.',
        ok: { label: 'Eliminar', color: 'negative', icon: 'delete' },
        cancel: { label: 'Cancelar', color: 'primary', flat: true },
        persistent: true
    }).onOk(async () => {
        const { status } = await scheduleStore.deleteSchedule(row._id)
        if (status === 200) {
            showNotify('Agenda eliminada exitosamente', 'positive', 'check_circle')
            rows.value = await getSchedule(currentUser.value._id, { contractor: true })
        } else {
            showNotify('Error al eliminar la agenda', 'negative')
        }
    })
}

function syncHoursAllDays(field) {
    if (!activities.value.length) return

    const baseDay = activities.value[0]
    if (!baseDay.items.length) return

    const baseValue = baseDay.items[0][field]
    if (!baseValue) return

    activities.value.forEach((day, dayIndex) => {
        day.items.forEach((item, itemIndex) => {
            if (dayIndex === 0 && itemIndex === 0) return

            // 🔹 SIEMPRE actualiza
            item[field] = baseValue
        })
    })
}
</script>

<style scoped>
.border-bottom {
    border-bottom: 1px solid black;
}

/* Títulos de sección del formulario */
.form-section-title {
    font-size: 17px;
    font-weight: 600;
    border-left: 4px solid currentColor;
    padding-left: 10px;
    margin-top: 12px !important;
    margin-bottom: 8px !important;
}

/* Tarjetas clickeables (ruta/transporte) */
.clickable-card {
    cursor: pointer;
    border: 1.5px dashed #bdbdbd !important;
    transition: background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    min-height: 56px;
}

.clickable-card:hover {
    background-color: #e8f5e9 !important;
    box-shadow: 0 2px 10px rgba(76, 175, 80, 0.25) !important;
    border-color: #4caf50 !important;
}

/* Animación chips */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scale(0.85);
}

/* Sección lugar inline */
.place-inline-form {
    background-color: #f9f9f9;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
}

.place-disabled {
    opacity: 0.5;
    pointer-events: none;
}

#invoice {
    font-family: Arial, sans-serif;
    word-spacing: 1px;
}
</style>