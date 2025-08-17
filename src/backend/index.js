const { server } = require('./src/app')

const port = (process.env?.PORT) ? Number(process.env.PORT) : 3000

process.on('SIGINT', () => {
    process.exit();
})

server.listen(port, () => {
    console.log('Listening on port ' + port);
})

