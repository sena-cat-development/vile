import { defineStore } from 'pinia'
import { instance } from './index.js'

export const useAmountStore = defineStore('amount', {
  state: () => ({
    loading: false,
    amounts: [],
    error: null
  }),

  actions: {
    /* ===============================
       OBTENER TODOS (opcional por tipo)
    ================================ */
    async fetchAmounts(type = null) {
      try {
        this.loading = true
        this.error = null

        const params = type ? { type } : {}
        const { data } = await instance.get('/amount', { params })

        this.amounts = data.data
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Error al obtener los montos'
      } finally {
        this.loading = false
      }
    },

    /* ===============================
       CREAR
    ================================ */
    async createAmount(payload) {
      try {
        this.loading = true
        this.error = null

        const { data } = await instance.post('/amount', payload)

        this.amounts.unshift(data.data)
        return data.data
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Error al crear el monto'
        throw error
      } finally {
        this.loading = false
      }
    },

    /* ===============================
       ACTUALIZAR
    ================================ */
    async updateAmount(id, payload) {
      try {
        this.loading = true
        this.error = null

        const { data } = await instance.put(`/amount/${id}`, payload)

        const index = this.amounts.findIndex(a => a._id === id)
        if (index !== -1) {
          this.amounts[index] = data.data
        }

        return data.data
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Error al actualizar el monto'
        throw error
      } finally {
        this.loading = false
      }
    },

    /* ===============================
       ELIMINAR
    ================================ */
    async deleteAmount(id) {
      try {
        this.loading = true
        this.error = null

        await instance.delete(`/amount/${id}`)
        this.amounts = this.amounts.filter(a => a._id !== id)
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Error al eliminar el monto'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})


