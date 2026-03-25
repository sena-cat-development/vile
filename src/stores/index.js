import axios from 'axios'

const instance = axios.create({
   //baseURL: 'http://localhost:3000'
   baseURL: import.meta.env.VITE_API_URL
})

export {
    instance
}