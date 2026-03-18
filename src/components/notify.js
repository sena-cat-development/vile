import { Notify } from 'quasar'

function showNotify(message, type, icon = 'warning') {
    Notify.create({
        message: message,
        type: type,
        icon: icon,
        position: 'bottom'
    })
}

export {
    showNotify
}