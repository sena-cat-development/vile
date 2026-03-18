<template>
  <div>
    <q-btn round dense glossy color="primary" icon="notifications" :class="{ 'btn-pulse': notificationStore.unreadCount > 0 }">
      <q-badge v-if="notificationStore.unreadCount" color="red" floating>
        {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
      </q-badge>

      <q-menu anchor="bottom right" self="top right" transition-show="jump-down" transition-hide="jump-up">
        <q-card style="min-width: 360px; max-width: 420px">

          <!-- HEADER -->
          <q-card-section class="row items-center justify-between q-pb-sm q-pt-sm">
            <div class="row items-center gap-sm">
              <span class="text-subtitle1 text-weight-bold">Notificaciones</span>
              <q-badge v-if="notificationStore.unreadCount > 0" color="primary" rounded>
                {{ notificationStore.unreadCount }}
              </q-badge>
            </div>
            <div class="row items-center">
              <q-btn
                v-if="notificationStore.unreadCount > 0"
                flat dense no-caps size="sm"
                label="Marcar leídas"
                color="primary"
                class="q-mr-xs"
                @click="markAllAsRead()"
              />
              <q-btn flat dense round icon="close" v-close-popup />
            </div>
          </q-card-section>

          <q-separator />

          <!-- EMPTY -->
          <q-card-section v-if="!sortedNotifications.length" class="text-center q-py-xl">
            <q-icon name="notifications_none" size="3.5rem" color="grey-4" />
            <div class="text-grey-5 q-mt-sm text-body2">Sin notificaciones</div>
          </q-card-section>

          <!-- GROUPS -->
          <q-card-section v-else class="q-pa-none" style="max-height: 500px; overflow-y: auto;">
            <template v-for="group in groupedNotifications" :key="group.label">

              <!-- Encabezado de grupo -->
              <div class="group-header">{{ group.label }}</div>

              <q-list>
                <transition-group name="notif">
                  <q-item
                    v-for="note in group.items"
                    :key="note._id || note.id"
                    clickable v-ripple
                    :class="getItemClass(note)"
                    @click="markAsRead(note)"
                  >
                    <q-item-section avatar>
                      <q-avatar
                        :color="getProcessColor(note)"
                        text-color="white"
                        :icon="getProcessIcon(note)"
                        size="36px"
                      />
                    </q-item-section>

                    <q-item-section>
                      <!-- Badges -->
                      <q-item-label class="row items-center q-gutter-xs q-mb-xs">
                        <q-badge :color="getProcessColor(note)" :label="getProcessLabel(note)" />
                        <q-badge
                          v-if="note.data?.scheduleType"
                          outline
                          color="blue-grey"
                          :label="note.data.scheduleType === 'contractor' ? 'Contratista' : 'Funcionario'"
                        />
                      </q-item-label>

                      <!-- Mensaje -->
                      <q-item-label
                        class="text-body2"
                        :class="{ 'text-weight-medium': !note.read }"
                        style="line-height: 1.4"
                      >
                        {{ cleanMessage(note.message) }}
                      </q-item-label>

                      <!-- Actor -->
                      <q-item-label v-if="note.data?.actorName" caption class="text-grey-6 q-mt-xs">
                        <q-icon name="person" size="xs" class="q-mr-xs" />
                        {{ note.data.actorName }}
                      </q-item-label>

                      <!-- Motivo de rechazo -->
                      <q-item-label v-if="isRejected(note) && getJustification(note)" class="q-mt-xs">
                        <div class="rejection-reason">
                          <q-icon name="info" size="xs" class="q-mr-xs" />
                          {{ getJustification(note) }}
                        </div>
                      </q-item-label>

                      <!-- Tiempo relativo -->
                      <q-item-label caption class="q-mt-xs text-grey-5">
                        <q-icon name="schedule" size="xs" class="q-mr-xs" />
                        {{ formatRelativeTime(note.timestamp || note.createdAt) }}
                        <q-tooltip>{{ formatFullDate(note.timestamp || note.createdAt) }}</q-tooltip>
                      </q-item-label>
                    </q-item-section>

                    <!-- Punto de no leído -->
                    <q-item-section side v-if="!note.read">
                      <q-badge color="primary" rounded style="width:8px;height:8px;min-width:0" />
                    </q-item-section>
                  </q-item>
                </transition-group>
              </q-list>

            </template>
          </q-card-section>

          <!-- FOOTER -->
          <template v-if="sortedNotifications.length">
            <q-separator />
            <q-card-section class="q-py-xs text-center text-caption text-grey-5">
              {{ sortedNotifications.length }} notificaciones
              <span v-if="notificationStore.unreadCount > 0">
                · <span class="text-primary">{{ notificationStore.unreadCount }} sin leer</span>
              </span>
            </q-card-section>
          </template>

        </q-card>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useNotificationStore } from '../stores/notificationStore'
import { useUserStore } from '../stores/user'

const notificationStore = useNotificationStore()
const userStore = useUserStore()

/* Ordenar más recientes primero */
const sortedNotifications = computed(() =>
  [...notificationStore.allNotifications].sort((a, b) => {
    const tA = new Date(a.timestamp || a.createdAt || 0).getTime()
    const tB = new Date(b.timestamp || b.createdAt || 0).getTime()
    return tB - tA
  })
)

/* Agrupar por fecha */
const groupedNotifications = computed(() => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)

  const groups = { today: [], yesterday: [], week: [], older: [] }

  for (const note of sortedNotifications.value) {
    const d = new Date(note.timestamp || note.createdAt || 0)
    if (d >= todayStart)       groups.today.push(note)
    else if (d >= yesterdayStart) groups.yesterday.push(note)
    else if (d >= weekStart)   groups.week.push(note)
    else                       groups.older.push(note)
  }

  return [
    { label: 'Hoy',          items: groups.today },
    { label: 'Ayer',         items: groups.yesterday },
    { label: 'Esta semana',  items: groups.week },
    { label: 'Anteriores',   items: groups.older }
  ].filter(g => g.items.length > 0)
})

/* Limpiar mensaje */
const cleanMessage = (msg) =>
  (msg || '').replace(/\bundefined\b/g, '').replace(/\s+/g, ' ').trim()

/* Detectar proceso */
const detectProcess = (note) => {
  const si = note.data?.statusIndex ?? -1
  const sn = note.data?.statusNumber ?? -1
  const msg = (note.message || '').toLowerCase()

  if (si === 0  && sn === 1) return 'rechazado'
  if (si === 1  && sn === 1) return 'aprobacion'
  if (si === 2  && sn === 2) return 'aprobacion'
  if (si === 3  && sn === 3) return 'legalizacion'
  if (si === 4  && sn === 3) return 'rechazado'
  if (si === 5  && sn === 3) return 'legalizacion'
  if (si === 6  && sn === 3) return 'completado'

  if (msg.includes('rechazada') || msg.includes('rechazado')) return 'rechazado'
  if (msg.includes('cuenta de cobro') || msg.includes('completamente legalizada')) return 'completado'
  if (msg.includes('legalizada') || msg.includes('legalización')) return 'legalizacion'
  if (msg.includes('aprobada') || msg.includes('firmada')) return 'aprobacion'
  if (msg.includes('nueva agenda') || msg.includes('creada')) return 'creacion'
  return 'sistema'
}

const isRejected = (note) => detectProcess(note) === 'rechazado'

const getJustification = (note) => {
  if (note.data?.justification && note.data.justification !== '-') return note.data.justification
  const match = (note.message || '').match(/[Mm]otivo:\s*"?([^"]+)"?/)
  return match ? match[1].trim() : null
}

const COLOR_MAP = {
  creacion: 'blue', aprobacion: 'orange', legalizacion: 'purple',
  completado: 'positive', rechazado: 'negative', sistema: 'grey'
}
const ICON_MAP = {
  creacion: 'add_task', aprobacion: 'rule', legalizacion: 'gavel',
  completado: 'verified', rechazado: 'cancel', sistema: 'notifications'
}
const LABEL_MAP = {
  creacion: 'Creación', aprobacion: 'Aprobación', legalizacion: 'Legalización',
  completado: 'Completado', rechazado: 'Rechazado', sistema: 'Sistema'
}

const getProcessColor = (note) => COLOR_MAP[detectProcess(note)] ?? 'grey'
const getProcessIcon  = (note) => ICON_MAP[detectProcess(note)]  ?? 'notifications'
const getProcessLabel = (note) => LABEL_MAP[detectProcess(note)] ?? 'Sistema'

const getItemClass = (note) => {
  const classes = []
  if (!note.read) classes.push('unread-item')
  if (!note.read && isRejected(note)) classes.push('rejected-item')
  return classes.join(' ')
}

/* Tiempo relativo */
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return ''
  const mins = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
  if (mins < 1)  return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `Hace ${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `Hace ${days} d`
  return formatFullDate(timestamp)
}

const formatFullDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const markAsRead = async (note) => {
  const uid = userStore.user?._id || userStore.user?.id
  if (!uid) return
  await notificationStore.markAsRead(note._id || note.id, uid)
}

const markAllAsRead = async () => {
  const uid = userStore.user?._id || userStore.user?.id
  if (!uid) return
  await notificationStore.markAllAsRead(uid)
}

onMounted(() => {
  watch(
    () => userStore.user,
    async (user) => {
      if (!user) return
      const uid = user._id || user.id
      await notificationStore.loadNotifications(uid)
      notificationStore.initSocketListeners()
    },
    { immediate: true }
  )
})
</script>

<style scoped>
/* Badge animado cuando hay no leídas */
.btn-pulse :deep(.q-badge) {
  animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.2); }
}

/* Encabezado de grupo */
.group-header {
  padding: 6px 16px 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #90a4ae;
  background: #f5f7fa;
  border-bottom: 1px solid #eceff1;
}

/* Items no leídos */
.unread-item {
  background: linear-gradient(90deg, rgba(2, 123, 227, 0.07), transparent);
  border-left: 3px solid var(--q-primary);
}

.rejected-item {
  background: linear-gradient(90deg, rgba(201, 50, 50, 0.08), transparent) !important;
  border-left: 3px solid var(--q-negative) !important;
}

/* Caja de motivo de rechazo */
.rejection-reason {
  display: inline-flex;
  align-items: flex-start;
  background: rgba(201, 50, 50, 0.07);
  border: 1px solid rgba(201, 50, 50, 0.2);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11.5px;
  color: #c13030;
  line-height: 1.4;
  max-width: 100%;
}

/* Transición de items */
.notif-enter-active,
.notif-leave-active {
  transition: all 0.25s ease;
}
.notif-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.notif-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Scrollbar */
:deep(.q-card-section::-webkit-scrollbar)       { width: 5px; }
:deep(.q-card-section::-webkit-scrollbar-thumb) { background: #b0bec5; border-radius: 4px; }
</style>
