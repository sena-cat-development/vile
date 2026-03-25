<template>
    <q-page class="q-pa-md">
        <div class="text-h4 text-center q-mb-md">Agendas</div>
        <div class="row justify-center q-pt-md">

            <div v-show="!showPreview" class="col-8 q-mt-md" style="width: 90%;">
                <!-- TABLA MIA -->
                <q-table :loading="cargando" class="my-sticky-header-table" :rows="rows" :columns="columns"
                    row-key="name" :filter="filter">
                    <template v-slot:top-left>
                        <div @click="showDialog = true" v-show="!showPreview" class="col-8 justify-end flex">
                            <q-btn label="Crear Agenda" color="primary" icon="add" />
                        </div>
                    </template>

                    <template v-slot:top-right>
                        <q-input dense debounce="300" color="primary" v-model="filter" placeholder="Buscar">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>

                    <template v-slot:body-cell-opciones="props">
                        <q-td :props="props">
                            <q-icon @click="showEdit(props.row)" name="fa-solid fa-eye" size="20px" color="blue">
                                <q-tooltip>
                                    Ver
                                </q-tooltip>
                            </q-icon>
                        </q-td>
                    </template>

                    <template v-slot:body-cell-route="props">
                        <q-td :props="props">
                            <div class="row">
                                <div class="col-12">
                                    <p v-if="props.row.route.go.length > 2"
                                        v-text="`Ida: ${props.row.route.go[1].data} - ${props.row.route.go[props.row.route.go.length - 2].data}`"
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
                            <p v-if="props.row.regional & props.row.regional !== null" v-text="props.row.regional"
                                class="q-my-none text-center" />
                            <p v-else-if="props.row.places && props.row.places.length !== 0"
                                v-text="props.row.places[0].data" class="q-my-none text-center" />
                            <p v-else class="q-my-none text-center">-</p>
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

                    <template v-slot:body-cell-company="props">
                        <q-td key="company" :props="props">
                            <p v-text="props.row.institutes.length !== 0 ? props.row.institutes[0].data : '-'"
                                class="q-my-none text-center" />
                        </q-td>
                    </template>

                    <template v-slot:body-cell-estado="props">
                        <q-td :props="props">
                            <span :class="{ 'text-red': props.row.status.data === 'Agenda rechazada' }">Rechazada</span>
                        </q-td>
                    </template>

                </q-table>
            </div>

            <div v-show="showPreview" class="justify-end start q-mb-md" style="font-size: 12px;">
                <q-btn @click="descargarFormatoPDF" label="Descargar como PDF" icon="download"
                    class="bg-blue text-white" />
            </div>

            <div v-show="showPreview" class="col-8 justify-end  flex q-mb-md">
                <q-btn @click="showPreview = false; showDialog = true" icon="fa-solid fa-arrow-right"
                    label="Continuar Creación" class="bg-green text-white" />
            </div>

            <div id="invoice" ref="invoice" style="width: 60%;">
                <Preview v-if="showPreview" :row="row" />
            </div>

            <q-dialog v-model="showDialog" persistent>
                <q-card style="max-width: 55%;">
                    <q-card-section class="bg-primary text-white justify-between flex z-top"
                        style="position: sticky; top: 0;">
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
                                <p class="q-my-none text-primary form-section-title">Información Desplazamiento
                                </p>
                            </div>

                            <div class="row" style="width: 90%;">
                                <div class="col-6" style="padding-right: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <q-card flat bordered class="bg-grey-1 q-pa-sm rounded-borders">

                                            <div class="text-subtitle2 text-grey-7 q-mb-sm q-pl-sm">
                                                <q-icon name="directions" size="sm" class="q-mr-xs text-green-8" />
                                                Ruta de Ida
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

                                                    <q-input filled dense clearable label="Otro destino"
                                                        v-model.trim="goOther" class="q-mb-md"
                                                        hint="Escribe un destino personalizado"
                                                        prepend-icon="edit_location" />

                                                    <q-select filled dense use-input stack-label v-model="goCounty"
                                                        :options="gocountyOptions" label="Departamento" use-chips
                                                        emit-value map-options hint="Selecciona el departamento"
                                                        @filter="(val, update) => update(() => {
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

                                                    <q-select filled stack-label use-input use-chips multiple
                                                        v-model="goCity" :options="gocityOptions"
                                                        label="Seleccionar Municipio" :loading="loadingCity"
                                                        :disable="!goCounty" hint="Selecciona uno o varios municipios"
                                                        @filter="(val, update) => {
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

                                                    <div class="flex justify-end q-mt-md">
                                                        <q-btn color="green" label="Agregar" glossy unelevated push
                                                            icon="check" @click="() => {
                                                                if (goOther?.trim()) {
                                                                    goRoute.push({ data: goOther, id: null });
                                                                } else if (goCity.length > 0) {
                                                                    goCity.forEach(city => goRoute.push({ data: city.label, id: city.data }));
                                                                }
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
                                        <q-card flat bordered class="bg-grey-1 q-pa-sm rounded-borders">

                                            <div class="text-subtitle2 text-grey-7 q-mb-sm q-pl-sm">
                                                <q-icon name="directions_bus" size="sm" class="q-mr-xs text-green-8" />
                                                Ruta de Regreso
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

                                                    <q-input filled dense clearable stack-label
                                                        v-model.trim="returnOther" label="Otro destino"
                                                        prepend-icon="edit_location" class="q-mb-md" />

                                                    <q-select filled dense use-input stack-label v-model="returnCounty"
                                                        :options="returncountyOptions" label="Departamento" use-chips
                                                        emit-value map-options hint="Selecciona el departamento"
                                                        @filter="(val, update) => update(() => {
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

                                                    <q-select filled stack-label use-input use-chips multiple
                                                        v-model="returnCity" :options="returncityOptions"
                                                        label="Seleccionar Municipio" :loading="loadingCity"
                                                        hint="Selecciona uno o varios municipios" @filter="(val, update) => {
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
                                </div>

                                <div class="col-6" style="padding-left: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <q-card flat bordered class="bg-grey-1 q-pa-sm rounded-borders">

                                            <div class="text-subtitle2 text-grey-7 q-mb-sm q-pl-sm">
                                                <q-icon name="directions_car" size="sm" class="q-mr-xs text-green-8" />
                                                Medios de Transporte de Ida
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
                                        <q-card flat bordered class="bg-grey-1 q-pa-sm rounded-borders">

                                            <div class="text-subtitle2 text-grey-7 q-mb-sm q-pl-sm">
                                                <q-icon name="directions_bus" size="sm" class="q-mr-xs text-green-8" />
                                                Medios de Transporte de Regreso
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
                                </div>
                            </div>

                            <div class="row" style="width: 90%;">
                                <div class="col-6" style="padding-right: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <div class="row" style="background-color: whitesmoke;">
                                            <div class="col-12">
                                                <p class="q-my-none q-pl-sm q-pt-sm"
                                                    style="font-size: 12px; color: grey;">
                                                    Ciudad o
                                                    Municipio</p>
                                            </div>

                                            <div class="col-12">
                                                <div class="row q-px-sm">
                                                    <div class="col-auto" v-for="(element, index) in place">
                                                        <q-chip removable @remove="place.splice(index, 1)">
                                                            {{ element.data }}
                                                            <q-popup-edit v-model="element.data" v-slot="scope" buttons>
                                                                <q-input v-model="scope.value" filled />
                                                            </q-popup-edit>
                                                        </q-chip>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="col-12 q-pr-sm q-pb-sm justify-end flex">
                                                <q-btn round size="sm" icon="fa-solid fa-plus"
                                                    class="bg-primary text-white" @click="saveplaceOption = true" />
                                            </div>

                                            <div class="col-12" style="background-color: white;">
                                                <q-menu fit max-width="200px" v-model="saveplaceOption">
                                                    <div class="row">
                                                        <div class="col-12 q-pa-sm">
                                                            <q-input filled stack-label clearable
                                                                :disable="placeCounty !== null || placeCity !== null"
                                                                v-model.trim="otherPlace" label="Otro" />
                                                        </div>

                                                        <div class="col-12 q-pa-sm q-pt-md">
                                                            <q-select filled stack-label use-chips use-input
                                                                :disable="otherPlace !== null && otherPlace.length !== 0"
                                                                v-model="placeCounty" :options="placecountyOptions"
                                                                label="Departamento"
                                                                @filter="function (val, update) { update(() => { placecountyOptions = mainCounty.filter(element => element.label.toLowerCase().indexOf(val.toLowerCase()) > -1) }) }"
                                                                @update:model-value="async (value) => {
                                                                    if (value) {
                                                                        mainplaceCity = await getCity([value]); placecityOptions = await getCity([value]); placeCity = null; loadingCity = false
                                                                    } else {
                                                                        placeCity = null
                                                                        mainplaceCity.splice(0)
                                                                        placecityOptions.splice(0)
                                                                    }
                                                                }" />
                                                        </div>
                                                        <div class="col-12 q-pa-sm">
                                                            <q-select filled stack-label use-input
                                                                :disable="otherPlace !== null && otherPlace.length !== 0"
                                                                :loading="loadingCity" v-model="placeCity"
                                                                :options="placecityOptions" label="Municipio"
                                                                @filter="function (val, update) { update(() => { placecityOptions = mainplaceCity.filter(element => element.label.toLowerCase().indexOf(val.toLowerCase()) > -1) }) }" />
                                                        </div>
                                                    </div>
                                                    <div class="row justify-end q-pt-sm q-pb-md q-pr-sm">
                                                        <q-btn @click="() => {
                                                            if (otherPlace !== null && otherPlace.length !== 0) {
                                                                place.push({ data: otherPlace, id: null })
                                                            } else if (placeCity !== null) {
                                                                place.push({ data: placeCity.label, id: placeCity.data })
                                                            }

                                                            otherPlace = null
                                                            placeCounty = null
                                                            placeCity = null

                                                            mainplaceCity.splice(0)
                                                            placecityOptions.splice(0)

                                                            saveplaceOption = false
                                                        }" label="AGREGAR" class="bg-primary text-white" />
                                                    </div>
                                                </q-menu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6" style="padding-left: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <q-select filled stack-label use-chips use-input v-model="regional"
                                            :options="regionalOptions" label="Dirección General / Regional" @filter="function (val, update, abort) {
                                                update(() => {
                                                    const needle = val.toLowerCase()

                                                    regionalOptions = mainRegional.filter(element => element.label.toLowerCase().indexOf(needle) > -1)
                                                })
                                            }" />
                                    </div>
                                </div>
                            </div>

                            <div class="row" style="width:90%">
                                <div class="col-12">
                                    <div class="col-10 q-mt-md">
                                        <div class="row" style="background-color: whitesmoke;">
                                            <div class="col-6">
                                                <p class="q-my-none q-ml-sm q-mt-sm"
                                                    style="font-size: 12px; color: grey;">
                                                    Dependencia /
                                                    Centro de Formación / Sede / Institución a Visitar</p>
                                            </div>

                                            <div class="col-12" />

                                            <div class="col-12">
                                                <div class="row q-px-sm">
                                                    <div class="col-auto" v-for="(element, index) in mainInstitute">
                                                        <q-chip @remove="mainInstitute.splice(index, 1)" removable
                                                            :label="element.data" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="col-12 q-pr-sm q-pb-sm justify-end flex">
                                                <q-btn @click="saveinstituteOption = true" round size="sm"
                                                    icon="fa-solid fa-plus" class="bg-primary text-white" />
                                            </div>

                                            <div class="col-12" style="background-color: white;">
                                                <q-menu v-model="saveinstituteOption" fit max-width="200px">
                                                    <div class="row">
                                                        <div class="col-12 q-pa-sm">
                                                            <q-input v-model.trim="otherInstitute"
                                                                :disable="otherRegional !== null || institute !== null"
                                                                filled clearable stack-label label="Otro" />
                                                        </div>

                                                        <div class="col-12 q-px-sm q-mt-sm">
                                                            <q-select v-model="otherRegional"
                                                                :disable="otherInstitute !== null && otherInstitute.length !== 0"
                                                                filled use-input use-chips stack-label
                                                                label="Dirección General / Regional"
                                                                :options="otherregionalOptions"
                                                                @filter="function (val, update, abort) { update(() => { otherregionalOptions = mainRegional.filter(element => element.label.toLowerCase().indexOf(val.toLowerCase()) > -1) }) }"
                                                                @update:model-value="async function (value) {
                                                                    if (value) {
                                                                        await getInstitute(value)
                                                                    } else {
                                                                        institute = null
                                                                        instituteOptions.splice(0)
                                                                    }
                                                                }" />
                                                        </div>

                                                        <div class="col-12 q-pa-sm">
                                                            <q-select v-model="institute" :options="instituteOptions"
                                                                :disable="otherInstitute !== null && otherInstitute.length !== 0"
                                                                filled use-chips stack-label
                                                                label="Dependencia / Centro" />
                                                        </div>
                                                    </div>
                                                    <div class="row justify-end q-pr-sm q-my-sm">
                                                        <q-btn @click="function () {
                                                            if (otherInstitute !== null && otherInstitute.length !== 0) {
                                                                mainInstitute.push({ data: otherInstitute, id: null })
                                                            } else if (institute !== null) {
                                                                mainInstitute.push({ data: institute.label, id: institute.data })
                                                            }

                                                            otherInstitute = null

                                                            otherRegional = null

                                                            institute = null

                                                            instituteOptions.splice(0)

                                                            saveinstituteOption = false
                                                        }" label="Agregar" class="bg-primary text-white" />
                                                    </div>
                                                </q-menu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row" style="width:90%">
                                <div class="col-6" style="padding-right: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <q-input v-model="dateStart" filled stack-label color="primary"
                                            label="Fecha Inicio Desplazamiento" type="date" />
                                    </div>
                                </div>
                                <div class="col-6" style="padding-left: 8px;">
                                    <div class="col-10 q-mt-md">
                                        <q-input v-model="dateEnd" filled stack-label color="primary"
                                            label="Fecha Fin Desplazamiento" type="date" />
                                    </div>
                                </div>
                            </div>

                            <div class="row" style="width:90%">
                                <div class="col-12">
                                    <div class="col-10 q-mt-md">
                                        <q-input v-model="object" autogrow filled stack-label color="primary"
                                            label="Objeto de la comisión" />
                                    </div>
                                </div>
                            </div>

                        </div>
                        <br>

                        <div class="row justify-center">
                            <div class="col-12">
                                <p class="q-my-none text-primary form-section-title">Actividades</p>
                            </div>

                            <div class="col-12">
                                <div v-for="(element, index) in getActivities" :key="element.date">
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
                                                        <q-input filled stack-label autogrow v-model="item.data"
                                                            label="Actividad" class="q-my-sm text-body1" color="primary" />
                                                    </div>

                                                    <!-- Hora Inicio -->
                                                    <div class="col-2">
                                                        <q-input v-model="item.startTime" type="time"
                                                            label="Hora inicio" filled stack-label class="text-body1"
                                                            @update:model-value="val => {
                                                                item.startTime = val || null
                                                                index === 0 &&
                                                                    itemIndex === 0 &&
                                                                    syncHoursAllDays('startTime')
                                                            }" />

                                                    </div>

                                                    <!-- Hora Fin -->
                                                    <div class="col-2">
                                                        <q-input v-model="item.endTime" type="time" label="Hora fin"
                                                            filled stack-label class="text-body1"
                                                            @update:model-value="val => {
                                                                item.endTime = val || null
                                                                index === 0 &&
                                                                    itemIndex === 0 &&
                                                                    syncHoursAllDays('endTime')
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
                                            <q-btn :disable="!getActivities.length || getActivities[0].date === ''"
                                                @click="element.items.push({ data: '', startTime: '', endTime: '' })"
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

                            <div class="col-12" style="width: 90%;padding-right:8px">
                                <template v-for="(element, index) in observations">
                                    <div class="row">
                                        <div class="col-10 q-pa-sm" style="padding-right: 8px;">
                                            <q-input v-model="element.data" filled autogrow stack-label color="primary"
                                                label="Observación" />
                                        </div>

                                        <div v-if="index !== 0" class="col-2 items-center flex">
                                            <q-btn @click="observations.splice(index, 1)" dense label="Eliminar"
                                                color="negative" />
                                        </div>

                                        <div v-else class="col-2" />
                                    </div>
                                </template>

                                <div class="row justify-end q-mt-sm q-pr-md">
                                    <q-btn @click="observations.push({ data: '' })" icon="fa solid fa-plus" round
                                        size="xs" class="bg-primary text-white" style="font-size: 15px;" />
                                </div>
                            </div>
                        </div>

                        <div class="row justify-center">
                            <div class="col-12">
                                <p class="q-my-none text-primary form-section-title">Firma</p>
                            </div>

                            <div class="col-10">
                                <div class="row" style="background-color: whitesmoke;">
                                    <div class="col-12">
                                        <p class="q-my-none q-pl-sm q-pt-sm" style="font-size: 12px; color: grey;">Firma
                                            Funcionario:</p>
                                    </div>

                                    <div class="col-12">
                                        <q-img :src="sign.publicWorker" fit="contain"
                                            style="width: 200px; height: 80px;" />
                                    </div>

                                    <div class="col-12 justify-end flex q-pb-sm q-pr-sm">
                                        <q-btn :disable="sign.publicWorker !== null" @click="getSign()"
                                            icon="fa-solid fa-signature" label="Firmar" class="bg-primary text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-actions class="justify-around">
                        <q-btn @click="async function () {
                            await cleanDialog()
                            yaFirmo = false
                            showDialog = false
                        }" color="negative" label="Cerrar" icon="fa-solid fa-xmark" />
                        <q-btn :disable="yaFirmo === false" class="bg-primary text-white" icon="fa-solid fa-floppy-disk"
                            label="Guardar" @click="confirmarGuardar()" />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <q-dialog v-model="confirm" persistent>
                <q-card>
                    <q-card-section class="q-gutter-md text-center">
                        <q-img src="../../../assets/advertencia.png" fit="contain" style="height: 70px; width: 70px;" />
                        <p style="font-size: 18px;font-weight: bold;">¿Está seguro de que desea crear la agenda?</p>
                        <p style="font-size: 15px;">No podrá modificarla después</p>
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
import { ref, computed, onBeforeMount, watch } from 'vue'

import { date, useQuasar } from 'quasar'

import draggable from 'vuedraggable'


import { useScheduleStore } from '../../../stores/schedule.js'

import { useUserStore } from '../../../stores/user.js'

import { showNotify } from '../../../components/notify.js'

import { jsPDF } from "jspdf";

import Preview from './Preview.vue'



const scheduleStore = useScheduleStore()

const userStore = useUserStore()

const $q = useQuasar()

const observations = ref([]);

let cargando = ref(false)

const fechaActual = new Date()

const isoDate = fechaActual.toISOString().split('T')[0];

let yaFirmo = ref(false)

const invoice = ref(null)

let confirm = ref(false)

const autoReturnRoute = ref(true)

const autoReturnMeans = ref(true)

const getActivities = computed(() => activities.value)



function recargar() {
    window.location.reload()
}

function confirmarGuardar() {
    confirm.value = true
};

function descargarFormatoPDF() {
    const notif = $q.notify({
        type: 'ongoing',
        message: 'Generando PDF...'
    })

    const doc = new jsPDF('p', 'pt', 'letter');

    // Obtener el HTML del div con la referencia
    const invoiceElement = invoice.value

    // Guardar el ancho original del elemento
    const originalWidth = invoiceElement.style.width;

    // Establecer un ancho fijo para el contenido
    invoiceElement.style.width = '700px'; // Ajusta este valor según tus necesidades

    // Convertir el HTML a PDF usando jsPDF
    doc.html(invoiceElement, {
        callback: function (doc) {
            // Restaurar el ancho original del elemento
            invoiceElement.style.width = originalWidth;
            doc.save('formatoFuncionario.pdf');
            notif({
                type: 'positive',
                message: 'Formato en PDF descargado',
                timeout: 1300
            })
        },
        x: 65,
        y: 20,
        html2canvas: {
            scale: 0.65,
        },
        margin: [20, 20, 20, 20],
        autoPaging: 'text',
        width: 500 // Ajusta el ancho del contenido si es necesario
    });
}

onBeforeMount(async function () {
    cargando.value = true
    gocountyOptions.value = await getCounty()
    mainCounty.value = await getCounty()

    returncountyOptions.value = await getCounty()

    placecountyOptions.value = await getCounty()

    regionalOptions.value = await getCounty({ regional: true })
    mainRegional.value = await getCounty({ regional: true })

    otherregionalOptions.value = await getCounty({ regional: true })

    const user = $q.localStorage.getItem('user')

    const { data } = await userStore.getUserParams(user.id)

    currentUser.value = data

    //console.log(data)

    if (user.role.data == 'user') {
        currentUser.value.role = 'user'

        rows.value = await getSchedule(currentUser.value._id)
    }

    if (user.role.data == 'supervisor') {
        currentUser.value.role = 'supervisor'

        console.log(data)

        rows.value = await getSchedule(user.id, { supervisor: true })
    }
    cargando.value = false
})

async function getSign() {
    if (currentUser.value.sign) {
        sign.value.publicWorker = currentUser.value.sign.url
        yaFirmo.value = true
        showNotify('Agenda firmada', 'positive', 'check_circle')
    } else {
        showNotify('Error, Firma no encontrada', 'negative')
    }
}

async function getCounty(query = {}) {
    const { data } = await scheduleStore.getCounty(query)

    const county = []

    for (let index = 0; index < data.length; index++) {
        county.push({ data: data[index]._id, label: data[index].name })
    }

    return county
}

async function getSchedule(id, query = { publicWorker: true }) {
    const { data } = await scheduleStore.getScheduleParams(id, query)
    //console.log(data)

    return data
}

let filter = ref('')
function getPreview(sharedUser = null) {
    // 🔴 VALIDACIONES
    console.log('🚩 Rutas de DESPLAZAMIENTO:')
    console.log('  → IDA:', goRoute.value)
    console.log('  → REGRESO:', returnRoute.value)
    console.log('🚍 Medios de TRANSPORTE:')
    console.log('  → IDA:', goMeanstransport.value)
    console.log('  → REGRESO:', returnMeanstransport.value)

    const userId = sharedUser?._id || currentUser.value._id
    const userRole = sharedUser?.role || currentUser.value.role

    row.value = {
        createdAt: null,
        publicWorker: userRole == 'user' ? userId : null,
        supervisor_id: userRole == 'supervisor' ? userId : null,
        paymaster: {
            id: currentUser.value.paymaster?._id || null,
            name: currentUser.value.paymaster?.name || null,
            position: currentUser.value.paymaster?.position || null
        },
        tripStart: dateStart.value,
        tripEnd: dateEnd.value,
        places: place.value,
        regional: regional.value !== null ? regional.value.label : null,
        institutes: mainInstitute.value,
        tripObjective: object.value,
        activities: activities.value,
        route: {
            go: [...goRoute.value],
            return: [...returnRoute.value]
        },
        meanstransport: {
            go: [...goMeanstransport.value],
            return: [...returnMeanstransport.value]
        },
        observations: observations.value.map(obs => obs.data).filter(data => data.trim() !== ''),
        status: { index: null },
        signature: sign.value
    }

    console.log('✅ row.value creado:')
    console.log('  → route:', row.value.route)
    console.log('  → meanstransport:', row.value.meanstransport)

    showPreview.value = true
    showDialog.value = false
}


async function getCity(value) {
    // loadingCity.value = true

    const { data } = await scheduleStore.getCity(value[0].data)

    const cities = []

    for (let index = 0; index < data.length; index++) {
        cities.push({ data: data[index]._id, label: data[index].name })
    }

    return cities
}

async function getInstitute(value) {
    const { data } = await scheduleStore.getInstitute(value.data)

    institute.value = null

    instituteOptions.value.splice(0)

    for (let index = 0; index < data.length; index++) {
        instituteOptions.value.push({ data: data[index]._id, label: data[index].name })
    }

}

async function cleanDialog() {
    row.value = {}

    sign.value = {
        publicWorker: null,
        paymaster: null
    }

    status.value = null

    loading.value = false

    goRoute.value = []

    labelDialog.value = 'Crear Agenda'

    returnRoute.value = []

    goMeanstransport.value = []

    returnMeanstransport.value = []

    place.value = []

    regional.value = null

    mainInstitute.value = []

    id.value = null

    dateStart.value = ''

    dateEnd.value = ''

    object.value = ''

    activities.value = [{ date: '', items: [] }]

    sign.value = {
        publicWorker: null,
        paymaster: null
    }

    if (currentUser.value.role == 'user') {
        rows.value = await getSchedule(currentUser.value._id)
    }
}

async function createSchedule() {
    loading.value = true;

    try {
        if (goRoute.value.length === 0) {
            return showNotify('Falta ruta de ida', 'negative');
        } else if (goMeanstransport.value.length === 0) {
            return showNotify('Faltan medios de transporte de ida', 'negative');
        } else if (returnRoute.value.length === 0) {
            return showNotify('Falta ruta de regreso', 'negative');
        } else if (returnMeanstransport.value.length === 0) {
            return showNotify('Faltan medios de transporte de regreso', 'negative');
        } else if (place.value.length === 0) {
            return showNotify('Falta Ciudad o Municipio', 'negative');
        } else if (!regional.value) {
            return showNotify('Falta Dirección General / Regional', 'negative');
        } else if (mainInstitute.value.length === 0) {
            return showNotify('Falta Dependencia / Centro de Formación / Sede / Institución a Visitar', 'negative');
        } else if (!dateStart.value) {
            return showNotify('Seleccione la fecha de inicio', 'negative');
        } else if (!dateEnd.value) {
            return showNotify('Seleccione la fecha de fin', 'negative');
        } else if (dateStart.value < isoDate) {
            return showNotify('La fecha de inicio no puede ser anterior al día de hoy', 'negative');
        } else if (dateEnd.value < isoDate) {
            return showNotify('La fecha de fin no puede ser anterior al día de hoy', 'negative');
        } else if (object.value === null || !object.value.trim()) {
            return showNotify('Digite el objeto', 'negative');
        }

        // 🔍 Validaciones adicionales para evitar el TypeError
        if (!currentUser.value) {
            return showNotify('No hay un usuario autenticado', 'negative');
        }

        if (!currentUser.value._id) {
            return showNotify('El usuario actual no tiene un ID válido', 'negative');
        }

        if (!currentUser.value.paymaster) {
            return showNotify('El usuario no tiene un ordenador de gasto asignado', 'negative');
        }

        // ✅ Construcción segura del payload
        const { data, status } = await scheduleStore.postSchedule({
            userId: currentUser.value._id,
            publicWorker: currentUser.value.role == 'user' ? currentUser.value._id : null,
            supervisor_id: currentUser.value.role == 'supervisor' ? currentUser.value._id : null,
            contract: {
                mail: currentUser.value.mail,
                publicName: currentUser.value.name,
                publicBranch: currentUser.value.branch
            },
            typeSchedule: 'commission',
            route: {
                go: goRoute.value,
                return: returnRoute.value
            },
            paymaster: {
                id: currentUser.value.paymaster?._id || null,
                name: currentUser.value.paymaster?.name || null,
                position: currentUser.value.paymaster?.position || null
            },
            meanstransport: {
                go: goMeanstransport.value,
                return: returnMeanstransport.value
            },
            places: place.value,
            regional: regional.value !== null ? regional.value.label : null,
            institutes: mainInstitute.value,
            tripStart: dateStart.value,
            tripEnd: dateEnd.value,
            tripObjective: object.value,
            activities: activities.value,
            signature: sign.value,
            status: {
                index: sign.value.publicWorker !== null ? 2 : null,
                data: sign.value.publicWorker !== null
                    ? 'Agenda firmada por Funcionario'
                    : 'Agenda Creada',
                number: 1
            }
        });

        if (status !== 200) {
            showNotify(data.msg, 'negative');
        } else if (sign.value.publicWorker !== null) {
            showNotify('Agenda Creada, pendiente por legalizar', 'positive', 'check_circle');
            await cleanDialog();
            showDialog.value = false;
            confirm.value = false;
            yaFirmo.value = false;
        } else {
            showNotify('Agenda Creada', 'positive', 'check_circle');
        }
    } catch (error) {
        console.error('❌ Error al crear la agenda:', error);
        showNotify('Error inesperado al crear la agenda', 'negative');
    } finally {
        loading.value = false;
    }
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
    } else if (place.value.length === 0) {
        showNotify('Falta Ciudad o Municipio', 'negative')
    } else if (!regional.value) {
        showNotify('Falta Dirección General / Regional', 'negative')
    } else if (mainInstitute.value.length === 0) {
        showNotify('Falta Dependencia / Centro de Formación / Sede / Institución a Visitar', 'negative')
    } else if (!dateStart.value) {
        showNotify('Seleccione la fecha de inicio', 'negative')
    } else if (!dateEnd.value) {
        showNotify('Seleccione la fecha de fin', 'negative')
    } else if (dateStart.value < isoDate) {
        showNotify('La fecha de inicio no puede ser anterior al día de hoy', 'negative')
    } else if (dateEnd.value < isoDate) {
        showNotify('La fecha de fin no puede ser anterior al día de hoy', 'negative')
    } else if (object.value === null || !object.value.trim()) {
        showNotify('Digite el objeto', 'negative')
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
            places: place.value,
            regional: regional.value !== null ? regional.value.label : null,
            institutes: mainInstitute.value,
            tripStart: dateStart.value,
            tripEnd: dateEnd.value,
            tripObjective: object.value,
            activities: activities.value,
            signature: sign.value,
            status: {
                index: sign.value.publicWorker !== null ? 2 : null,
                data: sign.value.publicWorker !== null ? 'Agenda firmada por Funcionario' : 'Agenda Creada',
                number: 1
            }
        }, id.value)

        await cleanDialog()

        showNotify('Agenda modificada y enviada correctamente', 'positive', 'check_circle')

        showDialog.value = false

        confirm.value = false

        window.location.reload()
    }
    loading.value = false
}

function showEdit(row) {
    labelDialog.value = 'Editar Agenda'

    goRoute.value = row.route.go

    status.value = row.status

    dateStart.value = row.tripStart.slice(0, 10)

    dateEnd.value = row.tripEnd.slice(0, 10)

    returnRoute.value = row.route.return

    goMeanstransport.value = row.meanstransport.go

    returnMeanstransport.value = row.meanstransport.return

    id.value = row._id

    place.value = row.places

    if (row.regional !== null) {
        regional.value = { label: row.regional }
    }

    mainInstitute.value = row.institutes

    object.value = row.tripObjective

    activities.value = row.activities

    showDialog.value = true
}

const currentUser = ref(null)

const sign = ref({
    publicWorker: null,
    paymaster: null
})

const columns = ref([
    { name: 'route', label: 'Ruta', align: 'center', style: 'width: 300px', headerStyle: 'width: 300px' },
    { name: 'place', label: 'Lugar Desplazamiento', align: 'center' },
    { name: 'company', label: 'Entidad o Empresa', align: 'center' },
    { name: 'tripDate', label: 'Fecha Desplazamiento', align: 'center' },
    { name: 'estado', label: 'Estado', align: 'center' },
    { name: 'opciones', label: 'Acciones', align: 'center' }
])

const rows = ref([])

const id = ref(null)

const status = ref(null)

let loading = ref(false)

const showDialog = ref(false)

const showPreview = ref(false)

const labelDialog = ref('Crear Agenda')

const row = ref({})

const goRoute = ref([])

const savegoOption = ref(false)

const goCounty = ref(null)

const goCity = ref(null)

const goOther = ref(null)

const mainCounty = ref([])

const gocountyOptions = ref([])

const loadingCity = ref(false)


const gocityOptions = ref([])

const maingoCity = ref([])


const returnRoute = ref([])

const savereturnOption = ref(false)

const returnCounty = ref(null)

const returnCity = ref(null)

const returnOther = ref(null)

const returncountyOptions = ref({})

const returncityOptions = ref([])

const mainreturnCity = ref([])


const goMeanstransport = ref([])

const savegoMeanstransport = ref(false)

const temporarygoMeanstransport = ref(null)

const meanstransportOptions = ref([
    { data: 0, label: 'Aéreo' },
    { data: 1, label: 'Terrestre' },
    { data: 2, label: 'Fluvial' }
])

const returnMeanstransport = ref([])

const savereturnMeanstransport = ref(false)

const temporaryreturnMeanstransport = ref(null)


const place = ref([])

const saveplaceOption = ref(false)

const placeCounty = ref(null)

const placeCity = ref(null)

const otherPlace = ref(null)

const placecountyOptions = ref([])

const placecityOptions = ref([])

const mainplaceCity = ref([])


const regional = ref(null)

const regionalOptions = ref([])

const mainRegional = ref([])


const mainInstitute = ref([])

const saveinstituteOption = ref(false)

const otherInstitute = ref(null)

const institute = ref(null)

const instituteOptions = ref([])

const otherRegional = ref(null)

const otherregionalOptions = ref([])


const object = ref(null)

const activities = ref([])

const dateStart = ref('')

const dateEnd = ref('')




watch(
    goRoute,
    (newGoRoute) => {
        if (!autoReturnRoute.value) return

        // Copia profunda + inversión del orden
        returnRoute.value = [...newGoRoute]
            .map(r => ({ ...r }))
            .reverse()
    },
    { deep: true }
)

watch(
    goMeanstransport,
    (newGoMeans) => {
        if (!autoReturnMeans.value) return

        returnMeanstransport.value = newGoMeans.map(m => ({ ...m }))
    },
    { deep: true }
)

function getDatesBetween(start, end) {
    const dates = []
    let current = new Date(start)
    const last = new Date(end)

    while (current <= last) {
        dates.push(current.toISOString().slice(0, 10))
        current.setDate(current.getDate() + 1)
    }

    return dates
}

watch([dateStart, dateEnd], ([start, end]) => {
    if (!start || !end) return
    if (start > end) return

    const dates = getDatesBetween(start, end)

    activities.value = dates.map(date => {
        const existing = activities.value.find(a => a.date === date)

        return {
            date,
            items: existing?.items?.length
                ? existing.items
                : [{ data: '', startTime: null, endTime: null }]
        }
    })
})

function syncHoursAllDays(field) {
    if (!activities.value.length) return

    const baseDay = activities.value[0]
    if (!baseDay.items.length) return

    const baseValue = baseDay.items[0][field]
    if (!baseValue) return

    activities.value.forEach((day, dayIndex) => {
        day.items.forEach((item, itemIndex) => {
            if (dayIndex === 0 && itemIndex === 0) return
            if (!item[field]) {
                item[field] = baseValue
            }
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