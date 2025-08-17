const path = require('path')

const { worker } = require('./../../helpers/worker');

const LIST_MESSAGES_PATH = path.join(__dirname, "./../../helpers/kafka/messages")
const REALTIME_MESSAGES_PATH = path.join(__dirname, "./../../helpers/kafka/realtime")

// { id: { topics: [] , worker: forkChild } }
const REALTIME_USERS = {}

let socketio = null


const areArraysDifferent = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return true;
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    if (set1.size !== set2.size) return true;
    for (const val of set1) {
        if (!set2.has(val)) return true;
    }
    return false;
}

class SocketHandler {

    constructor(socket, io) {
        socketio = io
        this.welcome(socket)
        socket.on('realtime', (data) => this.updateRealtime(socket, data))
        socket.on('list_messages', (data) => this.listMessages(socket, data))
        socket.on('disconnect', (reason) => this.onDisconnect(socket, reason))
    }

    welcome(socket) {
        console.log(socket.id, 'connected.');
        socketio.to(socket.id).emit("welcome", { id: socket.id })
    }

    onDisconnect(socket, reason) {
        if (socket.id in REALTIME_USERS) {
            const user = REALTIME_USERS[socket.id]
            const isConsumerActive = user.worker && user.worker.exitCode === null && !user.worker.killed
            if (isConsumerActive) {
                user.worker.kill('SIGINT')
            }
            delete REALTIME_USERS[socket.id]
        }
    }

    updateRealtime(socket, { id, topics }) {
        try {
            if (!(id in REALTIME_USERS)) {
                REALTIME_USERS[id] = {
                    topics: [],
                    worker: null
                }
            }

            const user = REALTIME_USERS[id]

            const shouldStop = topics.length === 0

            const isConsumerActive = user.worker && user.worker.exitCode === null && !user.worker.killed

            if (shouldStop ) {
                if (isConsumerActive) {
                    user.worker.kill('SIGINT')
                    user.topics = []
                    user.worker = null
                }
            } else {
                if (isConsumerActive) {
                    if (areArraysDifferent(topics, user.topics)) {
                        user.worker.kill('SIGINT')
                        user.topics = topics
                        user.worker = worker('realtime', { id, topics }, socketio, REALTIME_MESSAGES_PATH)
                    }
                } else {
                    user.topics = topics
                    user.worker = worker('realtime', { id, topics }, socketio, REALTIME_MESSAGES_PATH)
                }
            }
            REALTIME_USERS[id] = user

        } catch (err) {
            console.log('Error in worker for: listMessages - ', topic)
        }
    }

    listMessages(socket, { id, topic, startOffset, endOffset, partition, page }) {
        try {
            const child = worker('list_messages', { id, topic, startOffset, endOffset, partition, page }, socketio, LIST_MESSAGES_PATH)
        } catch (err) {
            console.log('Error in worker for: listMessages - ', topic)
        }
    }
}

module.exports = { SocketHandler }