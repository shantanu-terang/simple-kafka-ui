const moment = require('moment-timezone')

const { init, sendIPCMessage } = require('./kafka')

const getMessages = (topic, config) => {
    return new Promise( async resolve => {
        const kafka = await init()
        const consumer = kafka.consumer({ groupId: `simple-kafka-ui-seek-offsets-${config.id}-` + parseInt(Math.random() * 100) })
        await consumer.connect()

        const startOffset = config.startOffset || 0
        const endOffset = config.endOffset || 15
        const partition = config.partition || 0

        consumer.on(consumer.events.DISCONNECT, (err) => {
            sendIPCMessage('done', true, 'finish', null)
            resolve()
        })

        consumer.on(consumer.events.END_BATCH_PROCESS, async ({ payload }) => {
            sendIPCMessage('done', true, 'finish', null)
            resolve()
            await consumer.disconnect()
        })

        consumer.on(consumer.events.CRASH, async() => {
            sendIPCMessage('done', true, 'finish', null)
            resolve()
            await consumer.disconnect()
        })

        await consumer.subscribe({ topics: [topic], fromBeginning: true })
    
        const runConfig = {
            autoCommit: false,
            eachMessage: async ({ topic, partition, message }) => {
                const offset = Number(message.offset)
                const msgValue = message.value.toString()
                sendIPCMessage('list_messages', true, 'messages listing', {
                    id: config.id,
                    response: {
                        offset,
                        partition,
                        message: msgValue,
                        key: message.key,
                        topic,
                        timestamp: moment.unix(Number(message.timestamp)/1000).format(),
                        from_now: moment.unix(Number(message.timestamp)/1000).fromNow()
                    }
                })
                if (offset >= endOffset) {
                    sendIPCMessage('done', true, 'finish', null)
                    // make it crash because I do not need this any more
                    throw new Error('End offset reached')
                }

                return true
            }
        }
        
        consumer.run(runConfig)
        consumer.seek({ topic, partition, offset: startOffset })
    })
    
}


process.on("message", async ({ action, payload }) => {
    try {
        // console.log('got message: ', action, payload)
        switch (action) {
            case 'list_messages':
                await getMessages(payload.topic, payload)
                break
        }

    } catch (err) {
        console.error(err)
        sendIPCMessage(action, false, err.message, null)

    }
})