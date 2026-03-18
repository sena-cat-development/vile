// src/socket.js
import { io } from 'socket.io-client'

export const socket = io('http://localhost:3500') // Cambia al puerto de tu backend
