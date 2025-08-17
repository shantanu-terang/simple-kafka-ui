const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const { apiRouter } = require('./routes/api')
const { SocketHandler } = require('./controllers/socket/socket')
const { app, io, server } = require('./setup')

app.use(bodyParser.json())

// this will autlmatically load the public/index.html for / route
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/api', apiRouter)

io.on('connection', (socket) => new SocketHandler(socket, io))

module.exports = { server, app }