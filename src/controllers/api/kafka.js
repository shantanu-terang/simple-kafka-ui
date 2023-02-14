const { fork } = require('child_process');
const path = require('path')

const PROCESS_PATH = path.join(__dirname, "./../../helpers/kafka/process")

const worker = async (payload) => {
    return new Promise((resolve, reject) => {
        const f = fork(PROCESS_PATH)
        f.once("message", result => {
            f.kill('SIGINT')
            if (result.success) {
                resolve(result)
            } else {
                reject(result)
            }
        })
        f.on('error', (error) => {
            reject(error)
        })
        f.on('exit', (e) => {
            if (e) {
                reject("Something went wrong.")
            }
        })
        f.send(payload)
    })
}

class KafkaController {

    async getTopics(req, res) {
        try {
            return res.status(200).json(await worker({
                type: "topics"
            }))
        } catch (err) {
            return res.status(500).json(String(err).includes('success') ? err : { success: false, message: err, result: null, type: 'topics' })
        }

    }

    async getTopicOffset(req, res) {
        try {
            return res.status(200).json(await worker({
                type: "offsets",
                topic: req.params.topic
            }))
        } catch (err) {
            return res.status(500).json(String(err).includes('success') ? err : { success: false, message: err, result: null, type: 'offsets' })
        }
    }

    async getMessages(req, res) {
        try {
            return res.status(200).json(await worker({
                type: "messages",
                topic: req.params.topic,
                config: req.body
            }))
        } catch (err) {
            return res.status(500).json(String(err).includes('success') ? err : { success: false, message: err, result: null, type: 'messages' })
        }
    }

    async sendMessage(req, res) {
        try {
            return res.status(201).json(await worker({
                type: "produce",
                topic: req.params.topic,
                data: req.body
            }))
        } catch (err) {
            return res.status(500).json(String(err).includes('success') ? err : { success: false, message: err, result: null, type: 'produce' })
        }
    }

    async createTopic(req, res) {
        try {
            return res.status(201).json(await worker({
                type: "createTopic",
                data: req.body
            }))
        } catch (err) {
            return res.status(500).json(String(err).includes('success') ? err : { success: false, message: err, result: null, type: 'createTopic' })
        }
    }

    async getTopicDetails(req, res) {
        try {
            return res.status(200).json(await worker({
                type: "topicDetails",
                topic: req.params.topic
            }))
        } catch (err) {
            return res.status(500).json(String(err).includes('success') ? err : { success: false, message: err, result: null, type: 'topicDetails' })
        }
    }
}

module.exports = { kafkaController: new KafkaController() }