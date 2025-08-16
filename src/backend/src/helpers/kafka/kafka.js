const path = require('path')
const { Kafka, AssignerProtocol } = require('kafkajs')
const config = require(path.join(process.cwd(), '../', 'config.json'))

const init = async () => {
    return new Kafka(config)
}

const sendIPCMessage = (action, status, message, data) => {
    process.send({ action, success: status, message: message, data: data })
}


const getTopics = async () => {
    const kafka = await init()
    const admin = kafka.admin()
    await admin.connect()
    const topics = await admin.listTopics()
    await admin.disconnect()
    return topics.filter(item => !item.startsWith('__'))
}

const getTopicOffsets = async (topic) => {
    const kafka = await init()
    const admin = kafka.admin()
    await admin.connect()
    const result = await admin.fetchTopicOffsets(topic)
    await admin.disconnect()
    return result
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
            topic: data.name,
            numPartitions: data.numPartitions || -1,
            replicationFactor: data.replicationFactor || -1
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

module.exports = { init, getTopics, getTopicOffsets, sendMessage, createTopic, getTopicDetails , sendIPCMessage}