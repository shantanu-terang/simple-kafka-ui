const moment = require('moment-timezone')

const { init, sendIPCMessage } = require('./kafka')


const startRealtime = (config) => {
    return new Promise(async resolve => {
        const kafka = await init()
        const consumer = kafka.consumer({ groupId: `simple-kafka-ui-realtime-${config.id}-` + parseInt(Math.random() * 100) })
        await consumer.connect()

        consumer.on(consumer.events.DISCONNECT, (err) => {
            sendIPCMessage('done', true, 'finish', null)
            resolve()
        })

        consumer.on(consumer.events.END_BATCH_PROCESS, async ({ payload }) => {
            sendIPCMessage('done', true, 'finish', null)
            resolve()
            await consumer.disconnect()
        })

        consumer.on(consumer.events.CRASH, async () => {
            sendIPCMessage('done', true, 'finish', null)
            resolve()
            await consumer.disconnect()
        })

        await consumer.subscribe({ topics: config.topics, fromBeginning: false })

        const runConfig = {
            eachMessage: async ({ topic, partition, message }) => {
                const offset = Number(message.offset)
                const msgValue = message.value.toString()
                sendIPCMessage('realtime', true, 'realtime message', {
                    id: config.id,
                    response: {
                        offset,
                        partition,
                        message: msgValue,
                        key: message.key,
                        topic,
                        timestamp: moment.unix(Number(message.timestamp) / 1000).format(),
                        from_now: moment.unix(Number(message.timestamp) / 1000).fromNow()
                    }
                })
            }
        }

        consumer.run(runConfig)
    })
}


process.on("message", async ({ action, payload }) => {
    try {
        switch (action) {
            case 'realtime':
                await startRealtime(payload)
                break
        }

    } catch (err) {
        console.error(err)
        sendIPCMessage(action, false, err.message, null)

    }
})