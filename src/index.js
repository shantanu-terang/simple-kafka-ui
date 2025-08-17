const http = require('http');
const express = require("express")
const { Server } = require("socket.io");

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origins: ['*']
    }
})

server.requestTimeout = 300000 * 5 // miliconds * 5

module.exports = { app, server, io }