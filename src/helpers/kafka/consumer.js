const moment = require('moment-timezone')
const Kafka = require("./kafka")

let consumer = null

process.on("message", async ({type, topic }) => {
    let result = null
    try {
        if (type == 'start') {
            const kafka = await Kafka.init()
            consumer = kafka.consumer({ groupId: 'realtime' + parseInt(Math.random() * 100) })
            await consumer.connect()

            consumer.on(consumer.events.DISCONNECT, (err) => {
                console.log('disconnected: ', err)
                process.send({ success: false, message: 'Disconnected', result: result })
            })

            await consumer.subscribe({ topics: [topic] })

            const runConfig = {
                autoCommit: false, eachMessage: async ({ topic, partition, message }) => {
                    const offset = message.offset
                    const msgValue = message.value.toString()
                    process.send({ success: true, message: '', type, result: {
                        offset,
                        partition,
                        message: msgValue,
                        key: message.key,
                        topic,
                        timestamp: moment.unix(Number(message.timestamp)/1000).format(),
                        from_now: moment.unix(Number(message.timestamp)/1000).fromNow()
                    } })
    
                    return true
                }
            }

            await consumer.run(runConfig)
        }

        if (type == 'stop') {
            if (consumer)
                await consumer.disconnect()
        }

    } catch (err) {
        console.error(err)
        process.send({ success: false, message: err.message, type: err?.type ?? '', result: result })
    }
})