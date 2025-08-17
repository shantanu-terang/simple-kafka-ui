import { io } from 'socket.io-client';

class Socket {
    socket
    socketId
    

    emit(eventName, data) {
        this.socket.emit(eventName, {id: this.socketId, data})
    }

    on(eventName, callback) {
        this.socket.on(eventName, data => {
            // do something
            callback(data)
        })
    }

    connect() {
        this.socket = io(window.location.origin)
        this.socket.on("welcome", (data) => {
            this.socketId = data.id
            console.log(this.socketId, 'connected.')
        })
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
        }
    }
}

export default new Socket()