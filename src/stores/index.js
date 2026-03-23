import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://186.154.204.141:20128'
   //baseURL: 'http://localhost:3000'
})

export {
    instance
}