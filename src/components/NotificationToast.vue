<template>
  <div class="n-toast" @click="dismiss">

    <!-- Avatar con ícono del tipo -->
    <q-avatar :color="meta.color" text-color="white" :icon="meta.icon" size="38px" class="n-toast__avatar" />

    <!-- Cuerpo -->
    <div class="n-toast__body">

      <!-- Badges: proceso + tipo de personal -->
      <div class="n-toast__badges">
        <q-badge :color="meta.color" :label="meta.label" />
        <q-badge
          v-if="note.data?.scheduleType"
          outline
          color="white"
          :label="note.data.scheduleType === 'contractor' ? 'Contratista' : 'Funcionario'"
        />
      </div>

      <!-- Mensaje principal -->
      <div class="n-toast__message">{{ cleanMessage }}</div>

      <!-- Actor (quién realizó la acción) -->
      <div v-if="note.data?.actorName" class="n-toast__actor">
        <q-icon name="person" size="xs" class="q-mr-xs" />
        {{ note.data.actorName }}
      </div>

      <!-- Justificación si fue rechazada -->
      <div v-if="isRejected && justification" class="n-toast__rejection">
        <q-icon name="error_outline" size="xs" class="q-mr-xs" />
        {{ justification }}
      </div>

      <!-- Hora relativa con tooltip de fecha completa -->
      <div class="n-toast__time">
        <q-icon name="schedule" size="xs" class="q-mr-xs" />
        {{ relativeTime }}
        <q-tooltip anchor="bottom middle" self="top middle">{{ fullTimestamp }}</q-tooltip>
      </div>

    </div>

    <!-- Botón cerrar -->
    <q-btn flat round dense icon="close" size="xs" color="white" class="n-toast__close" @click.stop="dismiss" />

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  note:    { type: Object,   required: true },
  meta:    { type: Object,   required: true },
  dismiss: { type: Function, default: () => {} }
})

const cleanMessage = computed(() =>
  (props.note.message || '').replace(/\bundefined\b/g, '').replace(/\s+/g, ' ').trim()
)

const isRejected = computed(() => props.meta.process === 'rechazado')

const justification = computed(() => {
  if (props.note.data?.justification && props.note.data.justification !== '-') {
    return props.note.data.justification
  }
  const match = (props.note.message || '').match(/[Mm]otivo:\s*"?([^"]+)"?/)
  return match ? match[1].trim() : null
})

const relativeTime = computed(() => {
  const ts = props.note.timestamp || props.note.createdAt
  if (!ts) return ''
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  return `Hace ${Math.floor(hrs / 24)} d`
})

const fullTimestamp = computed(() => {
  const ts = props.note.timestamp || props.note.createdAt
  if (!ts) return ''
  return new Date(ts).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
})
</script>

<style scoped>
.n-toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 4px 10px 10px;
  min-width: 300px;
  max-width: 380px;
  cursor: pointer;
}

.n-toast__avatar {
  flex-shrink: 0;
  margin-top: 2px;
  opacity: 0.95;
}

.n-toast__body {
  flex: 1;
  min-width: 0;
}

.n-toast__badges {
  display: flex;
  gap: 4px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.n-toast__message {
  font-size: 13px;
  color: white;
  line-height: 1.45;
  word-break: break-word;
  font-weight: 500;
}

.n-toast__actor {
  display: flex;
  align-items: center;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 4px;
}

.n-toast__rejection {
  display: flex;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  padding: 3px 7px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.92);
  margin-top: 5px;
  line-height: 1.4;
}

.n-toast__time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 5px;
  display: flex;
  align-items: center;
}

.n-toast__close {
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: -2px;
}
</style>
