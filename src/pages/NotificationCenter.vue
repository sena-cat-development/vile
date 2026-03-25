<template>
  <q-btn round dense flat icon="notifications" data-notification-btn :class="{ 'btn-pulse': unreadCount > 0 }">
    <q-badge v-if="unreadCount" color="red" floating>
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </q-badge>

    <q-menu anchor="bottom right" self="top right" transition-show="jump-down" transition-hide="jump-up">
      <q-card class="notif-card">

        <!-- HEADER -->
        <q-card-section class="row items-center justify-between q-py-sm q-px-md">
          <div class="row items-center q-gutter-xs">
            <span class="text-subtitle2 text-weight-bold">Notificaciones</span>
            <q-badge v-if="unreadCount" color="primary" rounded>{{ unreadCount }}</q-badge>
          </div>
          <div class="row items-center q-gutter-xs">
            <q-btn v-if="unreadCount" flat dense no-caps size="sm" label="Marcar leídas" color="primary" @click="notifStore.markAllAsRead(uid)" />
            <q-btn flat dense round icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-separator />

        <!-- EMPTY -->
        <q-card-section v-if="!grouped.length" class="text-center q-py-xl">
          <q-icon name="notifications_none" size="3.5rem" color="grey-4" />
          <div class="text-grey-5 q-mt-sm text-body2">Sin notificaciones</div>
        </q-card-section>

        <!-- LIST -->
        <q-scroll-area v-else style="height: 460px">
          <template v-for="group in grouped" :key="group.label">
            <div class="group-label">{{ group.label }}</div>

            <transition-group tag="div" name="notif">
              <q-item
                v-for="note in group.items"
                :key="note._id || note.id"
                clickable v-ripple
                class="notif-item"
                :class="{ 'is-unread': !note.read, 'is-rejected': isRejected(note) && !note.read }"
                @click="notifStore.markAsRead(note._id || note.id)"
              >
                <q-item-section avatar>
                  <q-avatar :color="meta(note).color" text-color="white" :icon="meta(note).icon" size="34px" />
                </q-item-section>

                <q-item-section>
                  <!-- Badges -->
                  <div class="row q-gutter-xs q-mb-xs">
                    <q-badge :color="meta(note).color" :label="meta(note).label" />
                    <q-badge v-if="note.data?.scheduleType" outline color="blue-grey"
                      :label="note.data.scheduleType === 'contractor' ? 'Contratista' : 'Funcionario'" />
                  </div>

                  <!-- Mensaje -->
                  <q-item-label class="text-body2" :class="{ 'text-weight-medium': !note.read }" lines="3">
                    {{ clean(note.message) }}
                  </q-item-label>

                  <!-- Actor -->
                  <q-item-label v-if="note.data?.actorName" caption class="text-grey-6 q-mt-xs">
                    <q-icon name="person" size="xs" /> {{ note.data.actorName }}
                  </q-item-label>

                  <!-- Motivo de rechazo -->
                  <div v-if="isRejected(note) && justification(note)" class="rejection-box q-mt-xs">
                    <q-icon name="info" size="xs" class="q-mr-xs" />{{ justification(note) }}
                  </div>

                  <!-- Tiempo -->
                  <q-item-label caption class="text-grey-5 q-mt-xs">
                    <q-icon name="schedule" size="xs" /> {{ relativeTime(note.timestamp || note.createdAt) }}
                    <q-tooltip>{{ fullDate(note.timestamp || note.createdAt) }}</q-tooltip>
                  </q-item-label>
                </q-item-section>

                <!-- Indicador no leído -->
                <q-item-section v-if="!note.read" side>
                  <div class="unread-dot" />
                </q-item-section>
              </q-item>
            </transition-group>
          </template>
        </q-scroll-area>

        <!-- FOOTER -->
        <template v-if="grouped.length">
          <q-separator />
          <div class="text-center text-caption text-grey-5 q-py-xs">
            {{ sorted.length }} notificaciones
            <template v-if="unreadCount">
              · <span class="text-primary">{{ unreadCount }} sin leer</span>
            </template>
          </div>
        </template>

      </q-card>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '../stores/notificationStore'
import { useUserStore } from '../stores/user'

const notifStore = useNotificationStore()
const userStore  = useUserStore()

// ── ID del usuario actual ──────────────────────────────────────────────────
const uid = computed(() => userStore.user?._id || userStore.user?.id)

// ── Contador sin leer ──────────────────────────────────────────────────────
const unreadCount = computed(() => notifStore.unreadCount)

// ── Notificaciones ordenadas ───────────────────────────────────────────────
const sorted = computed(() => {
  const list = Array.isArray(notifStore.myNotifications) ? notifStore.myNotifications : []
  return [...list].sort((a, b) =>
    +new Date(b.timestamp || b.createdAt || 0) - +new Date(a.timestamp || a.createdAt || 0)
  )
})

// ── Agrupadas por fecha ────────────────────────────────────────────────────
const grouped = computed(() => {
  const now   = new Date()
  const sod   = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const today = sod(now)
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1)
  const week  = new Date(today); week.setDate(week.getDate() - 7)

  const buckets = { today: [], yesterday: [], week: [], older: [] }

  for (const note of sorted.value) {
    const d = new Date(note.timestamp || note.createdAt || 0)
    if      (d >= today) buckets.today.push(note)
    else if (d >= yest)  buckets.yesterday.push(note)
    else if (d >= week)  buckets.week.push(note)
    else                 buckets.older.push(note)
  }

  return [
    { label: 'Hoy',         items: buckets.today },
    { label: 'Ayer',        items: buckets.yesterday },
    { label: 'Esta semana', items: buckets.week },
    { label: 'Anteriores',  items: buckets.older },
  ].filter(g => g.items.length)
})

// ── Metadatos visuales (delegado al store) ────────────────────────────────
const meta = (note) => notifStore.getNoteMeta(note)

// ── Helpers de mensaje ────────────────────────────────────────────────────
const clean = (msg) => (msg || '').replace(/\bundefined\b/g, '').replace(/\s+/g, ' ').trim()

const isRejected = (note) => meta(note).process === 'rechazado'

const justification = (note) => {
  if (note.data?.justification && note.data.justification !== '-') return note.data.justification
  const match = (note.message || '').match(/[Mm]otivo:\s*"?([^"]+)"?/)
  return match?.[1]?.trim() ?? null
}

// ── Formato de tiempo ─────────────────────────────────────────────────────
const relativeTime = (ts) => {
  if (!ts) return ''
  const mins = Math.floor((Date.now() - new Date(ts)) / 60_000)
  if (mins <  1)  return 'Ahora'
  if (mins < 60)  return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return `Hace ${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days <  7)  return `Hace ${days} d`
  return fullDate(ts)
}

const fullDate = (ts) =>
  ts ? new Date(ts).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : ''
</script>

<style scoped>
/* Campana animada */
.btn-pulse :deep(.q-badge) {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.2); }
}

/* Tarjeta */
.notif-card {
  width: 380px;
  max-width: 95vw;
}

/* Encabezado de grupo */
.group-label {
  padding: 5px 16px 3px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--q-color-grey-6, #90a4ae);
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

/* Items */
.notif-item { transition: background 0.2s; }

.is-unread {
  border-left: 3px solid var(--q-primary);
  background: rgba(25, 118, 210, 0.05);
}

.is-rejected {
  border-left-color: var(--q-negative) !important;
  background: rgba(201, 50, 50, 0.05) !important;
}

/* Punto no leído */
.unread-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--q-primary);
}

/* Motivo de rechazo */
.rejection-box {
  display: inline-flex;
  align-items: flex-start;
  background: rgba(201, 50, 50, 0.07);
  border: 1px solid rgba(201, 50, 50, 0.2);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11.5px;
  color: #c13030;
  line-height: 1.4;
}

/* Transición de entrada/salida */
.notif-enter-active, .notif-leave-active { transition: all 0.22s ease; }
.notif-enter-from { opacity: 0; transform: translateY(-5px); }
.notif-leave-to   { opacity: 0; transform: translateX(8px); }
</style>