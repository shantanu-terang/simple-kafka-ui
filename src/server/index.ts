import express, { Request, Response } from "express"
import bodyParser from "body-parser"
import http from "http"
import { Server } from "socket.io"
import path from "path"


interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    hello: () => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}


const app = express()
const server = http.createServer(app)
const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>(server, {
    cors: {
        // origins: ['*']
    }
})

server.requestTimeout = 300000 * 5 // miliconds * 5

app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, './../../out/ui')))

app.get('/api', (req: Request, res: Response) => {
    res.json({ "name": "hello world"})
})


io.on('connection', (socket) => {
    console.log("socket connected")
})

const port = (process.env?.PORT) ? Number(process.env.PORT) : 3000

process.on('SIGINT', () => {
    process.exit();
})

server.listen(port, () => {
    console.log('Listening on port ' + port);
})