const { fork } = require('child_process');

const worker = (action, payload, socketio, exePath) => {
    const child = fork(exePath)
    child.on("message", ({ action: event, message, success, data }) => {
        switch (event) {
            case action:
                try {
                    socketio.to(data.id).emit(action, {
                        topic: data.response.topic, data: data.response
                    })
                } catch (e) {
                    console.log(e, 'sending error for: ', action)
                }
                break
            case 'done':
                child.kill('SIGINT')
                break
        }
    })
    child.on('error', (error) => {
        child.kill('SIGINT')
    })
    child.on('exit', (e) => {
        console.log('Exit worker for: ', action)
    })

    // trigger the action
    child.send({ action, payload })

    return child
}

module.exports = {
    worker
}