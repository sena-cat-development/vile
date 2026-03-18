import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { instance } from './index.js'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('User', {
    state: () => ({
        user: LocalStorage.getItem('user') || {},
        users: []
    }),

    getters: {
        isAuthenticated: (state) => !!state.user && !!state.user.id,
        userRole: (state) => state.user?.role?.data || null,
        isContractor: (state) => state.user?.staffType?.data === 'contractor'
    },

    actions: {
        // ✅ Nueva acción para inicializar usuario
        initUser() {
            const storedUser = LocalStorage.getItem('user')
            if (storedUser && storedUser.id) {
                this.user = storedUser
                return true
            }
            return false
        },

        async getUserParams(id) {
            try {
                const { data, status } = await instance({
                    method: 'get',
                    url: `/user/${id}`
                })
                return { data, status }
            } catch (error) {
                return { data: null, status: error.response?.status || 500 }
            }
        },


        // ✅ Nueva acción para logout
        logout() {
            this.user = {}
            LocalStorage.remove('user')
            LocalStorage.remove('token')
        },

        async login(identification, password) {
            try {
                const response = await instance({
                    method: 'post',
                    url: '/user/login',
                    data: { identification, password }
                })

                if (response) {
                    const { data, status } = response
                    const decode = jwtDecode(data.token)

                    // Traer usuario completo desde backend
                    const userFull = await this.getUserParams(decode.id)

                    if (!userFull || !userFull.data) {
                        throw new Error('No se pudo obtener el usuario completo')
                    }

                    const fullUser = {
                        ...decode,
                        ...userFull.data
                    }

                    // ✅ Guardar en el store PRIMERO
                    this.user = fullUser

                    // ✅ Luego guardar en localStorage de forma síncrona
                    LocalStorage.set('token', data.token)
                    LocalStorage.set('user', fullUser)

                    console.log('✅ Usuario guardado en store:', this.user)
                    console.log('✅ Usuario guardado en localStorage:', LocalStorage.getItem('user'))

                    return { data: { ...data, user: fullUser }, status }
                }

            } catch (error) {
                const { data, status } = error.response
                return { data, status }
            }
        },

        async getUser(query = {}) {
            const { data, status } = await instance({
                method: 'get',
                url: '/user',
                params: query
            })

            this.users = data

            return { data, status }
        },

        async getUserParams(id) {
            const { data, status } = await instance({
                method: 'get',
                url: `/user/${id}`
            })

            return { data }
        },

        async postUser(data) {
            try {
                const response = await instance({
                    method: 'post',
                    url: '/user',
                    data
                })

                if (response) {
                    const { data, status } = response
                    return { data, status }
                }

            } catch (error) {
                if (!error.response) {
                    return { data: { msg: 'Servidor no disponible o conexión rechazada.' }, status: 500 }
                }

                const { data, status } = error.response
                return { data, status }
            }
        },

        async putUser(data, id) {
            try {
                const response = await instance({
                    method: 'put',
                    url: `/user/${id}`,
                    data: data
                })

                if (response) {
                    const { data, status } = response
                    return { data, status }
                }
            } catch (error) {
                const { data, status } = error.response
                return { data, status }
            }
        },

        async putSign(id, data) {
            try {
                const response = await instance({
                    method: 'put',
                    url: `/user/sign/${id}`,
                    data: data,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                if (response) {
                    const { data, status } = response
                    return { data, status }
                }
            } catch (error) {
                const { data, status } = error.response
                return { data, status }
            }
        },

        async cambiarEstado(id, status) {
            try {
                const response = await instance({
                    method: 'patch',
                    url: `/user/${id}`,
                    data: {
                        status: status
                    }
                })

                if (response) {
                    const { data, status } = response
                    return { data, status }
                }

            } catch (error) {
                console.log(error);
            }
        },

        async envioCorreo(mail) {
            try {
                const response = await instance({
                    method: 'put',
                    url: `/user/email/clave`,
                    data: {
                        mail: mail
                    }
                })
                if (response) {
                    const { data, status } = response
                    return { data, status }
                }
            } catch (error) {
                console.log(error);
                throw error
            }
        },

        async nuevaContrasena(nuevaContrasena, reset) {
            try {
                const response = await instance({
                    method: 'put',
                    url: `/user/nueva/contrasena`,
                    data: {
                        nuevaContrasena: nuevaContrasena
                    },
                    headers: {
                        reset: reset
                    }
                })

                if (response) {
                    const { data, status } = response
                    return { data, status }
                }

            } catch (error) {
                console.log(error);
                throw error
            }
        }
    },

    async getSchedules(query = {}) {
        try {
            const { data } = await instance({
                method: 'get',
                url: '/schedule',
                params: query
            })

            this.schedules = data.data || []
            return data

        } catch (error) {
            console.error('Error obteniendo agendas:', error)
            throw error
        }
    },

    // 🔹 Obtener agenda por ID (detalle)
    async getScheduleById(id) {
        try {
            const { data } = await instance({
                method: 'get',
                url: `/schedule/${id}/detail`
            })

            this.scheduleDetail = data.data || null
            return data

        } catch (error) {
            console.error('Error obteniendo detalle:', error)
            throw error
        }
    },

    // 🔹 Crear nueva agenda
    async createSchedule(payload) {
        try {
            const { data } = await instance({
                method: 'post',
                url: '/schedule',
                data: payload
            })

            this.schedules.unshift(data.data)
            return data

        } catch (error) {
            console.error('Error creando agenda:', error)
            throw error
        }
    },

    // 🔹 Actualizar agenda
    async updateSchedule(id, payload) {
        try {
            const { data } = await instance({
                method: 'put',
                url: `/schedule/${id}`,
                data: payload
            })

            const index = this.schedules.findIndex(s => s.id === id)
            if (index !== -1) this.schedules[index] = data.data

            return data

        } catch (error) {
            console.error('Error actualizando agenda:', error)
            throw error
        }
    },

    // 🔹 Firmar agenda
    async signSchedule(scheduleId) {
        try {
            const { data } = await instance({
                method: 'post',
                url: `/schedule/sign/${scheduleId}`,
            })

            return data

        } catch (error) {
            console.error('Error firmando agenda:', error)
            throw error
        }
    },

    // 🔹 Descargar documento firmado
    async downloadSigned(publicId) {
        try {
            const response = await instance({
                method: 'get',
                url: `/schedule/download/${publicId}`,
                responseType: 'blob'
            })

            return response.data

        } catch (error) {
            console.error('Error descargando PDF:', error)
            throw error
        }
    },

    // 🔹 Ver PDF firmado (en visor)
    async viewSigned(publicId) {
        try {
            const { data } = await instance({
                method: 'get',
                url: `/schedule/view/${publicId}`
            })

            return data

        } catch (error) {
            console.error('Error viendo PDF:', error)
            throw error
        }
    },

    // 🔹 Adjuntar radicación
    async addRadication(scheduleId, payload) {
        try {
            const { data } = await instance({
                method: 'post',
                url: `/schedule/${scheduleId}/radication`,
                data: payload
            })

            return data

        } catch (error) {
            console.error('Error agregando radicación:', error)
            throw error
        }
    },

    // 🔹 Legalizar (crear)
    async legalize(id, payload) {
        try {
            const { data } = await instance({
                method: 'post',
                url: `/schedule/legalization/${id}`,
                data: payload
            })

            return data

        } catch (error) {
            console.error('Error legalizando:', error)
            throw error
        }
    },

    // 🔹 Legalizar (actualizar)
    async updateLegalization(id, payload) {
        try {
            const { data } = await instance({
                method: 'put',
                url: `/schedule/legalization/${id}`,
                data: payload
            })

            return data

        } catch (error) {
            console.error('Error actualizando legalización:', error)
            throw error
        }
    },

})