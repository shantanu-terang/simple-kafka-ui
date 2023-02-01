const { Kafka, AssignerProtocol } = require('kafkajs')
const moment = require('moment-timezone')
const config = require('./../../../config.json')

const init = async () => {
    return new Kafka(config)
}


const getTopics = async () => {
    const kafka = await init()
    const admin = kafka.admin()
    await admin.connect()
    const topics = await admin.listTopics()
    await admin.disconnect()
    return topics
}

const getTopicOffsets = async (topic) => {
    const kafka = await init()
    const admin = kafka.admin()
    await admin.connect()
    const result = await admin.fetchTopicOffsets(topic)
    await admin.disconnect()
    return result
}

const getMessages = async (topic, config) => {
    return new Promise( async resolve => {
        const result = []
        const kafka = await init()
        const consumer = kafka.consumer({ groupId: 'my-group-' + parseInt(Math.random() * 100) })
        await consumer.connect()

        consumer.on(consumer.events.DISCONNECT, (err) => {
            console.log('disconnected')
            resolve(result)
        })

        consumer.on(consumer.events.END_BATCH_PROCESS, async ({ payload }) => {
            await consumer.disconnect()
            console.log('consumer disconnected for ', payload.topic)
            
        })

        await consumer.subscribe({ topics: [topic] })

        const runConfig = {
            autoCommit: false, eachMessage: async ({ topic, partition, message }) => {
                const offset = message.offset
                const msgValue = message.value.toString()
                result.push({
                    offset,
                    partition,
                    message: msgValue,
                    key: message.key,
                    topic,
                    timestamp: moment.unix(Number(message.timestamp)/1000).format(),
                    from_now: moment.unix(Number(message.timestamp)/1000).fromNow()
                })

                return true
            }
        }

        consumer.run(runConfig)
        consumer.seek({ topic: topic, partition: config.partition, offset: config.offset })
    })
    
}

const sendMessage = async (topic, data) => {
    const kafka = await init()
    const producer = kafka.producer()
    await producer.connect()
    return await producer.send({
        topic: topic,
        messages: [
            { key: null, value: data.message, partition: data.partition }
        ],
    })
}

const createTopic = async (data) => {
    const kafka = await init()
    const admin = kafka.admin()
    await admin.connect()
    const response = await admin.createTopics({
        topics: [{
            topic: data.name
        }]
    })
    await admin.disconnect()
    return response
}

const getTopicDetails = async (topic) => {
    const kafka = await init()
    const admin = kafka.admin()
    await admin.connect()
    const response = await admin.listGroups()
    const groups = response.groups
    const gDetails = await admin.describeGroups(groups.map(g => g.groupId))
    await admin.disconnect()
    // return consumers
    return gDetails.groups.filter(g => g.protocolType == 'consumer' && g.state == 'Stable').map(g => {
        g.members = g.members.map(m => {
            m.memberMetadata = AssignerProtocol.MemberMetadata.decode(m.memberMetadata)
            m.memberAssignment = AssignerProtocol.MemberAssignment.decode(m.memberAssignment)
            return m
        })
        return g
    }).filter(g => {
        console.log(topic, g.groupId, g)
        return g.members.some(m => m.memberMetadata.topics.includes(topic))
    })
}

module.exports = { init, getTopics, getTopicOffsets, getMessages, sendMessage, createTopic, getTopicDetails }