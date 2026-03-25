import { defineStore } from 'pinia'
import { instance } from './index.js'

export const useScheduleStore = defineStore('Schedules', {
  state: () => ({}),  // ⚠️ Corregido: era "states" debería ser "state"
  getters: {},
  actions: {

    async getCounty(query) {
      const { data, status } = await instance({
        method: 'get',
        url: '/county',
        params: query
      })
      return { data, status }
    },

    async getCity(county) {
      const { data, status } = await instance({
        method: 'get',
        url: '/city/search',
        params: { county }
      })
      return { data, status }
    },

    async getInstitute(regional) {
      const { data, status } = await instance({
        method: 'get',
        url: '/institute/search',
        params: { regional }
      })
      return { data, status }
    },

    async postSchedule(data) {
      try {
        const response = await instance({
          method: 'post',
          url: '/schedule',
          data
        })

        if (response) {
          const { data: responseData, status } = response

          // ❌ ELIMINADO: socket.emit("nueva-solicitud", {...})
          // El backend ya emite este evento

          return { data: responseData, status }
        }

      } catch (error) {
        console.error("❌ Error en postSchedule:", error)

        return {
          data: error.response?.data || { message: "No se pudo conectar con el servidor" },
          status: error.response?.status || 500
        }
      }
    },

    async putSchedule(data, id) {
      const response = await instance({
        method: 'put',
        url: `/schedule/${id}`,
        data
      })

      // ❌ ELIMINADO: socket.emit("agenda-modificada", {...})
      // El backend ya emite este evento

      return response
    },

    async getSchedule(query = {}) {
      const { data, status } = await instance({
        method: 'get',
        url: '/schedule',
        params: query
      })
      return { data, status }
    },

    async getScheduleParams(id, query = {}) {
      const { data, status } = await instance({
        method: 'get',
        url: `/schedule/${id}`,
        params: query
      })
      return { data, status }
    },

    async getScheduleById(id) {
      const { data, status } = await instance({
        method: 'get',
        url: `/schedule/${id}/detail`
      })
      return { data, status }
    },

async postLegalization(formData, id) {
  const { data, status } = await instance({  // ✅ también desestructura data
    method: 'post',
    url: `/schedule/legalization/${id}`,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return { data, status }  // ✅ devuelve los documentos con URLs de Cloudinary
},

    async putLegalization(data, id) {
      const { status } = await instance({
        method: 'put',
        url: `/schedule/legalization/${id}`,
        data
      })
      return { status }
    },

    async uploadDocument(file, scheduleId, userId) {
      try {
        if (!file || !scheduleId || !userId) throw new Error('Datos incompletos')

        const formData = new FormData()
        formData.append('file', file)
        formData.append('scheduleId', scheduleId)
        formData.append('userId', userId)

        const { data, status } = await instance.post('/schedule/upload-document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        return { data, status }

      } catch (error) {
        console.error('❌ Error uploadDocument:', error)
        return { data: null, status: error.response?.status || 500 }
      }
    },



    async viewSignedDocument(schedule) {
      try {
        if (!schedule.attachedDocumentUrl) {
          return null
        }

        const { data } = await instance.get(`/schedule/${schedule._id}/document`, {
          responseType: 'blob'
        })

        return URL.createObjectURL(data)

      } catch (err) {
        return null
      }
    },

    async markAsSigned(scheduleId, userId, documentUrl, publicId = null) {
      try {
        const { data, status } = await instance.post(`/schedule/sign/${scheduleId}`, {
          userId,
          documentUrl,
          publicId
        })


        return { data, status }

      } catch (error) {
        console.error('❌ Error markAsSigned:', error)
        return { data: null, status: error.response?.status || 500 }
      }
    },

    async sendToLegalization(scheduleId, currentStatus) {
      try {
        const payload = {
          status: {
            index: 3,
            data: 'Lista para legalizar',
            justification: '-',
            number: currentStatus.number + 1
          }
        }

        const { status } = await instance({
          method: 'put',
          url: `/schedule/${scheduleId}`,
          data: payload
        })

        // ❌ ELIMINADO: socket.emit("agenda-legalizada", {...})
        // El backend ya emite este evento

        return { status }

      } catch (error) {
        console.error('❌ Error sendToLegalization:', error)
        return { status: error.response?.status || 500 }
      }
    },

    async addRadication(scheduleId, payload) {
      try {
        const { data, status } = await instance({
          method: 'post',
          url: `/schedule/${scheduleId}/radication`,
          data: payload
        })
        return { data, status }

      } catch (error) {
        console.error('❌ Error addRadication:', error)
        return {
          data: null,
          status: error.response?.status || 500
        }
      }
    },

    async updateRadication(scheduleId, radicationId, payload) {
      try {
        const { data, status } = await instance({
          method: 'put',
          url: `/schedule/${scheduleId}/radication/${radicationId}`,
          data: payload
        })
        return { data, status }

      } catch (error) {
        console.error('❌ Error updateRadication:', error)
        return {
          data: null,
          status: error.response?.status || 500
        }
      }
    },

    async openDocument(publicId) {
      const response = await instance.get(
        `/schedule/download/${publicId}`,
        { responseType: 'blob' }
      )

      return URL.createObjectURL(response.data)
    },

    async getDocuments(scheduleId) {
      return await instance.get(`/schedule/${scheduleId}/documents`)
    },

    async downloadDocument(publicId) {
      return await instance.get(
        `/schedule/download/${publicId}`,
        { responseType: 'blob' }
      )
    },

    async viewDocument(publicId) {
  try {
    const { data } = await instance.get(
      `/schedule/view/${publicId}`,
      { responseType: 'blob' }
    )

    return URL.createObjectURL(data)

  } catch (error) {
    console.error('❌ Error al ver documento:', error)
    return null
  }
}
 


  }
})