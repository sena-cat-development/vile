import axios from 'axios'

const instance = axios.create({
    baseURL: '186.154.204.141:20128'
   //baseURL: 'http://localhost:3500'
})

export {
    instance
}