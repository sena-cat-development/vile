// stores/notificationStore.js
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { Notify } from 'quasar'
import { useUserStore } from './user.js'
import { useScheduleStore } from './schedule.js'
import { instance } from './index.js'
import NotificationToast from '../components/NotificationToast.vue'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toId   = (v) => v ? String(v?._id ?? v?.id ?? v) : ''
const socket = io(import.meta.env.VITE_API_URL, { autoConnect: false })
let _listenersAttached = false

// Mensajes por estado (statusIndex-statusNumber)
const STATUS_MESSAGES = {
  '0-1': ({ agendaName, reason }) =>
    `Tu agenda "${agendaName}" fue rechazada.${reason}`,
  '4-3': ({ agendaName, reason }) =>
    `La legalización de tu agenda "${agendaName}" fue rechazada.${reason}`,
  '1-1': ({ agendaName, staffTypeText, contractorName }) =>
    `Nueva agenda de ${staffTypeText} "${agendaName}" firmada por ${contractorName} — Pendiente de tu revisión`,
  '2-2': ({ agendaName, staffTypeText, supervisorName, isContractor }) =>
    isContractor
      ? `Tu agenda "${agendaName}" fue aprobada por ${supervisorName}`
      : `Agenda "${agendaName}" (${staffTypeText}) aprobada — Pendiente de legalización`,
  '3-3': ({ agendaName }) =>
    `La legalización de tu agenda "${agendaName}" está lista para revisar`,
  '5-2': ({ agendaName, contractorName, isSupervisor }) =>
    isSupervisor
      ? `Legalización de "${agendaName}" firmada por ${contractorName} — Pendiente de tu firma`
      : `Legalización de "${agendaName}" firmada por ${contractorName} — Pendiente de aprobación`,
  '6-2': ({ agendaName, staffTypeText, contractorName, isContractor }) =>
    isContractor
      ? `¡Proceso completado! Tu agenda "${agendaName}" está lista para cuenta de cobro`
      : `Agenda "${agendaName}" (${staffTypeText}: ${contractorName}) — Lista para cuenta de cobro`,
}

// Destinatarios por estado
const STATUS_RECIPIENTS = {
  '0-1': ({ contractorId })               => [contractorId],
  '4-3': ({ contractorId })               => [contractorId],
  '1-1': ({ supervisorId })               => [supervisorId],
  '2-2': ({ contractorId })               => [contractorId],
  '3-3': ({ contractorId })               => [contractorId],
  '5-2': ({ supervisorId })               => [supervisorId],
  '6-2': ({ contractorId })               => [contractorId],
}

// Metadatos visuales por proceso
const PROCESS_META = {
  rechazado:    { color: 'negative', icon: 'cancel'       },
  aprobacion:   { color: 'orange',   icon: 'rule'          },
  legalizacion: { color: 'purple',   icon: 'gavel'         },
  completado:   { color: 'positive', icon: 'verified'      },
  creacion:     { color: 'blue',     icon: 'add_task'      },
  sistema:      { color: 'grey-7',   icon: 'notifications' },
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications:       [],
    socket,
    unreadCount:         0,
    notificationsLoaded: false,
    reminderInterval:    null,
    _adminCache:         { ids: [], fetchedAt: null },
  }),

  getters: {
    myNotifications: (state) => {
      try {
        const uid = toId(useUserStore().user)
        if (!uid) return []
        return state.notifications.filter(n =>
          toId(n.userId) === uid || toId(n.data?.userId) === uid
        )
      } catch {
        return []
      }
    },
  },

  actions: {

    // ── Ciclo de vida ──────────────────────────────────────────────────────
    async init(userId) {
      await this.loadNotifications(userId)
      this.initSocketListeners()
      this._startReminder()
    },

    teardown() {
      this._stopReminder()
      this._destroySocket()
      this.$reset()
    },

    // ── Carga de datos ─────────────────────────────────────────────────────
    async loadNotifications(userId) {
      try {
        const { data } = await instance.get(`/api/notifications/user/${userId}`)
        this.notifications = data ?? []
        this.unreadCount   = this.notifications.filter(n => !n.read).length

        if (!this.notificationsLoaded) {
          this._showLoginBanner()
          this.notificationsLoaded = true
        }
      } catch {
        this._loadFromLocal()
      }
    },

    _loadFromLocal() {
      try {
        this.notifications = JSON.parse(localStorage.getItem('notifications') ?? '[]')
        this.unreadCount   = this.notifications.filter(n => !n.read).length
      } catch {
        this.notifications = []
      }
    },

    _save() {
      localStorage.setItem('notifications', JSON.stringify(this.notifications))
    },

    _showLoginBanner() {
  if (!sessionStorage.getItem('justLoggedIn')) return
  sessionStorage.removeItem('justLoggedIn')

  // ✅ this.notifications en lugar de this.myNotifications
  const count = this.notifications.filter(n => !n.read).length
  if (!count) return

      setTimeout(() => Notify.create({
        message:  `Tienes ${count} notificación${count > 1 ? 'es' : ''} sin leer`,
        caption:  'Haz clic en la campana para revisarlas',
        position: 'top',
        timeout:  7000,
        progress: true,
        color:    'indigo-7',
        icon:     'notifications_active',
        actions: [
          {
            label: 'Ver ahora',
            color: 'white',
            handler: () => {
              document.querySelector('[data-notification-btn]')?.click()
            },
          },
          { icon: 'close', color: 'white', round: true, handler: () => {} },
        ],
      }), 800)
    },

    // ── Creación ───────────────────────────────────────────────────────────
    async addNotification(type, data = {}) {
      const currentUserId  = toId(useUserStore().user)
      const scheduleInfo   = data.scheduleId ? await this._getScheduleInfo(data.scheduleId) : null
      const si             = scheduleInfo?.status?.index  ?? data.statusIndex  ?? -1
      const sn             = scheduleInfo?.status?.number ?? data.statusNumber ?? -1
      const statusKey      = `${si}-${sn}`
      const recipients     = this._getRecipients(statusKey, scheduleInfo, data)
      const actorName      = await this._getName(currentUserId)
      const supervisorName = scheduleInfo ? await this._getName(toId(scheduleInfo.supervisor)) : null

      for (const recipientId of recipients) {
        const message = await this._buildMessage(statusKey, scheduleInfo, data, recipientId)
        await this._persist({
          userId: recipientId,
          type,
          message,
          data: {
            ...data,
            statusIndex:    si,
            statusNumber:   sn,
            contractorName: scheduleInfo?.contractorName ?? null,
            supervisorName,
            actorId:        currentUserId,
            actorName,
            agendaName:     scheduleInfo?.place || scheduleInfo?.tripObjective || null,
          },
        }, recipientId, currentUserId)
      }
    },

    _getRecipients(statusKey, scheduleInfo, data) {
      if (!scheduleInfo) return [data.userId].filter(Boolean)

      const ids = {
        contractorId: scheduleInfo.contractor,
        supervisorId: toId(scheduleInfo.supervisor),
      }

      const recipients = STATUS_RECIPIENTS[statusKey]?.(ids) ?? [ids.contractorId, ids.supervisorId]
      return [...new Set(recipients.filter(Boolean))]
    },

    async _buildMessage(statusKey, scheduleInfo, data, recipientId) {
      if (!scheduleInfo) return `Actualización de agenda — ${data.type ?? ''}`

      const agendaName    = scheduleInfo.place
        || scheduleInfo.tripObjective?.slice(0, 50)
        || `Agenda #${String(data.scheduleId).slice(0, 8)}`
      const justification = scheduleInfo.status?.justification || data.justification || ''
      const ctx = {
        agendaName,
        contractorName: await this._getName(scheduleInfo.contractor),
        supervisorName: await this._getName(toId(scheduleInfo.supervisor)),
        staffTypeText:  scheduleInfo.typeSchedule === 'contractor' ? 'Contratista' : 'Funcionario Público',
        reason:         justification && justification !== '-' ? ` Motivo: "${justification}"` : '',
        isContractor:   toId(recipientId) === toId(scheduleInfo.contractor),
        isSupervisor:   toId(recipientId) === toId(scheduleInfo.supervisor),
      }

      const msg = STATUS_MESSAGES[statusKey]?.(ctx)
      if (!msg) console.warn('[Notif] statusKey sin mapear:', statusKey, 'status:', scheduleInfo.status)
      return msg ?? `Agenda "${agendaName}" — Estado actualizado`
    },

    async _persist(notificationData, recipientId, currentUserId) {
      try {
        const { data } = await instance.post('/api/notifications', notificationData)
        if (data && toId(recipientId) === toId(currentUserId)) this._insert(data)
      } catch {
        if (toId(recipientId) === toId(currentUserId)) {
          this._insert({ id: Date.now(), ...notificationData, timestamp: new Date().toISOString(), read: false })
        }
      }
    },

    _insert(notification) {
      const exists = this.notifications.some(n =>
        (n._id && toId(n._id) === toId(notification._id)) ||
        (n.id  && String(n.id) === String(notification.id))
      )
      if (exists) return

      this.notifications.unshift(notification)
      if (!notification.read) this.unreadCount++
      this._save()
      this.showNotify(notification)
    },

    // ── Marcar leídas ──────────────────────────────────────────────────────
    async markAsRead(notificationId) {
      const note = this.notifications.find(n => toId(n._id ?? n.id) === toId(notificationId))
      if (!note || note.read) return

      note.read = true
      this.unreadCount = Math.max(0, this.unreadCount - 1)
      this._save()

      try { await instance.put(`/api/notifications/read/${notificationId}`) } catch { /* best effort */ }
    },

    async markAllAsRead(userId) {
      const uid     = toId(userId)
      const pending = this.notifications.filter(n =>
        !n.read && (toId(n.userId) === uid || toId(n.data?.userId) === uid)
      )
      if (!pending.length) return

      pending.forEach(n => { n.read = true })
      this.unreadCount = 0
      this._save()

      try { await instance.put(`/api/notifications/read-all/${userId}`) } catch { /* best effort */ }
    },

    clearAll() {
      this.notifications = []
      this.unreadCount   = 0
      this._save()
    },

    // ── Helpers internos ───────────────────────────────────────────────────
    async _getName(userId) {
      if (!userId) return 'Usuario'
      try {
        const { data } = await useUserStore().getUserParams(userId)
        return `${data?.name ?? ''} ${data?.lastName ?? ''}`.trim() || 'Usuario'
      } catch {
        return 'Usuario'
      }
    },

    async _getScheduleInfo(scheduleId) {
      try {
        const { data: s } = await useScheduleStore().getScheduleById(scheduleId)
        if (!s) return null

        const contractorId   = toId(s.contractor)
        const contractorName = contractorId ? await this._getName(contractorId) : 'Contratista'
        const route          = s.route?.data || ''

        return {
          contractor:    contractorId,
          supervisor:    s.supervisor,
          status:        s.status,
          typeSchedule:  s.typeSchedule,
          place:         s.place,
          tripObjective: s.tripObjective,
          contractorName,
          display: route ? `${contractorName} (${route})` : contractorName,
        }
      } catch {
        return null
      }
    },

    async _getAdminIds() {
      const { ids, fetchedAt } = this._adminCache
      if (ids.length && fetchedAt && Date.now() - fetchedAt < 300_000) return ids

      try {
        const userStore = useUserStore()
        const source    = userStore.users?.length
          ? userStore.users
          : (await userStore.getUser({ status: 1 }))?.data ?? []

        const admins = source
          .filter(u => u.role?.data === 'administrator' && u.status === 1)
          .map(u => u._id)

        this._adminCache = { ids: admins, fetchedAt: Date.now() }
        return admins
      } catch {
        return this._adminCache.ids
      }
    },

    // ── Socket ─────────────────────────────────────────────────────────────
    initSocketListeners() {
      if (_listenersAttached) return
      _listenersAttached = true
      socket.connect()

      const join = () => {
        const uid = toId(useUserStore().user)
        if (uid) socket.emit('join', uid)
      }

      socket.on('connect',           join)
      socket.on('disconnect',        () => console.warn('Socket desconectado'))
      socket.on('nueva-notificacion', n  => this._insert(n))
      socket.on('nueva-solicitud',    d  => this.addNotification('nueva',      d))
      socket.on('agenda-modificada',  d  => this.addNotification('modificada', d))
      socket.on('agenda-firmada',     d  => this.addNotification('firmada',    d))
      socket.on('agenda-legalizada',  d  => this.addNotification('legalizada', d))

      if (socket.connected) join()
    },

    _destroySocket() {
      ['connect', 'disconnect', 'nueva-notificacion',
       'nueva-solicitud', 'agenda-modificada', 'agenda-firmada', 'agenda-legalizada']
        .forEach(e => socket.off(e))
      socket.disconnect()
      _listenersAttached = false
    },

    // ── Recordatorio ───────────────────────────────────────────────────────
    _startReminder() {
      // Recordatorio solo al iniciar sesión — ver _showLoginBanner
    },

    _stopReminder() {
      clearInterval(this.reminderInterval)
      this.reminderInterval = null
    },

    // ── UI ─────────────────────────────────────────────────────────────────
    getNoteMeta(note) {
      const si  = note.data?.statusIndex  ?? -1
      const sn  = note.data?.statusNumber ?? -1
      const msg = (note.message || '').toLowerCase()

      let process = 'sistema'
      if      ((si === 0 && sn === 1) || (si === 4 && sn === 3))     process = 'rechazado'
      else if ((si === 1 && sn === 1) || (si === 2 && sn === 2))     process = 'aprobacion'
      else if ((si === 3 && sn === 3) || (si === 5 && sn === 2))     process = 'legalizacion'
      else if  (si === 6 && sn === 2)                                  process = 'completado'
      else if  (msg.includes('rechazad'))                             process = 'rechazado'
      else if  (msg.includes('cuenta de cobro'))                      process = 'completado'
      else if  (msg.includes('legalización'))                         process = 'legalizacion'
      else if  (msg.includes('aprobada') || msg.includes('firmada')) process = 'aprobacion'
      else if  (msg.includes('nueva agenda'))                         process = 'creacion'

      return { ...(PROCESS_META[process] ?? PROCESS_META.sistema), process }
    },

    showNotify(note) {
      try {
        const a = new Audio('/notify.mp3')
        a.volume = 0.6
        a.play().catch(() => {})
      } catch { /* noop */ }

      const meta = this.getNoteMeta(note)
      Notify.create({
        position:       'top',
        timeout:        6000,
        progress:       true,
        color:          meta.color,
        component:      NotificationToast,
        componentProps: { note, meta },
      })
    },
  },
})