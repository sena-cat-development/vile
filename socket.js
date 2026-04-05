// Singleton para la instancia de socket.io
// Evita la dependencia circular entre server.js y los controladores

let _io = null

export const setIo = (io) => { _io = io }
export const getIo = () => _io
