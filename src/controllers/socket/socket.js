const { fork } = require('child_process');
const path = require('path')
const { io } = require('./../../index')
const CONSUMER_PATH = path.join(__dirname, "./../../helpers/kafka/consumer")


class SocketHandler {
    consumer

    constructor(socket) {
        this.welcome(socket)
        socket.on('start_consumer', this.startConsumer)
        socket.on('stop_consumer', this.stopConsumer)
    }

    welcome(socket) {
        console.log(socket.id, 'connected.');
        io.to(socket.id).emit("welcome", {id: socket.id})
    }

    startConsumer({id, data }) {
        this.consumer = fork(CONSUMER_PATH)
        this.consumer.on("message", result => {
            // io.to(id).emit(`message_${data.topic}`, result)
            io.of('/').emit(`message_${data.topic}`, result)
        })
        this.consumer.on('error', (error) => {
            console.log('error: ', error)
        })
        this.consumer.on('exit', (e) => {
            console.log('exit: ', e)
        })
        this.consumer.send({ type: 'start', topic: data.topic })

    }

    stopConsumer({data}) {
        console.log('stoping...', data)
        if (this.consumer)
            this.consumer.kill('SIGINT')
    }
}

module.exports = { SocketHandler }