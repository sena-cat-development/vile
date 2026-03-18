// stores/notificationStore.js
import { defineStore } from 'pinia'
import { io } from "socket.io-client"
import { Notify } from 'quasar'
import { useUserStore } from './user.js'
import { useScheduleStore } from './schedule.js'
import { instance } from './index.js'
import NotificationToast from '../components/NotificationToast.vue'

const socket = io(import.meta.env.VITE_API_URL)



export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    socket: socket,
    unreadCount: 0,
    cachedAdminIds: [],
    lastAdminFetch: null,
    notificationsLoaded: false,
    lastNotificationTime: null,
    reminderInterval: null   // 👈 AGREGAR
  }),





  getters: {
    unreadNotifications: (state) => {
      const userStore = useUserStore()
      const userId = userStore.user?._id || userStore.user?.id
      if (!userId) return 0

      return state.notifications.filter(n =>
        String(n.userId) === String(userId) ||
        String(n.data?.userId) === String(userId)
      )
    },

    allNotifications: (state) => {
      const userStore = useUserStore()
      const userId = userStore.user?._id || userStore.user?.id
      if (!userId) return []

      return state.notifications.filter(n =>
        n.userId === userId || n.data?.userId === userId
      )
    }
  },

  actions: {


    startUnreadReminder() {

      if (this.reminderInterval) return

      this.reminderInterval = setInterval(() => {

        const unread = this.notifications.filter(n => !n.read)

        if (unread.length > 0) {

          Notify.create({
            message: `${unread.length} notificación${unread.length > 1 ? 'es' : ''} sin leer`,
            caption: 'Revisa tu centro de notificaciones',
            position: 'top-left',
            timeout: 4000,
            progress: true,
            color: 'grey-7',
            icon: 'notifications_active'
          })

        }

      }, 600000)

    },



    // ✅ Helper para obtener nombre de usuario por ID
    async getUserName(userId) {
      try {
        if (!userId) return 'Usuario'

        const userStore = useUserStore()
        const response = await userStore.getUserParams(userId)

        const name = response?.data?.name || ''
        const lastName = response?.data?.lastName || ''
        const fullName = `${name} ${lastName}`.trim()

        return fullName || 'Usuario'
      } catch (error) {
        console.error('Error obteniendo nombre de usuario:', error)
        return 'Usuario'
      }
    },

    // ✅ Helper para obtener información de la agenda
    async getScheduleInfo(scheduleId) {
      try {
        const scheduleStore = useScheduleStore()
        const response = await scheduleStore.getScheduleById(scheduleId)

        if (response && response.data) {
          const schedule = response.data

          const contractorId =
            typeof schedule.contractor === 'string'
              ? schedule.contractor
              : schedule.contractor?._id

          const contractorName = contractorId
            ? await this.getUserName(contractorId)
            : 'Contratista'

          const route = schedule.route?.data || ''

          return {
            contractor: contractorId,
            supervisor: schedule.supervisor,
            status: schedule.status,
            typeSchedule: schedule.typeSchedule,
            place: schedule.place,
            tripObjective: schedule.tripObjective,
            contractorName,
            route,
            display: route
              ? `${contractorName} (${route})`
              : contractorName
          }
        }

        return null
      } catch (error) {
        console.error('Error obteniendo información de agenda:', error)
        return null
      }
    },

    // 🆕 Cargar notificaciones desde el backend
    async loadNotifications(userId) {
      try {
        const response = await instance.get(`/api/notifications/user/${userId}`)
        if (response.data) {
          this.notifications = response.data
          console.log('📥 Notificaciones cargadas:', this.notifications.length)

          const newUnreadCount = this.notifications.filter(n => !n.read).length
          this.unreadCount = newUnreadCount
          console.log('📊 Contador inicial:', this.unreadCount)

          if (!this.notificationsLoaded) {
            const latest = this.notifications[0]
            if (latest) {
              this.lastNotificationTime = latest.createdAt || latest.timestamp
            }
            this.startUnreadReminder()
          }

          // Solo mostrar resumen al login (los toasts individuales son para tiempo real)
          const justLoggedIn = sessionStorage.getItem('justLoggedIn')
          if (justLoggedIn) {
            sessionStorage.removeItem('justLoggedIn')

            const unreadAtLogin = this.notifications.filter(n => !n.read)

            if (unreadAtLogin.length > 0) {
              setTimeout(() => {
                Notify.create({
                  message: `Tienes ${unreadAtLogin.length} notificación${unreadAtLogin.length > 1 ? 'es' : ''} sin leer`,
                  caption: 'Revisa tu centro de notificaciones',
                  position: 'top-left',
                  timeout: 7000,
                  progress: true,
                  color: 'indigo-8',
                  icon: 'mark_email_unread',
                  actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }]
                })
              }, 800)
            }
          }


          this.notificationsLoaded = true
        }
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
        this.loadNotificationsFromLocal()
      }
    },

    // 🆕 Obtener cantidad de notificaciones no leídas
    async getUnreadCount(userId) {
      try {
        const response = await instance.get(`/api/notifications/unread/${userId}`)
        if (response.data) {
          this.unreadCount = response.data.count
          console.log('📊 Contador actualizado desde backend:', this.unreadCount)
        }
      } catch (error) {
        console.error('Error al obtener contador de no leídas:', error)
        const userStore = useUserStore()
        const currentUserId = userStore.user?._id || userStore.user?.id
        this.unreadCount = this.notifications.filter(n =>
          !n.read && (n.userId === currentUserId || n.data?.userId === currentUserId)
        ).length
        console.log('📊 Contador calculado localmente:', this.unreadCount)
      }
    },

    // Cargar notificaciones desde localStorage (fallback)
    loadNotificationsFromLocal() {
      const saved = localStorage.getItem('notifications')
      if (saved) {
        try {
          this.notifications = JSON.parse(saved)
          const userStore = useUserStore()
          const userId = userStore.user?._id || userStore.user?.id
          if (userId) {
            const unreadCount = this.notifications.filter(n =>
              !n.read && (n.userId === userId || n.data?.userId === userId)
            ).length

            this.unreadCount = unreadCount
            console.log('📊 Contador desde localStorage:', this.unreadCount)

            if (unreadCount > 0) {
              setTimeout(() => {
                this.playSoundWithRetry(unreadCount)
              }, 500)
            }
          }
        } catch (error) {
          console.error('Error al cargar notificaciones:', error)
          this.notifications = []
        }
      }
    },

    // Guardar en localStorage (backup)
    saveNotifications() {
      localStorage.setItem('notifications', JSON.stringify(this.notifications))
    },

    // 🆕 Crear notificación en el backend
    async addNotification(type, message, data = {}) {
      data = data || {}

      console.log('📣 addNotification llamado:', type, JSON.stringify(data)) // ← agregar


      const userStore = useUserStore()
      const currentUserId = userStore.user?._id || userStore.user?.id

      let scheduleInfo = null
      if (data.scheduleId) {
        scheduleInfo = await this.getScheduleInfo(data.scheduleId)
      }

      const recipients = await this.getNotificationRecipients(type, data, scheduleInfo)

      for (const recipientId of recipients) {
        const customMessage = await this.buildCustomMessage(type, data, scheduleInfo, recipientId)

        let notificationData = {
          userId: recipientId,
          type: type,
          message: customMessage,
          data: {
            ...data,

            scheduleType: scheduleInfo?.typeSchedule,
            statusData: scheduleInfo?.status?.data,
            statusIndex: scheduleInfo?.status?.index,
            statusNumber: scheduleInfo?.status?.number,

            contractorName: scheduleInfo?.contractorName || null,
            supervisorName: await this.getSupervisorName(scheduleInfo?.supervisor) || null,

            // 👇 NUEVO (MUY IMPORTANTE)
            actorId: currentUserId,
            actorName: await this.getUserName(currentUserId),

            agendaName:
              scheduleInfo?.place ||
              scheduleInfo?.tripObjective ||
              null
          }
        }


        await this.saveNotification(notificationData, recipientId, currentUserId)
      }
    },


    async getNotificationRecipients(type, data, scheduleInfo) {
      const recipients = []

      if (!scheduleInfo) {
        return [data.userId]
      }

      const contractorId = scheduleInfo.contractor
      const supervisorId = scheduleInfo.supervisor?.id || scheduleInfo.supervisor?._id || scheduleInfo.supervisor
      const statusIndex = scheduleInfo.status?.index ?? data.statusIndex ?? -1
      const statusNumber = scheduleInfo.status?.number ?? data.statusNumber ?? -1
      const statusData = (scheduleInfo.status?.data || '').toLowerCase()

      console.log(`📋 Estado → index: ${statusIndex}, number: ${statusNumber}, data: "${statusData}"`)

      // ── Rechazos (index 0 ó index 4 con number 3) ──────────────
      if (statusIndex === 0 && statusNumber === 1) {
        // Agenda rechazada → avisar al contratista
        recipients.push(contractorId)
        console.log('🚫 Agenda rechazada → contratista')

      } else if (statusIndex === 4 && statusNumber === 3) {
        // Legalización Rechazada → avisar al contratista
        recipients.push(contractorId)
        console.log('🚫 Legalización rechazada → contratista')

        // ── Flujo normal ────────────────────────────────────────────
      } else if (statusIndex === 1 && statusNumber === 1) {
        // Agenda firmada por Contratista → notificar al Supervisor
        if (supervisorId) recipients.push(supervisorId)
        console.log('✅ [1-1] Agenda firmada por Contratista → supervisor')

      } else if (statusIndex === 2 && statusNumber === 2) {
        // Agenda firmada por Supervisor → notificar al Contratista
        recipients.push(contractorId)
        console.log('✅ [2-2] Agenda firmada por Supervisor → contratista')

      } else if (statusIndex === 3 && statusNumber === 3) {
        // Legalización enviada a contratista → notificar al Contratista
        recipients.push(contractorId)
        console.log('✅ [3-3] Legalización enviada → contratista')

      } else if (statusIndex === 5 && statusNumber === 3) {
        // Legalización finalizada y firmada por contratista → Supervisor
        if (supervisorId) recipients.push(supervisorId)
        console.log('✅ [4-4] Legalización firmada por contratista → supervisor')

      }
      else if (statusIndex === 6 && statusNumber === 3) {
        // Archivo firmado para cuenta de cobro → Contratista + Supervisor
        recipients.push(contractorId)
        if (supervisorId) recipients.push(supervisorId)
        console.log('✅ [5-4] Archivo firmado para cuenta de cobro → contratista + supervisor')

      } else {
        console.warn(`⚠️ Estado no mapeado: index ${statusIndex}, number ${statusNumber}`)
        recipients.push(contractorId)
        if (supervisorId) recipients.push(supervisorId)
      }

      // Eliminar duplicados y al usuario actual
      const uniqueRecipients = [...new Set(recipients)].filter(id => !!id)

      console.log(`📨 Destinatarios finales (${uniqueRecipients.length}):`, uniqueRecipients)

      return uniqueRecipients
    },

    async buildCustomMessage(type, data, scheduleInfo, recipientId) {
      if (!scheduleInfo) {
        console.warn('⚠️ No se pudo obtener información de la agenda')
        return `Actualización de agenda - ${type}`
      }

      const agendaName = scheduleInfo.place || scheduleInfo.tripObjective?.substring(0, 50) || `Agenda #${data.scheduleId?.substring(0, 8)}`
      const staffTypeText = scheduleInfo.typeSchedule === 'contractor' ? 'Contratista' : 'Funcionario Público'
      const contractorName = await this.getUserName(scheduleInfo.contractor)
      const supervisorName = await this.getSupervisorName(scheduleInfo.supervisor)
      const statusIndex = scheduleInfo.status?.index ?? data.statusIndex ?? -1
      const statusNumber = scheduleInfo.status?.number ?? data.statusNumber ?? -1
      const justification = scheduleInfo.status?.justification || data.justification || ''

      console.log(`🔍 buildCustomMessage → index: ${statusIndex}, number: ${statusNumber}`)

      // ── Rechazos ────────────────────────────────────────────────
      if (statusIndex === 0 && statusNumber === 1) {
        const reason = justification && justification !== '-' ? ` Motivo: "${justification}"` : ''
        return `Tu agenda "${agendaName}" fue rechazada.${reason}`
      }

      if (statusIndex === 4 && statusNumber === 3) {
        const reason = justification && justification !== '-' ? ` Motivo: "${justification}"` : ''
        return `La legalización de tu agenda "${agendaName}" fue rechazada.${reason}`
      }

      // ── Flujo normal ────────────────────────────────────────────

      // [index 1 - number 1] Agenda firmada por Contratista → mensaje al Supervisor
      if (statusIndex === 1 && statusNumber === 1) {
        return `Nueva agenda de ${staffTypeText} "${agendaName}" firmada por ${contractorName} — Pendiente de tu revisión`
      }

      // [index 2 - number 2] Agenda firmada por Supervisor
      if (statusIndex === 2 && statusNumber === 2) {
        if (String(recipientId) === String(scheduleInfo.contractor)) {
          return `Tu agenda "${agendaName}" fue aprobada por el supervisor ${supervisorName}`
        }
        return `Agenda "${agendaName}" (${staffTypeText}) aprobada por supervisor ${supervisorName} — Pendiente de legalización`
      }

      // [index 4 - number 4] Legalización finalizada y firmada por el contratista
      if (statusIndex === 5 && statusNumber === 2) {
        const supervisorId = scheduleInfo.supervisor?.id || scheduleInfo.supervisor?._id || scheduleInfo.supervisor
        if (String(recipientId) === String(supervisorId)) {
          return `Legalización de agenda "${agendaName}" firmada por ${contractorName} — Pendiente de tu firma`
        }
        return `Legalización de agenda "${agendaName}" (${staffTypeText}) firmada por ${contractorName} — Pendiente de aprobación final`
      }

      // [index 5 - number 4] Archivo firmado para cuenta de cobro
      if (statusIndex === 6 && statusNumber === 2) {
        if (String(recipientId) === String(scheduleInfo.contractor)) {
          return `¡Proceso completado! Tu agenda "${agendaName}" ha sido completamente legalizada y el archivo está listo para cuenta de cobro`
        }
        return `Agenda "${agendaName}" (${staffTypeText}: ${contractorName}) — Archivo firmado y listo para cuenta de cobro`
      }

      console.warn(`⚠️ Estado no mapeado en buildCustomMessage: index ${statusIndex}, number ${statusNumber}`)
      return `Agenda "${agendaName}" (${staffTypeText}) — Estado actualizado`
    },

    async getSupervisorName(supervisor) {
      if (!supervisor) return 'Supervisor'

      if (typeof supervisor === 'string') {
        return supervisor.match(/^[0-9a-fA-F]{24}$/)
          ? await this.getUserName(supervisor)
          : supervisor
      }

      if (supervisor._id) {
        return await this.getUserName(supervisor._id)
      }

      return supervisor.name || 'Supervisor'
    },

    async extractUserName(data) {
      if (data.updatedBy) {
        return data.updatedBy.match(/^[0-9a-fA-F]{24}$/)
          ? await this.getUserName(data.updatedBy)
          : data.updatedBy
      }
      if (data.supervisorName) return data.supervisorName
      if (data.userName) {
        return data.userName.match(/^[0-9a-fA-F]{24}$/)
          ? await this.getUserName(data.userName)
          : data.userName
      }
      return 'Usuario'
    },

    async getAdministratorIds() {
      try {
        const userStore = useUserStore()

        const now = Date.now()
        if (this.cachedAdminIds?.length > 0 && this.lastAdminFetch && (now - this.lastAdminFetch) < 300000) {
          console.log('✅ Usando administradores en cache')
          return this.cachedAdminIds
        }

        if (userStore.users?.length > 0) {
          const admins = userStore.users
            .filter(user => user.role?.data === 'administrator' && user.status === 1)
            .map(admin => admin._id)

          if (admins.length > 0) {
            this.cachedAdminIds = admins
            this.lastAdminFetch = now
            console.log(`✅ ${admins.length} administradores encontrados en store`)
            return admins
          }
        }

        console.log('🔄 Cargando usuarios desde API...')
        const result = await userStore.getUser({ status: 1 })

        if (result.data && Array.isArray(result.data)) {
          const admins = result.data
            .filter(user => user.role?.data === 'administrator' && user.status === 1)
            .map(admin => admin._id)

          this.cachedAdminIds = admins
          this.lastAdminFetch = now
          console.log(`✅ ${admins.length} administradores obtenidos de API`)
          return admins
        }

        console.warn('⚠️ No se encontraron administradores')
        return []

      } catch (error) {
        console.error('❌ Error obteniendo administradores:', error)
        return this.cachedAdminIds || []
      }
    },

    async saveNotification(notificationData, recipientId, currentUserId) {
      try {
        const response = await instance.post('/api/notifications', notificationData)

        if (response.data) {
          if (recipientId?.toString() === currentUserId?.toString()) {

            this.showNotify(response.data)
            this.lastNotificationTime = response.data.createdAt || response.data.timestamp

            this.notifications.unshift(response.data)
            this.unreadCount++

            this.saveNotifications()
          }

        }
      } catch (error) {
        console.error('Error al crear notificación:', error)

        if (String(recipientId) === String(currentUserId)) {
          const notification = {
            id: Date.now(),
            userId: recipientId,
            type: notificationData.type,
            message: notificationData.message,
            timestamp: new Date().toISOString(),
            read: false,
            data: notificationData.data
          }

          this.notifications.unshift(notification)
          this.saveNotifications()
        }
      }
    },

    // 🆕 Marcar como leída en el backend
    async markAsRead(notificationId, userId) {
      try {
        await instance.put(`/api/notifications/read/${notificationId}`)

        const notification = this.notifications.find(n => n._id === notificationId || n.id === notificationId)
        if (notification && !notification.read) {
          notification.read = true
          this.saveNotifications()
          this.unreadCount = Math.max(0, this.unreadCount - 1)
          console.log('📊 Contador decrementado:', this.unreadCount)
        }
      } catch (error) {
        console.error('Error al marcar como leída:', error)

        const notification = this.notifications.find(n => n._id === notificationId || n.id === notificationId)
        if (notification && !notification.read) {
          notification.read = true
          this.saveNotifications()
          this.unreadCount = Math.max(0, this.unreadCount - 1)
          console.log('📊 Contador decrementado (fallback):', this.unreadCount)
        }
      }
    },

    // 🆕 Marcar todas como leídas en el backend
    async markAllAsRead(userId) {
      try {
        await instance.put(`/api/notifications/read-all/${userId}`)

        this.notifications.forEach(n => {
          if (n.userId === userId || n.data?.userId === userId) {
            n.read = true
          }
        })
        this.saveNotifications()
        this.unreadCount = 0
        console.log('📊 Contador reseteado:', this.unreadCount)

      } catch (error) {
        console.error('Error al marcar todas como leídas:', error)

        this.notifications.forEach(n => {
          if (n.userId === userId || n.data?.userId === userId) {
            n.read = true
          }
        })
        this.saveNotifications()
        this.unreadCount = 0
        console.log('📊 Contador reseteado (fallback):', this.unreadCount)
      }
    },

    clearAll() {
      this.notifications = []
      this.saveNotifications()
      this.unreadCount = 0
    },

    // Inicializar listeners de socket
    initSocketListeners() {
      socket.off('nueva-solicitud')
      socket.off('agenda-modificada')
      socket.off('agenda-firmada')
      socket.off('agenda-legalizada')
      socket.off('nueva-notificacion')

      // 🔔 Notificación directa enviada por el backend al usuario específico
      socket.on('nueva-notificacion', (notification) => {
        const userStore = useUserStore()
        const currentUserId = userStore.user?._id || userStore.user?.id
        if (!currentUserId) return

        // Evitar duplicados
        const exists = this.notifications.some(n =>
          (n._id && String(n._id) === String(notification._id)) ||
          (n.id  && String(n.id)  === String(notification.id))
        )
        if (exists) return

        this.notifications.unshift(notification)
        this.unreadCount++
        this.saveNotifications()
        this.showNotify(notification)
      })

      socket.on('nueva-solicitud', async (data) => {
        console.log('📥 Nueva solicitud:', data)

        let targetUserId = data.userId || data.supervisorId
        if (!targetUserId) {
          const userStore = useUserStore()
          targetUserId = userStore.user?._id || userStore.user?.id
        }

        await this.addNotification('nueva', `Nueva agenda de ${data.userName}`, {
          ...data,
          userId: targetUserId
        })
      })

      socket.on('agenda-modificada', async (data) => {
        console.log('📝 Agenda modificada:', data)

        const userStore = useUserStore()
        await this.addNotification('modificada', `Agenda ${data.scheduleId} fue modificada`, {
          ...data,
          userId: data.userId || data.supervisorId || userStore.user?._id
        })
      })

      socket.on('agenda-firmada', async (data) => {
        console.log('✍️ Agenda firmada:', data)

        const scheduleInfo = data.scheduleId
          ? await this.getScheduleInfo(data.scheduleId)
          : { display: 'Contratista' }

        let supervisorName = 'Supervisor'
        if (data.supervisorId?.match(/^[0-9a-fA-F]{24}$/)) {
          supervisorName = await this.getUserName(data.supervisorId)
        } else if (data.updatedBy?.match(/^[0-9a-fA-F]{24}$/)) {
          supervisorName = await this.getUserName(data.updatedBy)
        } else if (data.supervisorName) {
          supervisorName = data.supervisorName
        } else if (data.userName) {
          supervisorName = data.userName.match(/^[0-9a-fA-F]{24}$/)
            ? await this.getUserName(data.userName)
            : data.userName
        }

        const customMessage = `Agenda de ${scheduleInfo.display} fue firmada por el supervisor ${supervisorName}`

        const userStore = useUserStore()
        await this.addNotification('firmada', customMessage, {
          ...data,
          userId: data.userId || data.contractorId || userStore.user?._id
        })
      })

      socket.on('agenda-legalizada', async (data) => {
        console.log('⚖️ Agenda legalizada:', data)

        await this.addNotification('legalizada', '', {
          ...data,
          scheduleId: data.scheduleId,
          updatedBy: data.updatedBy || data.userId,  // ← quién actualizó
          statusIndex: data.statusIndex,
          statusNumber: data.statusNumber
        })
      })

      socket.on('connect', () => {
        console.log('✅ Socket conectado')
        // Unirse a la sala personal para recibir notificaciones directas
        const userStore = useUserStore()
        const uid = userStore.user?._id || userStore.user?.id
        if (uid) socket.emit('join', String(uid))
      })

      socket.on('disconnect', () => console.log('❌ Socket desconectado'))

      // Si ya está conectado al llamar initSocketListeners, hacer join de inmediato
      if (socket.connected) {
        const userStore = useUserStore()
        const uid = userStore.user?._id || userStore.user?.id
        if (uid) socket.emit('join', String(uid))
      }
    },

    formatTime() {
      const d = new Date()
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    },

    formatDate() {
      const d = new Date()
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
    },

    playSound() {
  try {
    const audio = new Audio('/notify.mp3')
    audio.volume = 0.6

    audio.play().catch(() => {
      console.warn("🔇 Navegador bloqueó el sonido hasta interacción")
    })

  } catch (err) {
    console.error("Error reproduciendo sonido:", err)
  }
},


    showUnreadReminders() {
      const unread = this.notifications.filter(n => !n.read)

      unread.forEach((note, index) => {
        setTimeout(() => {
          this.showNotify(note)
        }, index * 600)
      })
    },

    getNoteMeta(note) {
      const si = note.data?.statusIndex ?? -1
      const sn = note.data?.statusNumber ?? -1
      const msg = (note.message || '').toLowerCase()

      let process = 'sistema'
      if ((si === 0 && sn === 1) || (si === 4 && sn === 3)) process = 'rechazado'
      else if ((si === 1 && sn === 1) || (si === 2 && sn === 2)) process = 'aprobacion'
      else if ((si === 3 && sn === 3) || (si === 5 && sn === 3)) process = 'legalizacion'
      else if (si === 6 && sn === 3) process = 'completado'
      else if (msg.includes('rechazada') || msg.includes('rechazado')) process = 'rechazado'
      else if (msg.includes('cuenta de cobro') || msg.includes('completamente legalizada')) process = 'completado'
      else if (msg.includes('legalizada') || msg.includes('legalización')) process = 'legalizacion'
      else if (msg.includes('aprobada') || msg.includes('firmada')) process = 'aprobacion'
      else if (msg.includes('nueva agenda') || msg.includes('creada')) process = 'creacion'

      const map = {
        rechazado:    { color: 'negative', icon: 'cancel',       label: 'Rechazado',    process: 'rechazado' },
        aprobacion:   { color: 'orange',   icon: 'rule',          label: 'Aprobación',   process: 'aprobacion' },
        legalizacion: { color: 'purple',   icon: 'gavel',         label: 'Legalización', process: 'legalizacion' },
        completado:   { color: 'positive', icon: 'verified',      label: 'Completado',   process: 'completado' },
        creacion:     { color: 'blue',     icon: 'add_task',      label: 'Creación',     process: 'creacion' },
        sistema:      { color: 'grey-7',   icon: 'notifications', label: 'Sistema',      process: 'sistema' }
      }
      return map[process] ?? map.sistema
    },

    showNotify(note) {
      const meta = this.getNoteMeta(note)
      this.playSound()

      Notify.create({
        position: 'top-right',
        timeout: 6000,
        progress: true,
        color: meta.color,
        component: NotificationToast,
        componentProps: { note, meta }
      })
    }



  }
})