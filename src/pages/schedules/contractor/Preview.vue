<template>
  <div class="document-container" id="element" style="font-family: 'Calibri', sans-serif; font-size: 11px;">
    <!-- ENCABEZADO: Logo + Versión/Código -->
    <div style="display: flex; border-bottom: 2px solid black;">

      <!-- Logo SENA -->
      <div style="
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 66px;
    padding: 4px;
    border-right: 1px solid black;
  ">
        <img src="../../../assets/sena-icono-nuevo.png" style="
        height: 60px;
        width: auto;
        display: block;
            margin-left: 90px; /* ajusta aquí */

      " />
      </div>

      <!-- Versión y Código -->
      <div style="
    width: 120px;
    display: flex;
    flex-direction: column;
  ">
        <div style="border-bottom: 1px solid black; padding: 4px; text-align: center;">
          <p class="q-my-none" style="font-size: 10px;">Versión: 01</p>
        </div>
        <div style="padding: 4px; text-align: center;">
          <p class="q-my-none" style="font-size: 10px;">
            Código:<br />GCCON-F-095
          </p>
        </div>
      </div>

    </div>

    <!-- PROCESO -->
    <div
      style="background-color: #161515; color: white; text-align: center; padding: 4px 0; border-bottom: 1px solid black;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">PROCESO</p>
    </div>
    <div style="text-align: center; padding: 5px 0; border-bottom: 1px solid black;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">GESTIÓN CONTRACTUAL</p>
    </div>

    <!-- NOMBRE DEL FORMATO -->
    <div
      style="background-color: #161515; color: white; text-align: center; padding: 4px 0; border-bottom: 1px solid black;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">NOMBRE DEL FORMATO</p>
    </div>
    <div style="text-align: center; padding: 5px 0; border-bottom: 1px solid black;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">FORMATO AGENDA DESPLAZAMIENTO CONTRATISTA</p>
    </div>

    <!-- CLASIFICACIÓN DE LA INFORMACIÓN -->
    <div
      style="background-color: #161515; color: white; text-align: center; padding: 4px 0; border-bottom: 1px solid black;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">CLASIFICACIÓN DE LA INFORMACIÓN</p>
    </div>
    <div style="display: flex; border-bottom: 2px solid black;">
      <div
        style="flex: 1; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 5px; cursor: pointer;"
        @click="infoClassification = 'Pública'">
        <span style="font-weight: bold;">Pública</span>
        <div
          style="width: 16px; height: 16px; border: 1px solid black; margin-left: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span v-if="infoClassification === 'Pública'" style="font-weight: bold; font-size: 12px;">X</span>
        </div>
      </div>
      <div
        style="flex: 1; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 5px; cursor: pointer;"
        @click="infoClassification = 'Pública Clasificada'">
        <span style="font-weight: bold;">Pública Clasificada</span>
        <div
          style="width: 16px; height: 16px; border: 1px solid black; margin-left: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span v-if="infoClassification === 'Pública Clasificada'" style="font-weight: bold; font-size: 12px;">X</span>
        </div>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 5px; cursor: pointer;"
        @click="infoClassification = 'Pública Reservada'">
        <span style="font-weight: bold;">Pública Reservada</span>
        <div
          style="width: 16px; height: 16px; border: 1px solid black; margin-left: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span v-if="infoClassification === 'Pública Reservada'" style="font-weight: bold; font-size: 12px;">X</span>
        </div>
      </div>
    </div>

    <!-- Separador vacío (fila 9 en Excel) -->
    <div style="height: 4px; border-bottom: 1px solid black;"></div>

    <!-- DATOS DEL CONTRATISTA QUE SE DESPLAZA -->
    <div
      style="background-color: white; color: black; text-align: center; padding: 3px 0; border-bottom: 1px solid black;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">DATOS DEL CONTRATISTA QUE SE DESPLAZA</p>
    </div>

    <!-- Fecha de elaboración de agenda -->
    <div style="display: flex; border-bottom: 1px solid black;">
      <div style="flex: 0 0 55%; border-right: 1px solid black; padding: 4px 6px; display: flex; align-items: center;">
        <p class="q-my-none" style="font-size: 10px; font-weight: bold;">FECHA DE ELABORACIÓN DE AGENDA</p>
      </div>
      <div style="flex: 1; padding: 4px; display: flex; align-items: center; justify-content: center;">
        <p class="q-my-none">
          {{ createdAt && currentUser.role.data !== 'user'
            ? date.formatDate(createdAt, 'DD/MM/YYYY')
            : date.formatDate(Date.now(), 'DD/MM/YYYY') }}
        </p>
      </div>
    </div>

    <!-- Nombres y Apellidos / Identificación (headers) -->
    <div style="display: flex; border-bottom: 1px solid black;">
      <div style="flex: 0 0 55%; border-right: 1px solid black; padding: 4px 6px; text-align: center;">
        <p class="q-my-none" style="font-weight: bold;">NOMBRES Y APELLIDOS</p>
      </div>
      <div style="flex: 1; padding: 4px; text-align: center;">
        <p class="q-my-none" style="font-weight: bold;">IDENTIFICACIÓN:</p>
      </div>
    </div>

    <!-- Nombres y Apellidos / Identificación (datos) -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 30px;">
      <!-- Nombre -->
      <div
        style="flex: 0 0 55%; border-right: 1px solid black; padding: 4px 6px; display: flex; align-items: center; justify-content: center;">
        <p v-text="contractor || '-'" class="q-my-none" />
      </div>
      <!-- Tipo + No. + Número -->
      <div style="flex: 1; display: flex; align-items: stretch;">
        <div
          style="flex: 0 0 33.1%; border-right: 1px solid black; display: flex; flex-direction: center; justify-content: center; padding: 2px 4px;">
          <p class="q-my-none" style="font-size: 10px; font-weight: bold;">Tipo:</p>
        </div>
        <div
          style="flex: 0 0 22%; border-right: 1px solid black; display: flex; flex-direction: column; justify-content: center; padding: 2px 4px;">
          <p v-text="identification.data || 'C.C.'" class="q-my-none" style="text-align: center;" />
        </div>
        <div
          style="flex: 0 0 16%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 2px 4px;">
          <p class="q-my-none" style="font-size: 9px; font-weight: bold;">No.</p>
        </div>
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 2px 4px;">
          <p v-text="identification || '0000000000'" class="q-my-none" />
        </div>
      </div>
    </div>

    <!-- Contrato -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 26px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 2px 4px;">
        <p class="q-my-none" style="font-weight: bold; font-size: 10px;">CONTRATO</p>
      </div>
      <div
        style="flex: 0 0 11%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 9px;">No.</p>
      </div>
      <div
        style="flex: 0 0 10%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 2px;">
        <p v-text="contract.number || ''" class="q-my-none" />
      </div>
      <div
        style="flex: 0 0 6%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 9px;">AÑO</p>
      </div>
      <div
        style="flex: 0 0 8%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 2px;">
        <p v-text="contract.date.start.slice(0, 4)" class="q-my-none" />
      </div>
      <div
        style="flex: 0 0 14.9%; border-right: 1px solid black; display: flex; align-items: center; padding: 2px 4px;">
        <p class="q-my-none" style="font-size: 8px; font-weight: bold; line-height: 1.2;">FECHA VENCIMIENTO DEL CONTRATO
        </p>
      </div>
      <!-- DD / MM / AA -->
      <div
        style="flex: 0 0 9.9%; border-right: 1px solid black; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 8px;"></p>
        <p v-text="contract.date.end.slice(8, 10)" class="q-my-none" />
      </div>
      <div
        style="flex: 0 0 7.2%; border-right: 1px solid black; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 8px;"></p>
        <p v-text="contract.date.end.slice(5, 7)" class="q-my-none" />
      </div>
      <div
        style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 8px;"></p>
        <p v-text="contract.date.end.slice(2, 4)" class="q-my-none" />
      </div>
    </div>

    <!-- Objeto Contractual -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 24px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-weight: bold; font-size: 10px;">OBJETO CONTRACTUAL:</p>
      </div>
      <div style="flex: 1; padding: 3px 6px; display: flex; align-items: center;">
        <p v-text="object || ''" class="q-my-none" style="white-space: normal; word-break: break-word;" />
      </div>
    </div>

    <!-- Dirección General / Regional | Dependencia / Centro -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 32px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 9px; font-weight: bold; line-height: 1.2;">DIRECCIÓN
          GENERAL/<br />REGIONAL</p>
      </div>
      <div
        style="flex: 0 0 35%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px 6px;">
        <p v-text="currentRegional || ''" class="q-my-none" />
      </div>
      <div style="flex: 0 0 15%; border-right: 1px solid black; display: flex; align-items: center;  padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 9px; font-weight: bold; line-height: 1.2;">DEPENDENCIA/<br />CENTRO</p>
      </div>
      <div
        style="flex: 1; display: flex; align-items: center; justify-content: center;text-align: center; padding: 3px 6px;">
        <p v-text="currentInstitute || ''" class="q-my-none" />
      </div>
    </div>

    <!-- Nombre Ordenador del Gasto -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 30px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 8px; font-weight: bold; line-height: 1.3;">NOMBRE DEL ORDENADOR DEL GASTO
          (de la Movilización)</p>
      </div>
      <div
        style="flex: 0 0 35%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px 6px;">
        <p v-text="paymaster.name || '-'" class="q-my-none" />
      </div>
      <div style="flex: 0 0 15%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 9px; font-weight: bold;">CARGO</p>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 3px 6px;">
        <p v-text="paymaster.position || '-'" class="q-my-none" />
      </div>
    </div>

    <!-- Nombre Supervisor -->
    <div style="display: flex; border-bottom: 2px solid black; min-height: 30px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 8px; font-weight: bold; line-height: 1.3;">NOMBRE DEL SUPERVISOR(A) DEL
          CONTRATO</p>
      </div>
      <div
        style="flex: 0 0 35%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px 6px;">
        <p v-text="supervisor.name || '-'" class="q-my-none" />
      </div>
      <div style="flex: 0 0 15%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 9px; font-weight: bold;">CARGO</p>
      </div>
      <div
        style="flex: 1; display: flex; align-items: center; justify-content: center;text-align: center; padding: 3px 6px;">
        <p v-text="supervisor.position || '-'" class="q-my-none" />
      </div>
    </div>

    <!-- INFORMACIÓN DEL DESPLAZAMIENTO -->
    <div
      style="background-color: #161515; color: white; text-align: center; padding: 3px 0; border-bottom: 1px solid black;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">INFORMACIÓN DEL DESPLAZAMIENTO</p>
    </div>

    <!-- RUTA -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 24px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-weight: bold;">RUTA</p>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 3px 6px;">
        <p v-text="getRoute()" class="q-my-none" />
      </div>
    </div>

    <!-- Dirección General / Regional destino | Dependencia / Centro destino -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 30px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 8px; font-weight: bold; line-height: 1.2;">DIRECCIÓN
          GENERAL/<br />REGIONAL</p>
      </div>
      <div
        style="flex: 0 0 35%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px 6px;">
        <p v-text="regional || '-'" class="q-my-none" />
      </div>
      <div
        style="flex: 0 0 15%; border-right: 1px solid black; display: flex; align-items: center;justify-content: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 8px; font-weight: bold; line-height: 1.2;">DEPENDENCIA/<br />CENTRO</p>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 3px 6px;">
        <p v-text="institute || '-'" class="q-my-none" style="" />
      </div>
    </div>

    <!-- Ciudad / Entidad / Contacto -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 36px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 8px; font-weight: bold; line-height: 1.3;">CIUDAD/DEPARTAMENTO O
          MUNICIPIO/DEPARTAMENTO O CIUDAD/PAÍS</p>
      </div>
      <div
        style="flex: 0 0 27%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px 4px;">
        <p v-text="place ? place[0].data : '-'" class="q-my-none" />
      </div>
      <div style="flex: 0 0 8%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 4px;">
        <p class="q-my-none" style="font-size: 8px; font-weight: bold; line-height: 1.3;">ENTIDAD O EMPRESA:</p>
      </div>
      <div
        style="flex: 0 0 25%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px 4px;">
        <p v-text="company || '-'" class="q-my-none" />
      </div>
      <div style="flex: 0 0 7.3%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 4px;">
        <p class="q-my-none" style="font-size: 8px; font-weight: bold;">CONTACTO</p>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 3px 4px;">
        <p v-text="companyContact || '-'" class="q-my-none" />
      </div>
    </div>

    <!-- Fecha inicio / fin desplazamiento -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 28px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 9px; font-weight: bold;">FECHA INICIO DEL DESPLAZAMIENTO</p>
      </div>
      <div
        style="flex: 0 0 10%; border-right: 1px solid black; display: flex; flex-direction: center; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 8px;"></p>
        <p v-text="tripStart.slice(8, 10) || ''" class="q-my-none" />
      </div>
      <div
        style="flex: 0 0 11%; border-right: 1px solid black; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 8px;"></p>
        <p v-text="tripStart.slice(5, 7) || ''" class="q-my-none" />
      </div>
      <div
        style="flex: 0 0 6%; border-right: 1px solid black; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 8px;"></p>
        <p v-text="tripStart.slice(2, 4) || ''" class="q-my-none" />
      </div>
      <div style="flex: 0 0 23%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 9px; font-weight: bold;">FECHA FIN DESPLAZAMIENTO</p>
      </div>
      <div
        style="flex: 0 0 10%; border-right: 1px solid black; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 8px;"></p>
        <p v-text="tripEnd.slice(8, 10) || ''" class="q-my-none" />
      </div>
      <div
        style="flex: 0 0 7.3%; border-right: 1px solid black; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 8px;"></p>
        <p v-text="tripEnd.slice(5, 7) || ''" class="q-my-none" />
      </div>
      <div
        style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px;">
        <p class="q-my-none" style="font-size: 8px;"></p>
        <p v-text="tripEnd.slice(2, 4) || ''" class="q-my-none" />
      </div>
    </div>

    <!-- Objetivo del desplazamiento -->
    <div style="display: flex; border-bottom: 1px solid black; min-height: 28px;">
      <div style="flex: 0 0 20%; border-right: 1px solid black; display: flex; align-items: center; padding: 3px 6px;">
        <p class="q-my-none" style="font-size: 9px; font-weight: bold;">OBJETIVO DEL DESPLAZAMIENTO</p>
      </div>
      <div style="flex: 1; padding: 3px 6px; display: flex; align-items: center; justify-content: center;">
        <p v-text="tripObjective || ''" class="q-my-none" />
      </div>
    </div>

    <!-- OBLIGACIONES DEL CONTRATO -->
    <div style="border-top: 2px solid black; border-bottom: 2px solid black; text-align: center; padding: 3px 0;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">OBLIGACIONES DEL CONTRATO</p>
    </div>

    <div v-for="(element, index) in duties" :key="index"
      style="display: flex; border-bottom: 1px solid black; min-height: 26px;">
      <div
        style="flex: 0 0 8%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 2px;">
        <p v-text="index + 1" class="q-my-none" />
      </div>
      <div style="flex: 1; padding: 3px 6px; display: flex; align-items: center;">
        <p v-text="element.data || ''" class="q-my-none" />
      </div>
    </div>

    <!-- AGENDA -->
    <div
      style="background-color: #161515; color: white; text-align: center; padding: 3px 0; border-bottom: 1px solid black;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">AGENDA</p>
    </div>
    <div style="text-align: center; padding: 3px 6px; border-bottom: 1px solid black; font-weight: bold;">
      <p class="q-my-none">ACTIVIDADES (Deberá contener información detallada de las tareas a realizar día a día)</p>
    </div>

    <!-- Actividades por día -->
    <template v-for="(element, index) in activities" :key="index">
      <div style="border: 1px solid black; margin-bottom: -1px;">

        <!-- Cabecera del día -->
        <div style="display: flex; border-bottom: 1px solid black;">
          <!-- Etiqueta del día -->
          <div
            style="flex: 0 0 7.5%; background-color: black; color: white; display: flex; align-items: center; justify-content: center; padding: 3px; border-right: 1px solid black; font-weight: bold;">
            <p class="q-my-none" style="font-size: 10px;">
              {{
                index === 0
                  ? 'Día Inicio'
                  : index === activities.length - 1
                    ? 'Día Fin'
                    : `Día ${index + 1}`
              }}
            </p>
          </div>
          <!-- Fecha DD / MM / AAAA -->
          <div style="display: flex; flex: 1;">
            <div
              style="flex: 0 0 13%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px;">
              <p class="q-my-none" style="font-weight: bold;">{{ element.date.slice(8) }}</p>
            </div>
            <div
              style="flex: 0 0 12%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px;">
              <p class="q-my-none" style="font-weight: bold;">{{ element.date.slice(5, 7) }}</p>
            </div>
            <div
              style="flex: 0 0 11%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px;">
              <p class="q-my-none" style="font-weight: bold;">{{ element.date.slice(0, 4) }}</p>
            </div>
            <div style="flex: 1;"></div>
          </div>
        </div>

        <!-- Ruta de ida (solo primer día) -->
        <div v-if="index === 0">
          <div style="display: flex; border-bottom: 1px solid black;">
            <div style="flex: 0 0 40.8%; border-right: 1px solid black; padding: 3px 6px; font-weight: bold;">
              Desplazamiento ruta de ida:
            </div>
            <div style="flex: 1; padding: 3px 6px; display: flex; align-items: center; justify-content: center;">
              <span v-if="goRoute && goRoute.length">{{goRoute.map(r => r.label || r.data).join(' - ')}}</span>
              <span v-else>-</span>
            </div>
          </div>
          <div style="display: flex; border-bottom: 1px solid black;">
            <div style="flex: 0 0 40.8%; border-right: 1px solid black; padding: 3px 6px; font-weight: bold;">
              Medio de transporte: aéreo, terrestre, fluvial:
            </div>
            <div style="flex: 1; padding: 3px 6px; display: flex; align-items: center; justify-content: center;">
              <span v-if="goMeanstransport && goMeanstransport.length">{{goMeanstransport.map(t => t.label ||
                t.data).join(', ')}}</span>
              <span v-else>-</span>
            </div>
          </div>
        </div>

        <!-- Actividades a ejecutar (header) -->
        <div style="text-align: center; padding: 3px; border-bottom: 1px solid black; font-weight: bold;">
          <p class="q-my-none">Actividades a ejecutar:</p>
        </div>

        <!-- Items de actividad -->
        <div style="display: flex; border-bottom: 1px solid black;">
          <!-- Día (número) -->
          <div
            style="flex: 0 0 7.5%; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; padding: 3px; font-weight: bold;">
            <p class="q-my-none">{{ element.date.slice(8) }}</p>
          </div>
          <!-- Lista de items -->
          <div style="flex: 1; display: flex; flex-direction: column;">
            <template v-for="(item, itemIndex) in element.items" :key="itemIndex">
              <div
                :style="`display: flex; align-items: stretch; ${itemIndex > 0 ? 'border-top: 1px solid black;' : ''}`">
                <!-- Hora -->
                <div
                  style="flex: 0 0 13%; border-right: 1px solid black; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px; font-weight: bold; line-height: 1.3; min-height: 22px;">
                  <template v-if="item.startTime || item.endTime">
                    <span> HORA:{{ item.startTime || '--:--' }} {{ item.startPeriod || '' }}</span>
                    <span v-if="item.endTime">a {{ item.endTime }} {{ item.endPeriod || '' }}</span>
                  </template>
                  <template v-else>
                    <span>--:--</span>
                  </template>
                </div>
                <!-- Descripción -->
                <div
                  style="flex: 1; padding: 3px 6px; display: flex; align-items: center; justify-content: center; text-align: center;">
                  <p class="q-my-none" style="white-space: normal; word-break: break-word;">{{ item.data }}</p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Ruta de regreso (solo último día) -->
        <div v-if="index === activities.length - 1">
          <div style="display: flex; border-bottom: 1px solid black;">
            <div style="flex: 0 0 40.8%; border-right: 1px solid black; padding: 3px 6px; font-weight: bold;">
              Desplazamiento ruta de regreso:
            </div>
            <div style="flex: 1; padding: 3px 6px; display: flex; align-items: center; justify-content: center;">
              <span v-if="returnRoute && returnRoute.length">{{returnRoute.map(r => r.label || r.data).join(' - ')
              }}</span>
              <span v-else>-</span>
            </div>
          </div>
          <div style="display: flex;">
            <div style="flex: 0 0 40.8%; border-right: 1px solid black; padding: 3px 6px; font-weight: bold;">
              Medio de transporte: aéreo, terrestre, fluvial:
            </div>
            <div style="flex: 1; padding: 3px 6px; display: flex; align-items: center; justify-content: center;">
              <span v-if="returnMeanstransport && returnMeanstransport.length">{{returnMeanstransport.map(t => t.label
                ||
                t.data).join(', ')}}</span>
              <span v-else>-</span>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- OBSERVACIONES -->
    <div
      style="background-color: #161515; color: white; text-align: center; padding: 3px 0; border-top: 1px solid black; border-bottom: 1px solid black; margin-top: -1px;">
      <p class="q-my-none" style="font-size: 11px; font-weight: bold;">OBSERVACIONES</p>
    </div>

    <div style="border: 1px solid black; border-top: none;">
      <div v-for="(element, index) in visualObservations" :key="element.key"
        :style="`padding: 4px 12px; ${index !== visualObservations.length - 1 ? 'border-bottom: 1px solid black;' : ''}`">
        <p class="q-my-none">
          {{ element.text }}
          <strong>
            {{ typeof element.amount === 'number' ? `$${element.amount.toLocaleString('es-CO')}` : '______________' }}
          </strong>
          <span v-if="element.key === 'intermunicipal'" class="q-ml-sm">
            <span v-if="element.cdp && element.cdpName">
              <strong>CDP:</strong> {{ element.cdp }} {{ element.cdpName }} -
            </span>
            <span v-if="monthlyFee">
              <strong>Honorarios Mensuales:</strong> ${{ monthlyFee.toLocaleString('es-CO') }}
            </span>
          </span>
        </p>
      </div>
    </div>

    <!-- FIRMAS -->
    <div style="display:flex; border:1px solid black; border-top:2px solid black; align-items:stretch;">

      <!-- Columna 1 -->
      <div style="flex:1; border-right:1px solid black; display:flex; flex-direction:column;">
        <div style="padding:4px 6px;">
          <p class="q-my-none" style="font-weight:bold; font-size:10px;">
            FIRMA ORDENADOR DE GASTO:
          </p>

          <q-img v-if="sign.paymaster" fit="contain" :src="sign.paymaster"
            style="width:180px; max-height:90px; margin-top:6px;" />
        </div>

        <div style="margin-top:auto; border-top:1px solid black; padding:3px 6px;">
          <p class="q-my-none" style="font-size:10px;">
            Nombres y Apellidos: {{ paymaster.name || '' }}
          </p>
        </div>

      </div>

      <!-- Columna 2 -->
      <div style="flex:1; border-right:1px solid black; display:flex; flex-direction:column;">
        <div style="padding:4px 6px;">
          <p class="q-my-none" style="font-weight:bold; font-size:10px;">
            FIRMA SUPERVISOR DEL CONTRATO:
          </p>

          <q-img v-if="sign.supervisor" fit="contain" :src="getFullUrl(sign.supervisor)"
            style="width:180px; max-height:90px; margin-top:6px;" />

        </div>

        <div style="margin-top:auto; border-top:1px solid black; padding:3px 6px;">
          <p class="q-my-none" style="font-size:10px;">
            Nombres y Apellidos: {{ supervisor.name || '' }}
          </p>
        </div>

      </div>

      <!-- Columna 3 -->
      <div style="flex:1; display:flex; flex-direction:column;">
        <div style="padding:4px 6px;">
          <p class="q-my-none" style="font-weight:bold; font-size:10px;">
            FIRMA DEL CONTRATISTA:
          </p>

          <q-img v-if="sign.contractor" fit="contain" :src="getFullUrl(sign.contractor)"
            style="width:180px; max-height:90px; margin-top:6px;" />
        </div>

        <div>
          <!-- vacío -->
        </div>
      </div>

    </div>

    <!-- Cargos debajo de firmas -->
    <div style="display: flex; border: 1px solid black; border-top: none;">
      <div style="flex: 1; border-right: 1px solid black; padding: 3px 6px;">
        <p v-text="`Cargo: ${paymaster.position || ''}`" class="q-my-none" style="font-size: 10px;" />
      </div>
      <div style="flex: 1; border-right: 1px solid black; padding: 3px 6px;">
        <p v-text="`Cargo: ${supervisor.position || ''}`" class="q-my-none" style="font-size: 10px;" />
      </div>
      <div style="flex: 1; padding: 3px 6px;">
        <p v-text="`Nombres y Apellidos: ${contractor || ''}`" class="q-my-none" style="font-size: 10px;" />
      </div>
    </div>
  </div>

  <div style="
  position: absolute;
  bottom: 1px;
  right: 410px;
  font-size: 10px;
">
    GTH-F-090 V.05
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { date, useQuasar } from 'quasar'
import { useUserStore } from '../../../stores/user.js'

const $q = useQuasar()
const userStore = useUserStore()

// En un computed o cuando cargues los datos
const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const encoded = encodeURI(path);
  return `${import.meta.env.VITE_API_URL}${encoded}`;
}

const props = defineProps({
  row: Object
})

const visualObservations = computed(() => {
  return (props.row?.observations || [])
    .map(o => ({
      ...o,
      enabled: o.enabled ?? true
    }))
    .filter(o => {
      if (o.key === 'air_terminal') return true
      return o.enabled && o.amount > 0
    })
})



async function getContractor(id) {
  console.log('🟡 getContractor ejecutado con ID:', id)
  const { data } = await userStore.getUserParams(id)
  return data
}

function getRoute() {
  if (!goRoute.value.length || !returnRoute.value.length) return ''

  // Ruta de ida
  const go = goRoute.value.map(item => item.data)

  // Ruta de regreso (evitando duplicar el primer punto si es igual al último de ida)
  const returnFiltered = returnRoute.value
    .map(item => item.data)
    .filter((item, index) => {
      if (index === 0 && item === go[go.length - 1]) {
        return false
      }
      return true
    })

  return [...go, ...returnFiltered].join(' - ')
}

onBeforeMount(async () => {
  console.log('🟠 onBeforeMount ejecutado')
  console.log('🧩 Props recibidos:', props.row)

  currentUser.value = $q.localStorage.getItem('user')

  if (!props.row) {
    console.warn('⚠️ No se recibió props.row o está vacío')
    return
  }

  const user = await getContractor(props.row.contractor)

  contractor.value = user.name
  identification.value = user.identification
  contract.value = user.contract
  object.value = props.row.contract.object
  currentRegional.value = props.row.contract.regional
  currentInstitute.value = props.row.contract.institute
  createdAt.value = props.row.createdAt
  supervisor.value = props.row.supervisor
  paymaster.value = props.row.paymaster
  regional.value = props.row.regional
  institute.value = props.row.institute

  if (props.row.place !== null) {
    place.value = [{ data: props.row.place }]
  }

  monthlyFee.value = user.monthlyFee?.amount || 0
  company.value = props.row.company
  companyContact.value = props.row.companyContact
  tripStart.value = props.row.tripStart
  tripEnd.value = props.row.tripEnd
  tripObjective.value = props.row.tripObjective
  duties.value = props.row.duties
  observations.value = props.row.observations
  activities.value = props.row.activities
  sign.value = props.row.signature
  goRoute.value = props.row.route.go
  returnRoute.value = props.row.route.return
  infoClassification.value = props.row.infoClassification || 'Sin Clasificar '

  for (let index = 0; index < props.row.meanstransport.go.length; index++) {
    goMeanstransport.value.push({ label: props.row.meanstransport.go[index].data })
  }

  for (let index = 0; index < props.row.meanstransport.return.length; index++) {
    returnMeanstransport.value.push({ label: props.row.meanstransport.return[index].data })
  }

  // 🧾 LOG COMPLETO DE DATOS DEL FORMULARIO

  console.log('🏷️ Clasificación:', infoClassification.value)
})

// 🧩 VARIABLES REACTIVAS
const currentUser = ref({})
const contractor = ref(null)
const identification = ref({})
const createdAt = ref('')
const contract = ref({
  number: null,
  date: {
    start: '',
    end: ''
  }
})
const object = ref(null)
const currentRegional = ref(null)
const currentInstitute = ref(null)
const supervisor = ref({})
const paymaster = ref({})
const regional = ref(null)
const institute = ref(null)
const place = ref(null)
const company = ref(null)
const companyContact = ref(null)
const tripStart = ref('')
const tripEnd = ref('')
const tripObjective = ref(null)
const duties = ref([])
const observations = ref([{ data: '' }])
const activities = ref([{ date: '', items: [{ data: '', startTime: '', endTime: '', startPeriod: 'AM', endPeriod: 'AM' }] }])
const sign = ref({})
const goRoute = ref([])
const returnRoute = ref([])
const goMeanstransport = ref([])
const returnMeanstransport = ref([])
const infoClassification = ref(null)
const monthlyFee = ref(0)
</script>




<style scoped>
.border-bottom {
  border-bottom: 1px solid black;
}

.border-right {
  border-right: 1px solid black;
}

.document-container {
  width: 100%;
  max-width: 840px;
  /* se adapta en pantalla */
  margin: 0 auto;
  background: white;
  font-family: Arial, sans-serif;
  font-size: 11px;
  border: 2px solid black;
}

/* 🔥 Modo exportación carta */
.document-container.export-mode {
  width: 816px !important;
  min-height: 1056px !important;
  max-width: 816px !important;
}

#element,
#element * {
  font-family: 'Calibri', sans-serif !important;
  font-size: 11px !important;
}
</style>