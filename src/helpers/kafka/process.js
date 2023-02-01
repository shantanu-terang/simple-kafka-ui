const kafka = require("./kafka")

process.on("message", async (msg) => {
    let result = null
    const event = msg
    try {
        switch (event.type) {
            case 'topics':
                result = await kafka.getTopics()
                process.send({ success: true, message: '', type: event.type, result: result })
                break
            case 'offsets':
                result = await kafka.getTopicOffsets(event.topic)
                process.send({ success: true, message: '', type: event.type, result: result })
                break
            case 'messages':
                result = (await kafka.getMessages(event.topic, event.config)).reverse()
                process.send({ success: true, message: '', type: event.type, result: result })
                break
            case 'produce':
                result = await kafka.sendMessage(event.topic, event.data)
                process.send({ success: true, message: '', type: event.type, result: result })
                break
            case 'createTopic':
                result = await kafka.createTopic(event.data)
                process.send({ success: true, message: '', type: event.type, result: result })
                break
            case 'topicDetails':
                result = await kafka.getTopicDetails(event.topic)
                process.send({ success: true, message: '', type: event.type, result: result })
                break
            default:
                process.send({ success: false, message: 'Unknown Request', type: 'UNKNOWN_REQUEST', result: result })
        }
    } catch (err) {
        process.send({ success: false, message: err.message, type: err?.type ?? '', result: result })
    }
})