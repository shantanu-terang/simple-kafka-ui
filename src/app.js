const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const { webRouter } = require('./routes/web')
const { apiRouter } = require('./routes/api')
const { SocketHandler } = require('./controllers/socket/socket')
const { app, io, server } = require('./index')

app.use(bodyParser.json())

// static files
app.use('/npm', express.static(path.join(__dirname, './../node_modules')))
app.use('/ui', express.static(path.join(__dirname, './ui')))
// 

app.use('/api', apiRouter)
app.use('/', webRouter)

io.on('connection', (socket) => new SocketHandler(socket))


module.exports = { server, app }