const express = require('express')
const router = express.Router()
const path = require('path')
const { kafkaController } = require('./../controllers/api/kafka')

router.get("/", (req, res) => {
    res.json({status: true})
});

router.get('/topics', kafkaController.getTopics)
router.post('/topics', kafkaController.createTopic)
router.get('/topics/:topic/offsets', kafkaController.getTopicOffset)
router.post('/topics/:topic/messages', kafkaController.getMessages)
router.post('/topics/:topic/produce', kafkaController.sendMessage)
router.get('/topics/:topic/details', kafkaController.getTopicDetails)


module.exports = { apiRouter: router }