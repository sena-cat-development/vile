import { Notification } from '../models/notification.js'
import { getIo } from '../socket.js'

export const httpNotification = {

  // ✅ Crear notificación
  create: async (req, res) => {
    try {
      const { userId, scheduleId, message, type, data } = req.body

      const now = new Date()

      const notification = await Notification.create({
        userId,
        scheduleId,
        message,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        read: false,
        metadata: { type, ...data }
      })

      const io = getIo()
      if (io && userId) {
        const payload = { ...notification.toObject(), data: notification.metadata }
        io.to(String(userId)).emit('nueva-notificacion', payload)
      }

      res.status(201).json(notification)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // ✅ Listar notificaciones por usuario (últimas 50)
  getByUser: async (req, res) => {
    try {
      const { userId } = req.params

      const notifications = await Notification
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('scheduleId')

      res.json(notifications)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // ✅ Marcar una como leída
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params

      const notification = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      )

      if (!notification) return res.status(404).json({ error: 'Notificación no encontrada' })

      const io = getIo()
      if (io && notification.userId) {
        io.to(String(notification.userId)).emit('notificacion-leida', { id })
      }

      res.json(notification)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // ✅ Marcar todas como leídas
  markAllAsRead: async (req, res) => {
    try {
      const { userId } = req.params

      await Notification.updateMany({ userId, read: false }, { read: true })

      const io = getIo()
      if (io) {
        io.to(String(userId)).emit('notificaciones-todas-leidas')
      }

      res.json({ message: 'Todas marcadas como leídas' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // ✅ Contador de no leídas
  unreadCount: async (req, res) => {
    try {
      const { userId } = req.params

      const count = await Notification.countDocuments({ userId, read: false })

      res.json({ unread: count })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // ✅ Eliminar una notificación
  deleteOne: async (req, res) => {
    try {
      const { id } = req.params

      const notification = await Notification.findByIdAndDelete(id)

      if (!notification) return res.status(404).json({ error: 'Notificación no encontrada' })

      res.json({ message: 'Notificación eliminada' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

}
