import { defineStore } from 'pinia'

export const useMoneyStore = defineStore('money', {
  state: () => ({
    locale: 'es-CO'
  }),

  actions: {
    /**
     * SOLO PARA MOSTRAR
     * 1000000 -> 1.000.000
     */
    format(value) {
      if (value === null || value === undefined) return ''
      return Number(value).toLocaleString(this.locale)
    }
  }
})
